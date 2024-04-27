import { computeAddress } from '@ethersproject/transactions';
import { BigNumber, ethers } from 'ethers';
import { joinSignature, sha256 } from 'ethers/lib/utils';
import * as siwe from 'siwe';

import { canonicalAccessControlConditionFormatter } from '@lit-protocol/access-control-conditions';
import {
  ILitResource,
  ISessionCapabilityObject,
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
  AUTH_METHOD_TYPE_IDS,
  AuthMethodType,
  EITHER_TYPE,
  LIT_ACTION_IPFS_HASH,
  LIT_ENDPOINT,
  LIT_ERROR,
  LIT_SESSION_KEY_URI,
  LOCAL_STORAGE_KEYS,
  LitNetwork,
  LIT_CURVE,
} from '@lit-protocol/constants';
import { LitCore, composeLitUrl } from '@lit-protocol/core';
import {
  combineEcdsaShares,
  combineSignatureShares,
  encrypt,
  generateSessionKeyPair,
  verifyAndDecryptWithSignatureShares,
} from '@lit-protocol/crypto';
import { safeParams } from '@lit-protocol/encryption';
import {
  defaultMintClaimCallback,
  executeWithRetry,
  findMostCommonResponse,
  hexPrefixed,
  log,
  logError,
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
  normalizeAndStringify,
  throwError,
} from '@lit-protocol/misc';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '@lit-protocol/misc-browser';
import { nacl } from '@lit-protocol/nacl';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import type {
  AuthCallback,
  AuthCallbackParams,
  AuthMethod,
  AuthSig,
  ClaimKeyResponse,
  ClaimProcessor,
  ClaimRequest,
  CustomNetwork,
  DecryptRequest,
  DecryptResponse,
  EncryptRequest,
  EncryptResponse,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  GetSessionSigsProps,
  GetSignSessionKeySharesProp,
  GetSignedTokenRequest,
  GetSigningShareForDecryptionRequest,
  GetWalletSigProps,
  JsonExecutionRequest,
  JsonPkpSignRequest,
  LitClientSessionManager,
  LitNodeClientConfig,
  NodeBlsSigningShare,
  NodeCommandResponse,
  NodeLog,
  NodeShare,
  PKPSignShare,
  RejectedNodePromises,
  SessionKeyPair,
  SessionSigningTemplate,
  SessionSigsMap,
  SigShare,
  SignConditionECDSA,
  SignSessionKeyProp,
  SignSessionKeyResponse,
  Signature,
  SignedData,
  SigningAccessControlConditionRequest,
  SuccessNodePromises,
  ValidateAndSignECDSA,
  WebAuthnAuthenticationVerificationParams,
  ILitNodeClient,
  GetPkpSessionSigs,
  CapacityCreditsReq,
  CapacityCreditsRes,
  JsonSignSessionKeyRequestV1,
  BlsResponseData,
  SessionKeyCache,
  JsonPkpSignSdkParams,
  JsonExecutionSdkParams,
  ExecuteJsNoSigningResponse,
  JsonExecutionSdkParamsTargetNode,
  JsonExecutionRequestTargetNode,
  SigResponse,
} from '@lit-protocol/types';
import * as blsSdk from '@lit-protocol/bls-sdk';
import { normalizeArray } from './helpers/normalize-array';
import { normalizeJsParams } from './helpers/normalize-params';
import { encodeCode } from './helpers/encode-code';
import { removeDoubleQuotes } from './helpers/remove-double-quotes';
import { parseAsJsonOrString } from './helpers/parse-as-json-or-string';
import { getFlattenShare, getSignatures } from './helpers/get-signatures';
import { getClaimsList } from './helpers/get-claims-list';
import { getClaims } from './helpers/get-claims';

const TEMP_CACHE_PERIOD = 30000; // 30 seconds

// Global cache variable
let sessionKeyCache: SessionKeyCache | null = null;

export class LitNodeClientNodeJs
  extends LitCore
  implements LitClientSessionManager, ILitNodeClient
{
  defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;

  // ========== Constructor ==========
  constructor(args: LitNodeClientConfig | CustomNetwork) {
    super(args);

    if ('defaultAuthCallback' in args) {
      this.defaultAuthCallback = args.defaultAuthCallback;
    }
  }

  // ========== Rate Limit NFT ==========

  // TODO: Add support for browser feature/lit-2321-js-sdk-add-browser-support-for-createCapacityDelegationAuthSig
  createCapacityDelegationAuthSig = async (
    params: CapacityCreditsReq
  ): Promise<CapacityCreditsRes> => {
    // Useful log for debugging
    if (!params.delegateeAddresses || params.delegateeAddresses.length === 0) {
      log(
        `[createCapacityDelegationAuthSig] No delegatee addresses provided. It means that the capability will not restrict access based on delegatee list, but it may still enforce other restrictions such as usage limits (uses) and specific NFT IDs (nft_id).`
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

    // -- validate
    if (!params.dAppOwnerWallet) {
      throw new Error('dAppOwnerWallet must exist');
    }

    const nonce = await this.getLatestBlockhash();

    const siweMessage = await createSiweMessageWithCapacityDelegation({
      uri: 'lit:capability:delegation',
      litNodeClient: this,
      walletAddress: dAppOwnerWalletAddress,
      nonce: nonce,

      // -- default configuration for recap object capability
      expiration:
        params.expiration ?? new Date(Date.now() + 1000 * 60 * 7).toISOString(),
      domain: params.domain ?? 'example.com',
      statement:
        params.statement ??
        'This is a test statement.  You can put anything you want here.',

      // -- capacity delegation specific configuration
      uses: params.uses ?? '1',
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
        `Storage key "${storageKey}" is missing. Not a problem. Contiune...`
      );

      // Check if a valid session key exists in cache
      if (
        sessionKeyCache &&
        Date.now() - sessionKeyCache.timestamp < TEMP_CACHE_PERIOD
      ) {
        log(`[getSessionKey] Returning session key from cache.`);
        return sessionKeyCache.value;
      }

      // Generate new one
      const newSessionKey = generateSessionKeyPair();

      // (TRY) to set to local storage
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
      } catch (e) {
        log(
          `[getSessionKey] Localstorage not available.Not a problem.Contiune...`
        );

        // Store in cache
        sessionKeyCache = {
          value: newSessionKey,
          timestamp: Date.now(),
        };

        log(`[getSessionKey] newSessionKey set to cache: `, sessionKeyCache);
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
    addAllCapabilities?: boolean,
    rateLimitAuthSig?: AuthSig
  ): Promise<ISessionCapabilityObject> {
    const sessionCapabilityObject = new RecapSessionCapabilityObject({}, []);

    // disable for now
    const _addAllCapabilities = addAllCapabilities ?? false;

    if (_addAllCapabilities) {
      for (const litResource of litResources) {
        sessionCapabilityObject.addAllCapabilitiesForResource(litResource);
      }
    }

    if (rateLimitAuthSig) {
      throw new Error('Not implemented yet.');
      // await sessionCapabilityObject.addRateLimitAuthSig(rateLimitAuthSig);
    }

    return sessionCapabilityObject;
  }

  // backward compatibility
  async generateSessionCapabilityObjectWithWildcards(
    litResources: ILitResource[]
    // rateLimitAuthSig?: AuthSig
  ): Promise<ISessionCapabilityObject> {
    // if (rateLimitAuthSig) {
    //   return await LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards(
    //     litResources,
    //     rateLimitAuthSig
    //   );
    // }

    return await LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards(
      litResources
    );
  }

  /**
   *
   * Get expiration for session
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
    ipfsId,
    jsParams,
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
          nonce,

          // for recap
          ...(resourceAbilityRequests && { resourceAbilityRequests }),

          // for lit action custom auth
          ...(litActionCode && { litActionCode }),
          ...(ipfsId && { ipfsId }),
          ...(jsParams && { jsParams }),
        };

        log('callback body:', body);

        walletSig = await authNeededCallback(body);
      } else {
        log('getWalletSig - flow 1.2');
        if (!this.defaultAuthCallback) {
          log('getWalletSig - flow 1.2.1');
          return throwError({
            message: 'No default auth callback provided',
            errorKind: LIT_ERROR.PARAMS_MISSING_ERROR.kind,
            errorCode: LIT_ERROR.PARAMS_MISSING_ERROR.name,
          });
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

  #authCallbackAndUpdateStorageItem = async ({
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
        return throwError({
          message: 'No default auth callback provided',
          errorKind: LIT_ERROR.PARAMS_MISSING_ERROR.kind,
          errorCode: LIT_ERROR.PARAMS_MISSING_ERROR.name,
        });
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
    sessionKeyUri: any;
    resourceAbilityRequests: LitResourceAbilityRequest[];
  }): Promise<boolean> => {
    const authSigSiweMessage = new siwe.SiweMessage(authSig.signedMessage);

    try {
      await authSigSiweMessage.validate(authSig.sig);
    } catch (e) {
      console.debug('Need retry because verify failed', e);
      return true;
    }

    // make sure the sig is for the correct session key
    if (authSigSiweMessage.uri !== sessionKeyUri) {
      console.debug('Need retry because uri does not match');
      return true;
    }

    // make sure the authSig contains at least one resource.
    if (
      !authSigSiweMessage.resources ||
      authSigSiweMessage.resources.length === 0
    ) {
      console.debug('Need retry because empty resources');
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
        console.debug('Need retry because capabilities do not match', {
          authSigSessionCapabilityObject,
          resourceAbilityRequest,
        });
        return true;
      }
    }

    return false;
  };

  // ==================== API Calls to Nodes ====================
  getClaimKeyExecutionShares = async (
    url: string,
    params: any,
    requestId: string
  ) => {
    logWithRequestId(requestId, 'getPkpSigningShares');
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.PKP_CLAIM,
    });
    if (!params.authMethod) {
      throw new Error('authMethod is required');
    }

    return await this.sendCommandToNode({
      url: urlWithPath,
      data: params,
      requestId,
    });
  };

  /**
   * Get Signing Shares for Token containing Access Control Condition
   *
   * @param { string } url
   * @param { SigningAccessControlConditionRequest } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  getSigningShareForToken = async (
    url: string,
    params: SigningAccessControlConditionRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    logWithRequestId(requestId, 'getSigningShareForToken');

    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.SIGN_ACCS,
    });

    return this.sendCommandToNode({
      url: urlWithPath,
      data: params,
      requestId,
    });
  };

  /**
   *
   * Get signature shares for decryption.
   *
   * @param url
   * @param params
   * @param requestId
   * @returns
   */
  getSigningShareForDecryption = async (
    url: string,
    params: GetSigningShareForDecryptionRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    log('getSigningShareForDecryption');

    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.ENCRYPTION_SIGN,
    });

    return await this.sendCommandToNode({
      url: urlWithPath,
      data: params,
      requestId,
    });
  };

  /**
   *
   * Sign Condition ECDSA
   *
   * @param { string } url
   * @param { SignConditionECDSA } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  signConditionEcdsa = async (
    url: string,
    params: SignConditionECDSA,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      log('signConditionEcdsa');

      const urlWithPath = composeLitUrl({
        url,
        endpoint: LIT_ENDPOINT.SIGN_ECDSA,
      });

      const data = {
        access_control_conditions: params.accessControlConditions,
        evmContractConditions: params.evmContractConditions,
        solRpcConditions: params.solRpcConditions,
        auth_sig: params.auth_sig,
        chain: params.chain,
        iat: params.iat,
        exp: params.exp,
      };

      return await this.sendCommandToNode({
        url: urlWithPath,
        data,
        requestId: id,
      });
    };

    const res = await executeWithRetry<any>(
      wrapper,
      (_error: any, _requestid: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('An error occured. attempting to retry: ');
        }
      },
      this.config.retryTolerance
    );

    return res as unknown as NodeCommandResponse;
  };

  /**
   *
   * Combine Shares from network public key set and signature shares
   *
   * @param { NodeBlsSigningShare } signatureShares
   *
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT = (
    signatureShares: NodeBlsSigningShare[],
    requestId: string = ''
  ): string => {
    // ========== Shares Validations ==========
    // -- sanity check
    if (
      !signatureShares.every(
        (val: any, i: any, arr: any) => val.unsignedJwt === arr[0].unsignedJwt
      )
    ) {
      const msg =
        'Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things';
      logErrorWithRequestId(requestId, msg);
    }

    // ========== Sorting ==========
    // -- sort the sig shares by share index.  this is important when combining the shares.
    signatureShares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

    // ========== Combine Shares ==========
    const signature = combineSignatureShares(
      signatureShares.map((s) => s.signatureShare)
    );

    logWithRequestId(requestId, 'signature is', signature);

    const unsignedJwt = mostCommonString(
      signatureShares.map((s: any) => s.unsignedJwt)
    );

    // ========== Result ==========
    // convert the sig to base64 and append to the jwt
    const finalJwt: string = `${unsignedJwt}.${uint8arrayToString(
      uint8arrayFromString(signature, 'base16'),
      'base64urlpad'
    )}`;

    return finalJwt;
  };

  #decryptWithSignatureShares = (
    networkPubKey: string,
    identityParam: Uint8Array,
    ciphertext: string,
    signatureShares: NodeBlsSigningShare[]
  ): Uint8Array => {
    const sigShares = signatureShares.map((s: any) => s.signatureShare);

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
      authMethods: [],
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
  ): Promise<
    SuccessNodePromises<NodeCommandResponse> | RejectedNodePromises
  > => {
    log('running runOnTargetedNodes:', params.targetNodeRange);

    if (!params.targetNodeRange) {
      return throwError({
        message: 'targetNodeRange is required',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
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

    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
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
          requestId: id,
        });

        nodePromises.push(singleNodePromise);
      }

      const handledPromise = (await this.handleNodePromises(
        nodePromises,
        id,
        params.targetNodeRange
      )) as SuccessNodePromises<NodeCommandResponse> | RejectedNodePromises;

      // -- handle response
      return handledPromise;
    };

    return executeWithRetry<RejectedNodePromises | SuccessNodePromises<any>>(
      wrapper,
      (_error: any, _requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('error has occured, attempting to retry');
        }
      },
      this.config.retryTolerance
    );
  };

  /**
   *
   * Get signatures from signed data
   *
   * @param { Array<any> } signedData
   *
   * @returns { any }
   *
   */
  getSessionSignatures = (signedData: any[]): any => {
    // -- prepare
    const signatures: any = {};

    // TOOD: get keys of signedData
    const keys = Object.keys(signedData[0]);

    // removeExtraBackslashesAndQuotes
    const sanitise = (str: string) => {
      // Check if str is a string and remove extra backslashes
      if (typeof str === 'string') {
        // Remove backslashes
        let newStr = str.replace(/\\+/g, '');
        // Remove leading and trailing double quotes
        newStr = newStr.replace(/^"|"$/g, '');
        return newStr;
      }
      return str;
    };

    // -- execute
    keys.forEach((key: any) => {
      log('key:', key);

      const shares = signedData.map((r: any) => r[key]);

      log('shares:', shares);

      shares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

      const sigShares: SigShare[] = shares.map((s: any, index: number) => {
        log('Original Share Struct:', s);

        const share = getFlattenShare(s);

        log('share:', share);

        if (!share) {
          throw new Error('share is null or undefined');
        }

        if (!share.bigr) {
          throw new Error(
            `bigR is missing in share ${index}. share ${JSON.stringify(share)}`
          );
        }

        const sanitisedBigR = sanitise(share.bigr);
        const sanitisedSigShare = sanitise(share.publicKey);

        log('sanitisedBigR:', sanitisedBigR);
        log('sanitisedSigShare:', sanitisedSigShare);

        return {
          sigType: share.sigType,
          signatureShare: sanitise(share.signatureShare),
          shareIndex: share.shareIndex,
          bigR: sanitise(share.bigr),
          publicKey: share.publicKey,
          dataSigned: share.dataSigned,
          siweMessage: share.siweMessage,
        };
      });

      log('getSessionSignatures - sigShares', sigShares);

      const sigType = mostCommonString(sigShares.map((s: any) => s.sigType));

      // -- validate if this.networkPubKeySet is null
      if (this.networkPubKeySet === null) {
        throwError({
          message: 'networkPubKeySet cannot be null',
          errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
          errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
        });
        return;
      }

      // -- validate if signature type is ECDSA
      if (
        sigType !== LIT_CURVE.EcdsaCaitSith &&
        sigType !== LIT_CURVE.EcdsaK256 &&
        sigType !== LIT_CURVE.EcdsaCAITSITHP256
      ) {
        throwError({
          message: `signature type is ${sigType} which is invalid`,
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
        });
        return;
      }

      const signature: any = combineEcdsaShares(sigShares);
      if (!signature.r) {
        throwError({
          message: 'siganture could not be combined',
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.name,
        });
      }

      const encodedSig = joinSignature({
        r: '0x' + signature.r,
        s: '0x' + signature.s,
        v: signature.recid,
      });

      signatures[key] = {
        ...signature,
        signature: encodedSig,
        publicKey: mostCommonString(sigShares.map((s: any) => s.publicKey)),
        dataSigned: mostCommonString(sigShares.map((s: any) => s.dataSigned)),
        siweMessage: mostCommonString(sigShares.map((s) => s.siweMessage)),
      };
    });

    return signatures;
  };

  /**
   *
   * Get a single signature
   *
   * @param { Array<any> } shareData from all node promises
   *
   * @returns { string } signature
   *
   */
  getSignature = async (shareData: any[], requestId: string): Promise<any> => {
    // R_x & R_y values can come from any node (they will be different per node), and will generate a valid signature
    const R_x = shareData[0].local_x;
    const R_y = shareData[0].local_y;

    const valid_shares = shareData.map((s: any) => s.signature_share);
    const shares = JSON.stringify(valid_shares);

    await wasmECDSA.initWasmEcdsaSdk(); // init WASM
    const signature = wasmECDSA.combine_signature(R_x, R_y, shares);
    logWithRequestId(requestId, 'raw ecdsa sig', signature);

    return signature;
  };

  // ========== Scoped Business Logics ==========

  // Normalize the data to a basic array

  // TODO: executeJsWithTargettedNodes
  // if (formattedParams.targetNodeRange) {
  //   // FIXME: we should make this a separate function
  //   res = await this.runOnTargetedNodes(formattedParams);
  // }

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

      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    const paramsIsSafe = safeParams({
      functionName: 'executeJs',
      params: params,
    });

    if (!paramsIsSafe) {
      return throwError({
        message: 'executeJs params are not valid',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }

    // Format the params
    const formattedParams: JsonExecutionSdkParams = {
      ...params,
      ...(params.jsParams && { jsParams: normalizeJsParams(params.jsParams) }),
      ...(params.code && { code: encodeCode(params.code) }),
    };

    // ========== Get Node Promises ==========
    // Handle promises for commands sent to Lit nodes
    const wrapper = async (
      requestId: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      const nodePromises = this.getNodePromises(async (url: string) => {
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
      });

      // -- resolve promises
      const res = await this.handleNodePromises(
        nodePromises,
        requestId,
        this.connectedNodes.size
      );

      return res;
    }; // wrapper end

    // ========== Execute with Retry ==========
    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (error: any, requestId: string, isFinal: boolean) => {
        logError('an error occured, attempting to retry operation');
      },
      this.config.retryTolerance
    );

    // ========== Handle Response ==========
    const requestId = res.requestId;

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises<NodeShare>).values;

    logWithRequestId(
      requestId,
      'executeJs responseData from node : ',
      JSON.stringify(responseData, null, 2)
    );

    // -- find the responseData that has the most common response
    const mostCommonResponse = findMostCommonResponse(
      responseData
    ) as NodeShare;

    const IS_SUCCESS = mostCommonResponse.success;
    const HAS_SIGNED_DATA =
      Object.keys(mostCommonResponse.signedData).length > 0;
    const HAS_CLAIM_DATA = Object.keys(mostCommonResponse.claimData).length > 0;

    // -- we must also check for claim responses as a user may have submitted for a claim and signatures must be aggregated before returning
    if (IS_SUCCESS && !HAS_SIGNED_DATA && !HAS_CLAIM_DATA) {
      return mostCommonResponse as unknown as ExecuteJsResponse;
    }

    // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
    if (!HAS_SIGNED_DATA && !HAS_CLAIM_DATA) {
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

    const signatures = getSignatures({
      requestId,
      networkPubKeySet: this.networkPubKeySet,
      minNodeCount: this.config.minNodeCount,
      signedData: signedDataList,
    });

    // -- 2. combine responses as a string, and parse it as JSON if possible
    const parsedResponse = parseAsJsonOrString(mostCommonResponse.response);

    // -- 3. combine logs
    const mostCommonLogs: string = mostCommonString(
      responseData.map((r: NodeLog) => r.logs)
    );

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

  sharePromise = async (func: any) => {
    return await func();
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
  ): Promise<any> => {
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
        throwError({
          message: `"${key}" cannot be undefined, empty, or null. Please provide a valid value.`,
          errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
          errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
        });
      }
    });

    // -- validate present of accepted auth methods
    if (
      !params.sessionSigs &&
      (!params.authMethods || params.authMethods.length <= 0)
    ) {
      throwError({
        message: `Either sessionSigs or authMethods (length > 0) must be present.`,
        errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
        errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
      });
    }

    // ========== Get Node Promises ==========
    // Handle promises for commands sent to Lit nodes
    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
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

        logWithRequestId(id, 'reqBody:', reqBody);

        const urlWithPath = composeLitUrl({
          url,
          endpoint: LIT_ENDPOINT.PKP_SIGN,
        });

        return this.generatePromise(urlWithPath, reqBody, id);
      });

      const res = await this.handleNodePromises(
        nodePromises,
        id,
        this.connectedNodes.size // ECDSA requires responses from all nodes, but only shares from minNodeCount.
      );
      return res;
    }; // wrapper end

    // ========== Execute with Retry ==========
    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (error: any, requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('errror occured, retrying operation');
        }
      },
      this.config.retryTolerance
    );

    // ========== Handle Response ==========
    const requestId = res.requestId;

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises<PKPSignShare>).values;

    logWithRequestId(
      requestId,
      'responseData',
      JSON.stringify(responseData, null, 2)
    );

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = responseData.map((r) => {
      // add the signed data to the signature share
      delete r.signatureShare.result;

      // nodes do not camel case the response from /web/pkp/sign.
      const snakeToCamel = (s: string) =>
        s.replace(/(_\w)/g, (k) => k[1].toUpperCase());
      //@ts-ignore
      const convertShare: any = (share: any) => {
        const keys = Object.keys(share);
        let convertedShare = {};
        for (const key of keys) {
          convertedShare = Object.defineProperty(
            convertedShare,
            snakeToCamel(key),
            Object.getOwnPropertyDescriptor(share, key) as PropertyDecorator
          );
        }

        return convertedShare;
      };
      const convertedShare: SigShare = convertShare(r.signatureShare);
      const keys = Object.keys(convertedShare);
      for (const key of keys) {
        //@ts-ignore
        if (typeof convertedShare[key] === 'string') {
          //@ts-ignore
          convertedShare[key] = convertedShare[key]
            .replace('"', '')
            .replace('"', '');
        }
      }
      //@ts-ignore
      convertedShare.dataSigned = convertedShare.digest;
      return {
        signature: convertedShare,
      };
    });

    const signatures = getSignatures({
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
      const message =
        '3 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // -- validate if this.networkPubKeySet is null
    if (this.networkPubKeySet === null) {
      return throwError({
        message: 'networkPubKeySet cannot be null',
        errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
        errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
      });
    }

    const paramsIsSafe = safeParams({
      functionName: 'getSignedToken',
      params,
    });

    if (!paramsIsSafe) {
      return throwError({
        message: `Parameter validation failed.`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
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
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // ========== Get Node Promises ==========
    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      const nodePromises = this.getNodePromises((url: string) => {
        // -- if session key is available, use it
        const authSigToSend = sessionSigs ? sessionSigs[url] : authSig;

        return this.getSigningShareForToken(
          url,
          {
            accessControlConditions: formattedAccessControlConditions,
            evmContractConditions: formattedEVMContractConditions,
            solRpcConditions: formattedSolRpcConditions,
            unifiedAccessControlConditions:
              formattedUnifiedAccessControlConditions,
            chain,
            authSig: authSigToSend,
            iat,
            exp,
          },
          id
        );
      });

      // -- resolve promises
      const res = await this.handleNodePromises(
        nodePromises,
        id,
        this.config.minNodeCount
      );
      return res;
    };

    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (error: any, requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('an error occured, attempting to retry ');
        }
      },
      this.config.retryTolerance
    );
    const requestId = res.requestId;

    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
    }

    const signatureShares: NodeBlsSigningShare[] = (
      res as SuccessNodePromises<NodeBlsSigningShare>
    ).values;

    log('signatureShares', signatureShares);

    // ========== Result ==========
    const finalJwt: string = this.combineSharesAndGetJWT(
      signatureShares,
      requestId
    );

    return finalJwt;
  };

  /**
   *
   * Encrypt data using the LIT network public key.
   *
   */
  encrypt = async (params: EncryptRequest): Promise<EncryptResponse> => {
    // ========== Validate Params ==========
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        '6 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // -- validate if this.subnetPubKey is null
    if (!this.subnetPubKey) {
      const message = 'subnetPubKey cannot be null';
      return throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    const paramsIsSafe = safeParams({
      functionName: 'encrypt',
      params,
    });

    if (!paramsIsSafe) {
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // ========== Validate Access Control Conditions Schema ==========
    await this.validateAccessControlConditionsSchema(params);

    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await this.getHashedAccessControlConditions(params);

    if (!hashOfConditions) {
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
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
    const identityParam = this.#getIdentityParamForEncryption(
      hashOfConditionsStr,
      hashOfPrivateDataStr
    );

    // ========== Encrypt ==========
    const ciphertext = encrypt(
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
    const { authSig, sessionSigs, chain, ciphertext, dataToEncryptHash } =
      params;

    // ========== Validate Params ==========
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        '6 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // -- validate if this.subnetPubKey is null
    if (!this.subnetPubKey) {
      const message = 'subnetPubKey cannot be null';
      return throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    const paramsIsSafe = safeParams({
      functionName: 'decrypt',
      params,
    });

    if (!paramsIsSafe) {
      return throwError({
        message: `Parameter validation failed.`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // ========== Hashing Access Control Conditions =========
    // hash the access control conditions
    const hashOfConditions: ArrayBuffer | undefined =
      await this.getHashedAccessControlConditions(params);

    if (!hashOfConditions) {
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
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
      throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // ========== Assemble identity parameter ==========
    const identityParam = this.#getIdentityParamForEncryption(
      hashOfConditionsStr,
      dataToEncryptHash
    );

    log('identityParam', identityParam);

    // ========== Get Network Signature ==========
    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      const nodePromises = this.getNodePromises((url: string) => {
        // -- if session key is available, use it
        const authSigToSend = sessionSigs ? sessionSigs[url] : authSig;

        return this.getSigningShareForDecryption(
          url,
          {
            accessControlConditions: formattedAccessControlConditions,
            evmContractConditions: formattedEVMContractConditions,
            solRpcConditions: formattedSolRpcConditions,
            unifiedAccessControlConditions:
              formattedUnifiedAccessControlConditions,
            dataToEncryptHash,
            chain,
            authSig: authSigToSend,
          },
          id
        );
      });

      // -- resolve promises
      const res = await this.handleNodePromises(
        nodePromises,
        id,
        this.config.minNodeCount
      );
      return res;
    };

    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (_error: string, _requestId: string, _isFinal: boolean) => {
        logError('an error occured attempting to retry');
      },
      this.config.retryTolerance
    );

    const requestId = res.requestId;

    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
    }

    const signatureShares: NodeBlsSigningShare[] = (
      res as SuccessNodePromises<NodeBlsSigningShare>
    ).values;

    logWithRequestId(requestId, 'signatureShares', signatureShares);

    // ========== Result ==========
    const decryptedData = this.#decryptWithSignatureShares(
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
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
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

  #getIdentityParamForEncryption = (
    hashOfConditionsStr: string,
    hashOfPrivateDataStr: string
  ): string => {
    return new LitAccessControlConditionResource(
      `${hashOfConditionsStr}/${hashOfPrivateDataStr}`
    ).getResourceKey();
  };

  /**
   *
   * Validates a condition, and then signs the condition if the validation returns true.
   * Before calling this function, you must know the on chain conditions that you wish to validate.
   *
   * @param { ValidateAndSignECDSA } params
   *
   * @returns { Promise<string> }
   */
  validateAndSignEcdsa = async (
    params: ValidateAndSignECDSA
  ): Promise<string> => {
    // ========== Validate Params ==========
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        '7 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // ========== Prepare Params ==========
    const { accessControlConditions, chain, auth_sig } = params;

    // ========== Prepare JWT Params ==========
    // we need to send jwt params iat (issued at) and exp (expiration)
    // because the nodes may have different wall clock times
    // the nodes will verify that these params are withing a grace period
    const { iat, exp } = this.getJWTParams();

    // -- validate
    if (!accessControlConditions) {
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // -- formatted access control conditions
    let formattedAccessControlConditions: any;

    formattedAccessControlConditions = accessControlConditions.map((c: any) =>
      canonicalAccessControlConditionFormatter(c)
    );
    log(
      'formattedAccessControlConditions',
      JSON.stringify(formattedAccessControlConditions)
    );

    // ========== Node Promises ==========
    const wrapper = async (
      id: string
    ): Promise<RejectedNodePromises | SuccessNodePromises<any>> => {
      const nodePromises = this.getNodePromises((url: string) => {
        return this.signConditionEcdsa(
          url,
          {
            accessControlConditions: formattedAccessControlConditions,
            evmContractConditions: undefined,
            solRpcConditions: undefined,
            auth_sig,
            chain,
            iat,
            exp,
          },
          id
        );
      });

      // ----- Resolve Promises -----
      const responses = await this.handleNodePromises(
        nodePromises,
        id,
        this.connectedNodes.size
      );

      return responses;
    };

    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (_error: any, _requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('an error has occured, attempting to retry ');
        }
      },
      this.config.retryTolerance
    );

    const requestId = res.requestId;
    // return the first value as this will be the signature data
    try {
      if (res.success === false) {
        return 'Condition Failed';
      }
      const shareData = (res as SuccessNodePromises<any>).values;
      const signature = this.getSignature(shareData, requestId);
      return signature;
    } catch (e) {
      logErrorWithRequestId(requestId, 'Error - signed_ecdsa_messages - ', e);
      const signed_ecdsa_message = res as RejectedNodePromises;
      // have to cast to any to keep with above `string` return value
      // this will be returned as `RejectedNodePromise`
      return signed_ecdsa_message as any;
    }
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
      const message =
        '[signSessionKey] ]LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // -- construct SIWE message that will be signed by node to generate an authSig.
    const _expiration =
      params.expiration ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    let sessionKeyUri: string;

    // This allow the user to provide a sessionKeyUri directly without using the session key pair
    if (params?.sessionKeyUri) {
      sessionKeyUri = params.sessionKeyUri;
      log(`[signSessionKey] sessionKeyUri found in params:`, sessionKeyUri);
    } else {
      // Try to get it from local storage, if not generates one~
      let sessionKey: SessionKeyPair =
        params.sessionKey ?? this.getSessionKey();
      sessionKeyUri = LIT_SESSION_KEY_URI + sessionKey.publicKey;

      log(
        `[signSessionKey] sessionKeyUri is not found in params, generating a new one`,
        sessionKeyUri
      );
    }

    if (!sessionKeyUri) {
      throw new Error(
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
      nonce: this.latestBlockhash!,
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
      ...(params?.authSig && { authSig: params.authSig }),
      siweMessage: siweMessage,
      curveType: LIT_CURVE.BLS,

      // -- custom auths
      ...(params?.litActionCode && { code: params.litActionCode }),
      ...(params?.jsParams && { jsParams: params.jsParams }),
      ...(this.currentEpochNumber && { epoch: this.currentEpochNumber }),
    };

    log(`[signSessionKey] body:`, body);

    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      logWithRequestId(id, 'signSessionKey body', body);
      const nodePromises = this.getNodePromises((url: string) => {
        return this.getSignSessionKeyShares(
          url,
          {
            body,
          },
          id
        );
      });

      // -- resolve promises
      let res;
      try {
        res = await this.handleNodePromises(
          nodePromises,
          id,
          this.connectedNodes.size
        );
        log('signSessionKey node promises:', res);
      } catch (e) {
        throw new Error(`Error when handling node promises: ${e}`);
      }
      return res;
    };

    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (_error: any, _requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('an error occured, attempting to retry ');
        }
      },
      this.config.retryTolerance
    );

    const requestId = res.requestId;
    logWithRequestId(requestId, 'handleNodePromises res:', res);

    // -- case: promises rejected
    if (!this.#isSuccessNodePromises(res)) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
      return {} as SignSessionKeyResponse;
    }

    const responseData = res.values;
    logWithRequestId(
      requestId,
      '[signSessionKey] responseData',
      JSON.stringify(responseData, null, 2)
    );

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    let curveType = responseData[0]?.curveType;

    if (!curveType) {
      log(`[signSessionKey] curveType not found. Defaulting to ECDSA.`);
      curveType = 'ECDSA';
    }

    log(`[signSessionKey] curveType is "${curveType}"`);

    let signedDataList: any[] = [];

    if (curveType === LIT_CURVE.BLS) {
      let _responseData: BlsResponseData[] = responseData;

      const signatureShares = _responseData.map((s) => ({
        ProofOfPossession: s.signatureShare.ProofOfPossession,
      }));

      log(`[signSessionKey] signatureShares:`, signatureShares);

      signedDataList = _responseData.map((s) => {
        return s.dataSigned;
      });

      signedDataList = _responseData;
    } else {
      signedDataList = responseData.map(
        (r: any) => (r as SignedData).signedData
      );
    }

    if (signedDataList.length <= 0) {
      const err = `[signSessionKey] signedDataList is empty.`;
      log(err);
      throw new Error(err);
    }

    logWithRequestId(
      requestId,
      '[signSessionKey] signedDataList',
      signedDataList
    );

    // -- checking if we have enough shares
    const validatedSignedDataList = signedDataList
      .map((signedData: any) => {
        const sessionSig = signedData['sessionSig'] ?? signedData;

        // add backwards compatibility for `sigType` field
        // For more context: Previously, the field was called `sigType` but it was changed to `curveType` because we are now using BLS instead of ECDSA.
        if (sessionSig['curveType'] && !sessionSig['sigType']) {
          sessionSig['sigType'] = sessionSig['curveType'];
        }

        // each of this field cannot be empty
        let requiredFields =
          curveType === LIT_CURVE.BLS
            ? [
                'signatureShare',
                'curveType',
                'shareIndex',
                'siweMessage',
                'dataSigned',
                'blsRootPubkey',
                'result',
              ]
            : [
                'sigType',
                'dataSigned',
                'signatureShare',
                'bigr',
                'publicKey',
                'sigName',
                'siweMessage',
              ];

        // check if all required fields are present
        for (const field of requiredFields) {
          if (!sessionSig[field] || sessionSig[field] === '') {
            log(
              `[signSessionKey] Invalid signed data. "${field}" is missing. Not a problem, we only need ${this.config.minNodeCount} nodes to sign the session key.`
            );
            return null;
          }
        }

        if (curveType === LIT_CURVE.BLS) {
          if (!sessionSig.signatureShare.ProofOfPossession) {
            const err = `[signSessionKey] Invalid signed data. "ProofOfPossession" is missing.`;
            log(err);
            throw new Error(err);
          }
        }

        return signedData;
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
      throw new Error(
        `[signSessionKey] not enough nodes signed the session key.  Expected ${this.config.minNodeCount}, got ${validatedSignedDataList.length}`
      );
    }

    let signatures: any;

    if (curveType === LIT_CURVE.BLS) {
      const blsSignedData: BlsResponseData[] =
        validatedSignedDataList as BlsResponseData[];

      const sigType = mostCommonString(
        blsSignedData.map((s: any) => s.sigType)
      );
      log(`[signSessionKey] sigType:`, sigType);

      const signatureShares = blsSignedData.map((s) => ({
        ProofOfPossession: s.signatureShare.ProofOfPossession,
      }));

      log(`[signSessionKey] signatureShares:`, signatureShares);

      const blsCombinedSignature = blsSdk.combine_signature_shares(
        signatureShares.map((s) => JSON.stringify(s))
      );

      log(`[signSessionKey] blsCombinedSignature:`, blsCombinedSignature);

      const publicKey = params.pkpPublicKey.startsWith('0x')
        ? params.pkpPublicKey.slice(2)
        : params.pkpPublicKey;

      const dataSigned = mostCommonString(
        blsSignedData.map((s: any) => s.dataSigned)
      );
      const siweMessage = mostCommonString(
        blsSignedData.map((s: any) => s.siweMessage)
      );
      signatures = {
        sessionSig: {
          signature: blsCombinedSignature,
          publicKey,
          dataSigned,
          siweMessage,
        },
      };
    } else {
      // Shape: [signSessionKey] signatures: {
      //   sessionSig: {
      //     r: "xx",
      //     s: "yy",
      //     recid: 1,
      //     signature: "0x...",
      //     publicKey: "04e...",
      //     dataSigned: "7c1...",
      //     siweMessage: "litprotocol.com wants you to sign in with your Ethereum account:\n0xd69969c6a2E56C928d63F12325fe1d9D47115C91\n\nLit Protocol PKP session signature Some custom statement. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Signing' for 'lit-pkp://*'.\n\nURI: lit:session:95ff87b5d2210c382ccfcba6bdb16ceb217da9726c91d0fdda5eb888f087488f\nVersion: 1\nChain ID: 1\nNonce: 0x337906a8c2a6da52d438495fc1b0145ed5632ec32ffa1dda1064f43775b3a802\nIssued At: 2024-04-09T17:58:47Z\nExpiration Time: 2024-04-10T17:59:13.420Z\nResources:\n- urn:recap:eyJhdHQiOnt9LCJwcmYiOltdfQ\n- urn:recap:eyJhdHQiOnsibGl0LXBrcDovLyoiOnsiVGhyZXNob2xkL1NpZ25pbmciOlt7fV19fSwicHJmIjpbXX0",
      //   },
      // }
      signatures = this.getSessionSignatures(validatedSignedDataList);
    }

    log('[signSessionKey] signatures:', signatures);

    const { sessionSig } = signatures;

    const signedMessage = normalizeAndStringify(sessionSig.siweMessage);

    log(`[signSessionKey] signedMessage:`, signedMessage);

    if (curveType === LIT_CURVE.BLS) {
      return {
        authSig: {
          sig: JSON.stringify({
            ProofOfPossession: sessionSig.signature,
          }),
          algo: 'LIT_BLS',
          derivedVia: 'lit.bls',
          signedMessage,
          address: computeAddress('0x' + sessionSig.publicKey),
        },
        pkpPublicKey: sessionSig.publicKey,
      };
    }

    return {
      authSig: {
        sig: sessionSig.signature,
        derivedVia: 'web3.eth.personal.sign via Lit PKP',
        signedMessage,
        address: computeAddress('0x' + sessionSig.publicKey),
      },
      pkpPublicKey: sessionSig.publicKey,
    };
  };

  #isSuccessNodePromises = <T>(res: any): res is SuccessNodePromises<T> => {
    return res.success === true;
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

  generateAuthMethodForWebAuthn = (
    params: WebAuthnAuthenticationVerificationParams
  ): AuthMethod => ({
    authMethodType: AUTH_METHOD_TYPE_IDS.WEBAUTHN,
    accessToken: JSON.stringify(params),
  });

  generateAuthMethodForDiscord = (access_token: string): AuthMethod => ({
    authMethodType: AUTH_METHOD_TYPE_IDS.DISCORD,
    accessToken: access_token,
  });

  generateAuthMethodForGoogle = (access_token: string): AuthMethod => ({
    authMethodType: AUTH_METHOD_TYPE_IDS.GOOGLE,
    accessToken: access_token,
  });

  generateAuthMethodForGoogleJWT = (access_token: string): AuthMethod => ({
    authMethodType: AUTH_METHOD_TYPE_IDS.GOOGLE_JWT,
    accessToken: access_token,
  });

  /**
   * Get session signatures for a set of resources
   *
   * High level, how this works:
   * 1. Generate or retrieve session key
   * 2. Generate or retrieve the wallet signature of the session key
   * 3. Sign the specific resources with the session key
   *
   * Note: When generating session signatures for different PKPs or auth methods,
   * be sure to call disconnectWeb3 to clear auth signatures stored in local storage
   *
   * @param { GetSessionSigsProps } params
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

    if (!this.latestBlockhash) {
      throwError({
        message: 'Eth Blockhash is undefined.',
        errorKind: LIT_ERROR.INVALID_ETH_BLOCKHASH.kind,
        errorCode: LIT_ERROR.INVALID_ETH_BLOCKHASH.name,
      });
    }
    const nonce = this.latestBlockhash!;

    // -- (TRY) to get the wallet signature
    let authSig = await this.getWalletSig({
      authNeededCallback: params.authNeededCallback,
      chain: params.chain || 'ethereum',
      sessionCapabilityObject,
      switchChain: params.switchChain,
      expiration: expiration,
      sessionKeyUri: sessionKeyUri,
      nonce,

      // -- for recap
      resourceAbilityRequests: params.resourceAbilityRequests,

      // -- optional fields
      ...(params.litActionCode && { litActionCode: params.litActionCode }),
      ...(params.ipfsId && { ipfsId: params.ipfsId }),
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
      log('need to re-sign session key.  Signing...');
      authSig = await this.#authCallbackAndUpdateStorageItem({
        authCallback: params.authNeededCallback,
        authCallbackParams: {
          chain: params.chain || 'ethereum',
          statement: sessionCapabilityObject.statement,
          resources: [sessionCapabilityObject.encodeAsSiweResource()],
          switchChain: params.switchChain,
          expiration,
          uri: sessionKeyUri,
          nonce,
          resourceAbilityRequests: params.resourceAbilityRequests,
        },
      });
    }

    if (
      authSig.address === '' ||
      authSig.derivedVia === '' ||
      authSig.sig === '' ||
      authSig.signedMessage === ''
    ) {
      throwError({
        message: 'No wallet signature found',
        errorKind: LIT_ERROR.WALLET_SIGNATURE_NOT_FOUND_ERROR.kind,
        errorCode: LIT_ERROR.WALLET_SIGNATURE_NOT_FOUND_ERROR.name,
      });
      // @ts-ignore - we throw an error above, so below should never be reached
      return;
    }

    // ===== AFTER we have Valid Signed Session Key =====
    // - Let's sign the resources with the session key
    // - 5 minutes is the default expiration for a session signature
    // - Because we can generate a new session sig every time the user wants to access a resource without prompting them to sign with their wallet
    const sessionExpiration = new Date(Date.now() + 1000 * 60 * 5);

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
      expiration: sessionExpiration.toISOString(),
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
          throw new Error(
            '[getPkpSessionSigs/callback] expiration is required'
          );
        }

        if (!props.resources) {
          throw new Error('[getPkpSessionSigs/callback]resources is required');
        }

        if (!props.resourceAbilityRequests) {
          throw new Error(
            '[getPkpSessionSigs/callback]resourceAbilityRequests is required'
          );
        }

        // lit action code and ipfs id cannot exist at the same time
        if (props.litActionCode && props.ipfsId) {
          throw new Error(
            '[getPkpSessionSigs/callback]litActionCode and ipfsId cannot exist at the same time'
          );
        }

        const response = await this.signSessionKey({
          statement: props.statement || 'Some custom statement.',
          authMethods: [...params.authMethods],
          pkpPublicKey: params.pkpPublicKey,
          expiration: props.expiration,
          resources: props.resources,
          chainId: 1,

          // -- required fields
          resourceAbilityRequests: props.resourceAbilityRequests,

          // -- optional fields
          ...(props.litActionCode && { litActionCode: props.litActionCode }),
          ...(props.ipfsId && { ipfsId: props.ipfsId }),
          ...(props.jsParams && { jsParams: props.jsParams }),
        });

        return response.authSig;
      },
    });

    return pkpSessionSigs;
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
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    if (params.authMethod.authMethodType == AuthMethodType.WebAuthn) {
      throwError({
        message:
          'Unsupported auth method type. Webauthn, and Lit Actions are not supported for claiming',
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }
    let requestId;
    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      const nodePromises = await this.getNodePromises((url: string) => {
        const nodeRequestParams = {
          authMethod: params.authMethod,
        };
        return this.getClaimKeyExecutionShares(url, nodeRequestParams, id);
      });

      const responseData = await this.handleNodePromises(
        nodePromises,
        id,
        this.connectedNodes.size
      );

      return responseData;
    };

    const responseData = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (_error: any, _requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('an error occured, attempting to retry');
        }
      },
      this.config.retryTolerance
    );
    requestId = responseData.requestId;

    if (responseData.success === true) {
      const nodeSignatures: Signature[] = (
        responseData as SuccessNodePromises<any>
      ).values.map((r: any) => {
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

      const derivedKeyId = (responseData as SuccessNodePromises<any>).values[0]
        .derivedKeyId;

      const pubkey: string = this.computeHDPubKey(derivedKeyId);
      logWithRequestId(
        requestId,
        `pubkey ${pubkey} derived from key id ${derivedKeyId}`
      );

      const relayParams: ClaimRequest<'relay'> =
        params as ClaimRequest<'relay'>;

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
          this.config.litNetwork as LitNetwork
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
          this.config.litNetwork as LitNetwork
        );
      }

      return {
        signatures: nodeSignatures,
        claimedKeyId: derivedKeyId,
        pubkey,
        mintTx,
      };
    } else {
      return throwError({
        message: `Claim request has failed. Request trace id: lit_${requestId} `,
        errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
        errorCode: LIT_ERROR.UNKNOWN_ERROR.code,
      });
    }
  }
}
