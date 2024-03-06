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
  validateAccessControlConditionsSchema,
  validateEVMContractConditionsSchema,
  validateSolRpcConditionsSchema,
  validateUnifiedAccessControlConditionsSchema,
} from '@lit-protocol/access-control-conditions';

import {
  INTERNAL_DEFAULT_CONFIG,
  LitNetwork,
  LIT_ERROR,
  LIT_ERROR_CODE,
  LIT_NETWORKS,
  version,
  TELEM_API_URL,
  SIGTYPE,
  StakingStates,
} from '@lit-protocol/constants';

import {
  bootstrapLogManager,
  executeWithRetry,
  isBrowser,
  isNode,
  log,
  logError,
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
  sendRequest,
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
  LitContractContext,
  LitContractResolverContext,
  LitNodeClientConfig,
  MultipleAccessControlConditions,
  NodeAttestation,
  NodeClientErrorV0,
  NodeClientErrorV1,
  NodeCommandServerKeysResponse,
  NodeErrorV3,
  NodePromiseResponse,
  RejectedNodePromises,
  RetryTolerance,
  SendNodeCommand,
  SessionSig,
  SessionSigsMap,
  SuccessNodePromises,
  SupportedJsonRequests,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitContracts } from '@lit-protocol/contracts-sdk';

export const DELAY_BEFORE_NEXT_EPOCH = 30000;
// export const MAX_CACHE_AGE = 30000;
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
  lastBlockHashRetrieved: number | null;
  networkSyncInterval: any | null;

  private epochChangeListenerSet = false;

  epochCache: {
    number: number | null;
    lastUpdateTime: number | null;
  } = {
      number: null,
      lastUpdateTime: null,
    };

  // ========== Constructor ==========
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    const customConfig = args;
    let _defaultConfig = {
      alertWhenUnauthorized: false,
      debug: true,
      connectTimeout: 20000,
      litNetwork: 'cayenne', // Default to cayenne network. will be replaced by custom config.
      minNodeCount: 2, // Default value, should be replaced
      bootstrapUrls: [], // Default value, should be replaced
      retryTolerance: {
        timeout: 31_000,
        maxRetryLimit: 3,
        interval: 100,
      },
    };

    // Initialize default config based on litNetwork
    if (args && 'litNetwork' in args) {
      switch (args.litNetwork) {
        case LitNetwork.Cayenne:
          this.config = {
            ..._defaultConfig,
            litNetwork: LitNetwork.Cayenne,
          } as unknown as LitNodeClientConfig;
          break;
        case LitNetwork.Manzano:
          this.config = {
            ..._defaultConfig,
            litNetwork: LitNetwork.Manzano,
            checkSevSnpAttestation: true,
          } as unknown as LitNodeClientConfig;
          break;
        case LitNetwork.Habanero:
          this.config = {
            ..._defaultConfig,
            litNetwork: LitNetwork.Habanero,
            checkSevSnpAttestation: true,
          } as unknown as LitNodeClientConfig;
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
    this.hdRootPubkeys = null;
    this.latestBlockhash = null;
    this.lastBlockHashRetrieved = null;
    // -- set bootstrapUrls to match the network litNetwork unless it's set to custom
    this.setCustomBootstrapUrls();

    // -- set global variables
    globalThis.litConfig = this.config;
    bootstrapLogManager('core');

    // -- configure local storage if not present
    // LitNodeClientNodejs is a base for LitNodeClient
    // First check for if our runtime is node
    // If the user sets a new storage provider we respect it over our default storage
    // If the user sets a new file path, we respect it over the default path.
    if (this.config.storageProvider?.provider) {
      log(
        'localstorage api not found, injecting persistance instance found in config'
      );
      // using Object definProperty in order to set a property previously defined as readonly.
      // if the user wants to override the storage option explicitly we override.
      Object.defineProperty(globalThis, 'localStorage', {
        value: this.config.storageProvider?.provider,
      });
    } else if (
      isNode() &&
      !globalThis.localStorage &&
      !this.config.storageProvider?.provider
    ) {
      log(
        'Looks like you are running in NodeJS and did not provide a storage provider, youre sessions will not be cached'
      );
    }
  }

  // ========== Logger utilities ==========
  getLogsForRequestId = (id: string): string[] => {
    return globalThis.logManager.getLogsForId(id);
  };

  // ========== Scoped Class Helpers ==========
  /**
   * Asynchronously updates the configuration settings for the LitNodeClient.
   * This function fetches the minimum node count and bootstrap URLs for the
   * specified Lit network. It validates these values and updates the client's
   * configuration accordingly.
   *
   * @throws Will throw an error if the minimum node count is invalid or if
   *         the bootstrap URLs array is empty.
   * @returns {Promise<void>} A promise that resolves when the configuration is updated.
   */
  setNewConfig = async (): Promise<void> => {
    if (
      this.config.litNetwork === LitNetwork.Manzano ||
      this.config.litNetwork === LitNetwork.Habanero
    ) {
      const minNodeCount = await LitContracts.getMinNodeCount(
        this.config.litNetwork as LitNetwork
      );
      const bootstrapUrls = await LitContracts.getValidators(
        this.config.litNetwork as LitNetwork
      );
      log('Bootstrap urls: ', bootstrapUrls);
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

      this.config.minNodeCount = parseInt(minNodeCount, 10);
      this.config.bootstrapUrls = bootstrapUrls;
    } else if (this.config.litNetwork === LitNetwork.Cayenne) {
      // If the network is cayenne it is a centralized testnet so we use a static config
      // This is due to staking contracts holding local ip / port contexts which are innacurate to the ip / port exposed to the world
      this.config.bootstrapUrls = LIT_NETWORKS.cayenne;
      this.config.minNodeCount =
        LIT_NETWORKS.cayenne.length == 2
          ? 2
          : (LIT_NETWORKS.cayenne.length * 2) / 3;

      /**
       * Here we are checking if a custom network defined with no node urls (bootstrap urls) defined
       * If this is the case we need to bootstrap the network state from the set of contracts given.
       * So we call to the Staking contract with the address given by the caller to resolve the network state.
       */
    } else if (
      this.config.litNetwork === LitNetwork.Custom &&
      this.config.bootstrapUrls.length < 1
    ) {
      log('using custom contracts: ', this.config.contractContext);

      const minNodeCount = await LitContracts.getMinNodeCount(
        this.config.litNetwork as LitNetwork,
        this.config.contractContext
      );

      const bootstrapUrls = await LitContracts.getValidators(
        this.config.litNetwork as LitNetwork,
        this.config.contractContext
      );
      log('Bootstrap urls: ', bootstrapUrls);
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

      this.config.minNodeCount = parseInt(minNodeCount, 10);
      this.config.bootstrapUrls = bootstrapUrls;
    }
  };

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
    // Check if we've already set up the listener to avoid duplicates
    if (this.epochChangeListenerSet) {
      log('Epoch change listener already set.');
      return;
    }

    if (
      this.config.litNetwork === LitNetwork.Manzano ||
      this.config.litNetwork === LitNetwork.Habanero ||
      this.config.litNetwork === LitNetwork.Custom
    ) {
      const stakingContract = await LitContracts.getStakingContract(
        this.config.litNetwork as any,
        this.config.contractContext
      );
      log(
        'listening for state change on staking contract: ',
        stakingContract.address
      );

      stakingContract.on('StateChanged', async (state: StakingStates) => {
        // (epoch) step 2: listen for epoch changes and update the cache accordingly, with a 30-second delay for using the new epoch number
        setTimeout(async () => {
          const newEpochNumber = await this.getCurrentEpochNumber();
          this.updateEpochCache(newEpochNumber);

        }, DELAY_BEFORE_NEXT_EPOCH);

        log(`New state detected: "${state}"`);
        if (state === StakingStates.NextValidatorSetLocked) {
          log(
            'State found to be new validator set locked, checking validator set'
          );
          const oldNodeUrls: string[] = [...this.config.bootstrapUrls].sort();
          await this.setNewConfig();
          const currentNodeUrls: string[] = this.config.bootstrapUrls.sort();
          const delta: string[] = currentNodeUrls.filter((item) =>
            oldNodeUrls.includes(item)
          );
          // if the sets differ we reconnect.
          if (delta.length > 1) {
            // check if the node sets are non matching and re connect if they do not.
            /*
              TODO: While this covers most cases where a node may come in or out of the active 
              set which we will need to re attest to the execution environments.
              The sdk currently does not know if there is an active network operation pending.
              Such that the state when the request was sent will now mutate when the response is sent back.
              The sdk should be able to understand its current execution environment and wait on an active 
              network request to the previous epoch's node set before changing over.
              
            */
            log(
              'Active validator sets changed, new validators ',
              delta,
              'starting node connection'
            );
            this.connectedNodes =
              await this._runHandshakeWithBootstrapUrls().catch(
                (err: NodeClientErrorV0 | NodeClientErrorV1) => {
                  logError(
                    'Error while attempting to reconnect to nodes after epoch transition: ',
                    err.message
                  );
                }
              );
          }
        }

        const newEpochNumber = await this.getCurrentEpochNumber();
        this.updateEpochCache(newEpochNumber);
      });

      // Mark that we've set up the listener
      this.epochChangeListenerSet = true;
    }
  };

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
  connect = async (): Promise<any> => {
    // -- handshake with each node
    await this.setNewConfig();

    // (epoch) step 1: Initialize epoch number cache
    this.epochCache.number = await this.getCurrentEpochNumber();
    this.epochCache.lastUpdateTime = Date.now();
    await this.listenForNewEpoch();

    await this._runHandshakeWithBootstrapUrls();
  };

  /**
   *
   * @returns {Promise<any>}
   */

  _runHandshakeWithBootstrapUrls = async (): Promise<any> => {
    // -- handshake with each node
    const requestId = this.getRequestId();

    // reset connectedNodes for the new handshake operation
    this.connectedNodes = new Set();

    if (this.config.bootstrapUrls.length <= 0) {
      throwError({
        message: `Failed to get bootstrapUrls for network ${this.config.litNetwork}`,
        errorKind: LIT_ERROR.INIT_ERROR.kind,
        errorCode: LIT_ERROR.INIT_ERROR.name,
      });
    }

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
            logErrorWithRequestId(
              requestId,
              'Error connecting to node. Detected "ERR" in keys',
              url,
              keys
            );
          }
          log('returned keys: ', keys);
          if (!keys.latestBlockhash) {
            logErrorWithRequestId(
              requestId,
              'Error getting latest blockhash from the node.'
            );
          }

          if (
            this.config.checkNodeAttestation ||
            this.config.litNetwork === LitNetwork.Manzano ||
            this.config.litNetwork === LitNetwork.Habanero
          ) {
            // check attestation
            if (!resp.attestation) {
              logErrorWithRequestId(
                requestId,
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
                logErrorWithRequestId(
                  requestId,
                  `Lit Node Attestation failed verification for ${url}`
                );
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
        if (
          Object.keys(this.serverKeys).length ==
          this.config.bootstrapUrls.length
        ) {
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

          if (!this.latestBlockhash) {
            logErrorWithRequestId(
              requestId,
              'Error getting latest blockhash from the nodes.'
            );

            throwError({
              message: 'Error getting latest blockhash from the nodes.',
              errorKind: LIT_ERROR.INVALID_ETH_BLOCKHASH.kind,
              errorCode: LIT_ERROR.INVALID_ETH_BLOCKHASH.name,
            });
          }

          this.lastBlockHashRetrieved = Date.now();
          this.ready = true;

          log(
            `🔥 lit is ready. "litNodeClient" variable is ready to use globally.`
          );
          log('current network config', {
            networkPubkey: this.networkPubKey,
            networkPubKeySet: this.networkPubKeySet,
            hdRootPubkeys: this.hdRootPubkeys,
            subnetPubkey: this.subnetPubKey,
            latestBlockhash: this.latestBlockhash,
          });

          // @ts-ignore
          globalThis.litNodeClient = this;

          // browser only
          if (isBrowser()) {
            document.dispatchEvent(new Event('lit-ready'));
          }
          // if the interval is defined we clear it
          if (this.networkSyncInterval) {
            clearInterval(this.networkSyncInterval);
          }

          this.networkSyncInterval = setInterval(async () => {
            if (Date.now() - this.lastBlockHashRetrieved! >= 30_000) {
              log(
                'Syncing state for new network context current config: ',
                this.config,
                'current blockhash: ',
                this.lastBlockHashRetrieved
              );
              await this._runHandshakeWithBootstrapUrls().catch((err) => {
                throw err;
              });
              log(
                'Done syncing state new config: ',
                this.config,
                'new blockhash: ',
                this.lastBlockHashRetrieved
              );
            }
          }, 30_000);

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
            logErrorWithRequestId(requestId, msg);
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
    const wrapper = async (id: string) => {
      // -- get properties from params
      const { url } = params;

      // -- create url with path
      const urlWithPath = `${url}/web/handshake`;

      log(`handshakeWithNode ${urlWithPath}`);

      const data = {
        clientPublicKey: 'test',
        challenge: params.challenge,
      };

      let res = await this.sendCommandToNode({
        url: urlWithPath,
        data,
        requestId,
      }).catch((err: NodeErrorV3) => {
        return err;
      });

      return res;
    };

    let res = await executeWithRetry<NodeCommandServerKeysResponse>(
      wrapper,
      (_error: any, _requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('an error occured, attempting to retry');
        }
      },
      this.config.retryTolerance
    );

    return res as NodeCommandServerKeysResponse;
  };

  updateEpochCache = async (epochNumber: number): Promise<void> => {
    this.epochCache.number = epochNumber;
    this.epochCache.lastUpdateTime = Date.now();
  };

  getCurrentEpochNumber = async (): Promise<number> => {
    try {
      // (epoch) step 3: first check the cache and use the cached value if it's not more than 30 seconds old. If it's a cache miss or the cached value is too old, fall back to fetching the current epoch number
      // const now = Date.now();
      // const cacheAge = now - this.epochCache.lastUpdateTime!;

      // if (
      this.epochCache.number !== null
      // && cacheAge <= MAX_CACHE_AGE
      // ) {
      //   log('Using cached epoch number', this.epochCache.number);
      //   return this.epochCache.number;
      // }

      // Cache miss or cached value too old, fetch new epoch number
      const stakingContract = await LitContracts.getStakingContract(
        this.config.litNetwork as any,
        this.config.contractContext
      );

      log('Fetching current epoch number');
      const epoch = await stakingContract['epoch']();
      const epochNumber = epoch.number.toNumber();

      // Update the cache
      // this.epochCache.number = epochNumber;
      // this.epochCache.lastUpdateTime = Date.now();

      return epochNumber;
    } catch (error) {
      return throwError({
        message: `Error getting current epoch number: ${error}`,
        errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
        errorCode: LIT_ERROR.UNKNOWN_ERROR.name,
      });
    }
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
    const epochNumber = await this.getCurrentEpochNumber();

    data = { ...data, epochNumber };

    logWithRequestId(
      requestId,
      `sendCommandToNode with url ${url} and data`,
      data
    );

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

    return sendRequest(url, req, requestId);
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

  validateAccessControlConditionsSchema = async (
    params: MultipleAccessControlConditions
  ): Promise<boolean> => {
    // ========== Prepare Params ==========
    const {
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
    } = params;

    if (accessControlConditions) {
      await validateAccessControlConditionsSchema(accessControlConditions);
    } else if (evmContractConditions) {
      await validateEVMContractConditionsSchema(evmContractConditions);
    } else if (solRpcConditions) {
      await validateSolRpcConditionsSchema(solRpcConditions);
    } else if (unifiedAccessControlConditions) {
      await validateUnifiedAccessControlConditionsSchema(
        unifiedAccessControlConditions
      );
    }

    return true;
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
    requestId?: string,
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

    logErrorWithRequestId(
      requestId || '',
      `most common error: ${JSON.stringify(mostCommonError)}`
    );

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
  _throwNodeError = (res: RejectedNodePromises, requestId: string): void => {
    if (res.error) {
      if (
        ((res.error.errorCode &&
          res.error.errorCode === LIT_ERROR_CODE.NODE_NOT_AUTHORIZED) ||
          res.error.errorCode === 'not_authorized') &&
        this.config.alertWhenUnauthorized
      ) {
        log('You are not authorized to access this content');
      }

      throwError({
        ...res.error,
        message:
          res.error.message ||
          'There was an error getting the signing shares from the nodes',
        errorCode: res.error.errorCode || LIT_ERROR.UNKNOWN_ERROR.code,
        requestId,
      } as NodeClientErrorV0 | NodeClientErrorV1);
    } else {
      throwError({
        message: `There was an error getting the signing shares from the nodes.  Response from the nodes: ${JSON.stringify(
          res
        )}`,
        error: LIT_ERROR.UNKNOWN_ERROR,
        requestId,
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
      logError('root public keys not found, have you connected to the nodes?');
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
