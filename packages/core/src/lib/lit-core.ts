import {
  canonicalAccessControlConditionFormatter,
  canonicalEVMContractConditionFormatter,
  canonicalSolRpcConditionFormatter,
  canonicalUnifiedAccessControlConditionFormatter,
  hashAccessControlConditions,
  hashEVMContractConditions,
  hashSolRpcConditions,
  hashUnifiedAccessControlConditions,
} from '@lit-protocol/access-control-conditions';
import { wasmBlsSdkHelpers } from '@lit-protocol/bls-sdk';

import {
  defaultLitnodeClientConfig,
  LIT_ERROR,
  LIT_NETWORKS,
  version,
  LIT_ERROR_CODE,
} from '@lit-protocol/constants';

import {
  CustomNetwork,
  FormattedMultipleAccs,
  HandshakeWithSgx,
  AuthSig,
  JsonEncryptionRetrieveRequest,
  JsonHandshakeResponse,
  JsonSaveEncryptionKeyRequest,
  JsonSigningStoreRequest,
  JsonStoreSigningRequest,
  KV,
  LitNodeClientConfig,
  NodeCommandResponse,
  NodeCommandServerKeysResponse,
  NodePromiseResponse,
  NodeShare,
  RejectedNodePromises,
  SendNodeCommand,
  SuccessNodePromises,
  SupportedJsonRequests,
  NodeClientErrorV0,
  NodeClientErrorV1,
  SessionSigsMap,
  SessionSig,
} from '@lit-protocol/types';
import { combineBlsDecryptionShares } from '@lit-protocol/crypto';
import {
  isBrowser,
  log,
  mostCommonString,
  throwError,
  is,
  checkIfAuthSigRequiresChainParam,
} from '@lit-protocol/misc';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

export class LitCore {
  config: LitNodeClientConfig;
  connectedNodes: SetConstructor | Set<any> | any;
  serverKeys: KV | any;
  ready: boolean;
  subnetPubKey: string | null;
  networkPubKey: string | null;
  networkPubKeySet: string | null;

  // ========== Constructor ==========
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    let customConfig = args;

    // -- initialize default config
    this.config = defaultLitnodeClientConfig;

    // -- initialize default auth callback
    // this.defaultAuthCallback = args?.defaultAuthCallback;

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

          // -- validate returned keys
          if (
            keys.serverPubKey === 'ERR' ||
            keys.subnetPubKey === 'ERR' ||
            keys.networkPubKey === 'ERR' ||
            keys.networkPubKeySet === 'ERR'
          ) {
            log('Error connecting to node. Detected "ERR" in keys', url, keys);
          }

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

    const paramsIsSafe = saveEncryptionKeyParamsIsSafe(params);

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
      this._throwNodeError(res as RejectedNodePromises);
    }

    return encryptedKey;
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
        '5 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
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

    const paramsIsSafe = getEncryptionKeyParamsIsSafe(params);

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
      this._throwNodeError(res as RejectedNodePromises);
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
   *
   * Get either auth sig or session auth sig
   *
   */
  getAuthSigOrSessionAuthSig = ({
    authSig,
    sessionSigs,
    url,
  }: {
    authSig?: AuthSig;
    sessionSigs?: SessionSigsMap;
    url: string;
  }): AuthSig | SessionSig => {
    if (!authSig && !sessionSigs) {
      throwError({
        message: `You must pass either authSig or sessionSigs`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
      // @ts-ignore
      return;
    }

    if (sessionSigs) {
      const sigToPassToNode = sessionSigs[url];

      if (!sigToPassToNode) {
        throwError({
          message: `You passed sessionSigs but we could not find session sig for node ${url}`,
          errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
          errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
        });
      }

      return sigToPassToNode;
    }

    return authSig!;
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
   *
   * Throw node error
   *
   * @param { RejectedNodePromises } res
   *
   * @returns { void }
   *
   */
  _throwNodeError = (res: RejectedNodePromises): void => {
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
}

function saveEncryptionKeyParamsIsSafe(params: JsonSaveEncryptionKeyRequest) {
  // -- prepare params
  const {
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    authSig,
    chain,
    symmetricKey,
    encryptedSymmetricKey,
    permanant,
    permanent,
    sessionSigs,
  } = params;

  if (
    accessControlConditions &&
    !is(
      accessControlConditions,
      'Array',
      'accessControlConditions',
      'saveEncryptionKey'
    )
  )
    return false;
  if (
    evmContractConditions &&
    !is(
      evmContractConditions,
      'Array',
      'evmContractConditions',
      'saveEncryptionKey'
    )
  )
    return false;
  if (
    solRpcConditions &&
    !is(solRpcConditions, 'Array', 'solRpcConditions', 'saveEncryptionKey')
  )
    return false;
  if (
    unifiedAccessControlConditions &&
    !is(
      unifiedAccessControlConditions,
      'Array',
      'unifiedAccessControlConditions',
      'saveEncryptionKey'
    )
  )
    return false;

  // log('authSig:', authSig);
  if (authSig && !is(authSig, 'Object', 'authSig', 'saveEncryptionKey'))
    return false;
  if (
    authSig &&
    !checkIfAuthSigRequiresChainParam(authSig, chain, 'saveEncryptionKey')
  )
    return false;

  if (
    sessionSigs &&
    !is(sessionSigs, 'Object', 'sessionSigs', 'saveEncryptionKey')
  )
    return false;

  if (!sessionSigs && !authSig) {
    throwError({
      message: 'You must pass either authSig or sessionSigs',
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
    return false;
  }

  if (
    symmetricKey &&
    !is(symmetricKey, 'Uint8Array', 'symmetricKey', 'saveEncryptionKey')
  )
    return false;
  if (
    encryptedSymmetricKey &&
    !is(
      encryptedSymmetricKey,
      'Uint8Array',
      'encryptedSymmetricKey',
      'saveEncryptionKey'
    )
  )
    return false;

  // to fix spelling mistake
  if (typeof params.permanant !== 'undefined') {
    params.permanent = params.permanant;
  }

  if (
    (!symmetricKey || symmetricKey == '') &&
    (!encryptedSymmetricKey || encryptedSymmetricKey == '')
  ) {
    throw new Error(
      'symmetricKey and encryptedSymmetricKey are blank.  You must pass one or the other'
    );
  }

  if (
    !accessControlConditions &&
    !evmContractConditions &&
    !solRpcConditions &&
    !unifiedAccessControlConditions
  ) {
    throw new Error(
      'accessControlConditions and evmContractConditions and solRpcConditions and unifiedAccessControlConditions are blank'
    );
  }

  // -- validate: if sessionSig and authSig exists
  if (sessionSigs && authSig) {
    throwError({
      message: 'You must pass only one authSig or sessionSigs',
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
    return false;
  }

  //   -- case: success
  return true;
}

function getEncryptionKeyParamsIsSafe(params: JsonEncryptionRetrieveRequest) {
  const {
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    toDecrypt,
    authSig,
    chain,
    sessionSigs,
  } = params;

  // -- validate
  if (
    accessControlConditions &&
    !is(
      accessControlConditions,
      'Array',
      'accessControlConditions',
      'getEncryptionKey'
    )
  )
    return false;

  if (
    evmContractConditions &&
    !is(
      evmContractConditions,
      'Array',
      'evmContractConditions',
      'getEncryptionKey'
    )
  )
    return false;

  if (
    solRpcConditions &&
    !is(solRpcConditions, 'Array', 'solRpcConditions', 'getEncryptionKey')
  )
    return false;

  if (
    unifiedAccessControlConditions &&
    !is(
      unifiedAccessControlConditions,
      'Array',
      'unifiedAccessControlConditions',
      'getEncryptionKey'
    )
  )
    return false;

  log('TYPEOF toDecrypt in getEncryptionKey():', typeof toDecrypt);
  if (!is(toDecrypt, 'String', 'toDecrypt', 'getEncryptionKey')) return false;
  if (authSig && !is(authSig, 'Object', 'authSig', 'getEncryptionKey'))
    return false;
  if (
    sessionSigs &&
    !is(sessionSigs, 'Object', 'sessionSigs', 'getEncryptionKey')
  )
    return false;

  // -- validate: if sessionSig or authSig exists
  if (!sessionSigs && !authSig) {
    throwError({
      message: 'You must pass either authSig or sessionSigs',
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
    return false;
  }

  // -- validate: if sessionSig and authSig exists
  if (sessionSigs && authSig) {
    throwError({
      message: 'You must pass only one authSig or sessionSigs',
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
    return false;
  }

  // -- validate if 'chain' is null
  if (!chain) {
    return false;
  }

  if (
    authSig &&
    !checkIfAuthSigRequiresChainParam(authSig, chain, 'getEncryptionKey')
  )
    return false;

  return true;
}
