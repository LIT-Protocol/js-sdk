import { computeAddress } from '@ethersproject/transactions';
import { BigNumber, ethers } from 'ethers';
import { joinSignature, sha256 } from 'ethers/lib/utils';
import * as siwe from 'siwe';

import { canonicalAccessControlConditionFormatter } from '@lit-protocol/access-control-conditions';
import {
  LitAccessControlConditionResource,
  decode,
  RecapSessionCapabilityObject,
  craftAuthSig,
  createSiweMessageWithCapacityDelegation,
  createSiweMessageWithRecaps,
  createSiweMessage,
} from '@lit-protocol/auth-helpers';

import {
  ILitResource,
  ISessionCapabilityObject,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';

import {
  AUTHSIG_ALGO,
  AUTH_METHOD_TYPE_IDS,
  AuthMethodType,
  DERIVED_VIA,
  EITHER_TYPE,
  LIT_ACTION_IPFS_HASH,
  LIT_ERROR,
  LIT_URI,
  LOCAL_STORAGE_KEYS,
  LIT_ENDPOINT,
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
  convertLitActionsParams,
  defaultMintClaimCallback,
  executeWithRetry,
  hexPrefixed,
  isNode,
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
  BlsResponseData,
  CapacityCreditsReq,
  CapacityCreditsRes,
  ClaimKeyResponse,
  ClaimProcessor,
  ClaimRequest,
  CustomNetwork,
  DecryptRequest,
  DecryptResponse,
  EncryptRequest,
  EncryptResponse,
  ExecuteJsProps,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  GetPkpSessionSigs,
  GetSessionSigsProps,
  GetSignSessionKeySharesProp,
  GetSignedTokenRequest,
  GetSigningShareForDecryptionRequest,
  GetWalletSigProps,
  JsExecutionRequestBody,
  JsonExecutionRequest,
  JsonPkpSignRequest,
  JsonSignSessionKeyRequestV1,
  LitClientSessionManager,
  LitNodeClientConfig,
  NodeBlsSigningShare,
  NodeCommandResponse,
  NodeLog,
  NodeResponse,
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
} from '@lit-protocol/types';

import * as blsSdk from '@lit-protocol/bls-sdk';

type SessionKeyCache = {
  value: SessionKeyPair;
  timestamp: number;
};

// Global cache variable
let sessionKeyCache: SessionKeyCache | null = null;

export class LitNodeClientNodeJs
  extends LitCore
  implements LitClientSessionManager
{
  defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;

  // ========== Constructor ==========
  constructor(args: LitNodeClientConfig | CustomNetwork) {
    super(args);

    if ('defaultAuthCallback' in args) {
      this.defaultAuthCallback = args.defaultAuthCallback;
    }
  }

  // ========== STATIC METHODS ==========
  static getClaims = (
    claims: any[]
  ): Record<string, { signatures: Signature[]; derivedKeyId: string }> => {
    const keys: string[] = Object.keys(claims[0]);
    const signatures: Record<string, Signature[]> = {};
    const claimRes: Record<
      string,
      { signatures: Signature[]; derivedKeyId: string }
    > = {};
    for (let i = 0; i < keys.length; i++) {
      const claimSet: { signature: string; derivedKeyId: string }[] =
        claims.map((c) => c[keys[i]]);
      signatures[keys[i]] = [];
      claimSet.map((c) => {
        const sig = ethers.utils.splitSignature(`0x${c.signature}`);
        const convertedSig = {
          r: sig.r,
          s: sig.s,
          v: sig.v,
        };
        signatures[keys[i]].push(convertedSig);
      });

      claimRes[keys[i]] = {
        signatures: signatures[keys[i]],
        derivedKeyId: claimSet[0].derivedKeyId,
      };
    }
    return claimRes;
  };

  // ========== Rate Limit NFT ==========

  // TODO: Add support for browser feature/lit-2321-js-sdk-add-browser-support-for-createCapacityDelegationAuthSig
  createCapacityDelegationAuthSig = async (
    params: CapacityCreditsReq
  ): Promise<CapacityCreditsRes> => {
    const {
      dAppOwnerWallet,
      capacityTokenId,
      delegateeAddresses,
      uses,
      domain,
      expiration,
      statement,
    } = params;

    // TODO: WARNING console when there are no delegatees, we need to warn the user

    // -- This is the owner address who holds the Capacity Credits NFT token and wants to delegate its
    // usage to a list of delegatee addresses
    const dAppOwnerWalletAddress = ethers.utils.getAddress(
      await dAppOwnerWallet.getAddress()
    );

    // -- if it's not ready yet, then connect
    if (!this.ready) {
      await this.connect();
    }

    // -- validate
    if (!dAppOwnerWallet) {
      throw new Error('dAppOwnerWallet must exist');
    }

    const nonce = this.getLatestBlockhash();

    const siweMessage = await createSiweMessageWithCapacityDelegation({
      uri: LIT_URI.CAPABILITY_DELEGATION,
      litNodeClient: this,
      walletAddress: dAppOwnerWalletAddress,
      nonce: nonce,
      // -- default configuration for recap object capability
      expiration:
        expiration ?? new Date(Date.now() + 1000 * 60 * 7).toISOString(),
      domain: domain ?? 'example.com',
      statement:
        statement ??
        'This is a test statement.  You can put anything you want here.',

      // -- capacity delegation specific configuration
      uses: uses ?? '1',
      delegateeAddresses: delegateeAddresses,
      capacityTokenId: capacityTokenId,
    });

    const authSig = await craftAuthSig({
      signer: dAppOwnerWallet,
      toSign: siweMessage,
    });

    return { capacityDelegationAuthSig: authSig };
  };

  // ========== Scoped Class Helpers ==========

  /**
   *
   * Get the request body of the lit action
   *
   * @param { ExecuteJsProps } params
   *
   * @returns { JsonExecutionRequest }
   *
   */
  getLitActionRequestBody = (params: ExecuteJsProps): JsonExecutionRequest => {
    const reqBody: JsonExecutionRequest = {
      ...(params.authSig && { authSig: params.authSig }),
      ...(params.sessionSigs && { sessionSigs: params.sessionSigs }),
      ...(params.authMethods && { authMethods: params.authMethods }),
      jsParams: convertLitActionsParams(params.jsParams),
      // singleNode: params.singleNode ?? false,
      targetNodeRange: params.targetNodeRange ?? 0,
    };

    if (params.code) {
      const _uint8Array = uint8arrayFromString(params.code, 'utf8');
      const encodedJs = uint8arrayToString(_uint8Array, 'base64');

      reqBody.code = encodedJs;
    }

    if (params.ipfsId) {
      reqBody.ipfsId = params.ipfsId;
    }

    if (params.authMethods && params.authMethods.length > 0) {
      reqBody.authMethods = params.authMethods;
    }

    return reqBody;
  };

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

  /**
   *
   * Parse the response string to JSON
   *
   * @param { string } responseString
   *
   * @returns { any } JSON object
   *
   */
  parseResponses = (responseString: string): any => {
    let response: any;

    try {
      response = JSON.parse(responseString);
    } catch (e) {
      log(
        'Error parsing response as json.  Swallowing and returning as string.',
        responseString
      );
    }

    return response;
  };

  // ==================== SESSIONS ====================
  /**
   * Try to get the session key in the local storage,
   * if not, generates one.
   * @return { SessionKeyPair } session key pair
   */
  getSessionKey = (): SessionKeyPair => {
    const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY; // lit-session-key
    const storedSessionKeyOrError = getStorageItem(storageKey);

    log(`[getSessionKey] storageKey: ${storageKey}`);
    log(
      `[getSessionKey] storedSessionKeyOrError: ${JSON.stringify(
        storedSessionKeyOrError
      )}`
    );

    if (
      storedSessionKeyOrError.type === EITHER_TYPE.ERROR ||
      !storedSessionKeyOrError.result ||
      storedSessionKeyOrError.result === ''
    ) {
      log(
        `[getSessionKey] Storage key "${storageKey}" is missing.Not a problem.Contiune...`
      );

      // Check if a valid session key exists in cache
      if (sessionKeyCache && Date.now() - sessionKeyCache.timestamp < 30000) {
        log(`[getSessionKey] Returning session key from cache.`);
        return sessionKeyCache.value;
      }

      // Generate new one
      const newSessionKey = generateSessionKeyPair();
      log(`[getSessionKey] newSessionKey: ${JSON.stringify(newSessionKey)}`);

      // Try to set to local storage
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
        log(`[getSessionKey] newSessionKey set to local storage`);
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
      log(`[getSessionKey] Storage key "${storageKey}" found.Continue...`);
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
   * returns the latest block hash.
   * will call refresh if the block hash is expired
   * @returns {Promise<string>} latest block hash from `handhsake` with the lit network.
   */
  getLatestBlockhash = (): string => {
    if (!this.ready) {
      logError('Client not connected, remember to call connect');
      throwError({
        message: 'Client not connected',
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.code,
      });
    }

    // we are confident in this value being non null so we return
    return this.latestBlockhash!;
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
  }: GetWalletSigProps): Promise<AuthSig> => {
    let walletSig: AuthSig;

    const storageKey = LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;
    const storedWalletSigOrError = getStorageItem(storageKey);

    // browser: 2 > 2.1 > 3
    // nodejs: 1. > 1.1

    // -- (TRY) to get it in the local storage
    // -- IF NOT: Generates one
    log(`[getWalletSig] flow starts
        storageKey: ${storageKey}
        storedWalletSigOrError: ${JSON.stringify(storedWalletSigOrError)}
  `);

    if (
      storedWalletSigOrError.type === EITHER_TYPE.ERROR ||
      !storedWalletSigOrError.result ||
      storedWalletSigOrError.result == ''
    ) {
      log('[getWalletSig] flow 1');
      log(
        `[getWalletSig] storageKey: ${storageKey} is missing.Not a problem.Continue...`
      );

      if (authNeededCallback) {
        log('[getWalletSig] flow 1.1');
        log(
          `[getWalletSig] authNeededCallback found from params.Creating a callback body...`
        );

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
          ...(resourceAbilityRequests && { resourceAbilityRequests }),
        };

        log('[getWalletSig] callback body:', body);
        log(
          `[getWalletSig] passing the callback body to the authNeededCallback.Please note that the implementation differs based on user's implementation.`
        );

        walletSig = await authNeededCallback(body);
        log(
          `[getWalletSig] walletSig from user's authNeededCallback`,
          walletSig
        );
      } else {
        log('[getWalletSig] flow 1.2');
        if (!this.defaultAuthCallback) {
          log('[getWalletSig] flow 1.2.1');
          return throwError({
            message: 'No default auth callback provided',
            errorKind: LIT_ERROR.PARAMS_MISSING_ERROR.kind,
            errorCode: LIT_ERROR.PARAMS_MISSING_ERROR.name,
          });
        }

        log('[getWalletSig] flow 1.2.2');
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

      log('[getWalletSig] flow 1.3');

      // (TRY) to set walletSig to local storage
      const storeNewWalletSigOrError = setStorageItem(
        storageKey,
        JSON.stringify(walletSig)
      );
      if (storeNewWalletSigOrError.type === 'ERROR') {
        log('[getWalletSig] flow 1.4');
        console.warn(
          `Unable to store walletSig in local storage. Not a problem. Continue...`
        );
      }
    } else {
      log('[getWalletSig] flow 2');
      try {
        walletSig = JSON.parse(storedWalletSigOrError.result as string);
        log('[getWalletSig] flow 2.1');
      } catch (e) {
        console.warn('Error parsing walletSig', e);
        log('[getWalletSig] flow 2.2');
      }
    }

    log('[getWalletSig] flow 3');
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
  /**
   *
   * Get JS Execution Shares from Nodes
   *
   * @param { JsonExecutionRequest } params
   *
   * @returns { Promise<any> }
   */
  getJsExecutionShares = async (
    url: string,
    params: JsonExecutionRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    const { code, ipfsId, authSig, jsParams, authMethods } = params;

    logWithRequestId(requestId, 'getJsExecutionShares');

    // -- execute
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.EXECUTE_JS,
    });

    if (!authSig) {
      throw new Error('authSig or sessionSig is required');
    }
    const data: JsExecutionRequestBody = {
      ...(authSig ? { authSig } : {}),
      ...(code ? { code } : {}),
      ...(ipfsId ? { ipfsId } : {}),
      ...(authMethods ? { authMethods } : {}),
      ...(jsParams ? { jsParams } : {}),
    };

    const res = await this.sendCommandToNode({
      url: urlWithPath,
      data,
      requestId,
    });
    logWithRequestId(
      requestId,
      `response node with url: ${url} from endpoint ${urlWithPath}`,
      res
    );
    return res;
  };

  getPkpSignExecutionShares = async (
    url: string,
    params: any,
    requestId: string
  ) => {
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.PKP_SIGN,
    });

    logWithRequestId(requestId, `[getPkpSigningShares] ${urlWithPath}`);

    if (!params.authSig) {
      throw new Error('authSig is required');
    }

    return await this.sendCommandToNode({
      url: urlWithPath,
      data: params,
      requestId,
    });
  };

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
    authSig,
    debug = false,
  }: {
    dataToHash: string;
    authSig: AuthSig;
    debug?: boolean;
  }) => {
    const laRes = await this.executeJs({
      authSig,
      ipfsId: LIT_ACTION_IPFS_HASH,
      authMethods: [],
      jsParams: {
        dataToHash,
      },
      debug,
    }).catch((e) => {
      logError('Error getting IPFS ID', e);
      throw e;
    });

    const data = JSON.parse(laRes.response).res;

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
    params: ExecuteJsProps
  ): Promise<
    SuccessNodePromises<NodeCommandResponse> | RejectedNodePromises
  > => {
    const {
      code,
      authMethods,
      authSig,
      jsParams,
      debug,
      sessionSigs,
      targetNodeRange,
    } = params;

    log('running runOnTargetedNodes:', targetNodeRange);

    if (!targetNodeRange) {
      return throwError({
        message: 'targetNodeRange is required',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }

    // determine which node to run on
    const ipfsId = await this.getIpfsId({
      dataToHash: code!,
      authSig: authSig!,
      debug,
    });

    // select targetNodeRange number of random index of the bootstrapUrls.length
    const randomSelectedNodeIndexes: number[] = [];

    let nodeCounter = 0;

    while (randomSelectedNodeIndexes.length < targetNodeRange) {
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

        const reqBody: JsonExecutionRequest =
          this.getLitActionRequestBody(params);

        // -- choose the right signature
        const sigToPassToNode = this.getSessionOrAuthSig({
          authSig,
          sessionSigs,
          url,
        });

        reqBody.authSig = sigToPassToNode;

        // this return { url: string, data: JsonRequest }
        const singleNodePromise = this.getJsExecutionShares(url, reqBody, id);

        nodePromises.push(singleNodePromise);
      }

      const handledPromise = (await this.handleNodePromises(
        nodePromises,
        id,
        targetNodeRange
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

  // ========== Shares Resolvers ==========
  _getFlattenShare = (share: any): SigShare => {
    // flatten the signature object so that the properties of the signature are top level
    const flattenObj = Object.entries(share).map(([key, item]) => {
      if (item === null || item === undefined) {
        return null;
      }

      const typedItem = item as SigShare;

      const requiredShareProps = [
        'sigType',
        'dataSigned',
        'signatureShare',
        'shareIndex',
        'bigR',
        'publicKey',
      ];

      const requiredSessionSigsShareProps = [
        ...requiredShareProps,
        'siweMessage',
      ] as const;

      const requiredSignatureShareProps = [
        ...requiredShareProps,
        'sigName',
      ] as const;

      const hasProps = (props: any) => {
        return [...props].every(
          (prop) =>
            typedItem[prop as keyof SigShare] !== undefined &&
            typedItem[prop as keyof SigShare] !== null
        );
      };

      if (
        hasProps(requiredSessionSigsShareProps) ||
        hasProps(requiredSignatureShareProps)
      ) {
        const bigR = typedItem.bigR ?? typedItem.bigr;

        typedItem.signatureShare = typedItem.signatureShare.replaceAll('"', '');
        typedItem.bigR = bigR?.replaceAll('"', '');
        typedItem.publicKey = typedItem.publicKey.replaceAll('"', '');
        typedItem.dataSigned = typedItem.dataSigned.replaceAll('"', '');

        return typedItem;
      }

      return null;
    });

    // removed all null values and should only have one item
    const flattenShare = flattenObj.filter(
      (item) => item !== null
    )[0] as SigShare;

    if (flattenShare === null || flattenShare === undefined) {
      return share;
    }
    return flattenShare;
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
      log('[getSessionSignatures] key:', key);

      const shares = signedData.map((r: any) => r[key]);

      log('[getSessionSignatures] shares:', shares);

      shares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

      const sigShares: SigShare[] = shares.map((s: any, index: number) => {
        log('[getSessionSignatures] Original Share Struct:', s);

        const share = this._getFlattenShare(s);

        log('[getSessionSignatures] share:', share);

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

        log('[getSessionSignatures] sanitisedBigR:', sanitisedBigR);
        log('[getSessionSignatures] sanitisedSigShare:', sanitisedSigShare);

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

      log('[getSessionSignatures] sigShares', sigShares);

      const sigType = mostCommonString(sigShares.map((s: any) => s.sigType));

      // -- validate if this.networkPubKeySet is null
      if (this.networkPubKeySet === null) {
        throwError({
          message: '[getSessionSignatures] networkPubKeySet cannot be null',
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
          message: `[getSessionSignatures] signature type is ${sigType} which is invalid`,
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
        });
        return;
      }

      const signature: any = combineEcdsaShares(sigShares);

      if (!signature.r) {
        throwError({
          message: '[getSessionSignatures] siganture could not be combined',
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.name,
        });
      }

      const encodedSig = joinSignature({
        r: '0x' + signature.r,
        s: '0x' + signature.s,
        v: signature.recid,
      });

      log(`[getSessionSignatures] encodedSig: ${encodedSig}`);

      signatures[key] = {
        ...signature,
        signature: encodedSig,
        publicKey: mostCommonString(sigShares.map((s: any) => s.publicKey)),
        dataSigned: mostCommonString(sigShares.map((s: any) => s.dataSigned)),
        siweMessage: mostCommonString(sigShares.map((s) => s.siweMessage)),
      };

      log(`[getSessionSignatures] signatures[${key}]:`, signatures[key]);
    });

    return signatures;
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
  getSignatures = (signedData: any[], requestId: string = ''): any => {
    const initialKeys = [...new Set(signedData.flatMap((i) => Object.keys(i)))];

    // processing signature shares for failed or invalid contents.  mutates the signedData object.
    for (const signatureResponse of signedData) {
      for (const sigName of Object.keys(signatureResponse)) {
        const requiredFields = ['signatureShare'];

        for (const field of requiredFields) {
          if (!signatureResponse[sigName][field]) {
            logWithRequestId(
              requestId,
              `invalid field ${field} in signature share: ${sigName}, continuing with share processing`
            );
            // destructive operation on the object to remove invalid shares inline, without a new collection.
            delete signatureResponse[sigName];
          } else {
            let share = this._getFlattenShare(signatureResponse[sigName]);

            share = {
              sigType: share.sigType,
              signatureShare: share.signatureShare,
              shareIndex: share.shareIndex,
              bigR: share.bigR,
              publicKey: share.publicKey,
              dataSigned: share.dataSigned,
              sigName: share.sigName ? share.sigName : 'sig',
            };
            signatureResponse[sigName] = share;
          }
        }
      }
    }

    const validatedSignedData = signedData;

    // -- prepare
    const signatures: any = {};

    // get all signature shares names from all node responses.
    // use a set to filter duplicates and copy into an array
    const allKeys = [
      ...new Set(validatedSignedData.flatMap((i) => Object.keys(i))),
    ];

    if (allKeys.length !== initialKeys.length) {
      throwError({
        message: 'total number of valid signatures does not match requested',
        errorKind: LIT_ERROR.NO_VALID_SHARES.kind,
        errorCode: LIT_ERROR.NO_VALID_SHARES.code,
      });
    }

    // -- combine
    for (var i = 0; i < allKeys.length; i++) {
      // here we use a map filter implementation to find common shares in each node response.
      // we then filter out undefined object from the key access.
      // currently we are unable to know the total signature count requested by the user.
      // but this allows for incomplete sets of signature shares to be aggregated
      // and then checked against threshold
      const shares = validatedSignedData
        .map((r: any) => r[allKeys[i]])
        .filter((r: any) => r !== undefined);

      shares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

      const sigName = shares[0].sigName;
      logWithRequestId(
        requestId,
        `[getSignatures] starting signature combine for sig name: ${sigName}`,
        shares
      );
      logWithRequestId(
        requestId,
        `[getSignatures] number of shares for ${sigName}:`,
        signedData.length
      );
      logWithRequestId(
        requestId,
        `[getSignatures] validated length for signature: ${sigName}`,
        shares.length
      );
      logWithRequestId(
        requestId,
        '[getSignatures] minimum required shares for threshold:',
        this.config.minNodeCount
      );

      if (shares.length < this.config.minNodeCount) {
        logErrorWithRequestId(
          requestId,
          `[getSignatures] not enough nodes to get the signatures.  Expected ${this.config.minNodeCount}, got ${shares.length}`
        );

        throwError({
          message: `[getSignatures] The total number of valid signatures shares ${shares.length} does not meet the threshold of ${this.config.minNodeCount}`,
          errorKind: LIT_ERROR.NO_VALID_SHARES.kind,
          errorCode: LIT_ERROR.NO_VALID_SHARES.code,
          requestId,
        });
      }

      const sigType = mostCommonString(shares.map((s: any) => s.sigType));

      // -- validate if this.networkPubKeySet is null
      if (this.networkPubKeySet === null) {
        throwError({
          message: '[getSignatures] networkPubKeySet cannot be null',
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
          message: `[getSignatures] signature type is ${sigType} which is invalid`,
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
        });
        return;
      }

      const signature = combineEcdsaShares(shares);
      if (!signature.r) {
        throwError({
          message: '[getSignatures] siganture could not be combined',
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.name,
        });
      }

      const encodedSig = joinSignature({
        r: '0x' + signature.r,
        s: '0x' + signature.s,
        v: signature.recid,
      });

      signatures[allKeys[i]] = {
        ...signature,
        signature: encodedSig,
        publicKey: mostCommonString(shares.map((s: any) => s.publicKey)),
        dataSigned: mostCommonString(shares.map((s: any) => s.dataSigned)),
      };
    }

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

  //  the data to a basic array
  public static normalizeParams(params: ExecuteJsProps): ExecuteJsProps {
    if (!params.jsParams) {
      params.jsParams = {};
      return params;
    }

    for (const key of Object.keys(params.jsParams)) {
      if (
        Array.isArray(params.jsParams[key]) ||
        ArrayBuffer.isView(params.jsParams[key])
      ) {
        const arr = [];
        for (let i = 0; i < params.jsParams[key].length; i++) {
          arr.push((params.jsParams[key] as Buffer)[i]);
        }
        params.jsParams[key] = arr;
      }
    }
    return params;
  }

  /**
   *
   * Execute JS on the nodes and combine and return any resulting signatures
   *
   * @param { ExecuteJsRequest } params
   *
   * @returns { ExecuteJsResponse }
   *
   */
  executeJs = async (params: ExecuteJsProps): Promise<ExecuteJsResponse> => {
    // ========== Prepare Params ==========
    const {
      authMethods,
      code,
      ipfsId,
      authSig,
      jsParams,
      debug,
      sessionSigs,
      targetNodeRange,
    } = params;

    // ========== Validate Params ==========
    // -- validate: If it's NOT ready
    if (!this.ready) {
      const message =
        '1 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

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

    // Call the normalizeParams function to normalize the parameters
    params = LitNodeClientNodeJs.normalizeParams(params);

    let res;
    let requestId = '';
    // -- only run on a single node
    if (targetNodeRange) {
      res = await this.runOnTargetedNodes(params);
    } else {
      // ========== Prepare Variables ==========
      // -- prepare request body
      const reqBody: JsonExecutionRequest =
        this.getLitActionRequestBody(params);

      // ========== Get Node Promises ==========

      // -- fetch shares from nodes
      const wrapper = async (
        requestId: string
      ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
        const nodePromises = this.getNodePromises((url: string) => {
          // -- choose the right signature
          const sigToPassToNode = this.getSessionOrAuthSig({
            authSig,
            sessionSigs,
            url,
          });

          reqBody.authSig = sigToPassToNode;

          const shares = this.getJsExecutionShares(url, reqBody, requestId);

          return shares;
        });
        // -- resolve promises
        res = await this.handleNodePromises(
          nodePromises,
          requestId,
          this.connectedNodes.size
        );
        return res;
      };
      res = await executeWithRetry<
        RejectedNodePromises | SuccessNodePromises<any>
      >(
        wrapper,
        (error: any, requestId: string, isFinal: boolean) => {
          logError('an error occured, attempting to retry operation');
        },
        this.config.retryTolerance
      );

      requestId = res.requestId;
    }
    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises<NodeShare>).values;

    logWithRequestId(
      requestId,
      '[executeJs] responseData from node : ',
      JSON.stringify(responseData, null, 2)
    );

    // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
    // we must also check for claim responses as a user may have submitted for a claim and signatures must be aggregated before returning
    if (
      responseData[0].success &&
      Object.keys(responseData[0].signedData).length <= 0 &&
      Object.keys(responseData[0].claimData).length <= 0
    ) {
      return responseData[0] as any as ExecuteJsResponse;
    }

    // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
    if (
      Object.keys(responseData[0].signedData).length <= 0 &&
      Object.keys(responseData[0].claimData).length <= 0
    ) {
      return {
        claims: {},
        signatures: null,
        decryptions: [],
        response: responseData[0].response,
        logs: responseData[0].logs,
      };
    }

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = responseData.map((r) => {
      const { signedData } = r;
      for (const key of Object.keys(signedData)) {
        for (const subkey of Object.keys(signedData[key])) {
          //@ts-ignore
          if (typeof signedData[key][subkey] === 'string') {
            //@ts-ignore
            signedData[key][subkey] = signedData[key][subkey].replaceAll(
              '"',
              ''
            );
          }
        }
      }
      return signedData;
    });

    logWithRequestId(
      requestId,
      'signatures shares to combine: ',
      signedDataList
    );
    const signatures = this.getSignatures(signedDataList, requestId);

    // -- 2. combine responses as a string, and get parse it as JSON
    let response: string = mostCommonString(
      responseData.map((r: NodeResponse) => r.response)
    );

    response = this.parseResponses(response);

    // -- 3. combine logs
    const mostCommonLogs: string = mostCommonString(
      responseData.map((r: NodeLog) => r.logs)
    );

    // -- 4. combine claims
    const claimsList = responseData
      .map((r) => {
        const { claimData } = r;
        if (claimData) {
          for (const key of Object.keys(claimData)) {
            for (const subkey of Object.keys(claimData[key])) {
              if (typeof claimData[key][subkey] == 'string') {
                claimData[key][subkey] = claimData[key][subkey].replaceAll(
                  '"',
                  ''
                );
              }
            }
          }
          return claimData;
        }
        return null;
      })
      .filter((item) => item !== null);

    // logWithRequestId(requestId, 'claimList:', claimsList);

    let claims = undefined;

    if (claimsList.length > 0) {
      claims = LitNodeClientNodeJs.getClaims(claimsList);
    }

    // ========== Result ==========
    const returnVal: ExecuteJsResponse = {
      claims,
      signatures,
      decryptions: [], // FIXME: Fix if and when we enable decryptions from within a Lit Action.
      response,
      logs: mostCommonLogs,
    };

    log('[executeJs] returnVal:', returnVal);

    // -- case: debug mode
    if (debug) {
      const allNodeResponses = responseData.map(
        (r: NodeResponse) => r.response
      );
      const allNodeLogs = responseData.map((r: NodeLog) => r.logs);

      returnVal.debug = {
        allNodeResponses,
        allNodeLogs,
        rawNodeHTTPResponses: responseData,
      };
    }

    return returnVal;
  };

  pkpSign = async (params: JsonPkpSignRequest) => {
    let { authSig, sessionSigs, toSign, pubKey, authMethods } = params;
    log('[pkpSign] params:', params);

    pubKey = hexPrefixed(pubKey);

    // -- validate required params
    (['toSign', 'pubKey'] as (keyof JsonPkpSignRequest)[]).forEach((key) => {
      if (!params[key]) {
        throwError({
          message: `[pkpSign] "${key}" cannot be undefined, empty, or null. Please provide a valid value.`,
          errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
          errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
        });
      }
    });

    // -- validate present of accepted auth methods
    if (!authSig && !sessionSigs && (!authMethods || authMethods.length <= 0)) {
      throwError({
        message: `[pkpSign] Either authSig, sessionSigs, or authMethods (length > 0) must be present.`,
        errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
        errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
      });
    }

    // the nodes will only accept a normal array type as a paramater due to serizalization issues with Uint8Array type.
    // this loop below is to normalize the message to a basic array.
    const arr = [];
    for (let i = 0; i < toSign.length; i++) {
      arr.push((toSign as Buffer)[i]);
    }
    toSign = arr;

    const wrapper = async (
      id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      const nodePromises = this.getNodePromises((url: string) => {
        // -- choose the right signature
        const sigToPassToNode = this.getSessionOrAuthSig({
          authSig,
          sessionSigs,
          url,
          mustHave: false,
        });

        logWithRequestId(id, '[pkpSign] sigToPassToNode:', sigToPassToNode);

        const reqBody = {
          toSign,
          pubkey: pubKey,
          ...(sigToPassToNode &&
            sigToPassToNode !== undefined && { authSig: sigToPassToNode }),
          ...(authMethods && authMethods.length > 0 && { authMethods }),
        };

        logWithRequestId(id, '[pkpSign] reqBody:', reqBody);

        return this.getPkpSignExecutionShares(url, reqBody, id);
      });

      const res = await this.handleNodePromises(
        nodePromises,
        id,
        this.connectedNodes.size // ECDSA requires responses from all nodes, but only shares from minNodeCount.
      );
      return res;
    };
    const res = await executeWithRetry<
      RejectedNodePromises | SuccessNodePromises<any>
    >(
      wrapper,
      (error: any, requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('[pkpSign] error occured, retrying operation');
        }
      },
      this.config.retryTolerance
    );
    const requestId = res.requestId;

    // -- case: promises rejected
    if (!res.success) {
      this._throwNodeError(res as RejectedNodePromises, requestId);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises<PKPSignShare>).values;
    logWithRequestId(
      requestId,
      '[pkpSign] responseData',
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

    const signatures = this.getSignatures(signedDataList, requestId);
    logWithRequestId(requestId, `[pkpSign] signature combination`, signatures);

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
      sessionKeyUri = LIT_URI.SESSION_KEY + sessionKey.publicKey;

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
      // resources: params.resources,
      nonce: this.latestBlockhash!,
      resources: params.resourceAbilityRequests,
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
          algo: AUTHSIG_ALGO.BLS,
          derivedVia: DERIVED_VIA.BLS,
          signedMessage,
          address: computeAddress('0x' + sessionSig.publicKey),
        },
        pkpPublicKey: sessionSig.publicKey,
      };
    }

    return {
      authSig: {
        sig: sessionSig.signature,
        derivedVia: DERIVED_VIA.LIT_ETH_PERSONAL_SIGN,
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
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.SIGN_SESSION_KEY,
    });

    log(`[getSignSessionKeyShares] from ${urlWithPath}`);
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
    log('[getSessionSigs] sessionKey:', sessionKey);
    const sessionKeyUri = this.getSessionKeyUri(sessionKey.publicKey);
    log('[getSessionSigs] sessionKeyUri:', sessionKeyUri);

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

    // -- try to get the wallet signature
    log('[getSessionSigs] Trying to get wallet signature for session key');
    let authSig = await this.getWalletSig({
      authNeededCallback: params.authNeededCallback,
      chain: params.chain || 'ethereum',
      sessionCapabilityObject,
      switchChain: params.switchChain,
      expiration: expiration,
      sessionKeyUri: sessionKeyUri,
      nonce,
      resourceAbilityRequests: params.resourceAbilityRequests,
    });

    const needToResignSessionKey = await this.checkNeedToResignSessionKey({
      authSig,
      sessionKeyUri,
      resourceAbilityRequests: params.resourceAbilityRequests,
    });
    log('[getSessionSigs] needToResignSessionKey:', needToResignSessionKey);

    // -- check if we need to resign the session key
    if (needToResignSessionKey) {
      log('[getSessionSigs] need to re-sign session key.  Signing...');
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
        message: '[getSessionSigs] No wallet signature found',
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
      ? [params.capacityDelegationAuthSig, authSig]
      : [authSig];
    // const capabilities = params.capacityDelegationAuthSig ? [authSig, params.capacityDelegationAuthSig] : [authSig];

    log('[getSessionSigs] capabilities:', capabilities);

    // console.log('capabilities:', capabilities);

    const signingTemplate = {
      sessionKey: sessionKey.publicKey,
      resourceAbilityRequests: params.resourceAbilityRequests,
      capabilities,
      issuedAt: new Date().toISOString(),
      expiration: sessionExpiration.toISOString(),
    };

    log('[getSessionSigs] signingTemplate:', signingTemplate);

    const signatures: SessionSigsMap = {};

    this.connectedNodes.forEach((nodeAddress: string) => {
      const toSign: SessionSigningTemplate = {
        ...signingTemplate,
        nodeAddress,
      };

      log(`[getSessionSigs] toSign:`, toSign);

      const signedMessage = JSON.stringify(toSign);
      log(`[getSessionSigs] signedMessage: ${signedMessage}`);

      const uint8arrayKey = uint8arrayFromString(
        sessionKey.secretKey,
        'base16'
      );

      const uint8arrayMessage = uint8arrayFromString(signedMessage, 'utf8');
      const signature = nacl.sign.detached(uint8arrayMessage, uint8arrayKey);
      log(`[getSessionSigs] signature:`, signature);

      const signatureObject = {
        sig: uint8arrayToString(signature, 'base16'),
        derivedVia: DERIVED_VIA.LIT_SESSION_SIGN,
        signedMessage: signedMessage,
        address: sessionKey.publicKey,
        algo: AUTHSIG_ALGO.ED25519,
      };

      signatures[nodeAddress] = signatureObject;

      log(
        `[getSessionSigs] signatureObject from ${nodeAddress}`,
        signatureObject
      );
    });

    log('[getSessionSigs] sessionSigs:', signatures);

    return signatures;
  };

  /**
   * Get PKP session sigs
   */
  getPkpSessionSigs = async (params: GetPkpSessionSigs) => {
    const chain = params?.chain || 'ethereum';

    const pkpSessionSigs = this.getSessionSigs({
      ...params,
      chain,
      pkpPublicKey: params.pkpPublicKey,
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
    return LIT_URI.SESSION_KEY + publicKey;
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
        `[claimKeyId] responseData: ${JSON.stringify(responseData, null, 2)}`
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
