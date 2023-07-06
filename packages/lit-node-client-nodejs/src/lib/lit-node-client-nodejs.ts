import {
  canonicalAccessControlConditionFormatter,
  canonicalResourceIdFormatter,
  hashResourceId,
} from '@lit-protocol/access-control-conditions';
import { wasmBlsSdkHelpers } from '@lit-protocol/bls-sdk';

import {
  LIT_ERROR,
  LOCAL_STORAGE_KEYS,
  SIGTYPE,
  LIT_SESSION_KEY_URI,
  AUTH_METHOD_TYPE_IDS,
  EITHER_TYPE,
} from '@lit-protocol/constants';

import {
  CustomNetwork,
  DecryptedData,
  ExecuteJsProps,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  GetSessionSigsProps,
  GetSignSessionKeySharesProp,
  AuthSig,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  JsonSigningStoreRequest,
  JsonStoreSigningRequest,
  LitNodeClientConfig,
  NodeCommandResponse,
  NodeLog,
  NodeResponse,
  NodeShare,
  RejectedNodePromises,
  SessionKeyPair,
  SessionSigningTemplate,
  SignedChainDataToken,
  SignedData,
  SignSessionKeyProp,
  SigShare,
  SignConditionECDSA,
  SuccessNodePromises,
  ValidateAndSignECDSA,
  AuthCallbackParams,
  WebAuthnAuthenticationVerificationParams,
  AuthMethod,
  SignSessionKeyResponse,
  GetWalletSigProps,
  SessionSigsMap,
  AuthCallback,
  JsonPkpSignRequest,
} from '@lit-protocol/types';
import {
  combineBlsDecryptionShares,
  combineBlsShares,
  combineEcdsaShares,
  generateSessionKeyPair,
} from '@lit-protocol/crypto';
import { safeParams } from '@lit-protocol/encryption';
import {
  convertLitActionsParams,
  log,
  mostCommonString,
  throwError,
} from '@lit-protocol/misc';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import { computeAddress } from '@ethersproject/transactions';
import { SiweMessage } from 'lit-siwe';
import { joinSignature, sha256 } from 'ethers/lib/utils';

import { IPFSBundledSDK } from '@lit-protocol/lit-third-party-libs';

import { nacl } from '@lit-protocol/nacl';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '@lit-protocol/misc-browser';
import { BigNumber } from 'ethers';
import {
  ILitResource,
  ISessionCapabilityObject,
  LitResourceAbilityRequest,
  decode,
  newSessionCapabilityObject,
} from '@lit-protocol/auth-helpers';
import { LitCore } from '@lit-protocol/core';

/** ---------- Main Export Class ---------- */

export class LitNodeClientNodeJs extends LitCore {
  defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;

  // ========== Constructor ==========
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    super(args);

    // -- initialize default auth callback
    this.defaultAuthCallback = args?.defaultAuthCallback;
  }

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

      // Generate new one
      const newSessionKey = generateSessionKeyPair();

      // (TRY) to set to local storage
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
      } catch (e) {
        console.warn(`Localstorage not available. Not a problem. Contiune...`);
      }

      return newSessionKey;
    } else {
      return JSON.parse(storedSessionKeyOrError.result);
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
   */
  generateSessionCapabilityObjectWithWildcards = (
    litResources: Array<ILitResource>
  ): ISessionCapabilityObject => {
    const sessionCapabilityObject = newSessionCapabilityObject();
    for (const litResource of litResources) {
      sessionCapabilityObject.addAllCapabilitiesForResource(litResource);
    }
    return sessionCapabilityObject;
  };

  /**
   *
   * Get expiration for session
   *
   */
  getExpiration = () => {
    return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
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
  }: GetWalletSigProps): Promise<AuthSig> => {
    let walletSig: AuthSig;

    const storageKey = LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;
    const storedWalletSigOrError = getStorageItem(storageKey);

    // -- (TRY) to get it in the local storage
    // -- IF NOT: Generates one
    if (
      storedWalletSigOrError.type === EITHER_TYPE.ERROR ||
      !storedWalletSigOrError.result ||
      storedWalletSigOrError.result == ''
    ) {
      console.warn(
        `Storage key "${storageKey}" is missing. Not a problem. Continue...`
      );
      if (authNeededCallback) {
        walletSig = await authNeededCallback({
          chain,
          statement: sessionCapabilityObject?.statement,
          resources: sessionCapabilityObject
            ? [sessionCapabilityObject.encodeAsSiweResource()]
            : undefined,
          switchChain,
          expiration,
          uri: sessionKeyUri,
        });
      } else {
        if (!this.defaultAuthCallback) {
          return throwError({
            message: 'No default auth callback provided',
            errorKind: LIT_ERROR.PARAMS_MISSING_ERROR.kind,
            errorCode: LIT_ERROR.PARAMS_MISSING_ERROR.name,
          });
        }
        walletSig = await this.defaultAuthCallback({
          chain,
          statement: sessionCapabilityObject.statement,
          resources: sessionCapabilityObject
            ? [sessionCapabilityObject.encodeAsSiweResource()]
            : undefined,
          switchChain,
          expiration,
          uri: sessionKeyUri,
        });
      }

      // (TRY) to set walletSig to local storage
      const storeNewWalletSigOrError = setStorageItem(
        storageKey,
        JSON.stringify(walletSig)
      );
      if (storeNewWalletSigOrError.type === 'ERROR') {
        console.warn(
          `Unable to store walletSig in local storage. Not a problem. Continue...`
        );
      }
    } else {
      try {
        walletSig = JSON.parse(storedWalletSigOrError.result);
      } catch (e) {
        console.warn('Error parsing walletSig', e);
      }
    }

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
    resourceAbilityRequests: Array<LitResourceAbilityRequest>;
  }): Promise<boolean> => {
    const authSigSiweMessage = new SiweMessage(authSig.signedMessage);

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
    const { code, ipfsId, authSig, jsParams, sessionSigs, authMethods } =
      params;

    log('getJsExecutionShares');

    // -- execute
    const urlWithPath = `${url}/web/execute`;

    if (!authSig) {
      throw new Error('authSig is required');
    }

    const data: JsonExecutionRequest = {
      code,
      ipfsId,
      authSig,
      jsParams,
      authMethods,
    };

    return await this.sendCommandToNode({ url: urlWithPath, data, requestId });
  };

  getPkpSignExecutionShares = async (
    url: string,
    params: any,
    requestId: string
  ) => {
    log('getPkpSigningShares');
    const urlWithPath = `${url}/web/pkp/sign`;
    if (!params.authSig) {
      throw new Error('authSig is required');
    }

    return await this.sendCommandToNode({
      url: urlWithPath,
      data: params,
      requestId,
    });
  };

  /**
   *
   * Get Chain Data Signing Shares
   *
   * @param { string } url
   * @param { JsonSignChainDataRequest } params
   *
   * @returns { Promise<any> }
   *
   */
  getChainDataSigningShare = async (
    url: string,
    params: JsonSignChainDataRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    const { callRequests, chain, iat, exp } = params;

    log('getChainDataSigningShare');

    const urlWithPath = `${url}/web/signing/sign_chain_data`;

    const data: JsonSignChainDataRequest = {
      callRequests,
      chain,
      iat,
      exp,
    };

    return await this.sendCommandToNode({ url: urlWithPath, data, requestId });
  };

  /**
   *
   * Get Signing Shares from Nodes
   *
   * @param { string } url
   * @param { JsonSigningRetrieveRequest } params
   *
   * @returns { Promise<any>}
   *
   */
  getSigningShare = async (
    url: string,
    params: JsonSigningRetrieveRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    log('getSigningShare');
    const urlWithPath = `${url}/web/signing/retrieve`;

    return await this.sendCommandToNode({
      url: urlWithPath,
      data: params,
      requestId,
    });
  };

  /**
   *
   * Store signing conditions to nodes
   *
   * @param { string } url
   * @param { JsonSigningStoreRequest } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  storeSigningConditionWithNode = async (
    url: string,
    params: JsonSigningStoreRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    log('storeSigningConditionWithNode');

    const urlWithPath = `${url}/web/signing/store`;

    return await this.sendCommandToNode({
      url: urlWithPath,
      data: {
        key: params.key,
        val: params.val,
        authSig: params.authSig,
        chain: params.chain,
        permanant: params.permanent,
      },
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
    log('signConditionEcdsa');
    const urlWithPath = `${url}/web/signing/signConditionEcdsa`;

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
      requestId,
    });
  };

  /**
   *
   * Combine Shares from network public key set and signature shares
   *
   * @param { string } networkPubKeySet
   * @param { any } signatureShares
   *
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT = (
    networkPubKeySet: string,
    signatureShares: Array<NodeShare>
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
      log(msg);
    }

    // ========== Sorting ==========
    // -- sort the sig shares by share index.  this is important when combining the shares.
    signatureShares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

    // ========== Combine Shares ==========
    const pkSetAsBytes: Uint8Array = uint8arrayFromString(
      networkPubKeySet,
      'base16'
    );
    log('pkSetAsBytes', pkSetAsBytes);

    const sigShares = signatureShares.map((s: any) => ({
      shareHex: s.signatureShare,
      shareIndex: s.shareIndex,
    }));

    const signature = wasmBlsSdkHelpers.combine_signatures(
      pkSetAsBytes,
      sigShares
    );

    log('raw sig', signature);
    log('signature is ', uint8arrayToString(signature, 'base16'));

    const unsignedJwt = mostCommonString(
      signatureShares.map((s: any) => s.unsignedJwt)
    );

    // ========== Result ==========
    // convert the sig to base64 and append to the jwt
    const finalJwt: string = `${unsignedJwt}.${uint8arrayToString(
      signature,
      'base64url'
    )}`;

    return finalJwt;
  };

  // ========== Promise Handlers ==========

  /**
   * Run lit action on a single deterministicly selected node. It's important that the nodes use the same deterministic selection algorithm.
   *
   * @param { ExecuteJsProps } params
   *
   * @returns { Promise<SuccessNodePromises | RejectedNodePromises> }
   *
   */
  runOnTargetedNodes = async (
    params: ExecuteJsProps
  ): Promise<SuccessNodePromises | RejectedNodePromises> => {
    const { code, authSig, jsParams, debug, sessionSigs, targetNodeRange } =
      params;

    log('running runOnTargetedNodes:', targetNodeRange);

    if (!targetNodeRange) {
      return throwError({
        message: 'targetNodeRange is required',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
      });
    }

    // determine which node to run on
    let ipfsId;

    if (params.code) {
      // hash the code to get IPFS id
      const blockstore = new IPFSBundledSDK.MemoryBlockstore();

      let content: string | Uint8Array = params.code;

      if (typeof content === 'string') {
        content = new TextEncoder().encode(content);
      } else {
        throwError({
          message:
            'Invalid code content type for single node execution.  Your code param must be a string',
          errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
          errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
        });
      }

      let lastCid;
      for await (const { cid } of IPFSBundledSDK.importer(
        [{ content }],
        blockstore,
        {
          onlyHash: true,
        }
      )) {
        lastCid = cid;
      }

      ipfsId = lastCid;
    } else {
      ipfsId = params.ipfsId;
    }

    if (!ipfsId) {
      return throwError({
        message: 'ipfsId is required',
        error: LIT_ERROR.INVALID_PARAM_TYPE,
      });
    }

    // select targetNodeRange number of random index of the bootstrapUrls.length
    const randomSelectedNodeIndexes: Array<number> = [];

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

    const requestId = this.getRequestId();
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
      let sigToPassToNode = this.getAuthSigOrSessionAuthSig({
        authSig,
        sessionSigs,
        url,
      });

      reqBody.authSig = sigToPassToNode;

      // this return { url: string, data: JsonRequest }
      let singleNodePromise = this.getJsExecutionShares(
        url,
        reqBody,
        requestId
      );

      nodePromises.push(singleNodePromise);
    }

    const handledPromise = await this.handleNodePromises(
      nodePromises,
      targetNodeRange
    );

    // -- handle response
    return handledPromise;
  };

  // ========== Shares Resolvers ==========

  /**
   *
   * Get signatures from signed data
   *
   * @param { Array<any> } signedData
   *
   * @returns { any }
   *
   */
  getSessionSignatures = (signedData: Array<any>): any => {
    // -- prepare
    let signatures: any = {};

    // TOOD: get keys of signedData
    const keys = Object.keys(signedData[0]);

    // -- execute
    keys.forEach((key: any) => {
      const shares = signedData.map((r: any) => r[key]);

      shares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

      const sigShares: Array<SigShare> = shares.map((s: any) => ({
        sigType: s.sigType,
        shareHex: s.signatureShare,
        shareIndex: s.shareIndex,
        localX: s.localX,
        localY: s.localY,
        publicKey: s.publicKey,
        dataSigned: s.dataSigned,
        siweMessage: s.siweMessage,
      }));

      log('sigShares', sigShares);

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

      // -- validate if signature type is BLS or ECDSA
      if (sigType !== 'BLS' && sigType !== 'ECDSA') {
        throwError({
          message: 'signature type is not BLS or ECDSA',
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
        });
        return;
      }

      let signature: any;

      if (sigType === SIGTYPE.BLS) {
        signature = combineBlsShares(sigShares, this.networkPubKeySet);
      } else if (sigType === SIGTYPE.ECDSA) {
        signature = combineEcdsaShares(sigShares);
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
   * Get signatures from signed data
   *
   * @param { Array<any> } signedData
   *
   * @returns { any }
   *
   */
  getSignatures = (signedData: Array<any>): any => {
    // -- prepare
    let signatures: any = {};

    // TOOD: get keys of signedData
    const keys = Object.keys(signedData[0]);

    // -- execute
    keys.forEach((key: any) => {
      const shares = signedData.map((r: any) => r[key]);

      shares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

      const sigShares: Array<SigShare> = shares.map((s: any) => ({
        sigType: s.sigType,
        shareHex: s.signatureShare,
        shareIndex: s.shareIndex,
        localX: s.localX,
        localY: s.localY,
        publicKey: s.publicKey,
        dataSigned: s.dataSigned,
      }));

      log('sigShares', sigShares);

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

      // -- validate if signature type is BLS or ECDSA
      if (sigType !== 'BLS' && sigType !== 'ECDSA') {
        throwError({
          message: 'signature type is not BLS or ECDSA',
          errorKind: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
          errorCode: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
        });
        return;
      }

      let signature: any;

      if (sigType === SIGTYPE.BLS) {
        signature = combineBlsShares(sigShares, this.networkPubKeySet);
      } else if (sigType === SIGTYPE.ECDSA) {
        signature = combineEcdsaShares(sigShares);
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
      };
    });

    return signatures;
  };

  /**
   *
   * Get the decryptions from the decrypted data list
   *
   * @param { Array<any> } decryptedData
   *
   * @returns { Promise<Array<any>> }
   *
   */
  getDecryptions = async (decryptedData: Array<any>): Promise<Array<any>> => {
    // -- prepare params
    let decryptions: any;

    Object.keys(decryptedData[0]).forEach(async (key: any) => {
      // -- prepare
      const shares = decryptedData.map((r: any) => r[key]);

      const decShares = shares.map((s: any) => ({
        algorithmType: s.algorithmType,
        decryptionShare: s.decryptionShare,
        shareIndex: s.shareIndex,
        publicKey: s.publicKey,
        ciphertext: s.ciphertext,
      }));

      const algorithmType = mostCommonString(
        decShares.map((s: any) => s.algorithmType)
      );
      const ciphertext = mostCommonString(
        decShares.map((s: any) => s.ciphertext)
      );

      // -- validate if this.networkPubKeySet is null
      if (this.networkPubKeySet === null) {
        throwError({
          message: 'networkPubKeySet cannot be null',
          errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
          errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
        });
        return;
      }

      let decrypted;
      if (algorithmType === 'BLS') {
        decrypted = await combineBlsDecryptionShares(
          decShares,
          this.networkPubKeySet,
          ciphertext
        );
      } else {
        throwError({
          message: 'Unknown decryption algorithm type',
          errorKind: LIT_ERROR.UNKNOWN_DECRYPTION_ALGORITHM_TYPE_ERROR.kind,
          errorCode: LIT_ERROR.UNKNOWN_DECRYPTION_ALGORITHM_TYPE_ERROR.name,
        });
      }

      decryptions[key] = {
        decrypted: uint8arrayToString(decrypted, 'base16'),
        publicKey: mostCommonString(decShares.map((s: any) => s.publicKey)),
        ciphertext: mostCommonString(decShares.map((s: any) => s.ciphertext)),
      };
    });

    return decryptions;
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
  getSignature = async (shareData: Array<any>): Promise<any> => {
    // R_x & R_y values can come from any node (they will be different per node), and will generate a valid signature
    const R_x = shareData[0].local_x;
    const R_y = shareData[0].local_y;

    // the public key can come from any node - it obviously will be identical from each node
    const public_key = shareData[0].public_key;
    const valid_shares = shareData.map((s: any) => s.signature_share);
    const shares = JSON.stringify(valid_shares);

    await wasmECDSA.initWasmEcdsaSdk(); // init WASM
    const signature = wasmECDSA.combine_signature(R_x, R_y, shares);
    log('raw ecdsa sig', signature);

    return signature;
  };

  // ========== Scoped Business Logics ==========

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

    let res;

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
      const requestId = this.getRequestId();
      const nodePromises = this.getNodePromises((url: string) => {
        // -- choose the right signature
        let sigToPassToNode = this.getAuthSigOrSessionAuthSig({
          authSig,
          sessionSigs,
          url,
        });
        reqBody.authSig = sigToPassToNode;

        return this.getJsExecutionShares(url, reqBody, requestId);
      });
      // -- resolve promises
      res = await this.handleNodePromises(nodePromises);
    }

    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises).values;
    log('responseData', JSON.stringify(responseData, null, 2));

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = responseData.map(
      (r: any) => (r as SignedData).signedData
    );
    const signatures = this.getSignatures(signedDataList);

    // -- 2. combine decrypted data a list, and get the decryptions from it
    const decryptedDataList: any[] = responseData.map(
      (r: DecryptedData) => r.decryptedData
    );
    const decryptions = await this.getDecryptions(decryptedDataList);

    // -- 3. combine responses as a string, and get parse it as JSON
    let response: string = mostCommonString(
      responseData.map((r: NodeResponse) => r.response)
    );

    response = this.parseResponses(response);

    // -- 4. combine logs
    const mostCommonLogs: string = mostCommonString(
      responseData.map((r: NodeLog) => r.logs)
    );

    // ========== Result ==========
    let returnVal: ExecuteJsResponse = {
      signatures,
      decryptions,
      response,
      logs: mostCommonLogs,
    };

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

    // the nodes will only accept a normal array type as a paramater due to serizalization issues with Uint8Array type.
    // this loop below is to normalize the message to a basic array.
    let arr = [];
    for (let i = 0; i < toSign.length; i++) {
      arr.push((toSign as Buffer)[i]);
    }
    toSign = arr;

    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- choose the right signature
      let sigToPassToNode = this.getAuthSigOrSessionAuthSig({
        authSig,
        sessionSigs,
        url,
      });

      let reqBody = {
        toSign,
        pubkey: pubKey,
        authSig: sigToPassToNode,
        authMethods,
      };

      return this.getPkpSignExecutionShares(url, reqBody, requestId);
    });

    const res = await this.handleNodePromises(nodePromises);

    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises);
    }

    // -- case: promises success (TODO: check the keys of "values")
    const responseData = (res as SuccessNodePromises).values;
    log('responseData', JSON.stringify(responseData, null, 2));

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = responseData.map((r: any) => {
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

      convertedShare.dataSigned = Buffer.from(r.signedData).toString('hex');
      return {
        signature: convertedShare,
      };
    });

    const signatures = this.getSignatures(signedDataList);
    log(`signature combination`, signatures);

    return signatures.signature; // only a single signature is ever present, so we just return it.
  };

  /**
   *
   * Request a signed JWT of any solidity function call from the LIT network.  There are no prerequisites for this function.  You should use this function if you need to transmit information across chains, or from a blockchain to a centralized DB or server.  The signature of the returned JWT verifies that the response is genuine.
   *
   * @param { SignedChainDataToken } params
   *
   * @returns { Promise<string>}
   */
  getSignedChainDataToken = async (
    params: SignedChainDataToken
  ): Promise<string> => {
    // ========== Prepare Params ==========
    const { callRequests, chain } = params;

    // ========== Pre-Validations ==========
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        '2 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      return throwError({
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

    // ========== Prepare ==========
    // we need to send jwt params iat (issued at) and exp (expiration)
    // because the nodes may have different wall clock times
    // the nodes will verify that these params are withing a grace period
    const { iat, exp } = this.getJWTParams();

    // ========== Get Node Promises ==========
    // -- fetch shares from nodes
    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      return this.getChainDataSigningShare(
        url,
        {
          callRequests,
          chain,
          iat,
          exp,
        },
        requestId
      );
    });

    // -- resolve promises
    const signatureShares = await Promise.all(nodePromises);
    log('signatureShares', signatureShares);

    // -- total of good shares
    const goodShares = signatureShares.filter(
      (d: any) => d.signatureShare !== ''
    );

    // ========== Shares Validations ==========
    // -- validate if we have enough good shares
    if (goodShares.length < this.config.minNodeCount) {
      log(
        `majority of shares are bad. goodShares is ${JSON.stringify(
          goodShares
        )}`
      );

      if (this.config.alertWhenUnauthorized) {
        alert(
          'You are not authorized to receive a signature to grant access to this content'
        );
      }

      throwError({
        message: `You are not authorized to recieve a signature on this item`,
        errorKind: LIT_ERROR.UNAUTHROZIED_EXCEPTION.kind,
        errorCode: LIT_ERROR.UNAUTHROZIED_EXCEPTION.name,
      });
    }

    // ========== Result ==========
    const finalJwt: string = this.combineSharesAndGetJWT(
      this.networkPubKeySet,
      signatureShares
    );

    return finalJwt;
  };

  /**
   *
   * Request a signed JWT from the LIT network. Before calling this function, you must either create or know of a resource id and access control conditions for the item you wish to gain authorization for. You can create an access control condition using the saveSigningCondition function.
   *
   * @param { JsonSigningRetrieveRequest } params
   *
   * @returns { Promise<string> } final JWT
   *
   */
  getSignedToken = async (
    params: JsonSigningRetrieveRequest
  ): Promise<string> => {
    // ========== Prepare Params ==========
    const {
      // accessControlConditions,
      // evmContractConditions,
      // solRpcConditions,
      // unifiedAccessControlConditions,
      chain,
      authSig,
      resourceId,
      sessionSigs,
    } = params;

    // ========== Pre-Validations ==========
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

    if (!resourceId) {
      return throwError({
        message: `You must provide a resourceId`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    const formattedResourceId = canonicalResourceIdFormatter(resourceId);

    // ========== Get Node Promises ==========
    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- if session key is available, use it
      let authSigToSend = sessionSigs ? sessionSigs[url] : authSig;

      return this.getSigningShare(
        url,
        {
          accessControlConditions: formattedAccessControlConditions,
          evmContractConditions: formattedEVMContractConditions,
          solRpcConditions: formattedSolRpcConditions,
          unifiedAccessControlConditions:
            formattedUnifiedAccessControlConditions,
          chain,
          authSig: authSigToSend,
          resourceId: formattedResourceId,
          iat,
          exp,
        },
        requestId
      );
    });

    // -- resolve promises
    const res = await this.handleNodePromises(nodePromises);

    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises);
    }

    const signatureShares: Array<NodeShare> = (res as SuccessNodePromises)
      .values;

    log('signatureShares', signatureShares);

    // ========== Result ==========
    const finalJwt: string = this.combineSharesAndGetJWT(
      this.networkPubKeySet,
      signatureShares
    );

    return finalJwt;
  };

  /**
   *
   * Associated access control conditions with a resource on the web.  After calling this function, users may use the getSignedToken function to request a signed JWT from the LIT network.  This JWT proves that the user meets the access control conditions, and is authorized to access the resource you specified in the resourceId parameter of the saveSigningCondition function.
   *
   * @param { JsonStoreSigningRequest } params
   *
   * @returns { Promise<boolean> }
   *
   */
  saveSigningCondition = async (
    params: JsonStoreSigningRequest
  ): Promise<boolean> => {
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        '4 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // this is to fix my spelling mistake that we must now maintain forever lol
    if (typeof params.permanant !== 'undefined') {
      params.permanent = params.permanant;
    }

    // ========== Prepare Params ==========
    const {
      // accessControlConditions,
      // evmContractConditions,
      // solRpcConditions,
      // unifiedAccessControlConditions,
      chain,
      authSig,
      resourceId,
      // permanant,
      permanent,
      sessionSigs,
    } = params;

    // ----- validate params -----
    // validate if resourceId is null
    if (!resourceId) {
      return throwError({
        message: 'resourceId cannot be null',
        errorKind: LIT_ERROR.PARAM_NULL_ERROR.kind,
        errorCode: LIT_ERROR.PARAM_NULL_ERROR.name,
      });
    }

    // ========== Hashing Resource ID & Conditions ==========
    // hash the resource id
    const hashOfResourceId = await hashResourceId(resourceId);

    const hashOfResourceIdStr = uint8arrayToString(
      new Uint8Array(hashOfResourceId),
      'base16'
    );

    let hashOfConditions: ArrayBuffer | undefined =
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

    // ========== Get Node Promises ==========
    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- if session key is available, use it
      let authSigToSend = sessionSigs ? sessionSigs[url] : authSig;

      return this.storeSigningConditionWithNode(
        url,
        {
          key: hashOfResourceIdStr,
          val: hashOfConditionsStr,
          authSig: authSigToSend,
          chain,
          permanent: permanent ? 1 : 0,
        },
        requestId
      );
    });

    // -- resolve promises
    const res = await this.handleNodePromises(nodePromises);

    // -- case: promises rejected
    if (res.success === false) {
      this._throwNodeError(res as RejectedNodePromises);
    }

    return true;
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
    const requestId = this.getRequestId();
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
        requestId
      );
    });

    // ----- Resolve Promises -----
    try {
      const shareData = await Promise.all(nodePromises);

      if (shareData[0].result == 'failure') return 'Condition Failed';

      const signature = this.getSignature(shareData);

      return signature;
    } catch (e) {
      log('Error - signed_ecdsa_messages - ', e);
      const signed_ecdsa_message = nodePromises[0];
      return signed_ecdsa_message;
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
    // ========== Validate Params ==========
    // -- validate: If it's NOT ready
    if (!this.ready) {
      const message =
        '8 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

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

    // Try to get it from local storage, if not generates one~
    let sessionKey = params.sessionKey ?? this.getSessionKey();
    let sessionKeyUri = LIT_SESSION_KEY_URI + sessionKey.publicKey;

    // Compute the address from the public key if it's provided. Otherwise, the node will compute it.
    const pkpEthAddress = (function () {
      if (params.pkpPublicKey) return computeAddress(params.pkpPublicKey);

      // This will be populated by the node, using dummy value for now.
      return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    })();

    let siwe_statement = 'Lit Protocol PKP session signature';
    if (!!params.statement) {
      siwe_statement += ' ' + params.statement;
    }

    let siweMessage: SiweMessage = new SiweMessage({
      domain: params?.domain || globalThis.location?.host || 'litprotocol.com',
      address: pkpEthAddress,
      statement: siwe_statement,
      uri: sessionKeyUri,
      version: '1',
      chainId: params.chainId ?? 1,
      expirationTime: _expiration,
      resources: params.resources,
    });

    let siweMessageStr: string = siweMessage.prepareMessage();

    // ========== Get Node Promises ==========
    // -- fetch shares from nodes
    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      return this.getSignSessionKeyShares(
        url,
        {
          body: {
            sessionKey: sessionKeyUri,
            authMethods: params.authMethods,
            pkpPublicKey: params.pkpPublicKey,
            authSig: params.authSig,
            siweMessage: siweMessageStr,
          },
        },
        requestId
      );
    });

    // -- resolve promises
    const res = await this.handleNodePromises(nodePromises);

    // -- case: promises rejected
    if (!this.#isSuccessNodePromises(res)) {
      this._throwNodeError(res);
      return {} as SignSessionKeyResponse;
    }

    const responseData = res.values;
    log('responseData', JSON.stringify(responseData, null, 2));

    // ========== Extract shares from response data ==========
    // -- 1. combine signed data as a list, and get the signatures from it
    const signedDataList = responseData.map(
      (r: any) => (r as SignedData).signedData
    );

    const signatures = this.getSessionSignatures(signedDataList);

    const { sessionSig } = signatures;

    return {
      authSig: {
        sig: sessionSig.signature,
        derivedVia: 'web3.eth.personal.sign via Lit PKP',
        signedMessage: sessionSig.siweMessage,
        address: computeAddress('0x' + sessionSig.publicKey),
      },
      pkpPublicKey: sessionSig.publicKey,
    };
  };

  #isSuccessNodePromises = (res: any): res is SuccessNodePromises => {
    return res.success === true;
  };

  getSignSessionKeyShares = async (
    url: string,
    params: GetSignSessionKeySharesProp,
    requestId: string
  ) => {
    log('getSignSessionKeyShares');
    const urlWithPath = `${url}/web/sign_session_key`;
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
    let sessionKey = params.sessionKey ?? this.getSessionKey();

    let sessionKeyUri = this.getSessionKeyUri(sessionKey.publicKey);

    // First get or generate the session capability object for the specified resources.
    const sessionCapabilityObject = params.sessionCapabilityObject
      ? params.sessionCapabilityObject
      : this.generateSessionCapabilityObjectWithWildcards(
          params.resourceAbilityRequests.map((r) => r.resource)
        );
    let expiration = params.expiration || this.getExpiration();

    // -- (TRY) to get the wallet signature
    let authSig = await this.getWalletSig({
      authNeededCallback: params.authNeededCallback,
      chain: params.chain,
      sessionCapabilityObject,
      switchChain: params.switchChain,
      expiration: expiration,
      sessionKeyUri: sessionKeyUri,
    });

    let needToResignSessionKey = await this.checkNeedToResignSessionKey({
      authSig,
      sessionKeyUri,
      resourceAbilityRequests: params.resourceAbilityRequests,
    });

    // -- (CHECK) if we need to resign the session key
    if (needToResignSessionKey) {
      log('need to re-sign session key.  Signing...');
      authSig = await this.#authCallbackAndUpdateStorageItem({
        authCallback: params.authNeededCallback,
        authCallbackParams: {
          chain: params.chain,
          statement: sessionCapabilityObject.statement,
          resources: [sessionCapabilityObject.encodeAsSiweResource()],
          switchChain: params.switchChain,
          expiration,
          uri: sessionKeyUri,
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
    let sessionExpiration = new Date(Date.now() + 1000 * 60 * 5);

    const signingTemplate = {
      sessionKey: sessionKey.publicKey,
      resourceAbilityRequests: params.resourceAbilityRequests,
      capabilities: [authSig],
      issuedAt: new Date().toISOString(),
      expiration: sessionExpiration.toISOString(),
    };

    const signatures: SessionSigsMap = {};

    this.connectedNodes.forEach((nodeAddress: string) => {
      const toSign: SessionSigningTemplate = {
        ...signingTemplate,
        nodeAddress,
      };

      let signedMessage = JSON.stringify(toSign);

      const uint8arrayKey = uint8arrayFromString(
        sessionKey.secretKey,
        'base16'
      );

      const uint8arrayMessage = uint8arrayFromString(signedMessage, 'utf8');
      let signature = nacl.sign.detached(uint8arrayMessage, uint8arrayKey);
      // log("signature", signature);
      signatures[nodeAddress] = {
        sig: uint8arrayToString(signature, 'base16'),
        derivedVia: 'litSessionSignViaNacl',
        signedMessage,
        address: sessionKey.publicKey,
        algo: 'ed25519',
      };
    });

    log('signatures:', signatures);

    return signatures;
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
}
