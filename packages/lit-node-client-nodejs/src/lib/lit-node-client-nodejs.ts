import { computeAddress } from '@ethersproject/transactions';
import { BigNumber, ethers } from 'ethers';
import { sha256 } from 'ethers/lib/utils';
import { SiweMessage } from 'siwe';

import {
  LitAccessControlConditionResource,
  LitResourceAbilityRequest,
  decode,
  RecapSessionCapabilityObject,
  generateAuthSig,
  createSiweMessageWithCapacityDelegation,
  createSiweMessageWithRecaps,
  createSiweMessage,
} from '@lit-protocol/auth-helpers';
import {
  AUTH_METHOD_TYPE,
  EITHER_TYPE,
  FALLBACK_IPFS_GATEWAYS,
  GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK,
  LIT_ACTION_IPFS_HASH,
  LIT_CURVE,
  LIT_ENDPOINT,
  LIT_SESSION_KEY_URI,
  LOCAL_STORAGE_KEYS,
  ParamsMissingError,
  ParamNullError,
  LitNodeClientNotReadyError,
  InvalidParamType,
  InvalidArgumentException,
  WalletSignatureNotFoundError,
  UnknownError,
  InvalidSignatureError,
  UnsupportedMethodError,
  InvalidSessionSigs,
} from '@lit-protocol/constants';
import { LitCore, composeLitUrl } from '@lit-protocol/core';
import {
  combineSignatureShares,
  encrypt,
  generateSessionKeyPair,
  verifyAndDecryptWithSignatureShares,
  verifySignature,
} from '@lit-protocol/crypto';
import {
  defaultMintClaimCallback,
  findMostCommonResponse,
  formatSessionSigs,
  hexPrefixed,
  log,
  logError,
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
  normalizeAndStringify,
  safeParams,
  removeHexPrefix,
  validateSessionSigs,
} from '@lit-protocol/misc';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '@lit-protocol/misc-browser';
import { nacl } from '@lit-protocol/nacl';
import { LitNodeClientConfigSchema } from '@lit-protocol/schemas';
import { ILitResource, ISessionCapabilityObject } from '@lit-protocol/types';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import { encodeCode } from './helpers/encode-code';
import { getBlsSignatures } from './helpers/get-bls-signatures';
import { getClaims } from './helpers/get-claims';
import { getClaimsList } from './helpers/get-claims-list';
import { getSignatures } from './helpers/get-signatures';
import { normalizeArray } from './helpers/normalize-array';
import { normalizeJsParams } from './helpers/normalize-params';
import { parseAsJsonOrString } from './helpers/parse-as-json-or-string';
import { parsePkpSignResponse } from './helpers/parse-pkp-sign-response';
import { processLitActionResponseStrategy } from './helpers/process-lit-action-response-strategy';
import { removeDoubleQuotes } from './helpers/remove-double-quotes';
import { blsSessionSigVerify } from './helpers/validate-bls-session-sig';

import type {
  AuthCallback,
  AuthCallbackParams,
  AuthSig,
  ClaimKeyResponse,
  ClaimProcessor,
  ClaimRequest,
  DecryptRequest,
  DecryptResponse,
  EncryptRequest,
  EncryptResponse,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  GetSessionSigsProps,
  GetSignedTokenRequest,
  GetWalletSigProps,
  JsonExecutionRequest,
  JsonPkpSignRequest,
  LitClientSessionManager,
  LitNodeClientConfig,
  NodeBlsSigningShare,
  NodeCommandResponse,
  NodeShare,
  RejectedNodePromises,
  SessionKeyPair,
  SessionSigningTemplate,
  SessionSigsMap,
  SignSessionKeyProp,
  SignSessionKeyResponse,
  Signature,
  SuccessNodePromises,
  ILitNodeClient,
  GetPkpSessionSigs,
  CapacityCreditsReq,
  CapacityCreditsRes,
  JsonSignSessionKeyRequestV1,
  BlsResponseData,
  JsonExecutionSdkParamsTargetNode,
  JsonExecutionRequestTargetNode,
  JsonExecutionSdkParams,
  ExecuteJsNoSigningResponse,
  JsonPkpSignSdkParams,
  SigResponse,
  EncryptSdkParams,
  GetLitActionSessionSigs,
  GetSignSessionKeySharesProp,
  EncryptionSignRequest,
  SigningAccessControlConditionRequest,
  JsonPKPClaimKeyRequest,
} from '@lit-protocol/types';

export class LitNodeClientNodeJs
  extends LitCore
  implements LitClientSessionManager, ILitNodeClient
{
  defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;

  // ========== Constructor ==========
  constructor(args: LitNodeClientConfig) {
    let _args: LitNodeClientConfig;
    try {
      _args = LitNodeClientConfigSchema.parse(args);
    } catch (e) {
      throw new InvalidArgumentException(
        {
          cause: e,
          info: {
            args,
          },
        },
        'must provide LitNodeClient parameters'
      );
    }

    // Passing args instead of _args so parent can make its own assertions without the ones here interfering
    super(args);

    if ('defaultAuthCallback' in _args) {
      this.defaultAuthCallback = _args.defaultAuthCallback;
    }
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
      log(
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
      uri: 'lit:capability:delegation',
      litNodeClient: this,
      walletAddress: dAppOwnerWalletAddress,
      nonce: await this.getLatestBlockhash(),
      expiration: params.expiration,
      domain: params.domain,
      statement: params.statement,

      // -- capacity delegation specific configuration
      uses: params.uses,
      delegateeAddresses: params.delegateeAddresses,
      capacityTokenId: params.capacityTokenId,
    });

    const authSig = await generateAuthSig({
      signer: params.dAppOwnerWallet,
      toSign: siweMessage,
    });

    return { capacityDelegationAuthSig: authSig };
  };

  // ========== Scoped Class Helpers ==========

  /**
   *
   * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
   *
   */
  getJWTParams = () => {
    const now = Date.now();
    const iat = Math.floor(now / 1000);
    const exp = iat + 12 * 60 * 60; // 12 hours in seconds

    return { iat, exp };
  };

  // ==================== SESSIONS ====================
  /**
   * Try to get the session key in the local storage,
   * if not, generates one.
   * @return { SessionKeyPair } session key pair
   */
  getSessionKey = (): SessionKeyPair => {
    const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY;
    const storedSessionKeyOrError = getStorageItem(storageKey);

    if (
      storedSessionKeyOrError.type === EITHER_TYPE.ERROR ||
      !storedSessionKeyOrError.result ||
      storedSessionKeyOrError.result === ''
    ) {
      console.warn(
        `Storage key "${storageKey}" is missing. Not a problem. Continue...`
      );

      // Generate new one
      const newSessionKey = generateSessionKeyPair();

      // (TRY) to set to local storage
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
      } catch (e) {
        log(
          `[getSessionKey] Localstorage not available.Not a problem. Continue...`
        );
      }

      return newSessionKey;
    } else {
      return JSON.parse(storedSessionKeyOrError.result as string);
    }
  };

  /**
   * Check if a given object is of type SessionKeyPair.
   *
   * @param obj - The object to check.
   * @returns True if the object is of type SessionKeyPair.
   */
  isSessionKeyPair(obj: any): obj is SessionKeyPair {
    return (
      typeof obj === 'object' &&
      'publicKey' in obj &&
      'secretKey' in obj &&
      typeof obj.publicKey === 'string' &&
      typeof obj.secretKey === 'string'
    );
  }

  /**
   * Generates wildcard capability for each of the LIT resources
   * specified.
   * @param litResources is an array of LIT resources
   * @param addAllCapabilities is a boolean that specifies whether to add all capabilities for each resource
   */
  static async generateSessionCapabilityObjectWithWildcards(
    litResources: ILitResource[],
    addAllCapabilities?: boolean
  ): Promise<ISessionCapabilityObject> {
    const sessionCapabilityObject = new RecapSessionCapabilityObject({}, []);

    // disable for now
    const _addAllCapabilities = addAllCapabilities ?? false;

    if (_addAllCapabilities) {
      for (const litResource of litResources) {
        sessionCapabilityObject.addAllCapabilitiesForResource(litResource);
      }
    }

    return sessionCapabilityObject;
  }

  // backward compatibility
  async generateSessionCapabilityObjectWithWildcards(
    litResources: ILitResource[]
  ): Promise<ISessionCapabilityObject> {
    return await LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards(
      litResources
    );
  }

  /**
   *
   * Get expiration for session default time is 1 day / 24 hours
   *
   */
  static getExpiration = () => {
    return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  };

  // backward compatibility
  getExpiration = () => {
    return LitNodeClientNodeJs.getExpiration();
  };

  /**
   *
   * Get the signature from local storage, if not, generates one
   *
   */
  getWalletSig = async ({
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
    log(`getWalletSig - flow starts
        storageKey: ${storageKey}
        storedWalletSigOrError: ${JSON.stringify(storedWalletSigOrError)}
    `);

    if (
      storedWalletSigOrError.type === EITHER_TYPE.ERROR ||
      !storedWalletSigOrError.result ||
      storedWalletSigOrError.result == ''
    ) {
      log('getWalletSig - flow 1');
      console.warn(
        `Storage key "${storageKey}" is missing. Not a problem. Continue...`
      );
      if (authNeededCallback) {
        log('getWalletSig - flow 1.1');

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

        log('callback body:', body);

        walletSig = await authNeededCallback(body);
      } else {
        log('getWalletSig - flow 1.2');
        if (!this.defaultAuthCallback) {
          log('getWalletSig - flow 1.2.1');
          throw new ParamsMissingError(
            {},
            'No authNeededCallback nor default auth callback provided'
          );
        }

        log('getWalletSig - flow 1.2.2');
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

      log('getWalletSig - flow 1.3');

      // (TRY) to set walletSig to local storage
      const storeNewWalletSigOrError = setStorageItem(
        storageKey,
        JSON.stringify(walletSig)
      );
      if (storeNewWalletSigOrError.type === 'ERROR') {
        log('getWalletSig - flow 1.4');
        console.warn(
          `Unable to store walletSig in local storage. Not a problem. Continue...`
        );
      }
    } else {
      log('getWalletSig - flow 2');
      try {
        walletSig = JSON.parse(storedWalletSigOrError.result as string);
        log('getWalletSig - flow 2.1');
      } catch (e) {
        console.warn('Error parsing walletSig', e);
        log('getWalletSig - flow 2.2');
      }
    }

    log('getWalletSig - flow 3');
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
    console.warn(
      `Unable to store walletSig in local storage. Not a problem. Continuing to remove item key...`
    );
    const removeWalletSigOrError = removeStorageItem(
      LOCAL_STORAGE_KEYS.WALLET_SIGNATURE
    );
    if (removeWalletSigOrError.type === EITHER_TYPE.ERROR) {
      console.warn(
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
  checkNeedToResignSessionKey = async ({
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
        log(`Error while verifying BLS signature: `, e);
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
        log(`Error while verifying bls signature: `, e);
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
      log('Need retry because uri does not match');
      return true;
    }

    // make sure the authSig contains at least one resource.
    if (
      !authSigSiweMessage.resources ||
      authSigSiweMessage.resources.length === 0
    ) {
      log('Need retry because empty resources');
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
        log('Need retry because capabilities do not match', {
          authSigSessionCapabilityObject,
          resourceAbilityRequest,
        });
        return true;
      }
    }

    return false;
  };

  // ==================== API Calls to Nodes ====================

  /**
   *
   * Combine Shares from network public key set and signature shares
   *
   * @param { NodeBlsSigningShare } signatureShares
   * @param { string } requestId
   *
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT = async (
    signatureShares: NodeBlsSigningShare[],
    requestId: string = ''
  ): Promise<string> => {
    // ========== Shares Validations ==========
    // -- sanity check
    if (
      !signatureShares.every(
        (val, i, arr) => val.unsignedJwt === arr[0].unsignedJwt
      )
    ) {
      const msg =
        'Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things';
      logErrorWithRequestId(requestId, msg);
    }

    // ========== Sorting ==========
    // -- sort the sig shares by share index.  this is important when combining the shares.
    signatureShares.sort((a, b) => a.shareIndex - b.shareIndex);

    // ========== Combine Shares ==========
    const signature = await combineSignatureShares(
      signatureShares.map((s) => s.signatureShare)
    );

    logWithRequestId(requestId, 'signature is', signature);

    const unsignedJwt = mostCommonString(
      signatureShares.map((s) => s.unsignedJwt)
    );

    // ========== Result ==========
    // convert the sig to base64 and append to the jwt
    const finalJwt: string = `${unsignedJwt}.${uint8arrayToString(
      uint8arrayFromString(signature, 'base16'),
      'base64urlpad'
    )}`;

    return finalJwt;
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

  // ========== Promise Handlers ==========
  getIpfsId = async ({
    dataToHash,
    sessionSigs,
  }: {
    dataToHash: string;
    sessionSigs: SessionSigsMap;
    debug?: boolean;
  }) => {
    const res = await this.executeJs({
      ipfsId: LIT_ACTION_IPFS_HASH,
      sessionSigs,
      jsParams: {
        dataToHash,
      },
    }).catch((e) => {
      logError('Error getting IPFS ID', e);
      throw e;
    });

    let data;

    if (typeof res.response === 'string') {
      try {
        data = JSON.parse(res.response).res;
      } catch (e) {
        data = res.response;
      }
    }

    if (!data.success) {
      logError('Error getting IPFS ID', data.data);
    }

    return data.data;
  };

  /**
   * Run lit action on a single deterministicly selected node. It's important that the nodes use the same deterministic selection algorithm.
   *
   * Lit Action: dataToHash -> IPFS CID
   * QmUjX8MW6StQ7NKNdaS6g4RMkvN5hcgtKmEi8Mca6oX4t3
   *
   * @param { ExecuteJsProps } params
   *
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
   *
   */
  runOnTargetedNodes = async (
    params: JsonExecutionSdkParamsTargetNode
  ): Promise<SuccessNodePromises | RejectedNodePromises> => {
    log('running runOnTargetedNodes:', params.targetNodeRange);

    if (!params.targetNodeRange) {
      throw new InvalidParamType(
        {
          info: {
            params,
          },
        },
        'targetNodeRange is required'
      );
    }

    // determine which node to run on
    const ipfsId = await this.getIpfsId({
      dataToHash: params.code!,
      sessionSigs: params.sessionSigs,
    });

    // select targetNodeRange number of random index of the bootstrapUrls.length
    const randomSelectedNodeIndexes: number[] = [];

    let nodeCounter = 0;

    while (randomSelectedNodeIndexes.length < params.targetNodeRange) {
      const str = `${nodeCounter}:${ipfsId.toString()}`;
      const cidBuffer = Buffer.from(str);
      const hash = sha256(cidBuffer);
      const hashAsNumber = BigNumber.from(hash);

      const nodeIndex = hashAsNumber
        .mod(this.config.bootstrapUrls.length)
        .toNumber();

      log('nodeIndex:', nodeIndex);

      // must be unique & less than bootstrapUrls.length
      if (
        !randomSelectedNodeIndexes.includes(nodeIndex) &&
        nodeIndex < this.config.bootstrapUrls.length
      ) {
        randomSelectedNodeIndexes.push(nodeIndex);
      }
      nodeCounter++;
    }

    log('Final Selected Indexes:', randomSelectedNodeIndexes);

    const requestId = this._getNewRequestId();
    const nodePromises = [];

    for (let i = 0; i < randomSelectedNodeIndexes.length; i++) {
      // should we mix in the jsParams?  to do this, we need a canonical way to serialize the jsParams object that will be identical in rust.
      // const jsParams = params.jsParams || {};
      // const jsParamsString = JSON.stringify(jsParams);

      const nodeIndex = randomSelectedNodeIndexes[i];

      // FIXME: we are using this.config.bootstrapUrls to pick the selected node, but we
      // should be using something like the list of nodes from the staking contract
      // because the staking nodes can change, and the rust code will use the same list
      const url = this.config.bootstrapUrls[nodeIndex];

      log(`running on node ${nodeIndex} at ${url}`);

      // -- choose the right signature
      const sessionSig = this.getSessionSigByUrl({
        sessionSigs: params.sessionSigs,
        url,
      });

      const reqBody: JsonExecutionRequestTargetNode = {
        ...params,
        targetNodeRange: params.targetNodeRange,
        authSig: sessionSig,
      };

      // this return { url: string, data: JsonRequest }
      // const singleNodePromise = this.getJsExecutionShares(url, reqBody, id);
      const singleNodePromise = this.sendCommandToNode({
        url: url,
        data: params,
        requestId: requestId,
      });

      nodePromises.push(singleNodePromise);
    }

    return (await this.handleNodePromises(
      nodePromises,
      requestId,
      params.targetNodeRange
    )) as SuccessNodePromises | RejectedNodePromises;
  };

  // ========== Scoped Business Logics ==========

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

    log(
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
        console.error(`Error fetching code from IPFS gateway ${url}`);
        // Continue to the next gateway in the array
      }
    }

    throw new Error('All IPFS gateways failed to fetch the code.');
  }

  private async executeJsNodeRequest(
    url: string,
    formattedParams: JsonExecutionSdkParams,
    requestId: string
  ) {
    // -- choose the right signature
    const sessionSig = this.getSessionSigByUrl({
      sessionSigs: formattedParams.sessionSigs,
      url,
    });

    const reqBody: JsonExecutionRequest = {
      ...formattedParams,
      authSig: sessionSig,
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
    if (!this.ready) {
      const message =
        '[executeJs] LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

      throw new LitNodeClientNotReadyError({}, message);
    }

    const paramsIsSafe = safeParams({
      functionName: 'executeJs',
      params: params,
    });

    if (!paramsIsSafe) {
      throw new InvalidParamType(
        {
          info: {
            params,
          },
        },
        'executeJs params are not valid'
      );
    }

    // validate session sigs
    const checkedSessionSigs = validateSessionSigs(params.sessionSigs);

    if (checkedSessionSigs.isValid === false) {
      throw new InvalidSessionSigs(
        {},
        `Invalid sessionSigs. Errors: ${checkedSessionSigs.errors}`
      );
    }

    // Format the params
    let formattedParams: JsonExecutionSdkParams = {
      ...params,
      ...(params.jsParams && { jsParams: normalizeJsParams(params.jsParams) }),
      ...(params.code && { code: encodeCode(params.code) }),
    };

    // Check if IPFS options are provided and if the code should be fetched from IPFS and overwrite the current code.
    // This will fetch the code from the specified IPFS gateway using the provided ipfsId,
    // and update the params with the fetched code, removing the ipfsId afterward.
    const overwriteCode =
      params.ipfsOptions?.overwriteCode ||
      GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[this.config.litNetwork];

    if (overwriteCode && params.ipfsId) {
      const code = await this._getFallbackIpfsCode(
        params.ipfsOptions?.gatewayUrl,
        params.ipfsId
      );

      formattedParams = {
        ...params,
        code: code,
        ipfsId: undefined,
      };
    }

    const requestId = this._getNewRequestId();
    // ========== Get Node Promises ==========
    // Handle promises for commands sent to Lit nodes
    const getNodePromises = async () => {
      if (params.useSingleNode) {
        return this.getRandomNodePromise((url: string) =>
          this.executeJsNodeRequest(url, formattedParams, requestId)
        );
      }
      return this.getNodePromises((url: string) =>
        this.executeJsNodeRequest(url, formattedParams, requestId)
      );
    };

    const nodePromises = await getNodePromises();

    // -- resolve promises
    const res = await this.handleNodePromises(
      nodePromises,
      requestId,
      params.useSingleNode ? 1 : this.connectedNodes.size
    );

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises).values as NodeShare[];

    logWithRequestId(
      requestId,
      'executeJs responseData from node : ',
      JSON.stringify(responseData, null, 2)
    );

    // -- find the responseData that has the most common response
    const mostCommonResponse = findMostCommonResponse(
      responseData
    ) as NodeShare;

    const responseFromStrategy = processLitActionResponseStrategy(
      responseData,
      params.responseStrategy ?? { strategy: 'leastCommon' }
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

    logWithRequestId(
      requestId,
      'signatures shares to combine: ',
      signedDataList
    );

    const signatures = await getSignatures({
      requestId,
      networkPubKeySet: this.networkPubKeySet,
      minNodeCount: params.useSingleNode ? 1 : this.config.minNodeCount,
      signedData: signedDataList,
    });

    // -- 2. combine responses as a string, and parse it as JSON if possible
    const parsedResponse = parseAsJsonOrString(mostCommonResponse.response);

    // -- 3. combine logs
    const mostCommonLogs = mostCommonString(responseData.map((r) => r.logs));

    // -- 4. combine claims
    const claimsList = getClaimsList(responseData);
    const claims = claimsList.length > 0 ? getClaims(claimsList) : undefined;

    // ========== Result ==========
    const returnVal: ExecuteJsResponse = {
      claims,
      signatures,
      // decryptions: [],
      response: parsedResponse,
      logs: mostCommonLogs,
    };

    log('returnVal:', returnVal);

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
    params: any,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    return await this.sendCommandToNode({
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
    const requiredParamKeys = ['toSign', 'pubKey'];

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

    // -- validate present of accepted auth methods
    if (
      !params.sessionSigs &&
      (!params.authMethods || params.authMethods.length <= 0)
    ) {
      throw new ParamNullError(
        {
          info: {
            params,
          },
        },
        'Either sessionSigs or authMethods (length > 0) must be present.'
      );
    }

    const requestId = this._getNewRequestId();

    // validate session sigs
    const checkedSessionSigs = validateSessionSigs(params.sessionSigs);

    if (checkedSessionSigs.isValid === false) {
      throw new InvalidSessionSigs(
        {},
        `Invalid sessionSigs. Errors: ${checkedSessionSigs.errors}`
      );
    }

    // ========== Get Node Promises ==========
    // Handle promises for commands sent to Lit nodes

    const nodePromises = this.getNodePromises((url: string) => {
      // -- get the session sig from the url key
      const sessionSig = this.getSessionSigByUrl({
        sessionSigs: params.sessionSigs,
        url,
      });

      const reqBody: JsonPkpSignRequest = {
        toSign: normalizeArray(params.toSign),
        pubkey: hexPrefixed(params.pubKey),
        authSig: sessionSig,

        // -- optional params
        ...(params.authMethods &&
          params.authMethods.length > 0 && {
            authMethods: params.authMethods,
          }),
      };

      logWithRequestId(requestId, 'reqBody:', reqBody);

      const urlWithPath = composeLitUrl({
        url,
        endpoint: LIT_ENDPOINT.PKP_SIGN,
      });

      return this.generatePromise(urlWithPath, reqBody, requestId);
    });

    const res = await this.handleNodePromises(
      nodePromises,
      requestId,
      this.connectedNodes.size
    );

    // ========== Handle Response ==========
    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises).values;

    logWithRequestId(
      requestId,
      'responseData',
      JSON.stringify(responseData, null, 2)
    );

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = parsePkpSignResponse(responseData);

    const signatures = await getSignatures<{ signature: SigResponse }>({
      requestId,
      networkPubKeySet: this.networkPubKeySet,
      minNodeCount: this.config.minNodeCount,
      signedData: signedDataList,
    });

    logWithRequestId(requestId, `signature combination`, signatures);

    return signatures.signature; // only a single signature is ever present, so we just return it.
  };

  /**
   *
   * Request a signed JWT from the LIT network. Before calling this function, you must know the access control conditions for the item you wish to gain authorization for.
   *
   * @param { GetSignedTokenRequest } params
   *
   * @returns { Promise<string> } final JWT
   *
   */
  getSignedToken = async (params: GetSignedTokenRequest): Promise<string> => {
    // ========== Prepare Params ==========
    const { chain, authSig, sessionSigs } = params;

    // ========== Validation ==========
    // -- validate if it's ready
    if (!this.ready) {
      throw new LitNodeClientNotReadyError(
        {},
        '3 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.'
      );
    }

    // -- validate if this.networkPubKeySet is null
    if (this.networkPubKeySet === null) {
      throw new ParamNullError({}, 'networkPubKeySet cannot be null');
    }

    const paramsIsSafe = safeParams({
      functionName: 'getSignedToken',
      params,
    });

    if (!paramsIsSafe) {
      throw new InvalidParamType(
        {
          info: {
            params,
          },
        },
        'Parameter validation failed.'
      );
    }

    // ========== Prepare ==========
    // we need to send jwt params iat (issued at) and exp (expiration)
    // because the nodes may have different wall clock times
    // the nodes will verify that these params are withing a grace period
    const { iat, exp } = this.getJWTParams();

    // ========== Formatting Access Control Conditions =========
    const {
      error,
      formattedAccessControlConditions,
      formattedEVMContractConditions,
      formattedSolRpcConditions,
      formattedUnifiedAccessControlConditions,
    }: FormattedMultipleAccs = this.getFormattedAccessControlConditions(params);

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

    // ========== Get Node Promises ==========
    const requestId = this._getNewRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- if session key is available, use it
      const authSigToSend = sessionSigs ? sessionSigs[url] : authSig;

      const reqBody: SigningAccessControlConditionRequest = {
        accessControlConditions: formattedAccessControlConditions,
        evmContractConditions: formattedEVMContractConditions,
        solRpcConditions: formattedSolRpcConditions,
        unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
        chain,
        authSig: authSigToSend,
        iat,
        exp,
      };

      const urlWithPath = composeLitUrl({
        url,
        endpoint: LIT_ENDPOINT.SIGN_ACCS,
      });

      return this.generatePromise(urlWithPath, reqBody, requestId);
    });

    // -- resolve promises
    const res = await this.handleNodePromises(
      nodePromises,
      requestId,
      this.config.minNodeCount
    );

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    const signatureShares: NodeBlsSigningShare[] = (res as SuccessNodePromises)
      .values;

    log('signatureShares', signatureShares);

    // ========== Result ==========
    const finalJwt: string = await this.combineSharesAndGetJWT(
      signatureShares,
      requestId
    );

    return finalJwt;
  };

  /**
   *
   * Encrypt data using the LIT network public key.
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

    const paramsIsSafe = safeParams({
      functionName: 'encrypt',
      params,
    });

    if (!paramsIsSafe) {
      throw new InvalidArgumentException(
        {
          info: {
            params,
          },
        },
        'You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions'
      );
    }

    // ========== Validate Access Control Conditions Schema ==========
    await this.validateAccessControlConditionsSchema(params);

    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await this.getHashedAccessControlConditions(params);

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

    const hashOfConditionsStr = uint8arrayToString(
      new Uint8Array(hashOfConditions),
      'base16'
    );

    // ========== Hashing Private Data ==========
    // hash the private data
    const hashOfPrivateData = await crypto.subtle.digest(
      'SHA-256',
      params.dataToEncrypt
    );
    const hashOfPrivateDataStr = uint8arrayToString(
      new Uint8Array(hashOfPrivateData),
      'base16'
    );

    // ========== Assemble identity parameter ==========
    const identityParam = this._getIdentityParamForEncryption(
      hashOfConditionsStr,
      hashOfPrivateDataStr
    );

    // ========== Encrypt ==========
    const ciphertext = await encrypt(
      this.subnetPubKey,
      params.dataToEncrypt,
      uint8arrayFromString(identityParam, 'utf8')
    );

    return { ciphertext, dataToEncryptHash: hashOfPrivateDataStr };
  };

  /**
   *
   * Decrypt ciphertext with the LIT network.
   *
   */
  decrypt = async (params: DecryptRequest): Promise<DecryptResponse> => {
    const { chain, ciphertext, dataToEncryptHash } = params;

    // ========== Validate Params ==========
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

    const paramsIsSafe = safeParams({
      functionName: 'decrypt',
      params,
    });

    if (!paramsIsSafe) {
      throw new InvalidArgumentException(
        {
          info: {
            params,
          },
        },
        'Parameter validation failed.'
      );
    }

    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await this.getHashedAccessControlConditions(params);

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

    const hashOfConditionsStr = uint8arrayToString(
      new Uint8Array(hashOfConditions),
      'base16'
    );

    // ========== Formatting Access Control Conditions =========
    const {
      error,
      formattedAccessControlConditions,
      formattedEVMContractConditions,
      formattedSolRpcConditions,
      formattedUnifiedAccessControlConditions,
    }: FormattedMultipleAccs = this.getFormattedAccessControlConditions(params);

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

    log('identityParam', identityParam);

    // ========== Get Network Signature ==========
    const requestId = this._getNewRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- if session key is available, use it
      const authSigToSend =
        'sessionSigs' in params ? params.sessionSigs[url] : params.authSig;

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
        unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
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
    });

    // -- resolve promises
    const res = await this.handleNodePromises(
      nodePromises,
      requestId,
      this.config.minNodeCount
    );

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res, requestId);
    }

    const signatureShares: NodeBlsSigningShare[] = (res as SuccessNodePromises)
      .values;

    logWithRequestId(requestId, 'signatureShares', signatureShares);

    // ========== Result ==========
    const decryptedData = await this._decryptWithSignatureShares(
      this.subnetPubKey,
      uint8arrayFromString(identityParam, 'utf8'),
      ciphertext,
      signatureShares
    );

    return { decryptedData };
  };

  getLitResourceForEncryption = async (
    params: EncryptRequest
  ): Promise<LitAccessControlConditionResource> => {
    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await this.getHashedAccessControlConditions(params);

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

    const hashOfConditionsStr = uint8arrayToString(
      new Uint8Array(hashOfConditions),
      'base16'
    );

    // ========== Hashing Private Data ==========
    // hash the private data
    const hashOfPrivateData = await crypto.subtle.digest(
      'SHA-256',
      params.dataToEncrypt
    );
    const hashOfPrivateDataStr = uint8arrayToString(
      new Uint8Array(hashOfPrivateData),
      'base16'
    );

    return new LitAccessControlConditionResource(
      `${hashOfConditionsStr}/${hashOfPrivateDataStr}`
    );
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

  signSessionKey = async (
    params: SignSessionKeyProp
  ): Promise<SignSessionKeyResponse> => {
    log(`[signSessionKey] params:`, params);

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
      params.sessionKey ?? this.getSessionKey();
    const sessionKeyUri = LIT_SESSION_KEY_URI + sessionKey.publicKey;

    log(
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
      log(`[signSessionKey] statement found in params: "${params.statement}"`);
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

    // ========== Get Node Promises ==========
    // -- fetch shares from nodes
    const body: JsonSignSessionKeyRequestV1 = {
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
    };

    log(`[signSessionKey] body:`, body);

    const requestId = this._getNewRequestId();
    logWithRequestId(requestId, 'signSessionKey body', body);
    const nodePromises = this.getNodePromises((url: string) => {
      const reqBody: JsonSignSessionKeyRequestV1 = body;

      const urlWithPath = composeLitUrl({
        url,
        endpoint: LIT_ENDPOINT.SIGN_SESSION_KEY,
      });

      return this.generatePromise(urlWithPath, reqBody, requestId);
    });

    // -- resolve promises
    let res;
    try {
      res = await this.handleNodePromises(
        nodePromises,
        requestId,
        this.config.minNodeCount
      );
      log('signSessionKey node promises:', res);
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

    logWithRequestId(requestId, 'handleNodePromises res:', res);

    // -- case: promises rejected
    if (!this._isSuccessNodePromises(res)) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
      return {} as SignSessionKeyResponse;
    }

    const responseData: BlsResponseData[] = res.values as BlsResponseData[];
    logWithRequestId(
      requestId,
      '[signSessionKey] responseData',
      JSON.stringify(responseData, null, 2)
    );

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const curveType = responseData[0]?.curveType;

    if (curveType === 'ECDSA') {
      throw new Error(
        'The ECDSA curve type is not supported in this version. Please use version 6.x.x instead.'
      );
    }

    log(`[signSessionKey] curveType is "${curveType}"`);

    const signedDataList = responseData.map((s) => s.dataSigned);

    if (signedDataList.length <= 0) {
      const err = `[signSessionKey] signedDataList is empty.`;
      log(err);
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

    logWithRequestId(
      requestId,
      '[signSessionKey] signedDataList',
      signedDataList
    );

    // -- checking if we have enough shares
    const validatedSignedDataList = responseData
      .map((data: BlsResponseData) => {
        // each of this field cannot be empty
        const requiredFields = [
          'signatureShare',
          'curveType',
          'shareIndex',
          'siweMessage',
          'dataSigned',
          'blsRootPubkey',
          'result',
        ];

        // check if all required fields are present
        for (const field of requiredFields) {
          const key: keyof BlsResponseData = field as keyof BlsResponseData;

          if (
            data[key] === undefined ||
            data[key] === null ||
            data[key] === ''
          ) {
            log(
              `[signSessionKey] Invalid signed data. "${field}" is missing. Not a problem, we only need ${this.config.minNodeCount} nodes to sign the session key.`
            );
            return null;
          }
        }

        if (!data.signatureShare.ProofOfPossession) {
          const err = `[signSessionKey] Invalid signed data. "ProofOfPossession" is missing.`;
          log(err);
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

    logWithRequestId(
      requestId,
      '[signSessionKey] requested length:',
      signedDataList.length
    );
    logWithRequestId(
      requestId,
      '[signSessionKey] validated length:',
      validatedSignedDataList.length
    );
    logWithRequestId(
      requestId,
      '[signSessionKey] minimum required length:',
      this.config.minNodeCount
    );
    if (validatedSignedDataList.length < this.config.minNodeCount) {
      throw new InvalidSignatureError(
        {
          info: {
            requestId,
            responseData,
            validatedSignedDataList,
            minNodeCount: this.config.minNodeCount,
          },
        },
        `[signSessionKey] not enough nodes signed the session key.  Expected ${this.config.minNodeCount}, got ${validatedSignedDataList.length}`
      );
    }

    const blsSignedData: BlsResponseData[] =
      validatedSignedDataList as BlsResponseData[];

    const sigType = mostCommonString(blsSignedData.map((s) => s.curveType));
    log(`[signSessionKey] sigType:`, sigType);

    const signatureShares = getBlsSignatures(blsSignedData);

    log(`[signSessionKey] signatureShares:`, signatureShares);

    const blsCombinedSignature = await combineSignatureShares(signatureShares);

    log(`[signSessionKey] blsCombinedSignature:`, blsCombinedSignature);

    const publicKey = removeHexPrefix(params.pkpPublicKey);
    log(`[signSessionKey] publicKey:`, publicKey);

    const dataSigned = mostCommonString(blsSignedData.map((s) => s.dataSigned));
    log(`[signSessionKey] dataSigned:`, dataSigned);

    const mostCommonSiweMessage = mostCommonString(
      blsSignedData.map((s) => s.siweMessage)
    );

    log(`[signSessionKey] mostCommonSiweMessage:`, mostCommonSiweMessage);

    const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

    log(`[signSessionKey] signedMessage:`, signedMessage);

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

  private _isSuccessNodePromises = (
    res: SuccessNodePromises | RejectedNodePromises
  ): res is SuccessNodePromises => {
    return res.success;
  };

  getSignSessionKeyShares = async (
    url: string,
    params: GetSignSessionKeySharesProp,
    requestId: string
  ) => {
    log('getSignSessionKeyShares');
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.SIGN_SESSION_KEY,
    });
    return await this.sendCommandToNode({
      url: urlWithPath,
      data: params.body,
      requestId,
    });
  };

  /**
   * Get session signatures for a set of [Lit resources](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.ILitResource.html#resource).
   *
   * How this function works on a high level:
   * 1. Generate or retrieve [session keys](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.SessionKeyPair.html) (a public and private key pair)
   * 2. Generate or retrieve the [`AuthSig`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.AuthSig.html) that specifies the session [abilities](https://v6-api-doc-lit-js-sdk.vercel.app/enums/auth_helpers_src.LitAbility.html)
   * 3. Sign the specific resources with the session key
   *
   *
   * Note: When generating session signatures for different PKPs or auth methods,
   * be sure to call disconnectWeb3 to clear auth signatures stored in local storage
   *
   *
   * @param { GetSessionSigsProps } params
   *
   * An example of how this function is used can be found in the Lit developer-guides-code repository [here](https://github.com/LIT-Protocol/developer-guides-code/tree/master/session-signatures/getSessionSigs).
   *
   */
  getSessionSigs = async (
    params: GetSessionSigsProps
  ): Promise<SessionSigsMap> => {
    // -- prepare
    // Try to get it from local storage, if not generates one~
    const sessionKey = params.sessionKey ?? this.getSessionKey();

    const sessionKeyUri = this.getSessionKeyUri(sessionKey.publicKey);

    // First get or generate the session capability object for the specified resources.
    const sessionCapabilityObject = params.sessionCapabilityObject
      ? params.sessionCapabilityObject
      : await this.generateSessionCapabilityObjectWithWildcards(
          params.resourceAbilityRequests.map((r) => r.resource)
        );
    const expiration = params.expiration || LitNodeClientNodeJs.getExpiration();

    // -- (TRY) to get the wallet signature
    let authSig = await this.getWalletSig({
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

    const needToResignSessionKey = await this.checkNeedToResignSessionKey({
      authSig,
      sessionKeyUri,
      resourceAbilityRequests: params.resourceAbilityRequests,
    });

    // console.log('XXX needToResignSessionKey:', needToResignSessionKey);

    // -- (CHECK) if we need to resign the session key
    if (needToResignSessionKey) {
      log('need to re-sign session key. Signing...');
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

    const capabilities = params.capacityDelegationAuthSig
      ? [
          ...(params.capabilityAuthSigs ?? []),
          params.capacityDelegationAuthSig,
          authSig,
        ]
      : [...(params.capabilityAuthSigs ?? []), authSig];

    const signingTemplate = {
      sessionKey: sessionKey.publicKey,
      resourceAbilityRequests: params.resourceAbilityRequests,
      capabilities,
      issuedAt: new Date().toISOString(),
      expiration: sessionExpiration,
    };

    const signatures: SessionSigsMap = {};

    this.connectedNodes.forEach((nodeAddress: string) => {
      const toSign: SessionSigningTemplate = {
        ...signingTemplate,
        nodeAddress,
      };

      const signedMessage = JSON.stringify(toSign);

      const uint8arrayKey = uint8arrayFromString(
        sessionKey.secretKey,
        'base16'
      );

      const uint8arrayMessage = uint8arrayFromString(signedMessage, 'utf8');
      const signature = nacl.sign.detached(uint8arrayMessage, uint8arrayKey);

      signatures[nodeAddress] = {
        sig: uint8arrayToString(signature, 'base16'),
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: signedMessage,
        address: sessionKey.publicKey,
        algo: 'ed25519',
      };
    });

    log('signatures:', signatures);

    try {
      const formattedSessionSigs = formatSessionSigs(
        JSON.stringify(signatures)
      );
      log(formattedSessionSigs);
    } catch (e) {
      // swallow error
      log('Error formatting session signatures: ', e);
    }

    return signatures;
  };

  /**
   * Retrieves the PKP sessionSigs.
   *
   * @param params - The parameters for retrieving the PKP sessionSigs.
   * @returns A promise that resolves to the PKP sessionSigs.
   * @throws An error if any of the required parameters are missing or if `litActionCode` and `ipfsId` exist at the same time.
   */
  getPkpSessionSigs = async (params: GetPkpSessionSigs) => {
    const chain = params?.chain || 'ethereum';

    const pkpSessionSigs = this.getSessionSigs({
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

        const response = await this.signSessionKey({
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
    });

    return pkpSessionSigs;
  };

  /**
   * Retrieves session signatures specifically for Lit Actions.
   * Unlike `getPkpSessionSigs`, this function requires either `litActionCode` or `litActionIpfsId`, and `jsParams` must be provided.
   *
   * @param params - The parameters required for retrieving the session signatures.
   * @returns A promise that resolves with the session signatures.
   */
  getLitActionSessionSigs = async (params: GetLitActionSessionSigs) => {
    // Check if either litActionCode or litActionIpfsId is provided
    if (!params.litActionCode && !params.litActionIpfsId) {
      throw new InvalidParamType(
        {
          info: {
            params,
          },
        },
        'Either "litActionCode" or "litActionIpfsId" must be provided.'
      );
    }

    // Check if jsParams is provided
    if (!params.jsParams) {
      throw new ParamsMissingError(
        {
          info: {
            params,
          },
        },
        "'jsParams' is required."
      );
    }

    return this.getPkpSessionSigs(params);
  };

  /**
   *
   * Get Session Key URI eg. lit:session:0x1234
   *
   * @param publicKey is the public key of the session key
   * @returns { string } the session key uri
   */
  getSessionKeyUri = (publicKey: string): string => {
    return LIT_SESSION_KEY_URI + publicKey;
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

    const nodePromises = this.getNodePromises((url: string) => {
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
    });

    const responseData = await this.handleNodePromises(
      nodePromises,
      requestId,
      this.connectedNodes.size
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

      logWithRequestId(
        requestId,
        `responseData: ${JSON.stringify(responseData, null, 2)}`
      );

      const derivedKeyId = responseData.values[0].derivedKeyId;

      const pubkey = await this.computeHDPubKey(derivedKeyId);
      logWithRequestId(
        requestId,
        `pubkey ${pubkey} derived from key id ${derivedKeyId}`
      );

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
}
