import { ethers } from 'ethers';

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
  LIT_ERROR,
  LIT_ERROR_CODE,
  LIT_NETWORKS,
  LitNetwork,
  LIT_CURVE,
  StakingStates,
  version,
  LIT_ENDPOINT,
  CAYENNE_URL,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  checkSevSnpAttestation,
  computeHDPubKey,
  loadModules,
  unloadModules,
} from '@lit-protocol/crypto';
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

import type {
  AuthSig,
  CustomNetwork,
  FormattedMultipleAccs,
  HandshakeWithNode,
  JsonHandshakeResponse,
  LitNodeClientConfig,
  MultipleAccessControlConditions,
  NodeClientErrorV0,
  NodeClientErrorV1,
  NodeCommandServerKeysResponse,
  NodeErrorV3,
  RejectedNodePromises,
  SendNodeCommand,
  SessionSigsMap,
  SuccessNodePromises,
  SupportedJsonRequests,
} from '@lit-protocol/types';
import { composeLitUrl } from './endpoint-version';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => void;

interface CoreNodeConfig {
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
  hdRootPubkeys: string[];
  latestBlockhash: string;
  lastBlockHashRetrieved: number;
}

interface EpochCache {
  currentNumber: null | number;
  lastUpdateTime: null | number;
}

export type LitNodeClientConfigWithDefaults = Required<
  Pick<
    LitNodeClientConfig,
    | 'bootstrapUrls'
    | 'alertWhenUnauthorized'
    | 'debug'
    | 'connectTimeout'
    | 'checkNodeAttestation'
    | 'litNetwork'
    | 'minNodeCount'
    | 'retryTolerance'
    | 'rpcUrl'
  >
> &
  Partial<Pick<LitNodeClientConfig, 'storageProvider' | 'contractContext'>>;

// On epoch change, we wait this many seconds for the nodes to update to the new epoch before using the new epoch #
const EPOCH_PROPAGATION_DELAY = 30_000;
// This interval is responsible for keeping latest block hash up to date
const NETWORK_SYNC_INTERVAL = 30_000;

export class LitCore {
  config: LitNodeClientConfigWithDefaults = {
    alertWhenUnauthorized: false,
    debug: true,
    connectTimeout: 20000,
    checkNodeAttestation: false,
    litNetwork: 'cayenne', // Default to cayenne network. will be replaced by custom config.
    minNodeCount: 2, // Default value, should be replaced
    bootstrapUrls: [], // Default value, should be replaced
    retryTolerance: {
      timeout: 31_000,
      maxRetryCount: 3,
      interval: 100,
    },
    rpcUrl: null,
  };
  connectedNodes = new Set<string>();
  serverKeys: Record<string, JsonHandshakeResponse> = {};
  ready: boolean = false;
  subnetPubKey: string | null = null;
  networkPubKey: string | null = null;
  networkPubKeySet: string | null = null;
  hdRootPubkeys: string[] | null = null;
  latestBlockhash: string | null = null;
  lastBlockHashRetrieved: number | null = null;
  private _networkSyncInterval: ReturnType<typeof setInterval> | null = null;
  private _epochUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
  private _stakingContract: ethers.Contract | null = null;
  private _stakingContractListener: null | Listener = null;
  private _connectingPromise: null | Promise<void> = null;
  private _epochCache: EpochCache = {
    currentNumber: null,
    lastUpdateTime: null,
  };

  // ========== Constructor ==========
  constructor(config: LitNodeClientConfig | CustomNetwork) {
    // Initialize default config based on litNetwork
    switch (config?.litNetwork) {
      case LitNetwork.Cayenne:
        this.config = {
          ...this.config,
          ...config,
        };
        break;
      case LitNetwork.Manzano:
        this.config = {
          ...this.config,
          checkNodeAttestation: true,
          ...config,
        };
        break;
      case LitNetwork.Habanero:
        this.config = {
          ...this.config,
          checkNodeAttestation: true,
          ...config,
        };
        break;
      default:
        // Probably `custom` or `localhost`
        this.config = {
          ...this.config,
          ...config,
        };
    }

    // -- set bootstrapUrls to match the network litNetwork unless it's set to custom
    this.#setCustomBootstrapUrls();

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
        'localstorage api not found, injecting persistence instance found in config'
      );
      // using Object defineProperty in order to set a property previously defined as readonly.
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
        'Looks like you are running in NodeJS and did not provide a storage provider, your sessions will not be cached'
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
   * specified Lit network.
   *
   * It validates these values and updates the client's
   * configuration accordingly.
   *
   * It also stashes a handle on the Staking Contract so that we can use it for polling for epoch-related state changes
   *
   * @throws Will throw an error if the minimum node count is invalid or if
   *         the bootstrap URLs array is empty.
   * @returns {Promise<void>} A promise that resolves when the configuration is updated.
   */
  setNewConfig = async (): Promise<void> => {
    if (
      this.config.litNetwork === LitNetwork.Manzano ||
      this.config.litNetwork === LitNetwork.Habanero ||
      this.config.litNetwork === LitNetwork.Cayenne
    ) {
      const minNodeCount = await LitContracts.getMinNodeCount(
        this.config.litNetwork
      );
      const bootstrapUrls = await LitContracts.getValidators(
        this.config.litNetwork
      );

      // Handle on staking contract is used to monitor epoch/validator changes
      this._stakingContract = await LitContracts.getStakingContract(
        this.config.litNetwork
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
    } else if (
      this.config.litNetwork === LitNetwork.Custom &&
      this.config.bootstrapUrls.length < 1
    ) {
      log('using custom contracts: ', this.config.contractContext);

      const minNodeCount = await LitContracts.getMinNodeCount(
        this.config.litNetwork,
        this.config.contractContext
      );

      const bootstrapUrls = await LitContracts.getValidators(
        this.config.litNetwork,
        this.config.contractContext
      );

      // Handle on staking contract is used to monitor epoch/validator changes
      this._stakingContract = await LitContracts.getStakingContract(
        this.config.litNetwork,
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
    } else if (
      this.config.litNetwork === LitNetwork.Custom &&
      this.config.bootstrapUrls.length >= 1 &&
      this.config.rpcUrl
    ) {
      log('Using custom bootstrap urls:', this.config.bootstrapUrls);

      // const provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);

      const minNodeCount = await LitContracts.getMinNodeCount(
        this.config.litNetwork,
        this.config.contractContext,
        this.config.rpcUrl!
      );
      this.config.minNodeCount = parseInt(minNodeCount, 10);

      const bootstrapUrls = await LitContracts.getValidators(
        this.config.litNetwork,
        this.config.contractContext,
        this.config.rpcUrl!
      );
      this.config.bootstrapUrls = bootstrapUrls;

      this._stakingContract = await LitContracts.getStakingContract(
        this.config.litNetwork,
        this.config.contractContext,
        this.config.rpcUrl!
      );
    } else {
      return throwError({
        message:
          'Unsuported network has been provided please use a "litNetwork" option which is supported ("cayenne", "habanero", "manzano")',
        errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
        errorCode: LIT_ERROR.INVALID_PARAM_TYPE.code,
      });
    }
  };

  /** Schedule an update to the current epoch number for EPOCH_PROPAGATION_DELAY seconds from now
   * We don't immediately update this value on `NextValidatorSetLocked` state changes because we want to give the nodes
   * a few seconds to update to the new epoch before we start sending the new epoch number with requests
   *
   * This function should only be called as a result of a rare state change (`NextValidatorSetLocked`)
   * So we don't debounce setting the timeout handler.
   * @private
   */
  private _scheduleEpochNumberUpdate() {
    if (this._epochUpdateTimeout) {
      clearTimeout(this._epochUpdateTimeout);
    }

    this._epochUpdateTimeout = setTimeout(async () => {
      try {
        this.currentEpochNumber = await this.fetchCurrentEpochNumber();
      } catch (e) {
        // Don't let errors here bubble up to be unhandle rejections in the runtime!
        logError('Error while attempting to fetch current epoch number');
      }
    }, EPOCH_PROPAGATION_DELAY);

    // If nothing else is pending, don't keep node process open just for this timer to fire!
    // unref doesn't exist in the browser; guard it :)
    if (
      this._epochUpdateTimeout.unref &&
      typeof this._epochUpdateTimeout.unref === 'function'
    ) {
      this._epochUpdateTimeout.unref();
    }
  }
  private async _handleStakingContractStateChange(state: StakingStates) {
    log(`New state detected: "${state}"`);

    if (state === StakingStates.NextValidatorSetLocked) {
      // We always want to track the most recent epoch number on _all_ networks
      this._scheduleEpochNumberUpdate();

      if (
        this.config.litNetwork === LitNetwork.Manzano ||
        this.config.litNetwork === LitNetwork.Habanero ||
        this.config.litNetwork === LitNetwork.Custom
      ) {
        // But we don't need to handle node urls changing on Cayenne, since it is static
        try {
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
            // check if the node sets are non-matching and re-connect if they do not.
            /*
                TODO: This covers *most* cases where a node may come in or out of the active
                set which we will need to re attest to the execution environments.
                However, the sdk currently does not know if there is an active network operation pending.
                Such that the state when the request was sent will now mutate when the response is sent back.
                The sdk should be able to understand its current execution environment and wait on an active
                network request to the previous epoch's node set before changing over.
              */
            log(
              'Active validator sets changed, new validators ',
              delta,
              'starting node connection'
            );
          }

          await this.connect();
        } catch (err: unknown) {
          // FIXME: We should emit an error event so that consumers know that we are de-synced and can connect() again
          // But for now, our every-30-second network sync will fix things in at most 30s from now.
          // this.ready = false; Should we assume core is invalid if we encountered errors refreshing from an epoch change?
          const { message = '' } = err as
            | Error
            | NodeClientErrorV0
            | NodeClientErrorV1;
          logError(
            'Error while attempting to reconnect to nodes after epoch transition:',
            message
          );
        }
      }
    }
  }

  /**
   * Sets up a listener to detect state changes (new epochs) in the staking contract.
   * When a new epoch is detected, it triggers the `setNewConfig` function to update
   * the client's configuration based on the new state of the network. This ensures
   * that the client's configuration is always in sync with the current state of the
   * staking contract.
   *
   * @returns { void }
   */
  #listenForNewEpoch(): void {
    // Check if we've already set up the listener to avoid duplicates
    if (this._stakingContractListener) {
      // Already listening, do nothing
      return;
    }

    if (this._stakingContract) {
      log(
        'listening for state change on staking contract: ',
        this._stakingContract.address
      );

      // Stash a function instance, because its identity must be consistent for '.off()' usage to work later
      this._stakingContractListener = (state: StakingStates) => {
        // Intentionally not return or await; Listeners are _not async_
        this._handleStakingContractStateChange(state);
      };
      this._stakingContract.on('StateChanged', this._stakingContractListener);
    }
  }

  /**
   *  Stops internal listeners/polling that refresh network state and watch for epoch changes.
   *  Removes global objects created internally
   */
  async disconnect() {
    unloadModules();

    this._stopListeningForNewEpoch();
    this._stopNetworkPolling();
    if (globalThis.litConfig) delete globalThis.litConfig;
  }

  protected _stopNetworkPolling() {
    if (this._networkSyncInterval) {
      clearInterval(this._networkSyncInterval);
      this._networkSyncInterval = null;
    }
  }

  protected _stopListeningForNewEpoch() {
    if (this._stakingContract && this._stakingContractListener) {
      this._stakingContract.off('StateChanged', this._stakingContractListener);
      this._stakingContractListener = null;
    }
  }

  /**
   *
   * Set bootstrapUrls to match the network litNetwork unless it's set to custom
   *
   * @returns { void }
   *
   */
  #setCustomBootstrapUrls = (): void => {
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
   * Return the latest blockhash from the nodes
   * @returns { Promise<string> } latest blockhash
   */
  getLatestBlockhash = async (): Promise<string> => {
    await this.connect();

    if (!this.latestBlockhash) {
      throw new Error(
        `latestBlockhash is not available. Received: "${this.latestBlockhash}"`
      );
    }

    return this.latestBlockhash;
  };

  /**
   *
   * Connect to the LIT nodes
   *
   * @returns { Promise } A promise that resolves when the nodes are connected.
   *
   */
  async connect(): Promise<void> {
    // If we have never connected on this client instance first load WASM modules.
    if (!this.ready) {
      await loadModules();
    }

    // Ensure that multiple closely timed calls to `connect()` don't result in concurrent connect() operations being run
    if (this._connectingPromise) {
      return this._connectingPromise;
    }

    this._connectingPromise = this._connect();

    await this._connectingPromise.finally(() => {
      this._connectingPromise = null;
    });
  }

  private async _connect() {
    // Ensure an ill-timed epoch change event doesn't trigger concurrent config changes while we're already doing that
    this._stopListeningForNewEpoch();
    // Ensure we don't fire an existing network sync poll handler while we're in the midst of connecting anyway
    this._stopNetworkPolling();

    await this.setNewConfig();

    // Already scheduled update for current epoch number (due to a recent epoch change)
    // Skip setting it right now, because we haven't waited long enough for nodes to propagate the new epoch
    if (!this._epochUpdateTimeout) {
      this.currentEpochNumber = await this.fetchCurrentEpochNumber();
    }

    // -- handshake with each node.  Note that if we've previously initialized successfully, but this call fails,
    // core will remain useable but with the existing set of `connectedNodes` and `serverKeys`.
    const { connectedNodes, serverKeys, coreNodeConfig } =
      await this._runHandshakeWithBootstrapUrls();
    Object.assign(this, { ...coreNodeConfig, connectedNodes, serverKeys });

    this.#scheduleNetworkSync();
    this.#listenForNewEpoch();

    // FIXME: don't create global singleton; multiple instances of `core` should not all write to global
    // @ts-expect-error typeof globalThis is not defined. We're going to get rid of the global soon.
    globalThis.litNodeClient = this;
    this.ready = true;

    log(`🔥 lit is ready. "litNodeClient" variable is ready to use globally.`);
    log('current network config', {
      networkPubkey: this.networkPubKey,
      networkPubKeySet: this.networkPubKeySet,
      hdRootPubkeys: this.hdRootPubkeys,
      subnetPubkey: this.subnetPubKey,
      latestBlockhash: this.latestBlockhash,
    });

    // browser only
    if (isBrowser()) {
      document.dispatchEvent(new Event('lit-ready'));
    }
  }

  private async handshakeAndVerifyNodeAttestation({
    url,
    requestId,
  }: {
    url: string;
    requestId: string;
  }): Promise<JsonHandshakeResponse> {
    const challenge = this.getRandomHexString(64);

    const handshakeResult = await this.#handshakeWithNode(
      { url, challenge },
      requestId
    );

    const keys: JsonHandshakeResponse = {
      serverPubKey: handshakeResult.serverPublicKey,
      subnetPubKey: handshakeResult.subnetPublicKey,
      networkPubKey: handshakeResult.networkPublicKey,
      networkPubKeySet: handshakeResult.networkPublicKeySet,
      hdRootPubkeys: handshakeResult.hdRootPubkeys,
      latestBlockhash: handshakeResult.latestBlockhash,
    };

    // Nodes that have just bootstrapped will not have negotiated their keys, yet
    // They will return ERR for those values until they reach consensus

    // Note that if node attestation checks are disabled or checkSevSnpAttestation() succeeds, we will still track the
    // node, even though its keys may be "ERR".
    // Should we really track servers with ERR as keys?
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

    log(`Handshake with ${url} returned keys: `, keys);
    if (!keys.latestBlockhash) {
      logErrorWithRequestId(
        requestId,
        `Error getting latest blockhash from the node ${url}.`
      );
    }

    if (
      this.config.checkNodeAttestation ||
      this.config.litNetwork === LitNetwork.Manzano ||
      this.config.litNetwork === LitNetwork.Habanero
    ) {
      const attestation = handshakeResult.attestation;

      if (!attestation) {
        throwError({
          message: `Missing attestation in handshake response from ${url}`,
          errorKind: LIT_ERROR.INVALID_NODE_ATTESTATION.kind,
          errorCode: LIT_ERROR.INVALID_NODE_ATTESTATION.name,
        });
      }

      // actually verify the attestation by checking the signature against AMD certs
      log('Checking attestation against amd certs...');

      try {
        // ensure we won't try to use a node with an invalid attestation response
        await checkSevSnpAttestation(attestation, challenge, url);
        log(`Lit Node Attestation verified for ${url}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        throwError({
          message: `Lit Node Attestation failed verification for ${url} - ${e.message}`,
          errorKind: LIT_ERROR.INVALID_NODE_ATTESTATION.kind,
          errorCode: LIT_ERROR.INVALID_NODE_ATTESTATION.name,
        });
      }
    }

    return keys;
  }

  /** Handshakes with all nodes that are in `bootstrapUrls`
   * @private
   *
   * @returns {Promise<{connectedNodes: Set<string>, serverKeys: {}}>} Returns a set of the urls of nodes that we
   * successfully connected to, an object containing their returned keys, and our 'core' config (most common values for
   * critical values)
   */
  private async _runHandshakeWithBootstrapUrls(): Promise<{
    connectedNodes: Set<string>;
    serverKeys: Record<string, JsonHandshakeResponse>;
    coreNodeConfig: CoreNodeConfig;
  }> {
    // -- handshake with each node
    const requestId: string = this.#getRequestId();

    // track connectedNodes for the new handshake operation
    const connectedNodes = new Set<string>();
    const serverKeys: Record<string, JsonHandshakeResponse> = {};

    if (this.config.bootstrapUrls.length <= 0) {
      throwError({
        message: `Failed to get bootstrapUrls for network ${this.config.litNetwork}`,
        errorKind: LIT_ERROR.INIT_ERROR.kind,
        errorCode: LIT_ERROR.INIT_ERROR.name,
      });
    }

    let timeoutHandle: ReturnType<typeof setTimeout>;
    await Promise.race([
      new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          const msg = `Error: Could not connect to enough nodes after timeout of ${
            this.config.connectTimeout
          }ms.  Could only connect to ${Object.keys(serverKeys).length} of ${
            this.config.minNodeCount
          } required nodes, from ${
            this.config.bootstrapUrls.length
          } possible nodes.  Please check your network connection and try again.  Note that you can control this timeout with the connectTimeout config option which takes milliseconds.`;

          try {
            // TODO: Kludge, replace with standard error construction
            throwError({
              message: msg,
              errorKind: LIT_ERROR.INIT_ERROR.kind,
              errorCode: LIT_ERROR.INIT_ERROR.name,
            });
          } catch (e) {
            reject(e);
          }
        }, this.config.connectTimeout);
      }),
      Promise.all(
        this.config.bootstrapUrls.map(async (url) => {
          serverKeys[url] = await this.handshakeAndVerifyNodeAttestation({
            url,
            requestId,
          });
          connectedNodes.add(url);
        })
      ).finally(() => {
        clearTimeout(timeoutHandle);
      }),
    ]);

    const coreNodeConfig = this._getCoreNodeConfigFromHandshakeResults({
      serverKeys,
      requestId,
    });

    return { connectedNodes, serverKeys, coreNodeConfig };
  }

  private _getCoreNodeConfigFromHandshakeResults({
    serverKeys,
    requestId,
  }: {
    serverKeys: Record<string, JsonHandshakeResponse>;
    requestId: string;
  }): CoreNodeConfig {
    const latestBlockhash = mostCommonString(
      Object.values(serverKeys).map(
        (keysFromSingleNode) => keysFromSingleNode.latestBlockhash
      )
    );

    if (!latestBlockhash) {
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

    // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key
    return {
      subnetPubKey: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.subnetPubKey
        )
      ),
      networkPubKey: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.networkPubKey
        )
      ),
      networkPubKeySet: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.networkPubKeySet
        )
      ),
      hdRootPubkeys: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.hdRootPubkeys
        )
      ),
      latestBlockhash,
      lastBlockHashRetrieved: Date.now(),
    };
  }

  /** Currently, we perform a full sync every 30s, including handshaking with every node
   * However, we also have a state change listener that watches for staking contract state change events, which
   * _should_ be the only time that we need to perform handshakes with every node.
   *
   * However, the current block hash does need to be updated regularly, and we currently update it only when we
   * handshake with every node.
   *
   * We can remove this network sync code entirely if we refactor our code to fetch latest blockhash on-demand.
   * @private
   */
  #scheduleNetworkSync() {
    if (this._networkSyncInterval) {
      clearInterval(this._networkSyncInterval);
    }

    this._networkSyncInterval = setInterval(async () => {
      if (
        !this.lastBlockHashRetrieved ||
        Date.now() - this.lastBlockHashRetrieved >= NETWORK_SYNC_INTERVAL
      ) {
        log(
          'Syncing state for new network context current config: ',
          this.config,
          'current blockhash: ',
          this.lastBlockHashRetrieved
        );
        try {
          await this.connect();
          log(
            'Done syncing state new config: ',
            this.config,
            'new blockhash: ',
            this.lastBlockHashRetrieved
          );
        } catch (err: unknown) {
          // Don't let error from this setInterval handler bubble up to runtime; it'd be an unhandledRejectionError
          const { message = '' } = err as Error | NodeClientErrorV1;
          logError(
            'Error while attempting to refresh nodes to fetch new latestBlockhash:',
            message
          );
        }
      }
    }, NETWORK_SYNC_INTERVAL);
  }

  /**
   *
   * Get a random request ID
   *
   * @returns { string }
   *
   */
  #getRequestId(): string {
    return Math.random().toString(16).slice(2);
  }

  /**
   *
   * Get a random hex string for use as an attestation challenge
   *
   * @returns { string }
   */

  getRandomHexString(size: number): string {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  /**
   * Handshake with Node
   *
   * @param { HandshakeWithNode } params
   * @param { string } requestId
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  #handshakeWithNode = async (
    params: HandshakeWithNode,
    requestId: string
  ): Promise<NodeCommandServerKeysResponse> => {
    const res = await executeWithRetry<NodeCommandServerKeysResponse>(
      async () => {
        // -- get properties from params
        const { url } = params;

        // -- create url with path
        const urlWithPath = composeLitUrl({
          url,
          endpoint: LIT_ENDPOINT.HANDSHAKE,
        });

        log(`handshakeWithNode ${urlWithPath}`);

        const data = {
          clientPublicKey: 'test',
          challenge: params.challenge,
        };

        return await this._sendCommandToNode({
          url: urlWithPath,
          data,
          requestId,
        }).catch((err: NodeErrorV3) => {
          return err;
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_error: any, _requestId: string, isFinal: boolean) => {
        if (!isFinal) {
          logError('an error occurred, attempting to retry');
        }
      },
      this.config.retryTolerance
    );

    return res as NodeCommandServerKeysResponse;
  };

  private async fetchCurrentEpochNumber() {
    if (!this._stakingContract) {
      return throwError({
        message:
          'Unable to fetch current epoch number; no staking contract configured. Did you forget to `connect()`?',
        errorKind: LIT_ERROR.INIT_ERROR.kind,
        errorCode: LIT_ERROR.INIT_ERROR.name,
      });
    }
    try {
      const epoch = await this._stakingContract['epoch']();
      return epoch.number.toNumber() as number;
    } catch (error) {
      return throwError({
        message: `Error getting current epoch number: ${error}`,
        errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
        errorCode: LIT_ERROR.UNKNOWN_ERROR.name,
      });
    }
  }
  get currentEpochNumber(): number | null {
    return this._epochCache.currentNumber;
  }
  set currentEpochNumber(epochNumber: number | null) {
    this._epochCache.currentNumber = epochNumber;
    this._epochCache.lastUpdateTime = Date.now();
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
  protected _sendCommandToNode = async ({
    url,
    data,
    requestId,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SendNodeCommand): Promise<any> => {
    // FIXME: Replace <any> usage with explicit, strongly typed handlers
    data = { ...data, epoch: this.currentEpochNumber };

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
  protected _getNodePromises = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (url: string) => Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>[] => {
    // FIXME: Replace <any> usage with explicit, strongly typed handlers

    const nodePromises = [];

    for (const url of this.connectedNodes) {
      nodePromises.push(callback(url));
    }

    return nodePromises;
  };

  /**
   * Retrieves the session signature for a given URL from the sessionSigs map.
   * Throws an error if sessionSigs is not provided or if the session signature for the URL is not found.
   *
   * @param sessionSigs - The session signatures map.
   * @param url - The URL for which to retrieve the session signature.
   * @returns The session signature for the given URL.
   * @throws An error if sessionSigs is not provided or if the session signature for the URL is not found.
   */
  protected _getSessionSigByUrl = ({
    sessionSigs,
    url,
  }: {
    sessionSigs: SessionSigsMap;
    url: string;
  }): AuthSig => {
    if (!sessionSigs) {
      return throwError({
        message: `You must pass in sessionSigs`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    const sigToPassToNode = sessionSigs[url];

    if (!sessionSigs[url]) {
      throwError({
        message: `You passed sessionSigs but we could not find session sig for node ${url}`,
        errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
        errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
      });
    }

    return sigToPassToNode;
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
   * @param { string } requestId requestId to be logged in case of error
   * @param { number } minNodeCount number of nodes we need valid results from in order to resolve
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
   */
  protected _handleNodePromises = async <T>(
    nodePromises: Promise<T>[],
    requestId: string,
    minNodeCount: number
  ): Promise<SuccessNodePromises<T> | RejectedNodePromises> => {
    async function waitForNSuccessesWithErrors<T>(
      promises: Promise<T>[],
      n: number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<{ successes: T[]; errors: any[] }> {
      let responses = 0;
      const successes: T[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any[] = [];

      return new Promise((resolve) => {
        promises.forEach((promise) => {
          promise
            .then((result) => {
              successes.push(result);
              if (successes.length >= n) {
                // If we've got enough successful responses to continue, resolve immediately even if some are pending
                resolve({ successes, errors });
              }
            })
            .catch((error) => {
              errors.push(error);
            })
            .finally(() => {
              responses++;
              if (responses === promises.length) {
                // In case the total number of successful responses is less than n,
                // resolve what we have when all promises are settled.
                resolve({ successes, errors });
              }
            });
        });
      });
    }

    // -- wait until we've received n responses
    const { successes, errors } = await waitForNSuccessesWithErrors(
      nodePromises,
      minNodeCount
    );

    // console.log(`successes: ${JSON.stringify(successes, null, 2)}`)
    // console.log(`errors: ${JSON.stringify(errors, null, 2)}`)

    // -- case: success (when success responses are more than minNodeCount)
    if (successes.length >= minNodeCount) {
      return {
        success: true,
        values: successes,
      };
    }

    // -- case: if we're here, then we did not succeed.  time to handle and report errors.
    const mostCommonError = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mostCommonString(errors.map((r: any) => JSON.stringify(r)))
    );

    logErrorWithRequestId(
      requestId || '',
      `most common error: ${JSON.stringify(mostCommonError)}`
    );

    return {
      success: false,
      error: mostCommonError,
    };
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
  protected _throwNodeError = (
    res: RejectedNodePromises,
    requestId: string
  ): void => {
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
      formattedAccessControlConditions = accessControlConditions.map((c) =>
        canonicalAccessControlConditionFormatter(c)
      );
      log(
        'formattedAccessControlConditions',
        JSON.stringify(formattedAccessControlConditions)
      );
    } else if (evmContractConditions) {
      formattedEVMContractConditions = evmContractConditions.map((c) =>
        canonicalEVMContractConditionFormatter(c)
      );
      log(
        'formattedEVMContractConditions',
        JSON.stringify(formattedEVMContractConditions)
      );
    } else if (solRpcConditions) {
      // FIXME: ConditionItem is too narrow, or `solRpcConditions` is too wide
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formattedSolRpcConditions = solRpcConditions.map((c: any) =>
        canonicalSolRpcConditionFormatter(c)
      );
      log(
        'formattedSolRpcConditions',
        JSON.stringify(formattedSolRpcConditions)
      );
    } else if (unifiedAccessControlConditions) {
      formattedUnifiedAccessControlConditions =
        unifiedAccessControlConditions.map((c) =>
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
   * Calculates an HD public key from a given keyId
   * The curve type or signature type is assumed to be k256 unless provided
   * @param keyId
   * @param {LIT_CURVE} sigType
   * @returns {string} public key
   */
  computeHDPubKey = (
    keyId: string,
    sigType: LIT_CURVE = LIT_CURVE.EcdsaCaitSith
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
   * These identifiers are specific to each auth method and will derive the public key portion of a pkp which will be persisted
   * when a key is claimed.
   * | Auth Method | User ID | App ID |
   * |:------------|:--------|:-------|
   * | Google OAuth | token `sub` | token `aud` |
   * | Discord OAuth | user id | client app identifier |
   * | Stytch OTP |token `sub` | token `aud`|
   * | Lit Actions | user defined | ipfs cid |
   * *Note* Lit Action claiming uses a different schema than other auth methods
   *
   * @param {string} userId user identifier for the Key Identifier
   * @param {string} appId app identifier for the Key Identifier
   * @param {boolean} isForActionContext should be set for true if using claiming through actions
   *
   * @returns {string} public key of pkp when claimed
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
