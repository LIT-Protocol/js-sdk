import {
  canonicalAccessControlConditionFormatter,
  canonicalEVMContractConditionFormatter,
  canonicalResourceIdFormatter,
  canonicalSolRpcConditionFormatter,
  canonicalUnifiedAccessControlConditionFormatter,
  hashAccessControlConditions,
  hashEVMContractConditions,
  hashResourceId,
  hashSolRpcConditions,
  hashUnifiedAccessControlConditions,
} from '@lit-protocol/access-control-conditions';
import { wasmBlsSdkHelpers } from '@lit-protocol/bls-sdk';

import {
  defaultLitnodeClientConfig,
  LIT_ERROR,
  LIT_NETWORKS,
  LOCAL_STORAGE_KEYS,
  SIGTYPE,
  version,
  LIT_SESSION_KEY_URI,
  AUTH_METHOD_TYPE_IDS,
  LIT_ERROR_CODE,
  LitErrorKind,
} from '@lit-protocol/constants';

import {
  CustomNetwork,
  DecryptedData,
  ExecuteJsProps,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  GetSessionSigsProps,
  GetSignSessionKeySharesProp,
  HandshakeWithSgx,
  JsonAuthSig,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonHandshakeResponse,
  JsonSaveEncryptionKeyRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  JsonSigningStoreRequest,
  JsonStoreSigningRequest,
  KV,
  LitNodeClientConfig,
  NodeCommandResponse,
  NodeCommandServerKeysResponse,
  NodeLog,
  NodePromiseResponse,
  NodeResponse,
  NodeShare,
  RejectedNodePromises,
  SendNodeCommand,
  SessionKeyPair,
  SessionSigningTemplate,
  SignedChainDataToken,
  SignedData,
  SignSessionKeyProp,
  SigShare,
  SignConditionECDSA,
  SuccessNodePromises,
  SupportedJsonRequests,
  ValidateAndSignECDSA,
  CheckAndSignAuthParams,
  WebAuthnAuthenticationVerificationParams,
  AuthMethod,
  SignSessionKeyResponse,
  NodeClientErrorV0,
  NodeClientErrorV1,
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
  isBrowser,
  isNodeErrorV1,
  log,
  mostCommonString,
  throwError,
  throwGenericError,
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
import { getStorageItem } from '@lit-protocol/misc-browser';
import { BigNumber } from 'ethers';
// import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';

/** ---------- Main Export Class ---------- */

export class LitNodeClientNodeJs {
  config: LitNodeClientConfig;
  connectedNodes: SetConstructor | Set<any> | any;
  serverKeys: KV | any;
  ready: boolean;
  subnetPubKey: string | null;
  networkPubKey: string | null;
  networkPubKeySet: string | null;
  defaultAuthCallback?: (
    authSigParams: CheckAndSignAuthParams
  ) => Promise<JsonAuthSig>;

  // ========== Constructor ==========
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    let customConfig = args;

    // -- initialize default config
    this.config = defaultLitnodeClientConfig;

    // -- initialize default auth callback
    this.defaultAuthCallback = args?.defaultAuthCallback;

    // -- if config params are specified, replace it
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
      // this.config = override(this.config, customConfig);
    }

    // -- init default properties
    this.connectedNodes = new Set();
    this.serverKeys = {};
    this.ready = false;
    this.subnetPubKey = null;
    this.networkPubKey = null;
    this.networkPubKeySet = null;

    // -- set bootstrapUrls to match the network litNetwork unless it's set to custom
    this.setCustomBootstrapUrls();

    // -- set global variables
    globalThis.litConfig = this.config;
  }

  // ========== Scoped Class Helpers ==========

  /**
   *
   * Set bootstrapUrls to match the network litNetwork unless it's set to custom
   *
   * @returns { void }
   *
   */
  setCustomBootstrapUrls = (): void => {
    // -- validate
    if (this.config.litNetwork === 'custom') return;

    // -- execute
    const hasNetwork: boolean = this.config.litNetwork in LIT_NETWORKS;

    if (!hasNetwork) {
      // network not found, report error
      throwError({
        message:
          'the litNetwork specified in the LitNodeClient config not found in LIT_NETWORKS',
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_BAD_CONFIG_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_BAD_CONFIG_ERROR.name,
      });
      return;
    }

    this.config.bootstrapUrls = LIT_NETWORKS[this.config.litNetwork];
  };

  /**
   *
   * Get either auth sig or session auth sig
   *
   */
  getAuthSigOrSessionAuthSig = ({
    authSig,
    sessionSigs,
    url,
  }: {
    authSig: JsonAuthSig | any;
    sessionSigs: any;
    url: string;
  }) => {
    // -- if there's session
    let sigToPassToNode = authSig;

    if (sessionSigs) {
      sigToPassToNode = sessionSigs[url];

      if (!sigToPassToNode) {
        throwError({
          message: `You passed sessionSigs but we could not find session sig for node ${url}`,
          errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
          errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
        });
      }
    }
    return sigToPassToNode;
  };

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
      authSig: params.authSig,
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
   *
   * Try to get the session key in the local storage,
   * if not, generates one.
   * @param { string } supposedSessionKey
   * @return { }
   */
  getSessionKey = (supposedSessionKey?: string): SessionKeyPair => {
    let sessionKey: any = supposedSessionKey ?? '';

    const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY;
    const storedSessionKeyOrError = getStorageItem(storageKey);

    if (sessionKey === '') {
      // check if we already have a session key + signature for this chain
      // let storedSessionKey;
      let storedSessionKey: any;

      // -- (TRY) to get it in the local storage
      if (storedSessionKeyOrError.type === 'ERROR') {
        console.warn(
          `Storage key "${storageKey}" is missing. Not a problem. Contiune...`
        );
      } else {
        storedSessionKey = storedSessionKeyOrError.result;
      }

      // -- IF NOT: Generates one
      if (!storedSessionKey || storedSessionKey == '') {
        sessionKey = generateSessionKeyPair();

        // (TRY) to set to local storage
        try {
          localStorage.setItem(storageKey, JSON.stringify(sessionKey));
        } catch (e) {
          console.warn(
            `Localstorage not available. Not a problem. Contiune...`
          );
        }
      } else {
        log('storedSessionKeyOrError');
        sessionKey = JSON.parse(storedSessionKeyOrError.result);
      }
    }

    return sessionKey as SessionKeyPair;
  };

  /**
   *
   * Get session capabilities from user, it not, generates one
   * @param { Array<any> } capabilities
   * @param { Array<any> } resources
   * @return { Array<any> }
   */
  getSessionCapabilities = (
    capabilities: Array<any>,
    resources: Array<any>
  ): Array<any> => {
    if (!capabilities || capabilities.length == 0) {
      capabilities = resources.map((resource: any) => {
        const { protocol, resourceId } = this.parseResource({ resource });

        return `${protocol}Capability://*`;
      });
    }

    return capabilities;
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
    capabilities,
    switchChain,
    expiration,
    sessionKeyUri,
  }: {
    authNeededCallback: any;
    chain: string;
    capabilities: Array<any>;
    switchChain: boolean;
    expiration: string;
    sessionKeyUri: string;
  }): Promise<JsonAuthSig> => {
    let walletSig;

    const storageKey = LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;
    const storedWalletSigOrError = getStorageItem(storageKey);

    // -- (TRY) to get it in the local storage
    if (storedWalletSigOrError.type === 'ERROR') {
      console.warn(
        `Storage key "${storageKey}" is missing. Not a problem. Contiune...`
      );
    } else {
      walletSig = storedWalletSigOrError.result;
    }

    // -- IF NOT: Generates one
    if (!storedWalletSigOrError.result || storedWalletSigOrError.result == '') {
      if (authNeededCallback) {
        walletSig = await authNeededCallback({
          chain,
          resources: capabilities,
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
          resources: capabilities,
          switchChain,
          expiration,
          uri: sessionKeyUri,
        });
      }
    } else {
      try {
        walletSig = JSON.parse(storedWalletSigOrError.result);
      } catch (e) {
        console.warn('Error parsing walletSig', e);
      }
    }

    return walletSig;
  };

  /**
   *
   * Check if a session key needs to be resigned
   *
   */
  checkNeedToResignSessionKey = async ({
    siweMessage,
    walletSignature,
    sessionKeyUri,
    resources,
    sessionCapabilities,
  }: {
    siweMessage: SiweMessage;
    walletSignature: any;
    sessionKeyUri: any;
    resources: any;
    sessionCapabilities: Array<any>;
  }): Promise<boolean> => {
    let needToResign = false;

    try {
      // @ts-ignore
      await siweMessage.verify({ signature: walletSignature });
    } catch (e) {
      needToResign = true;
    }

    // make sure the sig is for the correct session key
    if (siweMessage.uri !== sessionKeyUri) {
      needToResign = true;
    }

    // make sure the sig has the session capabilities required to fulfill the resources requested
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      const { protocol, resourceId } = this.parseResource({ resource });

      // check if we have blanket permissions or if we authed the specific resource for the protocol
      const permissionsFound = sessionCapabilities.some((capability: any) => {
        const capabilityParts = this.parseResource({ resource: capability });
        return (
          capabilityParts.protocol === protocol &&
          (capabilityParts.resourceId === '*' ||
            capabilityParts.resourceId === resourceId)
        );
      });
      if (!permissionsFound) {
        needToResign = true;
      }
    }

    return needToResign;
  };

  /**
   *
   * Get a random request ID
   *   *
   * @returns { string }
   *
   */
  getRequestId() {
    return Math.random().toString(16).slice(2);
  }

  // ==================== SENDING COMMAND ====================
  /**
   *
   * Send a command to nodes
   *
   * @param { SendNodeCommand }
   *
   * @returns { Promise<any> }
   *
   */
  sendCommandToNode = async ({
    url,
    data,
    requestId,
  }: SendNodeCommand): Promise<any> => {
    log(`sendCommandToNode with url ${url} and data`, data);

    const req: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lit-SDK-Version': version,
        'X-Lit-SDK-Type': 'Typescript',
        'X-Request-Id': 'lit_' + requestId,
      },
      body: JSON.stringify(data),
    };

    return fetch(url, req)
      .then(async (response) => {
        const isJson = response.headers
          .get('content-type')
          ?.includes('application/json');

        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          // get error message from body or default to response status
          const error = data || response.status;
          return Promise.reject(error);
        }

        return data;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
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
    const { code, ipfsId, authSig, jsParams, sessionSigs } = params;

    log('getJsExecutionShares');

    // -- execute
    const urlWithPath = `${url}/web/execute`;

    const data: JsonExecutionRequest = {
      code,
      ipfsId,
      authSig,
      jsParams,
    };

    return await this.sendCommandToNode({ url: urlWithPath, data, requestId });
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
   * Ger Decryption Shares from Nodes
   *
   * @param { string } url
   * @param { JsonEncryptionRetrieveRequest } params
   *
   * @returns { Promise<any> }
   *
   */
  getDecryptionShare = async (
    url: string,
    params: JsonEncryptionRetrieveRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    log('getDecryptionShare');
    const urlWithPath = `${url}/web/encryption/retrieve`;

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
   * Store encryption conditions to nodes
   *
   * @param { string } urk
   * @param { JsonEncryptionStoreRequest } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  storeEncryptionConditionWithNode = async (
    url: string,
    params: JsonSigningStoreRequest,
    requestId: string
  ): Promise<NodeCommandResponse> => {
    log('storeEncryptionConditionWithNode');
    const urlWithPath = `${url}/web/encryption/store`;
    const data = {
      key: params.key,
      val: params.val,
      authSig: params.authSig,
      chain: params.chain,
      permanant: params.permanent,
    };

    return await this.sendCommandToNode({ url: urlWithPath, data, requestId });
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
   * Handshake with SGX
   *
   * @param { HandshakeWithSgx } params
   *
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  handshakeWithSgx = async (
    params: HandshakeWithSgx,
    requestId: string
  ): Promise<NodeCommandServerKeysResponse> => {
    // -- get properties from params
    const { url } = params;

    // -- create url with path
    const urlWithPath = `${url}/web/handshake`;

    log(`handshakeWithSgx ${urlWithPath}`);

    const data = {
      clientPublicKey: 'test',
    };

    return this.sendCommandToNode({
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

  /**
   *
   * Get different formats of access control conditions, eg. evm, sol, unified etc.
   *
   * @param { SupportedJsonRequests } params
   *
   * @returns { FormattedMultipleAccs }
   *
   */
  getFormattedAccessControlConditions = (
    params: SupportedJsonRequests
  ): FormattedMultipleAccs => {
    // -- prepare params
    const {
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
    } = params;

    // -- execute
    let formattedAccessControlConditions;
    let formattedEVMContractConditions;
    let formattedSolRpcConditions;
    let formattedUnifiedAccessControlConditions;
    let error = false;

    if (accessControlConditions) {
      formattedAccessControlConditions = accessControlConditions.map((c: any) =>
        canonicalAccessControlConditionFormatter(c)
      );
      log(
        'formattedAccessControlConditions',
        JSON.stringify(formattedAccessControlConditions)
      );
    } else if (evmContractConditions) {
      formattedEVMContractConditions = evmContractConditions.map((c: any) =>
        canonicalEVMContractConditionFormatter(c)
      );
      log(
        'formattedEVMContractConditions',
        JSON.stringify(formattedEVMContractConditions)
      );
    } else if (solRpcConditions) {
      formattedSolRpcConditions = solRpcConditions.map((c: any) =>
        canonicalSolRpcConditionFormatter(c)
      );
      log(
        'formattedSolRpcConditions',
        JSON.stringify(formattedSolRpcConditions)
      );
    } else if (unifiedAccessControlConditions) {
      formattedUnifiedAccessControlConditions =
        unifiedAccessControlConditions.map((c: any) =>
          canonicalUnifiedAccessControlConditionFormatter(c)
        );
      log(
        'formattedUnifiedAccessControlConditions',
        JSON.stringify(formattedUnifiedAccessControlConditions)
      );
    } else {
      error = true;
    }

    return {
      error,
      formattedAccessControlConditions,
      formattedEVMContractConditions,
      formattedSolRpcConditions,
      formattedUnifiedAccessControlConditions,
    };
  };

  /**
   *
   * Get hash of access control conditions
   *
   * @param { JsonStoreSigningRequest } params
   *
   * @returns { Promise<ArrayBuffer | undefined> }
   *
   */
  getHashedAccessControlConditions = async (
    params: JsonStoreSigningRequest
  ): Promise<ArrayBuffer | undefined> => {
    let hashOfConditions: ArrayBuffer;

    // ========== Prepare Params ==========
    const {
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
    } = params;

    // ========== Hash ==========
    if (accessControlConditions) {
      hashOfConditions = await hashAccessControlConditions(
        accessControlConditions
      );
    } else if (evmContractConditions) {
      hashOfConditions = await hashEVMContractConditions(evmContractConditions);
    } else if (solRpcConditions) {
      hashOfConditions = await hashSolRpcConditions(solRpcConditions);
    } else if (unifiedAccessControlConditions) {
      hashOfConditions = await hashUnifiedAccessControlConditions(
        unifiedAccessControlConditions
      );
    } else {
      return;
    }

    // ========== Result ==========
    return hashOfConditions;
  };

  // ========== Promise Handlers ==========

  /**
   *
   * Get and gather node promises
   *
   * @param { any } callback
   *
   * @returns { Array<Promise<any>> }
   *
   */
  getNodePromises = (callback: Function): Array<Promise<any>> => {
    const nodePromises = [];

    for (const url of this.connectedNodes) {
      nodePromises.push(callback(url));
    }

    return nodePromises;
  };

  /**
   * Handle node promises
   *
   * @param { Array<Promise<any>> } nodePromises
   *
   * @returns { Promise<SuccessNodePromises | RejectedNodePromises> }
   *
   */
  handleNodePromises = async (
    nodePromises: Array<Promise<any>>,
    minNodeCount?: number
  ): Promise<SuccessNodePromises | RejectedNodePromises> => {
    // -- prepare
    const responses = await Promise.allSettled(nodePromises);
    const minNodes = minNodeCount ?? this.config.minNodeCount;

    // -- get fulfilled responses
    const successes: Array<NodePromiseResponse> = responses.filter(
      (r: any) => r.status === 'fulfilled'
    );

    // -- case: success (when success responses are more than minNodeCount)
    if (successes.length >= minNodes) {
      const successPromises: SuccessNodePromises = {
        success: true,
        values: successes.map((r: any) => r.value),
      };

      return successPromises;
    }

    // -- case: if we're here, then we did not succeed.  time to handle and report errors.

    // -- get "rejected" responses
    const rejected = responses.filter((r: any) => r.status === 'rejected');

    const mostCommonError = JSON.parse(
      mostCommonString(
        rejected.map((r: NodePromiseResponse) => JSON.stringify(r.reason))
      )
    );

    log(`most common error: ${JSON.stringify(mostCommonError)}`);

    const rejectedPromises: RejectedNodePromises = {
      success: false,
      error: mostCommonError,
    };

    return rejectedPromises;
  };

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

    if(!ipfsId){
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

  /**
   *
   * Throw node error
   *
   * @param { RejectedNodePromises } res
   *
   * @returns { void }
   *
   */
  throwNodeError = (res: RejectedNodePromises): void => {
    if (res.error && res.error.errorCode) {
      if (
        (res.error.errorCode === LIT_ERROR_CODE.NODE_NOT_AUTHORIZED ||
          res.error.errorCode === 'not_authorized') &&
        this.config.alertWhenUnauthorized
      ) {
        log(
          '[Alert originally] You are not authorized to access to this content'
        );
      }

      throwError({
        ...res.error,
        message:
          res.error.message ||
          'You are not authorized to access to this content',
        errorCode: res.error.errorCode!,
      } as NodeClientErrorV0 | NodeClientErrorV1);
    } else {
      throwError({
        message: `There was an error getting the signing shares from the nodes`,
        error: LIT_ERROR.UNKNOWN_ERROR,
      });
    }
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
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

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
      this.throwNodeError(res as RejectedNodePromises);
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
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
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
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
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
      this.throwNodeError(res as RejectedNodePromises);
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
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
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
      this.throwNodeError(res as RejectedNodePromises);
    }

    return true;
  };

  /**
   *
   * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
   *
   */
  getEncryptionKey = async (
    params: JsonEncryptionRetrieveRequest
  ): Promise<Uint8Array> => {
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // -- validate if this.networkPubKeySet is null
    if (!this.networkPubKeySet) {
      const message = 'networkPubKeySet cannot be null';
      throwError({
        message,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // ========== Prepare Params ==========
    const { chain, authSig, resourceId, toDecrypt } = params;

    // ========== Validate Params ==========
    const paramsIsSafe = safeParams({
      functionName: 'getEncryptionKey',
      params: params,
    });

    if (!paramsIsSafe) {
      throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

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

    // ========== Node Promises ==========
    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- choose the right signature
      let sigToPassToNode = this.getAuthSigOrSessionAuthSig({
        authSig: params.authSig,
        sessionSigs: params.sessionSigs,
        url,
      });

      return this.getDecryptionShare(
        url,
        {
          accessControlConditions: formattedAccessControlConditions,
          evmContractConditions: formattedEVMContractConditions,
          solRpcConditions: formattedSolRpcConditions,
          unifiedAccessControlConditions:
            formattedUnifiedAccessControlConditions,
          toDecrypt,
          authSig: sigToPassToNode,
          chain,
        },
        requestId
      );
    });

    // -- resolve promises
    const res = await this.handleNodePromises(nodePromises);

    // -- case: promises rejected
    if (res.success === false) {
      this.throwNodeError(res as RejectedNodePromises);
    }

    const decryptionShares: Array<NodeShare> = (res as SuccessNodePromises)
      .values;

    log('decryptionShares', decryptionShares);

    if (!this.networkPubKeySet) {
      return throwError({
        message: 'networkPubKeySet cannot be null',
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
      });
    }

    // ========== Combine Shares ==========
    const decrypted = combineBlsDecryptionShares(
      decryptionShares,
      this.networkPubKeySet,
      toDecrypt
    );

    return decrypted;
  };

  /**
   *
   * Securely save the association between access control conditions and something that you wish to decrypt
   *
   * @param { JsonSaveEncryptionKeyRequest } params
   *
   * @returns { Promise<Uint8Array> }
   *
   */
  saveEncryptionKey = async (
    params: JsonSaveEncryptionKeyRequest
  ): Promise<Uint8Array> => {
    // ========= Prepare Params ==========
    const { encryptedSymmetricKey, symmetricKey, authSig, chain, permanent } =
      params;

    // ========== Validate Params ==========
    // -- validate if it's ready
    if (!this.ready) {
      const message =
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
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
      functionName: 'saveEncryptionKey',
      params,
    });

    if (!paramsIsSafe) {
      return throwError({
        message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // ========== Encryption ==========
    // -- encrypt with network pubkey
    let encryptedKey;

    if (encryptedSymmetricKey) {
      encryptedKey = encryptedSymmetricKey;
    } else {
      encryptedKey = wasmBlsSdkHelpers.encrypt(
        uint8arrayFromString(this.subnetPubKey, 'base16'),
        symmetricKey
      );
      log(
        'symmetric key encrypted with LIT network key: ',
        uint8arrayToString(encryptedKey, 'base16')
      );
    }

    // ========== Hashing ==========
    // -- hash the encrypted pubkey
    const hashOfKey = await crypto.subtle.digest('SHA-256', encryptedKey);
    const hashOfKeyStr = uint8arrayToString(
      new Uint8Array(hashOfKey),
      'base16'
    );

    // hash the access control conditions
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

    // ========== Node Promises ==========
    const requestId = this.getRequestId();
    const nodePromises = this.getNodePromises((url: string) => {
      // -- choose the right signature
      let sigToPassToNode = this.getAuthSigOrSessionAuthSig({
        authSig: params.authSig,
        sessionSigs: params.sessionSigs,
        url,
      });

      return this.storeEncryptionConditionWithNode(
        url,
        {
          key: hashOfKeyStr,
          val: hashOfConditionsStr,
          authSig: sigToPassToNode,
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
      this.throwNodeError(res as RejectedNodePromises);
    }

    return encryptedKey;
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
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
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

  /**
   *
   * Connect to the LIT nodes
   *
   * @returns { Promise } A promise that resolves when the nodes are connected.
   *
   */
  connect = (): Promise<any> => {
    // -- handshake with each node
    const requestId = this.getRequestId();
    for (const url of this.config.bootstrapUrls) {
      this.handshakeWithSgx({ url }, requestId)
        .then((resp: any) => {
          this.connectedNodes.add(url);

          let keys: JsonHandshakeResponse = {
            serverPubKey: resp.serverPublicKey,
            subnetPubKey: resp.subnetPublicKey,
            networkPubKey: resp.networkPublicKey,
            networkPubKeySet: resp.networkPublicKeySet,
          };

          this.serverKeys[url] = keys;
        })
        .catch((e: any) => {
          log('Error connecting to node ', url, e);
        });
    }

    // -- get promise
    const promise = new Promise((resolve: any, reject: any) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (Object.keys(this.serverKeys).length >= this.config.minNodeCount) {
          clearInterval(interval);

          // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key
          this.subnetPubKey = mostCommonString(
            Object.values(this.serverKeys).map(
              (keysFromSingleNode: any) => keysFromSingleNode.subnetPubKey
            )
          );
          this.networkPubKey = mostCommonString(
            Object.values(this.serverKeys).map(
              (keysFromSingleNode: any) => keysFromSingleNode.networkPubKey
            )
          );
          this.networkPubKeySet = mostCommonString(
            Object.values(this.serverKeys).map(
              (keysFromSingleNode: any) => keysFromSingleNode.networkPubKeySet
            )
          );
          this.ready = true;

          log(
            `🔥 lit is ready. "litNodeClient" variable is ready to use globally.`
          );

          // @ts-ignore
          globalThis.litNodeClient = this;

          // browser only
          if (isBrowser()) {
            document.dispatchEvent(new Event('lit-ready'));
          }

          // @ts-ignore: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?ts(2794)
          resolve();
        } else {
          const now = Date.now();
          if (now - startTime > this.config.connectTimeout) {
            clearInterval(interval);
            const msg = `Error: Could not connect to enough nodes after timeout of ${
              this.config.connectTimeout
            }ms.  Could only connect to ${
              Object.keys(this.serverKeys).length
            } of ${
              this.config.minNodeCount
            } required nodes.  Please check your network connection and try again.  Note that you can control this timeout with the connectTimeout config option which takes milliseconds.`;
            log(msg);
            reject(msg);
          }
        }
      }, 500);
    });

    return promise;
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
        'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

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
    let sessionKey = this.getSessionKey(params.sessionKey);
    let sessionKeyUri = LIT_SESSION_KEY_URI + sessionKey.publicKey;

    // Compute the address from the public key if it's provided. Otherwise, the node will compute it.
    const pkpEthAddress = (function () {
      if (params.pkpPublicKey) return computeAddress(params.pkpPublicKey);

      // This will be populated by the node, using dummy value for now.
      return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    })();

    let siweMessage: SiweMessage = new SiweMessage({
      domain: params?.domain || globalThis.location?.host || 'litprotocol.com',
      address: pkpEthAddress,
      statement: 'Lit Protocol PKP session signature',
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
      this.throwNodeError(res);
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

  parseResource = ({
    resource,
  }: {
    resource: any;
  }): {
    protocol: any;
    resourceId: any;
  } => {
    const [protocol, resourceId] = resource.split('://');
    return { protocol, resourceId };
  };

  /**
   * Get session signatures for a set of resources
   *
   * High level, how this works:
   * 1. Generate or retrieve session key
   * 2. Generate or retrieve the wallet signature of the session key
   * 3. Sign the specific resources with the session key
   *
   * @param { GetSessionSigsProps } params
   */
  getSessionSigs = async (params: GetSessionSigsProps) => {
    // -- prepare
    // Try to get it from local storage, if not generates one~
    let sessionKey = this.getSessionKey(params.sessionKey);

    let sessionKeyUri = LIT_SESSION_KEY_URI + sessionKey.publicKey;
    let capabilities = this.getSessionCapabilities(
      params.sessionCapabilities,
      params.resources
    );
    let expiration = params.expiration || this.getExpiration();

    // -- (TRY) to get the wallet signature
    let walletSig = await this.getWalletSig({
      authNeededCallback: params.authNeededCallback,
      chain: params.chain,
      capabilities: capabilities,
      switchChain: params.switchChain,
      expiration: expiration,
      sessionKeyUri: sessionKeyUri,
    });

    let siweMessage = new SiweMessage(walletSig?.signedMessage);

    let needToResignSessionKey = await this.checkNeedToResignSessionKey({
      siweMessage,
      walletSignature: walletSig?.sig,
      sessionKeyUri,
      resources: params.resources,
      sessionCapabilities: capabilities,
    });

    // -- (CHECK) if we need to resign the session key
    if (needToResignSessionKey) {
      log('need to re-sign session key.  Signing...');
      if (params.authNeededCallback) {
        walletSig = await params.authNeededCallback({
          chain: params.chain,
          resources: capabilities,
          expiration,
          uri: sessionKeyUri,
          litNodeClient: this,
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
          chain: params.chain,
          resources: capabilities,
          switchChain: params.switchChain,
          expiration,
          uri: sessionKeyUri,
        });
      }
    }

    if (
      walletSig.address === '' ||
      walletSig.derivedVia === '' ||
      walletSig.sig === '' ||
      walletSig.signedMessage === ''
    ) {
      throwError({
        message: 'No wallet signature found',
        errorKind: LIT_ERROR.WALLET_SIGNATURE_NOT_FOUND_ERROR.kind,
        errorCode: LIT_ERROR.WALLET_SIGNATURE_NOT_FOUND_ERROR.name,
      });
      return;
    }

    // ===== AFTER we have Valid Signed Session Key =====
    // - Let's sign the resources with the session key
    // - 5 minutes is the default expiration for a session signature
    // - Because we can generate a new session sig every time the user wants to access a resource without prompting them to sign with their wallet
    let sessionExpiration = new Date(Date.now() + 1000 * 60 * 5);

    const signingTemplate: SessionSigningTemplate = {
      sessionKey: sessionKey.publicKey,
      resources: params.resources,
      capabilities: [walletSig],
      issuedAt: new Date().toISOString(),
      expiration: sessionExpiration.toISOString(),
    };

    const signatures: any = {};

    this.connectedNodes.forEach((nodeAddress: string) => {
      const toSign = {
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
}
