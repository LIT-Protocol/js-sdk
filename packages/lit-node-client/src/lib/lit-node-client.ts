import { computeAddress } from '@ethersproject/transactions';
import { ed25519 } from '@noble/curves/ed25519';
import { ethers } from 'ethers';
import { pino, Logger } from 'pino';
import { SiweMessage } from 'siwe';

import {
  getFormattedAccessControlConditions,
  getHashedAccessControlConditions,
} from '@lit-protocol/access-control-conditions';
import {
  createSiweMessage,
  createSiweMessageWithCapacityDelegation,
  createSiweMessageWithRecaps,
  decode,
  generateAuthSig,
  generateSessionCapabilityObjectWithWildcards,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import {
  AUTH_METHOD_TYPE,
  EITHER_TYPE,
  FALLBACK_IPFS_GATEWAYS,
  GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK,
  InvalidArgumentException,
  InvalidParamType,
  InvalidSessionSigs,
  InvalidSignatureError,
  LIT_CURVE,
  LIT_CURVE_TYPE,
  LIT_ENDPOINT,
  LitNodeClientNotReadyError,
  LOCAL_STORAGE_KEYS,
  ParamNullError,
  ParamsMissingError,
  PRODUCT_IDS,
  SIWE_URI_PREFIX,
  UnknownError,
  UnsupportedMethodError,
  WalletSignatureNotFoundError,
} from '@lit-protocol/constants';
import { getNodePrices } from '@lit-protocol/contracts-sdk';
import { composeLitUrl, mostCommonValue, LitCore } from '@lit-protocol/core';
import {
  combineSignatureShares,
  encrypt,
  generateSessionKeyPair,
  verifyAndDecryptWithSignatureShares,
  verifySignature,
} from '@lit-protocol/crypto';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '@lit-protocol/misc-browser';
import {
  applySchemaWithValidation,
  DecryptRequestSchema,
  EncryptRequestSchema,
  JsonExecutionSdkParamsBaseSchema,
} from '@lit-protocol/schemas';
import {
  AuthCallback,
  AuthCallbackParams,
  type AuthenticationContext,
  AuthSig,
  BlsResponseData,
  CapacityCreditsReq,
  CapacityCreditsRes,
  ClaimKeyResponse,
  ClaimProcessor,
  ClaimRequest,
  CustomNetwork,
  DecryptRequest,
  DecryptResponse,
  EncryptionSignRequest,
  EncryptResponse,
  EncryptSdkParams,
  ExecuteJsNoSigningResponse,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  GetWalletSigProps,
  ILitNodeClient,
  JsonExecutionRequest,
  JsonExecutionSdkParams,
  JsonPKPClaimKeyRequest,
  JsonPkpSignRequest,
  JsonPkpSignSdkParams,
  JsonSignSessionKeyRequestV1,
  JsonSignSessionKeyRequestV2,
  LitNodeClientConfig,
  LitResourceAbilityRequest,
  NodeBlsSigningShare,
  NodeCommandResponse,
  NodeSet,
  NodeShare,
  PKPSignEndpointResponse,
  RejectedNodePromises,
  SessionKeyPair,
  SessionSigningTemplate,
  SessionSigsMap,
  Signature,
  SignSessionKeyProp,
  SignSessionKeyResponse,
  SigResponse,
  SuccessNodePromises,
} from '@lit-protocol/types';
import { AuthMethod } from '@lit-protocol/types';

import { assembleMostCommonResponse } from './helpers/assemble-most-common-response';
import { encodeCode } from './helpers/encode-code';
import { getBlsSignatures } from './helpers/get-bls-signatures';
import { getClaims } from './helpers/get-claims';
import { getClaimsList } from './helpers/get-claims-list';
import { getExpiration } from './helpers/get-expiration';
import { getMaxPricesForNodeProduct } from './helpers/get-max-prices-for-node-product';
import { getSignatures } from './helpers/get-signatures';
import { hexPrefixed, removeHexPrefix } from './helpers/hex';
import { defaultMintClaimCallback } from './helpers/mint-claim-callback';
import { normalizeAndStringify } from './helpers/normalize-and-stringify';
import { normalizeArray } from './helpers/normalize-array';
import { normalizeJsParams } from './helpers/normalize-params';
import { parseAsJsonOrString } from './helpers/parse-as-json-or-string';
import { parsePkpSignResponse } from './helpers/parse-pkp-sign-response';
import { processLitActionResponseStrategy } from './helpers/process-lit-action-response-strategy';
import { removeDoubleQuotes } from './helpers/remove-double-quotes';
import { formatSessionSigs } from './helpers/session-sigs-reader';
import { validateSessionSigs } from './helpers/session-sigs-validator';
import { blsSessionSigVerify } from './helpers/validate-bls-session-sig';

export class LitNodeClient extends LitCore implements ILitNodeClient {
  readonly #logger: Logger;
  /** Tracks the total max price a user is willing to pay for each supported product type
   * This must be distributed across all nodes; each node will get a percentage of this price
   *
   * If the user never sets a max price, it means 'unlimited'
   */
  defaultMaxPriceByProduct: Record<keyof typeof PRODUCT_IDS, bigint> = {
    DECRYPTION: BigInt(-1),
    SIGN: BigInt(-1),
    LIT_ACTION: BigInt(-1),
  };

  defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;

  // ========== Constructor ==========
  constructor(args: LitNodeClientConfig | CustomNetwork) {
    if (!args) {
      throw new ParamsMissingError({}, 'must provide LitNodeClient parameters');
    }

    super(args);

    this.#logger = pino({
      name: 'LitNodeClient',
      level: this.config.debug ? 'debug' : 'info',
    });

    if (args !== undefined && args !== null && 'defaultAuthCallback' in args) {
      this.defaultAuthCallback = args.defaultAuthCallback;
    }
  }

  setDefaultMaxPrice(product: keyof typeof PRODUCT_IDS, price: bigint) {
    this.defaultMaxPriceByProduct[product] = price;
  }

  private _getNodePrices() {
    return getNodePrices({
      realmId: 1,
      litNetwork: this.config.litNetwork,
      networkContext: this.config.contractContext,
      rpcUrl: this.config.rpcUrl,
      nodeProtocol: this.config.nodeProtocol,
    });
  }
  // ========== Rate Limit NFT ==========

  // TODO: Add support for browser feature/lit-2321-js-sdk-add-browser-support-for-createCapacityDelegationAuthSig
  createCapacityDelegationAuthSig = async (
    params: CapacityCreditsReq
  ): Promise<CapacityCreditsRes> => {
    // -- validate
    if (!params.dAppOwnerWallet) {
      throw new InvalidParamType(
        {
          info: {
            params,
          },
        },
        'dAppOwnerWallet must exist'
      );
    }

    // Useful log for debugging
    if (!params.delegateeAddresses || params.delegateeAddresses.length === 0) {
      this.#logger.info(
        `[createCapacityDelegationAuthSig] 'delegateeAddresses' is an empty array. It means that no body can use it. However, if the 'delegateeAddresses' field is omitted, It means that the capability will not restrict access based on delegatee list, but it may still enforce other restrictions such as usage limits (uses) and specific NFT IDs (nft_id).`
      );
    }

    // -- This is the owner address who holds the Capacity Credits NFT token and wants to delegate its
    // usage to a list of delegatee addresses
    const dAppOwnerWalletAddress = ethers.utils.getAddress(
      await params.dAppOwnerWallet.getAddress()
    );

    // -- if it's not ready yet, then connect
    if (!this.ready) {
      await this.connect();
    }

    const siweMessage = await createSiweMessageWithCapacityDelegation({
      uri: SIWE_URI_PREFIX.DELEGATION,
      litNodeClient: this,
      walletAddress: dAppOwnerWalletAddress,
      nonce: await this.getLatestBlockhash(),
      expiration: params.expiration,
      domain: params.domain,
      statement: params.statement,

      // -- capacity delegation specific configuration
      uses: params.uses,
      delegateeAddresses: params.delegateeAddresses,
      // paymentId: params.paymentId, // CHANGE: Not supported yet
    });

    const authSig = await generateAuthSig({
      signer: params.dAppOwnerWallet,
      toSign: siweMessage,
    });

    return { capacityDelegationAuthSig: authSig };
  };

  // ==================== SESSIONS ====================
  /**
   * Try to get the session key in the local storage,
   * if not, generates one.
   * @return { SessionKeyPair } session key pair
   */
  private _getSessionKey = (): SessionKeyPair => {
    const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY;
    const storedSessionKeyOrError = getStorageItem(storageKey);

    if (
      storedSessionKeyOrError.type === EITHER_TYPE.ERROR ||
      !storedSessionKeyOrError.result ||
      storedSessionKeyOrError.result === ''
    ) {
      this.#logger.warn(
        `Storage key "${storageKey}" is missing. Not a problem. Continue...`
      );

      // Generate new one
      const newSessionKey = generateSessionKeyPair();

      // (TRY) to set to local storage
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
      } catch (e) {
        this.#logger.info(
          `[getSessionKey] Localstorage not available.Not a problem. Continue...`
        );
      }

      return newSessionKey;
    } else {
      return JSON.parse(storedSessionKeyOrError.result as string);
    }
  };

  /**
   * Get the signature from local storage, if not, generates one
   */
  private _getWalletSig = async ({
    authNeededCallback,
    chain,
    sessionCapabilityObject,
    switchChain,
    expiration,
    sessionKeyUri,
    nonce,
    resourceAbilityRequests,
    litActionCode,
    litActionIpfsId,
    jsParams,
    sessionKey,
  }: GetWalletSigProps): Promise<AuthSig> => {
    let walletSig: AuthSig;

    const storageKey = LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;
    const storedWalletSigOrError = getStorageItem(storageKey);

    // browser: 2 > 2.1 > 3
    // nodejs: 1. > 1.1

    // -- (TRY) to get it in the local storage
    // -- IF NOT: Generates one
    this.#logger.info(`getWalletSig - flow starts
        storageKey: ${storageKey}
        storedWalletSigOrError: ${JSON.stringify(storedWalletSigOrError)}
    `);

    if (
      storedWalletSigOrError.type === EITHER_TYPE.ERROR ||
      !storedWalletSigOrError.result ||
      storedWalletSigOrError.result == ''
    ) {
      this.#logger.info('getWalletSig - flow 1');
      this.#logger.warn(
        `Storage key "${storageKey}" is missing. Not a problem. Continue...`
      );
      if (authNeededCallback) {
        this.#logger.info('getWalletSig - flow 1.1');

        const body = {
          chain,
          statement: sessionCapabilityObject?.statement,
          resources: sessionCapabilityObject
            ? [sessionCapabilityObject.encodeAsSiweResource()]
            : undefined,
          ...(switchChain && { switchChain }),
          expiration,
          uri: sessionKeyUri,
          sessionKey: sessionKey,
          nonce,

          // for recap
          ...(resourceAbilityRequests && { resourceAbilityRequests }),

          // for lit action custom auth
          ...(litActionCode && { litActionCode }),
          ...(litActionIpfsId && { litActionIpfsId }),
          ...(jsParams && { jsParams }),
        };

        this.#logger.info({ msg: 'callback body', body });

        walletSig = await authNeededCallback(body);
      } else {
        this.#logger.info('getWalletSig - flow 1.2');
        if (!this.defaultAuthCallback) {
          this.#logger.info('getWalletSig - flow 1.2.1');
          throw new ParamsMissingError(
            {},
            'No authNeededCallback nor default auth callback provided'
          );
        }

        this.#logger.info('getWalletSig - flow 1.2.2');
        walletSig = await this.defaultAuthCallback({
          chain,
          statement: sessionCapabilityObject.statement,
          resources: sessionCapabilityObject
            ? [sessionCapabilityObject.encodeAsSiweResource()]
            : undefined,
          switchChain,
          expiration,
          uri: sessionKeyUri,
          nonce,
        });
      }

      this.#logger.info('getWalletSig - flow 1.3');

      // (TRY) to set walletSig to local storage
      const storeNewWalletSigOrError = setStorageItem(
        storageKey,
        JSON.stringify(walletSig)
      );
      if (storeNewWalletSigOrError.type === 'ERROR') {
        this.#logger.info('getWalletSig - flow 1.4');
        this.#logger.warn(
          `Unable to store walletSig in local storage. Not a problem. Continue...`
        );
      }
    } else {
      this.#logger.info('getWalletSig - flow 2');
      try {
        walletSig = JSON.parse(storedWalletSigOrError.result as string);
        this.#logger.info('getWalletSig - flow 2.1');
      } catch (e) {
        this.#logger.warn('Error parsing walletSig', e);
        this.#logger.info('getWalletSig - flow 2.2');
      }
    }

    this.#logger.info('getWalletSig - flow 3');
    return walletSig!;
  };

  private _authCallbackAndUpdateStorageItem = async ({
    authCallbackParams,
    authCallback,
  }: {
    authCallbackParams: AuthCallbackParams;
    authCallback?: AuthCallback;
  }): Promise<AuthSig> => {
    let authSig: AuthSig;

    if (authCallback) {
      authSig = await authCallback(authCallbackParams);
    } else {
      if (!this.defaultAuthCallback) {
        throw new ParamsMissingError(
          {},
          'No authCallback nor default auth callback provided'
        );
      }
      authSig = await this.defaultAuthCallback(authCallbackParams);
    }

    // (TRY) to set walletSig to local storage
    const storeNewWalletSigOrError = setStorageItem(
      LOCAL_STORAGE_KEYS.WALLET_SIGNATURE,
      JSON.stringify(authSig)
    );
    if (storeNewWalletSigOrError.type === EITHER_TYPE.SUCCESS) {
      return authSig;
    }

    // Setting local storage failed, try to remove the item key.
    this.#logger.warn(
      `Unable to store walletSig in local storage. Not a problem. Continuing to remove item key...`
    );
    const removeWalletSigOrError = removeStorageItem(
      LOCAL_STORAGE_KEYS.WALLET_SIGNATURE
    );
    if (removeWalletSigOrError.type === EITHER_TYPE.ERROR) {
      this.#logger.warn(
        `Unable to remove walletSig in local storage. Not a problem. Continuing...`
      );
    }

    return authSig;
  };

  /**
   *
   * Check if a session key needs to be resigned. These are the scenarios where a session key needs to be resigned:
   * 1. The authSig.sig does not verify successfully against the authSig.signedMessage
   * 2. The authSig.signedMessage.uri does not match the sessionKeyUri
   * 3. The authSig.signedMessage does not contain at least one session capability object
   *
   */
  private _checkNeedToResignSessionKey = async ({
    authSig,
    sessionKeyUri,
    resourceAbilityRequests,
  }: {
    authSig: AuthSig;
    sessionKeyUri: string;
    resourceAbilityRequests: LitResourceAbilityRequest[];
  }): Promise<boolean> => {
    const authSigSiweMessage = new SiweMessage(authSig.signedMessage);
    // We will either have `ed25519` or `LIT_BLS` as we have deviated from the specification of SIWE and use BLS signatures in some cases
    // Here we need to check the `algo` of the SIWE to confirm we can validate the signature as if we attempt to validate the BLS signature here
    // it will fail. If the  algo is not defined we can assume that it was an EOA wallet signing the message so we can use SIWE.
    if (authSig.algo === `ed25519` || authSig.algo === undefined) {
      try {
        await authSigSiweMessage.verify(
          { signature: authSig.sig },
          { suppressExceptions: false }
        );
      } catch (e) {
        this.#logger.error({ msg: `Error while verifying BLS signature: `, e });
        return true;
      }
    } else if (authSig.algo === `LIT_BLS`) {
      try {
        await blsSessionSigVerify(
          verifySignature,
          this.networkPubKey!,
          authSig,
          authSigSiweMessage
        );
      } catch (e) {
        this.#logger.error({ msg: `Error while verifying bls signature: `, e });
        return true;
      }
    } else {
      throw new InvalidSignatureError(
        {
          info: {
            authSig,
            resourceAbilityRequests,
            sessionKeyUri,
          },
        },
        'Unsupported signature algo for session signature. Expected ed25519 or LIT_BLS received %s',
        authSig.algo
      );
    }

    // make sure the sig is for the correct session key
    if (authSigSiweMessage.uri !== sessionKeyUri) {
      this.#logger.info('Need retry because uri does not match');
      return true;
    }

    // make sure the authSig contains at least one resource.
    if (
      !authSigSiweMessage.resources ||
      authSigSiweMessage.resources.length === 0
    ) {
      this.#logger.info('Need retry because empty resources');
      return true;
    }

    // make sure the authSig contains session capabilities that can be parsed.
    // TODO: we currently only support the first resource being a session capability object.
    const authSigSessionCapabilityObject = decode(
      authSigSiweMessage.resources[0]
    );

    // make sure the authSig session capability object describes capabilities that are equal or greater than
    // the abilities requested against the resources in the resource ability requests.
    for (const resourceAbilityRequest of resourceAbilityRequests) {
      if (
        !authSigSessionCapabilityObject.verifyCapabilitiesForResource(
          resourceAbilityRequest.resource,
          resourceAbilityRequest.ability
        )
      ) {
        this.#logger.info({
          msg: 'Need retry because capabilities do not match',
          authSigSessionCapabilityObject,
          resourceAbilityRequest,
        });
        return true;
      }
    }

    return false;
  };

  private _decryptWithSignatureShares = (
    networkPubKey: string,
    identityParam: Uint8Array,
    ciphertext: string,
    signatureShares: NodeBlsSigningShare[]
  ): Promise<Uint8Array> => {
    const sigShares = signatureShares.map((s) => s.signatureShare);

    return verifyAndDecryptWithSignatureShares(
      networkPubKey,
      identityParam,
      ciphertext,
      sigShares
    );
  };

  /**
   * Retrieves the fallback IPFS code for a given IPFS ID.
   *
   * @param gatewayUrl - the gateway url.
   * @param ipfsId - The IPFS ID.
   * @returns The base64-encoded fallback IPFS code.
   * @throws An error if the code retrieval fails.
   */
  private async _getFallbackIpfsCode(
    gatewayUrl: string | undefined,
    ipfsId: string
  ) {
    const allGateways = gatewayUrl
      ? [gatewayUrl, ...FALLBACK_IPFS_GATEWAYS]
      : FALLBACK_IPFS_GATEWAYS;

    this.#logger.info(
      `Attempting to fetch code for IPFS ID: ${ipfsId} using fallback IPFS gateways`
    );

    for (const url of allGateways) {
      try {
        const response = await fetch(`${url}${ipfsId}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch code from IPFS gateway ${url}: ${response.status} ${response.statusText}`
          );
        }

        const code = await response.text();
        const codeBase64 = Buffer.from(code).toString('base64');

        return codeBase64;
      } catch (error) {
        this.#logger.error(`Error fetching code from IPFS gateway ${url}`);
        // Continue to the next gateway in the array
      }
    }

    throw new Error('All IPFS gateways failed to fetch the code.');
  }

  private async executeJsNodeRequest(
    url: string,
    formattedParams: JsonExecutionSdkParams & { sessionSigs: SessionSigsMap },
    requestId: string,
    nodeSet: NodeSet[]
  ) {
    // -- choose the right signature
    const sessionSig = this._getSessionSigByUrl({
      sessionSigs: formattedParams.sessionSigs,
      url,
    });

    const reqBody: JsonExecutionRequest = {
      ...formattedParams,
      authSig: sessionSig,
      nodeSet,
    };

    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.EXECUTE_JS,
    });

    return this.generatePromise(urlWithPath, reqBody, requestId);
  }

  /**
   *
   * Execute JS on the nodes and combine and return any resulting signatures
   *
   * @param { JsonExecutionSdkParams } params
   *
   * @returns { ExecuteJsResponse }
   *
   */
  executeJs = async (
    params: JsonExecutionSdkParams
  ): Promise<ExecuteJsResponse> => {
    // ========== Validate Params ==========
    const _params = applySchemaWithValidation(
      'executeJs',
      params,
      JsonExecutionSdkParamsBaseSchema
    );

    if (!this.ready) {
      const message =
        '[executeJs] LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

      throw new LitNodeClientNotReadyError({}, message);
    }

    // Format the params
    let formattedParams: JsonExecutionSdkParams = {
      ..._params,
      ...(_params.jsParams && {
        jsParams: normalizeJsParams(_params.jsParams),
      }),
      ...(_params.code && { code: encodeCode(_params.code) }),
    };

    // Check if IPFS options are provided and if the code should be fetched from IPFS and overwrite the current code.
    // This will fetch the code from the specified IPFS gateway using the provided ipfsId,
    // and update the params with the fetched code, removing the ipfsId afterward.
    const overwriteCode =
      _params.ipfsOptions?.overwriteCode ||
      GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[this.config.litNetwork];

    if (overwriteCode && _params.ipfsId) {
      const code = await this._getFallbackIpfsCode(
        _params.ipfsOptions?.gatewayUrl,
        _params.ipfsId
      );

      formattedParams = {
        ..._params,
        code: code,
        ipfsId: undefined,
      };
    }

    const requestId = this._getNewRequestId();

    const userMaxPrices = await this.getMaxPricesForNodeProduct({
      product: 'LIT_ACTION',
      userMaxPrice: _params.userMaxPrice,
    });

    const targetNodePrices = _params.useSingleNode
      ? userMaxPrices.slice(0, 1)
      : userMaxPrices;

    const sessionSigs = await this._getSessionSigs({
      ..._params.authContext,
      userMaxPrices: targetNodePrices,
    });

    const targetNodeUrls = targetNodePrices.map(({ url }) => url);
    // ========== Get Node Promises ==========
    // Handle promises for commands sent to Lit nodes
    const nodePromises = this._getNodePromises(targetNodeUrls, (url: string) =>
      this.executeJsNodeRequest(
        url,
        {
          ...formattedParams,
          sessionSigs,
        },
        requestId,
        this._getNodeSet(targetNodeUrls)
      )
    );

    // -- resolve promises
    const res = await this._handleNodePromises(
      nodePromises,
      requestId,
      _params.useSingleNode ? 1 : this._getThreshold()
    );

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises<NodeShare>).values;

    this.#logger.info({
      requestId,
      responseData,
    });

    // -- find the responseData that has the most common response
    const mostCommonResponse = assembleMostCommonResponse(
      responseData
    ) as NodeShare;

    const responseFromStrategy = processLitActionResponseStrategy(
      responseData,
      _params.responseStrategy ?? { strategy: 'leastCommon' }
    );
    mostCommonResponse.response = responseFromStrategy;

    const isSuccess = mostCommonResponse.success;
    const hasSignedData = Object.keys(mostCommonResponse.signedData).length > 0;
    const hasClaimData = Object.keys(mostCommonResponse.claimData).length > 0;

    // -- we must also check for claim responses as a user may have submitted for a claim and signatures must be aggregated before returning
    if (isSuccess && !hasSignedData && !hasClaimData) {
      return mostCommonResponse as unknown as ExecuteJsResponse;
    }

    // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
    if (!hasSignedData && !hasClaimData) {
      return {
        claims: {},
        signatures: null,
        decryptions: [],
        response: mostCommonResponse.response,
        logs: mostCommonResponse.logs,
      } as ExecuteJsNoSigningResponse;
    }

    // ========== Extract shares from response data ==========

    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = responseData.map((r) => {
      return removeDoubleQuotes(r.signedData);
    });

    this.#logger.info({
      requestId,
      msg: 'signatures shares to combine',
      signedDataList,
    });

    // Flatten the signedDataList by moving the data within the `sig` (or any other key user may choose) object to the top level.
    // The specific key name (`sig`) is irrelevant, as the contents of the object are always lifted directly.
    const key = Object.keys(signedDataList[0])[0]; // Get the first key of the object

    const flattenedSignedMessageShares = signedDataList.map((item) => {
      return item[key]; // Return the value corresponding to that key
    });

    // -- 2. combine responses as a string, and parse it as JSON if possible
    const parsedResponse = parseAsJsonOrString(mostCommonResponse.response);

    // -- 3. combine logs
    const mostCommonLogs: string = mostCommonValue(
      responseData.map(
        (r: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logs: any;
        }) => r.logs
      )
    );

    // -- 4. combine claims
    const claimsList = getClaimsList(responseData);
    const claims = claimsList.length > 0 ? getClaims(claimsList) : undefined;

    // ========== Result ==========
    const returnVal: ExecuteJsResponse = {
      claims,
      signatures: hasSignedData
        ? {
            [key]: await getSignatures({
              requestId,
              networkPubKeySet: this.networkPubKeySet,
              threshold: _params.useSingleNode ? 1 : this._getThreshold(),
              signedMessageShares: flattenedSignedMessageShares,
            }),
          }
        : {},
      // decryptions: [],
      response: parsedResponse,
      logs: mostCommonLogs,
    };

    this.#logger.info({ msg: 'returnVal', returnVal });

    return returnVal;
  };

  /**
   * Generates a promise by sending a command to the Lit node
   *
   * @param url - The URL to send the command to.
   * @param params - The parameters to include in the command.
   * @param requestId - The ID of the request.
   * @returns A promise that resolves with the response from the server.
   */
  generatePromise = async (
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    return await this._sendCommandToNode({
      url,
      data: params,
      requestId,
    });
  };

  /**
   * Use PKP to sign
   *
   * @param { JsonPkpSignSdkParams } params
   * @param params.toSign - The data to sign
   * @param params.pubKey - The public key to sign with
   * @param params.sessionSigs - The session signatures to use
   * @param params.authMethods - (optional) The auth methods to use
   */
  pkpSign = async (params: JsonPkpSignSdkParams): Promise<SigResponse> => {
    // -- validate required params
    const requiredParamKeys = ['toSign', 'pubKey', 'authContext'];

    (requiredParamKeys as (keyof JsonPkpSignSdkParams)[]).forEach((key) => {
      if (!params[key]) {
        throw new ParamNullError(
          {
            info: {
              params,
              key,
            },
          },
          `"%s" cannot be undefined, empty, or null. Please provide a valid value.`,
          key
        );
      }
    });

    const requestId = this._getNewRequestId();

    const targetNodePrices = await this.getMaxPricesForNodeProduct({
      product: 'SIGN',
      userMaxPrice: params.userMaxPrice,
    });

    const sessionSigs = await this._getSessionSigs({
      pkpPublicKey: params.pubKey,
      ...params.authContext,
      userMaxPrices: targetNodePrices,
    });

    // validate session sigs
    const checkedSessionSigs = validateSessionSigs(sessionSigs);

    if (checkedSessionSigs.isValid === false) {
      throw new InvalidSessionSigs(
        {},
        `Invalid sessionSigs. Errors: ${checkedSessionSigs.errors}`
      );
    }

    // ========== Get Node Promises ==========
    // Handle promises for commands sent to Lit nodes

    const targetNodeUrls = targetNodePrices.map(({ url }) => url);
    const nodePromises = this._getNodePromises(
      targetNodeUrls,
      (url: string) => {
        // -- get the session sig from the url key
        const sessionSig = this._getSessionSigByUrl({
          sessionSigs,
          url,
        });

        const reqBody: JsonPkpSignRequest<LIT_CURVE_TYPE> = {
          toSign: normalizeArray(params.toSign),
          pubkey: hexPrefixed(params.pubKey),
          authSig: sessionSig,

          // -- optional params - no longer allowed in >= Naga?
          // ...(params.authContext.authMethods &&
          //   params.authContext.authMethods.length > 0 && {
          //     authMethods: params.authContext.authMethods,
          //   }),

          // nodeSet: thresholdNodeSet,
          nodeSet: this._getNodeSet(targetNodeUrls),
          signingScheme: 'EcdsaK256Sha256',
        };

        this.#logger.info({ requestId, reqBody });

        const urlWithPath = composeLitUrl({
          url,
          endpoint: LIT_ENDPOINT.PKP_SIGN,
        });

        return this.generatePromise(urlWithPath, reqBody, requestId);
      }
    );

    const res = await this._handleNodePromises(
      nodePromises,
      requestId,
      this._getThreshold()
    );

    // ========== Handle Response ==========
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    const responseData = (res as SuccessNodePromises<PKPSignEndpointResponse>)
      .values;

    this.#logger.info({
      requestId,
      responseData,
    });

    // clean up the response data (as there are double quotes & snake cases in the response)
    const signedMessageShares = parsePkpSignResponse(responseData);

    try {
      const signatures = await getSignatures({
        requestId,
        networkPubKeySet: this.networkPubKeySet,
        threshold: this._getThreshold(),
        signedMessageShares: signedMessageShares,
      });

      this.#logger.info({ requestId, signatures });

      return signatures;
    } catch (e) {
      this.#logger.error({ msg: 'Error getting signature', error: e });
      throw e;
    }
  };

  /**
   * Encrypt data using the LIT network public key.
   * See more: https://developer.litprotocol.com/sdk/access-control/encryption
   *
   * @param { EncryptSdkParams } params
   * @param params.dataToEncrypt - The data to encrypt
   * @param params.accessControlConditions - (optional) The access control conditions for the data
   * @param params.evmContractConditions - (optional) The EVM contract conditions for the data
   * @param params.solRpcConditions - (optional) The Solidity RPC conditions for the data
   * @param params.unifiedAccessControlConditions - (optional) The unified access control conditions for the data
   *
   * @return { Promise<EncryptResponse> } The encrypted ciphertext and the hash of the data
   *
   * @throws { Error } if the LIT node client is not ready
   * @throws { Error } if the subnetPubKey is null
   */
  encrypt = async (params: EncryptSdkParams): Promise<EncryptResponse> => {
    // ========== Validate Params ==========
    const _params = applySchemaWithValidation(
      'encrypt',
      params,
      EncryptRequestSchema
    );

    // -- validate if it's ready
    if (!this.ready) {
      throw new LitNodeClientNotReadyError(
        {},
        '6 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.'
      );
    }

    // -- validate if this.subnetPubKey is null
    if (!this.subnetPubKey) {
      throw new LitNodeClientNotReadyError({}, 'subnetPubKey cannot be null');
    }

    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await getHashedAccessControlConditions(_params);

    if (!hashOfConditions) {
      throw new InvalidArgumentException(
        {
          info: {
            params,
          },
        },
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    const hashOfConditionsStr = Buffer.from(
      new Uint8Array(hashOfConditions)
    ).toString('hex');

    // ========== Hashing Private Data ==========
    // hash the private data
    const hashOfPrivateData = await crypto.subtle.digest(
      'SHA-256',
      params.dataToEncrypt
    );
    const hashOfPrivateDataStr = Buffer.from(
      new Uint8Array(hashOfPrivateData)
    ).toString('hex');

    // ========== Assemble identity parameter ==========
    const identityParam = this._getIdentityParamForEncryption(
      hashOfConditionsStr,
      hashOfPrivateDataStr
    );

    // ========== Encrypt ==========
    const ciphertext = await encrypt(
      this.subnetPubKey,
      params.dataToEncrypt,
      Buffer.from(identityParam, 'utf8')
    );

    return { ciphertext, dataToEncryptHash: hashOfPrivateDataStr };
  };

  /**
   *
   * Decrypt ciphertext with the LIT network.
   *
   */
  decrypt = async (params: DecryptRequest): Promise<DecryptResponse> => {
    // -- validate params
    const { authContext, chain, ciphertext, dataToEncryptHash, userMaxPrice } =
      applySchemaWithValidation('decrypt', params, DecryptRequestSchema);

    // -- validate if it's ready
    if (!this.ready) {
      throw new LitNodeClientNotReadyError(
        {},
        '6 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.'
      );
    }

    // -- validate if this.subnetPubKey is null
    if (!this.subnetPubKey) {
      throw new LitNodeClientNotReadyError({}, 'subnetPubKey cannot be null');
    }

    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await getHashedAccessControlConditions(params);

    if (!hashOfConditions) {
      throw new InvalidArgumentException(
        {
          info: {
            params,
          },
        },
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    const hashOfConditionsStr = Buffer.from(
      new Uint8Array(hashOfConditions)
    ).toString('hex');

    // ========== Formatting Access Control Conditions =========
    const {
      error,
      formattedAccessControlConditions,
      formattedEVMContractConditions,
      formattedSolRpcConditions,
      formattedUnifiedAccessControlConditions,
    }: FormattedMultipleAccs = getFormattedAccessControlConditions(params);

    if (error) {
      throw new InvalidArgumentException(
        {
          info: {
            params,
          },
        },
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    // ========== Assemble identity parameter ==========
    const identityParam = this._getIdentityParamForEncryption(
      hashOfConditionsStr,
      dataToEncryptHash
    );

    this.#logger.info({ msg: 'identityParam', identityParam });

    const userMaxPrices = await this.getMaxPricesForNodeProduct({
      product: 'DECRYPTION',
      userMaxPrice,
    });

    const sessionSigs = await this._getSessionSigs({
      ...authContext,
      userMaxPrices,
    });

    // ========== Get Network Signature ==========
    const requestId = this._getNewRequestId();
    const nodePromises = this._getNodePromises(
      userMaxPrices.map(({ url }) => url),
      (url: string) => {
        // -- if session key is available, use it
        const authSigToSend = sessionSigs[url];

        if (!authSigToSend) {
          throw new InvalidArgumentException(
            {
              info: {
                params,
              },
            },
            'authSig is required'
          );
        }

        const reqBody: EncryptionSignRequest = {
          accessControlConditions: formattedAccessControlConditions,
          evmContractConditions: formattedEVMContractConditions,
          solRpcConditions: formattedSolRpcConditions,
          unifiedAccessControlConditions:
            formattedUnifiedAccessControlConditions,
          dataToEncryptHash,
          chain,
          authSig: authSigToSend,
          epoch: this.currentEpochNumber!,
        };

        const urlWithParh = composeLitUrl({
          url,
          endpoint: LIT_ENDPOINT.ENCRYPTION_SIGN,
        });

        return this.generatePromise(urlWithParh, reqBody, requestId);
      }
    );

    // -- resolve promises
    const res = await this._handleNodePromises(
      nodePromises,
      requestId,
      this._getThreshold()
    );

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    const signatureShares: NodeBlsSigningShare[] = (
      res as SuccessNodePromises<NodeBlsSigningShare>
    ).values;

    this.#logger.info({ requestId, signatureShares });

    // ========== Result ==========
    const decryptedData = await this._decryptWithSignatureShares(
      this.subnetPubKey,
      Buffer.from(identityParam, 'utf8'),
      ciphertext,
      signatureShares
    );

    return { decryptedData };
  };

  private _getIdentityParamForEncryption = (
    hashOfConditionsStr: string,
    hashOfPrivateDataStr: string
  ): string => {
    return new LitAccessControlConditionResource(
      `${hashOfConditionsStr}/${hashOfPrivateDataStr}`
    ).getResourceKey();
  };

  /** ============================== SESSION ============================== */

  /**
   * Sign a session public key using a PKP, which generates an authSig.
   * @returns {Object} An object containing the resulting signature.
   */
  private _signSessionKey = async (
    params: SignSessionKeyProp
  ): Promise<SignSessionKeyResponse> => {
    this.#logger.info({ msg: `[signSessionKey] params:`, params });

    // ========== Validate Params ==========
    // -- validate: If it's NOT ready
    if (!this.ready) {
      throw new LitNodeClientNotReadyError(
        {},
        '[signSessionKey] ]LitNodeClient is not ready.  Please call await litNodeClient.connect() first.'
      );
    }

    // -- construct SIWE message that will be signed by node to generate an authSig.
    const _expiration =
      params.expiration ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Try to get it from local storage, if not generates one~
    const sessionKey: SessionKeyPair =
      params.sessionKey ?? this._getSessionKey();
    const sessionKeyUri = this._getSessionKeyUri(sessionKey.publicKey);

    this.#logger.info(
      `[signSessionKey] sessionKeyUri is not found in params, generating a new one`,
      sessionKeyUri
    );

    if (!sessionKeyUri) {
      throw new InvalidParamType(
        {
          info: {
            params,
          },
        },
        '[signSessionKey] sessionKeyUri is not defined. Please provide a sessionKeyUri or a sessionKey.'
      );
    }

    // Compute the address from the public key if it's provided. Otherwise, the node will compute it.
    const pkpEthAddress = (function () {
      // prefix '0x' if it's not already prefixed
      params.pkpPublicKey = hexPrefixed(params.pkpPublicKey!);

      if (params.pkpPublicKey) return computeAddress(params.pkpPublicKey);

      // This will be populated by the node, using dummy value for now.
      return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    })();

    let siwe_statement = 'Lit Protocol PKP session signature';
    if (params.statement) {
      siwe_statement += ' ' + params.statement;
      this.#logger.info(
        `[signSessionKey] statement found in params: "${params.statement}"`
      );
    }

    let siweMessage;

    const siweParams = {
      domain: params?.domain || globalThis.location?.host || 'litprotocol.com',
      walletAddress: pkpEthAddress,
      statement: siwe_statement,
      uri: sessionKeyUri,
      version: '1',
      chainId: params.chainId ?? 1,
      expiration: _expiration,
      nonce: await this.getLatestBlockhash(),
    };

    if (params.resourceAbilityRequests) {
      siweMessage = await createSiweMessageWithRecaps({
        ...siweParams,
        resources: params.resourceAbilityRequests,
        litNodeClient: this,
      });
    } else {
      siweMessage = await createSiweMessage(siweParams);
    }

    // This may seem a bit weird because we usually only care about prices for sessionSigs...
    // But this also ensures we use the cheapest nodes and takes care of getting the minNodeCount of node URLs for the operation
    const targetNodePrices = await this.getMaxPricesForNodeProduct({
      product: 'LIT_ACTION',
    });

    // ========== Get Node Promises ==========
    // -- fetch shares from nodes
    const body: JsonSignSessionKeyRequestV2<LIT_CURVE_TYPE> = {
      nodeSet: this._getNodeSet(targetNodePrices.map(({ url }) => url)),
      sessionKey: sessionKeyUri,
      authMethods: params.authMethods,
      ...(params?.pkpPublicKey && { pkpPublicKey: params.pkpPublicKey }),
      siweMessage: siweMessage,
      curveType: LIT_CURVE.BLS,

      // -- custom auths
      ...(params?.litActionIpfsId && {
        litActionIpfsId: params.litActionIpfsId,
      }),
      ...(params?.litActionCode && { code: params.litActionCode }),
      ...(params?.jsParams && { jsParams: params.jsParams }),
      ...(this.currentEpochNumber && { epoch: this.currentEpochNumber }),
      signingScheme: LIT_CURVE.BLS,
    };

    this.#logger.info({ msg: `[signSessionKey] body:`, body });

    const requestId = this._getNewRequestId();
    this.#logger.info({ requestId, signSessionKeyBody: body });

    const targetNodeUrls = targetNodePrices.map(({ url }) => url);
    const nodePromises = this._getNodePromises(
      targetNodeUrls,
      (url: string) => {
        const reqBody: JsonSignSessionKeyRequestV1 = body;

        const urlWithPath = composeLitUrl({
          url,
          endpoint: LIT_ENDPOINT.SIGN_SESSION_KEY,
        });

        return this.generatePromise(urlWithPath, reqBody, requestId);
      }
    );

    // -- resolve promises
    let res;
    try {
      res = await this._handleNodePromises(
        nodePromises,
        requestId,
        this._getThreshold()
      );
      this.#logger.info({ msg: 'signSessionKey node promises', res });
    } catch (e) {
      throw new UnknownError(
        {
          info: {
            requestId,
          },
          cause: e,
        },
        'Error when handling node promises'
      );
    }

    this.#logger.info({ requestId, handleNodePromisesRes: res });

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
      return {} as SignSessionKeyResponse;
    }

    const responseData: BlsResponseData[] = res.values as BlsResponseData[];
    this.#logger.info({
      requestId,
      responseData,
    });

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const curveType = responseData[0]?.curveType;

    if (curveType === 'ECDSA') {
      throw new Error(
        'The ECDSA curve type is not supported in this version. Please use version 6.x.x instead.'
      );
    }

    this.#logger.info(`[signSessionKey] curveType is "${curveType}"`);

    const signedDataList = responseData.map((s) => s.dataSigned);

    if (signedDataList.length <= 0) {
      const err = `[signSessionKey] signedDataList is empty.`;
      this.#logger.info(err);
      throw new InvalidSignatureError(
        {
          info: {
            requestId,
            responseData,
            signedDataList,
          },
        },
        err
      );
    }

    this.#logger.info({
      requestId,
      signedDataList,
    });

    // -- checking if we have enough shares.
    const validatedSignedDataList = this._validateSignSessionKeyResponseData(
      responseData,
      requestId,
      this._getThreshold()
    );

    const blsSignedData: BlsResponseData[] = validatedSignedDataList;

    const sigType = mostCommonValue(blsSignedData.map((s) => s.curveType));
    this.#logger.info(`[signSessionKey] sigType:`, sigType);

    const signatureShares = getBlsSignatures(blsSignedData);

    this.#logger.info(`[signSessionKey] signatureShares:`, signatureShares);

    const blsCombinedSignature = await combineSignatureShares(signatureShares);

    this.#logger.info(
      `[signSessionKey] blsCombinedSignature:`,
      blsCombinedSignature
    );

    const publicKey = removeHexPrefix(params.pkpPublicKey);
    this.#logger.info(`[signSessionKey] publicKey:`, publicKey);

    const dataSigned = mostCommonValue(blsSignedData.map((s) => s.dataSigned));
    this.#logger.info(`[signSessionKey] dataSigned:`, dataSigned);

    const mostCommonSiweMessage = mostCommonValue(
      blsSignedData.map((s) => s.siweMessage)
    );

    this.#logger.info(
      `[signSessionKey] mostCommonSiweMessage:`,
      mostCommonSiweMessage
    );

    const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

    this.#logger.info(`[signSessionKey] signedMessage:`, signedMessage);

    const signSessionKeyRes: SignSessionKeyResponse = {
      authSig: {
        sig: JSON.stringify({
          ProofOfPossession: blsCombinedSignature,
        }),
        algo: 'LIT_BLS',
        derivedVia: 'lit.bls',
        signedMessage,
        address: computeAddress(hexPrefixed(publicKey)),
      },
      pkpPublicKey: publicKey,
    };

    return signSessionKeyRes;
  };

  getSignSessionKeyShares = async (
    url: string,
    params: {
      body: {
        sessionKey: string;
        authMethods: AuthMethod[];
        pkpPublicKey?: string;
        authSig?: AuthSig;
        siweMessage: string;
      };
    },
    requestId: string
  ) => {
    this.#logger.info('getSignSessionKeyShares');
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.SIGN_SESSION_KEY,
    });
    return await this._sendCommandToNode({
      url: urlWithPath,
      data: params.body,
      requestId,
    });
  };

  getMaxPricesForNodeProduct = async ({
    userMaxPrice,
    product,
  }: {
    userMaxPrice?: bigint;
    product: keyof typeof PRODUCT_IDS;
  }) => {
    this.#logger.info({
      msg: 'getMaxPricesForNodeProduct(): Product',
      product,
    });
    const getUserMaxPrice = () => {
      if (userMaxPrice) {
        this.#logger.info({
          msg: 'getMaxPricesForNodeProduct(): User provided maxPrice of userMaxPrice',
          userMaxPrice,
        });
        return userMaxPrice;
      }

      if (this.defaultMaxPriceByProduct[product] === -1n) {
        this.#logger.info(
          `getMaxPricesForNodeProduct(): No user-provided maxPrice and no defaultMaxPrice set for ${product}; setting to max value`
        );

        return 340_282_366_920_938_463_463_374_607_431_768_211_455n; // Rust U128 max
      }
      return this.defaultMaxPriceByProduct[product];
    };

    return getMaxPricesForNodeProduct({
      nodePrices: await this._getNodePrices(),
      userMaxPrice: getUserMaxPrice(),
      productId: PRODUCT_IDS[product],
      numRequiredNodes: this._getThreshold(),
    });
  };

  /**
   *
   * Retrieves or generates sessionSigs (think access token) for accessing Lit Network resources.
   *
   * How this function works on a high level:
   * 1. Generate or retrieve [session keys](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.SessionKeyPair.html) (a public and private key pair)
   * 2. Generate or retrieve the [`AuthSig`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthSig.html) that specifies the session [abilities](https://v6-api-doc-lit-js-sdk.vercel.app/enums/auth_helpers_src.LitAbility.html)
   * 3. Sign the specific resources with the session key
   *
   * The process follows these steps:
   * 1. Retrieves or generates a session key pair (Ed25519) for the user's device. The session key is either fetched from local storage or newly created if not found. The key does not expire.
   * 2. Generates an authentication signature (`authSig`) by signing an ERC-5573 "Sign-in with Ethereum" message, which includes resource ability requests, capabilities, expiration, the user's device session public key, and a nonce. The `authSig` is retrieved from local storage, and if it has expired, the user will be prompted to re-sign.
   * 3. Uses the session private key to sign the session public key along with the resource ability requests, capabilities, issuedAt, and expiration details. This creates a device-generated signature.
   * 4. Constructs the session signatures (`sessionSigs`) by including the device-generated signature and the original message. The `sessionSigs` provide access to Lit Network features such as `executeJs` and `pkpSign`.
   *
   * See Sequence Diagram: https://www.plantuml.com/plantuml/uml/VPH1RnCn48Nl_XLFlT1Av00eGkm15QKLWY8K9K9SO-rEar4sjcLFalBl6NjJAuaMRl5utfjlPjQvJsAZx7UziQtuY5-9eWaQufQ3TOAR77cJy407Rka6zlNdHTRouUbIzSEtjiTIBUswg5v_NwMnuAVlA9KKFPN3I0x9qSSj7bqNF3iPykl9c4o9oUSJMuElv2XQ8IHAYRt3bluWM8wuVUpUJwVlFjsP8JUh5B_1DyV2AYdD6DjhLsTQTaYd3W3ad28SGWqM997fG5ZrB9DJqOaALuRwH1TMpik8tIYze-E8OrPKU5I6cMqtem2kCqOhr4vdaRAvtSjcoMkTo68scKu_Vi1EPMfrP_xVtj7sFMaHNg-6GVqk0MW0z18uKdVULTvDWtdqko28b7KktvUB2hKOBd1asU2QgDfTzrj7T4bLPdv6TR0zLwPQKkkZpIRTY4CTMbrBpg_VKuXyi49beUAHqIlirOUrL2zq9JPPdpRR5OMLVQGoGlLcjyRyQNv6MHz4W_fG42W--xWhUfNyOxiLL1USS6lRLeyAkYLNjrkVJuClm_qp5I8Lq0krUw7lwIt2DgY9oiozrjA_Yhy0
   *
   * Note: When generating session signatures for different PKPs or auth methods,
   * be sure to call disconnectWeb3 to clear auth signatures stored in local storage
   *
   * @param { AuthenticationContext } params
   *
   * An example of how this function is used can be found in the Lit developer-guides-code repository [here](https://github.com/LIT-Protocol/developer-guides-code/tree/master/session-signatures/getSessionSigs).
   *
   */
  private _getSessionSigs = async (
    params: AuthenticationContext & {
      userMaxPrices: { url: string; price: bigint }[];
    }
  ): Promise<SessionSigsMap> => {
    // -- prepare
    // Try to get it from local storage, if not generates one~
    const sessionKey = params.sessionKey ?? this._getSessionKey();

    const sessionKeyUri = this._getSessionKeyUri(sessionKey.publicKey);

    // First get or generate the session capability object for the specified resources.
    const sessionCapabilityObject = params.sessionCapabilityObject
      ? params.sessionCapabilityObject
      : await generateSessionCapabilityObjectWithWildcards(
          params.resourceAbilityRequests.map((r) => r.resource)
        );
    const expiration = params.expiration || getExpiration();

    // -- (TRY) to get the wallet signature
    let authSig = await this._getWalletSig({
      authNeededCallback: params.authNeededCallback,
      chain: params.chain || 'ethereum',
      sessionCapabilityObject,
      switchChain: params.switchChain,
      expiration: expiration,
      sessionKey: sessionKey,
      sessionKeyUri: sessionKeyUri,
      nonce: await this.getLatestBlockhash(),

      // -- for recap
      resourceAbilityRequests: params.resourceAbilityRequests,

      // -- optional fields
      ...(params.litActionCode && { litActionCode: params.litActionCode }),
      ...(params.litActionIpfsId && {
        litActionIpfsId: params.litActionIpfsId,
      }),
      ...(params.jsParams && { jsParams: params.jsParams }),
    });

    const needToResignSessionKey = await this._checkNeedToResignSessionKey({
      authSig,
      sessionKeyUri,
      resourceAbilityRequests: params.resourceAbilityRequests,
    });

    // -- (CHECK) if we need to resign the session key
    if (needToResignSessionKey) {
      this.#logger.info('need to re-sign session key. Signing...');
      authSig = await this._authCallbackAndUpdateStorageItem({
        authCallback: params.authNeededCallback,
        authCallbackParams: {
          chain: params.chain || 'ethereum',
          statement: sessionCapabilityObject.statement,
          resources: [sessionCapabilityObject.encodeAsSiweResource()],
          switchChain: params.switchChain,
          expiration,
          sessionKey: sessionKey,
          uri: sessionKeyUri,
          nonce: await this.getLatestBlockhash(),
          resourceAbilityRequests: params.resourceAbilityRequests,

          // -- optional fields
          ...(params.litActionCode && { litActionCode: params.litActionCode }),
          ...(params.litActionIpfsId && {
            litActionIpfsId: params.litActionIpfsId,
          }),
          ...(params.jsParams && { jsParams: params.jsParams }),
        },
      });
    }

    if (
      authSig.address === '' ||
      authSig.derivedVia === '' ||
      authSig.sig === '' ||
      authSig.signedMessage === ''
    ) {
      throw new WalletSignatureNotFoundError(
        {
          info: {
            authSig,
          },
        },
        'No wallet signature found'
      );
    }

    // ===== AFTER we have Valid Signed Session Key =====
    // - Let's sign the resources with the session key
    // - 5 minutes is the default expiration for a session signature
    // - Because we can generate a new session sig every time the user wants to access a resource without prompting them to sign with their wallet
    const sessionExpiration =
      expiration ?? new Date(Date.now() + 1000 * 60 * 5).toISOString();

    const capabilities = params.capabilityAuthSigs
      ? [
          ...(params.capabilityAuthSigs ?? []),
          params.capabilityAuthSigs,
          authSig,
        ]
      : [...(params.capabilityAuthSigs ?? []), authSig];

    // This is the template that will be combined with the node address as a single object, then signed by the session key
    // so that the node can verify the session signature
    const sessionSigningTemplate = {
      sessionKey: sessionKey.publicKey,
      resourceAbilityRequests: params.resourceAbilityRequests,
      capabilities,
      issuedAt: new Date().toISOString(),
      expiration: sessionExpiration,
    };

    const sessionSigs: SessionSigsMap = {};

    params.userMaxPrices.forEach(({ url: nodeAddress, price }) => {
      const toSign: SessionSigningTemplate = {
        ...sessionSigningTemplate,
        nodeAddress,
        maxPrice: price.toString(),
      };

      this.#logger.info(
        `Setting maxprice for ${nodeAddress} to `,
        price.toString()
      );

      const signedMessage = JSON.stringify(toSign);

      const uint8arrayMessage = Buffer.from(signedMessage, 'utf8');
      const signature = ed25519.sign(uint8arrayMessage, sessionKey.secretKey);

      sessionSigs[nodeAddress] = {
        sig: Buffer.from(signature).toString('hex'),
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: signedMessage,
        address: sessionKey.publicKey,
        algo: 'ed25519',
      };
    });

    this.#logger.info({ msg: 'sessionSigs', sessionSigs });

    try {
      const formattedSessionSigs = formatSessionSigs(
        JSON.stringify(sessionSigs)
      );
      this.#logger.info(formattedSessionSigs);
    } catch (e) {
      // swallow error
      this.#logger.info({ msg: 'Error formatting session signatures', e });
    }

    return sessionSigs;
  };

  /**
   * Retrieves the PKP sessionSigs.
   *
   * @param params - The parameters for retrieving the PKP sessionSigs.
   * @returns A promise that resolves to the PKP sessionSigs.
   * @throws An error if any of the required parameters are missing or if `litActionCode` and `ipfsId` exist at the same time.
   */
  getPkpAuthContext = (params: AuthenticationContext) => {
    const chain = params?.chain || 'ethereum';

    return {
      chain,
      ...params,
      authNeededCallback: async (props: AuthCallbackParams) => {
        // -- validate
        if (!props.expiration) {
          throw new ParamsMissingError(
            {
              info: {
                props,
              },
            },
            '[getPkpSessionSigs/callback] expiration is required'
          );
        }

        if (!props.resources) {
          throw new ParamsMissingError(
            {
              info: {
                props,
              },
            },
            '[getPkpSessionSigs/callback]resources is required'
          );
        }

        if (!props.resourceAbilityRequests) {
          throw new ParamsMissingError(
            {
              info: {
                props,
              },
            },
            '[getPkpSessionSigs/callback]resourceAbilityRequests is required'
          );
        }

        // lit action code and ipfs id cannot exist at the same time
        if (props.litActionCode && props.litActionIpfsId) {
          throw new UnsupportedMethodError(
            {
              info: {
                props,
              },
            },
            '[getPkpSessionSigs/callback]litActionCode and litActionIpfsId cannot exist at the same time'
          );
        }

        // Check if IPFS options are provided and if the code should be fetched from IPFS and overwrite the current code.
        // This will fetch the code from the specified IPFS gateway using the provided ipfsId,
        // and update the params with the fetched code, removing the ipfsId afterward.
        const overwriteCode =
          params.ipfsOptions?.overwriteCode ||
          GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[this.config.litNetwork];

        if (overwriteCode && props.litActionIpfsId) {
          const code = await this._getFallbackIpfsCode(
            params.ipfsOptions?.gatewayUrl,
            props.litActionIpfsId
          );

          props = {
            ...props,
            litActionCode: code,
            litActionIpfsId: undefined,
          };
        }

        /**
         * We must provide an empty array for authMethods even if we are not using any auth methods.
         * So that the nodes can serialize the request correctly.
         */
        const authMethods = params.authMethods || [];

        const response = await this._signSessionKey({
          sessionKey: props.sessionKey,
          statement: props.statement || 'Some custom statement.',
          authMethods: [...authMethods],
          pkpPublicKey: params.pkpPublicKey,
          expiration: props.expiration,
          resources: props.resources,
          chainId: 1,

          // -- required fields
          resourceAbilityRequests: props.resourceAbilityRequests,

          // -- optional fields
          ...(props.litActionCode && { litActionCode: props.litActionCode }),
          ...(props.litActionIpfsId && {
            litActionIpfsId: props.litActionIpfsId,
          }),
          ...(props.jsParams && { jsParams: props.jsParams }),
        });

        return response.authSig;
      },
    };
  };

  /**
   *
   * Get Session Key URI eg. lit:session:0x1234
   *
   * @param publicKey is the public key of the session key
   * @returns { string } the session key uri
   */
  private _getSessionKeyUri = (publicKey: string): string => {
    return SIWE_URI_PREFIX.SESSION_KEY + publicKey;
  };

  /**
   * Authenticates an Auth Method for claiming a Programmable Key Pair (PKP).
   * A {@link MintCallback} can be defined for custom on chain interactions
   * by default the callback will forward to a relay server for minting on chain.
   * @param {ClaimKeyRequest} params an Auth Method and {@link MintCallback}
   * @returns {Promise<ClaimKeyResponse>}
   */
  async claimKeyId(
    params: ClaimRequest<ClaimProcessor>
  ): Promise<ClaimKeyResponse> {
    if (!this.ready) {
      const message =
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throw new LitNodeClientNotReadyError({}, message);
    }

    if (params.authMethod.authMethodType == AUTH_METHOD_TYPE.WebAuthn) {
      throw new LitNodeClientNotReadyError(
        {},
        'Unsupported auth method type. Webauthn, and Lit Actions are not supported for claiming'
      );
    }

    const requestId = this._getNewRequestId();

    // This may seem a bit weird because we usually only care about prices for sessionSigs...
    // But this also ensures we use the cheapest nodes and takes care of getting the minNodeCount of node URLs for the operation
    const targetNodePrices = await this.getMaxPricesForNodeProduct({
      product: 'LIT_ACTION',
    });

    const targetNodeUrls = targetNodePrices.map(({ url }) => url);

    const nodePromises = this._getNodePromises(
      targetNodeUrls,
      (url: string) => {
        if (!params.authMethod) {
          throw new ParamsMissingError(
            {
              info: {
                params,
              },
            },
            'authMethod is required'
          );
        }

        const reqBody: JsonPKPClaimKeyRequest = {
          authMethod: params.authMethod,
        };

        const urlWithPath = composeLitUrl({
          url,
          endpoint: LIT_ENDPOINT.PKP_CLAIM,
        });

        return this.generatePromise(urlWithPath, reqBody, requestId);
      }
    );

    const responseData = await this._handleNodePromises(
      nodePromises,
      requestId,
      this._getThreshold()
    );

    if (responseData.success) {
      const nodeSignatures: Signature[] = responseData.values.map((r) => {
        const sig = ethers.utils.splitSignature(`0x${r.signature}`);
        return {
          r: sig.r,
          s: sig.s,
          v: sig.v,
        };
      });

      this.#logger.info({
        requestId,
        responseData,
      });

      const derivedKeyId = responseData.values[0].derivedKeyId;

      const pubkey = await this.computeHDPubKey(derivedKeyId);
      this.#logger.info({
        requestId,
        msg: `pubkey ${pubkey} derived from key id ${derivedKeyId}`,
      });

      const relayParams = params as ClaimRequest<'relay'>;

      let mintTx = '';
      if (params.mintCallback && 'signer' in params) {
        mintTx = await params.mintCallback(
          {
            derivedKeyId,
            authMethodType: params.authMethod.authMethodType,
            signatures: nodeSignatures,
            pubkey,
            signer: (params as ClaimRequest<'client'>).signer,
            ...relayParams,
          },
          this.config.litNetwork
        );
      } else {
        mintTx = await defaultMintClaimCallback(
          {
            derivedKeyId,
            authMethodType: params.authMethod.authMethodType,
            signatures: nodeSignatures,
            pubkey,
            ...relayParams,
          },
          this.config.litNetwork
        );
      }

      return {
        signatures: nodeSignatures,
        claimedKeyId: derivedKeyId,
        pubkey,
        mintTx,
      };
    } else {
      throw new UnknownError(
        {
          info: {
            requestId,
            responseData,
          },
        },
        `Claim request has failed. Request trace id: lit_%s`,
        requestId
      );
    }
  }

  /**
   * Note: ✨ This is to check data integrity of the response from the signSessionKey endpoint.
   * As sometimes the response data structure has changed and we need to update the required fields.
   * Validates the response data from the signSessionKey endpoint.
   * Each response data item must have all required fields and valid ProofOfPossession.
   *
   * @param responseData - Array of BlsResponseData to validate
   * @param requestId - Request ID for logging and error reporting
   * @param threshold - Minimum number of valid responses needed
   * @returns Filtered array of valid BlsResponseData
   * @throws InvalidSignatureError if validation fails
   */
  private _validateSignSessionKeyResponseData(
    responseData: BlsResponseData[],
    requestId: string,
    threshold: number
  ): BlsResponseData[] {
    // each of this field cannot be empty
    const requiredFields = [
      'signatureShare',
      'curveType',
      'siweMessage',
      'dataSigned',
      'blsRootPubkey',
      'result',
    ];

    // -- checking if we have enough shares.
    const validatedSignedDataList = responseData
      .map((data: BlsResponseData) => {
        // check if all required fields are present
        for (const field of requiredFields) {
          const key: keyof BlsResponseData = field as keyof BlsResponseData;

          if (
            data[key] === undefined ||
            data[key] === null ||
            data[key] === ''
          ) {
            this.#logger.info(
              `Invalid signed data. "${field}" is missing. Not a problem, we only need ${threshold} nodes to sign the session key.`
            );
            return null;
          }
        }

        if (!data.signatureShare.ProofOfPossession) {
          const err = `Invalid signed data. "ProofOfPossession" is missing.`;
          this.#logger.info(err);
          throw new InvalidSignatureError(
            {
              info: {
                requestId,
                responseData,
                data,
              },
            },
            err
          );
        }

        return data;
      })
      .filter((item) => item !== null);

    this.#logger.info({
      requestId,
      validatedSignedDataList,
    });
    this.#logger.info({ requestId, msg: 'minimum threshold', threshold });

    if (validatedSignedDataList.length < threshold) {
      throw new InvalidSignatureError(
        {
          info: {
            requestId,
            responseData,
            validatedSignedDataList,
            threshold,
          },
        },
        `not enough nodes signed the session key. Expected ${threshold}, got ${validatedSignedDataList.length}`
      );
    }

    return validatedSignedDataList as BlsResponseData[];
  }
}
