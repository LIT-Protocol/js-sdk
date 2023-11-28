import { computeHDPubKey, checkSevSnpAttestation } from '@lit-protocol/crypto';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';

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

import {
  LIT_ERROR,
  LIT_ERROR_CODE,
  LIT_NETWORKS,
  version,
  TELEM_API_URL,
  SIGTYPE,
  LitNetwork,
  StakingStates,
} from '@lit-protocol/constants';

import {
  isBrowser,
  log,
  mostCommonString,
  throwError,
} from '@lit-protocol/misc';
import {
  AuthMethod,
  AuthSig,
  CustomNetwork,
  FormattedMultipleAccs,
  HandshakeWithNode,
  JsonExecutionRequest,
  JsonHandshakeResponse,
  JsonPkpSignRequest,
  KV,
  LitNodeClientConfig,
  MultipleAccessControlConditions,
  NodeAttestation,
  NodeClientErrorV0,
  NodeClientErrorV1,
  NodeCommandServerKeysResponse,
  NodeErrorV3,
  NodePromiseResponse,
  RejectedNodePromises,
  SendNodeCommand,
  SessionSig,
  SessionSigsMap,
  SuccessNodePromises,
  SupportedJsonRequests,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { uint8arrayFromString } from '@lit-protocol/uint8arrays';

export class LitCore {
  config: LitNodeClientConfig;
  connectedNodes: SetConstructor | Set<any> | any;
  serverKeys: KV | any;
  ready: boolean;
  subnetPubKey: string | null;
  networkPubKey: string | null;
  networkPubKeySet: string | null;
  hdRootPubkeys: string[] | null;
  latestBlockhash: string | null;

  // ========== Constructor ==========
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    const customConfig = args;

    let _defaultConfig = {
      alertWhenUnauthorized: false,
      debug: true,
      connectTimeout: 20000,
      litNetwork: '', // Default value, should be replaced
      minNodeCount: 2, // Default value, should be replaced
      bootstrapUrls: [], // Default value, should be replaced
      checkNodeAttestation: false
    };

    // Initialize default config based on litNetwork
    if (args && 'litNetwork' in args) {
      switch (args.litNetwork) {
        case LitNetwork.Cayenne:
          this.config = {
            ..._defaultConfig,
            litNetwork: LitNetwork.Cayenne,
          } as LitNodeClientConfig;
          break;
        case LitNetwork.InternalDev:
          this.config = {
            ..._defaultConfig,
            litNetwork: LitNetwork.InternalDev,
          } as LitNodeClientConfig;
          break;
        default:
          this.config = {
            ..._defaultConfig,
            ...customConfig,
          } as LitNodeClientConfig;
      }

    } else {
      this.config = { ..._defaultConfig, ...customConfig };
    }



    // -- init default properties
    this.connectedNodes = new Set();
    this.serverKeys = {};
    this.ready = false;
    this.subnetPubKey = null;
    this.networkPubKey = null;
    this.networkPubKeySet = null;
    this.hdRootPubkeys = null;
    this.latestBlockhash = null;
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
   * Asynchronously updates the configuration settings for the LitNodeClient.
   * This function fetches the minimum node count and bootstrap URLs for the
   * specified Lit network. It validates these values and updates the client's
   * configuration accordingly. If the network is set to 'InternalDev', it
   * dynamically updates the bootstrap URLs in the configuration.
   *
   * @throws Will throw an error if the minimum node count is invalid or if
   *         the bootstrap URLs array is empty.
   * @returns {Promise<void>} A promise that resolves when the configuration is updated.
   */
  setNewConfig = async (): Promise<void> => {
    const minNodeCount = await LitContracts.getMinNodeCount(this.config.litNetwork as LitNetwork);
    const bootstrapUrls = await LitContracts.getValidators(this.config.litNetwork as LitNetwork);

    if (minNodeCount <= 0) {
      throwError({
        message: `minNodeCount is ${minNodeCount}, which is invalid. Please check your network connection and try again.`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    if (bootstrapUrls.length <= 0) {
      throwError({
        message: `bootstrapUrls is empty, which is invalid. Please check your network connection and try again.`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    // -- Update config
    // TODO TEMPORARY: only dynamically update when it's set to internalDev
    if (this.config.litNetwork === LitNetwork.InternalDev) {
      this.config.bootstrapUrls = bootstrapUrls;
    }

    this.config.minNodeCount = minNodeCount;
  }

  /**
   * Sets up a listener to detect state changes (new epochs) in the staking contract.
   * When a new epoch is detected, it triggers the `setNewConfig` function to update
   * the client's configuration based on the new state of the network. This ensures
   * that the client's configuration is always in sync with the current state of the
   * staking contract.
   *
   * @returns {Promise<void>} A promise that resolves when the listener is successfully set up.
   */
  listenForNewEpoch = async (): Promise<void> => {
    const stakingContract = await LitContracts.getStakingContract(this.config.litNetwork as LitNetwork);

    stakingContract.on("StateChanged", async (state: StakingStates) => {
      log(`New state detected: "${state}"`);

      if (state === StakingStates.Active) {
        await this.setNewConfig();
      }
    });
  };

  /**
   * Initiates the connection process for the LitNodeClient. This function performs several key steps:
   * 1. Updates the client's configuration by fetching the latest minimum node count and bootstrap URLs.
   * 2. Sets up a listener to detect new epochs in the staking contract and update the configuration accordingly.
   * 3. Performs a handshake with each node in the bootstrap URLs list, storing their public keys.
   * 4. Waits until a sufficient number of nodes are connected (based on the minimum node count) or until a timeout occurs.
   * 5. Selects the most common public keys among the connected nodes to mitigate the risk of connecting to malicious nodes.
   * 6. Marks the client as ready and makes it globally accessible if in a browser environment.
   * 7. Dispatches a 'lit-ready' event in a browser environment.
   *
   * The function returns a promise that resolves when the client is successfully connected to the required number of nodes,
   * or rejects if the connection process times out or fails to connect to enough nodes.
   *
   * @returns {Promise<any>} A promise that resolves when the client is connected and ready, or rejects with an error message if the connection fails.
   */
  connect = async (): Promise<any> => {

    await this.setNewConfig();
    await this.listenForNewEpoch();

    // -- handshake with each node
    const requestId = this.getRequestId();

    for (const url of this.config.bootstrapUrls) {
      const challenge = this.getRandomHexString(64);
      this.handshakeWithNode({ url, challenge }, requestId)
        .then((resp: any) => {
          this.connectedNodes.add(url);

          let keys: JsonHandshakeResponse = {
            serverPubKey: resp.serverPublicKey,
            subnetPubKey: resp.subnetPublicKey,
            networkPubKey: resp.networkPublicKey,
            networkPubKeySet: resp.networkPublicKeySet,
            hdRootPubkeys: resp.hdRootPubkeys,
            latestBlockhash: resp.latestBlockhash,
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

          if (!keys.latestBlockhash) {
            log('Error getting latest blockhash from the node.');
          }

          if (this.config.checkNodeAttestation) {
            // check attestation
            if (!resp.attestation) {
              console.error(
                `Missing attestation in handshake response from ${url}`
              );
              throwError({
                message: `Missing attestation in handshake response from ${url}`,
                errorKind: LIT_ERROR.INVALID_NODE_ATTESTATION.kind,
                errorCode: LIT_ERROR.INVALID_NODE_ATTESTATION.name,
              });
            } else {
              // actually verify the attestation by checking the signature against AMD certs
              log('Checking attestation against amd certs...');
              const attestation = resp.attestation;

              try {
                checkSevSnpAttestation(attestation, challenge, url).then(() => {
                  log(`Lit Node Attestation verified for ${url}`);

                  // only set server keys if attestation is valid
                  // so that we don't use this node if it's not valid
                  this.serverKeys[url] = keys;
                });
              } catch (e) {
                console.error(
                  `Lit Node Attestation failed verification for ${url}`
                );
                console.error(e);
                throwError({
                  message: `Lit Node Attestation failed verification for ${url}`,
                  errorKind: LIT_ERROR.INVALID_NODE_ATTESTATION.kind,
                  errorCode: LIT_ERROR.INVALID_NODE_ATTESTATION.name,
                });
              }
            }
          } else {
            // don't check attestation, just set server keys
            this.serverKeys[url] = keys;
          }
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
          this.hdRootPubkeys = mostCommonString(
            Object.values(this.serverKeys).map(
              (keysFromSingleNode: any) => keysFromSingleNode.hdRootPubkeys
            )
          );
          this.latestBlockhash = mostCommonString(
            Object.values(this.serverKeys).map(
              (keysFromSingleNode: any) => keysFromSingleNode.latestBlockhash
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
            const msg = `Error: Could not connect to enough nodes after timeout of ${this.config.connectTimeout
              }ms.  Could only connect to ${Object.keys(this.serverKeys).length
              } of ${this.config.minNodeCount
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
   *
   * @returns { string }
   *
   */
  getRequestId() {
    return Math.random().toString(16).slice(2);
  }

  /**
   *
   * Get a random hex string for use as an attestation challenge
   *
   * @returns { string }
   */

  getRandomHexString(size: number) {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  /**
   *
   * Handshake with Node
   *
   * @param { HandshakeWithNode } params
   *
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  handshakeWithNode = async (
    params: HandshakeWithNode,
    requestId: string
  ): Promise<NodeCommandServerKeysResponse> => {
    // -- get properties from params
    const { url } = params;

    // -- create url with path
    const urlWithPath = `${url}/web/handshake`;

    log(`handshakeWithNode ${urlWithPath}`);

    const data = {
      clientPublicKey: 'test',
      challenge: params.challenge,
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
      .catch((error: NodeErrorV3) => {
        console.error(
          `Something went wrong, internal id for request: lit_${requestId}. Please provide this identifier with any support requests. ${error?.message || error?.details
            ? `Error is ${error.message} - ${error.details}`
            : ''
          }`
        );
        return Promise.reject(error);
      });
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
  getSessionOrAuthSig = ({
    authSig,
    sessionSigs,
    url,
    mustHave = true,
  }: {
    authSig?: AuthSig;
    sessionSigs?: SessionSigsMap;
    url: string;
    mustHave?: boolean;
  }): AuthSig | SessionSig => {
    if (!authSig && !sessionSigs) {
      if (mustHave) {
        throwError({
          message: `You must pass either authSig, or sessionSigs`,
          errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
          errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
        });
      } else {
        log(`authSig or sessionSigs not found. This may be using authMethod`);
      }
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
   * @param { MultipleAccessControlConditions } params
   *
   * @returns { Promise<ArrayBuffer | undefined> }
   *
   */
  getHashedAccessControlConditions = async (
    params: MultipleAccessControlConditions
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
   * Handle node promises
   *
   * @param { Array<Promise<any>> } nodePromises
   *
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
   *
   */
  handleNodePromises = async <T>(
    nodePromises: Array<Promise<T>>,
    minNodeCount?: number
  ): Promise<SuccessNodePromises<T> | RejectedNodePromises> => {
    // -- prepare
    const responses = await Promise.allSettled(nodePromises);
    const minNodes = minNodeCount ?? this.config.minNodeCount;

    // -- get fulfilled responses
    const successes: Array<NodePromiseResponse> = responses.filter(
      (r: any) => r.status === 'fulfilled'
    );

    // -- case: success (when success responses are more than minNodeCount)
    if (successes.length >= minNodes) {
      const successPromises: SuccessNodePromises<T> = {
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
   * Calculates an HD public key from a given {@link keyId} the curve type or signature type will assumed to be k256 unless given
   * @param keyId
   * @param sigType
   * @returns {string} public key
   */
  computeHDPubKey = (
    keyId: string,
    sigType: SIGTYPE = SIGTYPE.EcdsaCaitSith
  ): string => {
    if (!this.hdRootPubkeys) {
      throwError({
        message: `root public keys not found, have you connected to the nodes?`,
        errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
        errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.code,
      });
    }
    return computeHDPubKey(this.hdRootPubkeys as string[], keyId, sigType);
  };

  /**
   * Calculates a Key Id for claiming a pkp based on a user identifier and an app identifier.
   * The key Identifier is an Auth Method Id which scopes the key uniquely to a specific application context.
   * These identifiers are specific to each auth method and will derive the public key protion of a pkp which will be persited
   * when a key is claimed.
   * | Auth Method | User ID | App ID |
   * |:------------|:--------|:-------|
   * | Google OAuth | token `sub` | token `aud` |
   * | Discord OAuth | user id | client app identifier |
   * | Stytch OTP |token `sub` | token `aud`|
   * | Lit Actions | user defined | ipfs cid |
   * *Note* Lit Action claiming uses a different schema than oter auth methods
   * isForActionContext should be set for true if using claiming through actions
   * @param userId {string} user identifier for the Key Identifier
   * @param appId {string} app identifier for the Key Identifier
   * @returns {String} public key of pkp when claimed
   */
  computeHDKeyId(
    userId: string,
    appId: string,
    isForActionContext: boolean = false
  ): string {
    if (!isForActionContext) {
      return ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`${userId}:${appId}`)
      );
    } else {
      return ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`${appId}:${userId}`)
      );
    }
  }
}
