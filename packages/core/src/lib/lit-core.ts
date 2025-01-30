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
  CENTRALISATION_BY_NETWORK,
  HTTP,
  HTTPS,
  InitError,
  InvalidArgumentException,
  InvalidEthBlockhash,
  InvalidNodeAttestation,
  InvalidParamType,
  LIT_CURVE,
  LIT_CURVE_VALUES,
  LIT_ENDPOINT,
  LIT_ERROR_CODE,
  LIT_NETWORK,
  LIT_NETWORKS,
  LitNodeClientBadConfigError,
  LitNodeClientNotReadyError,
  LogLevel,
  NetworkError,
  NodeError,
  RPC_URL_BY_NETWORK,
  STAKING_STATES,
  STAKING_STATES_VALUES,
  UnknownError,
  version,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { checkSevSnpAttestation, computeHDPubKey } from '@lit-protocol/crypto';
import {
  bootstrapLogManager,
  isBrowser,
  isNode,
  log,
  logError,
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
  sendRequest,
  setMiscLitConfig,
} from '@lit-protocol/misc';
import {
  AuthSig,
  BlockHashErrorResponse,
  CustomNetwork,
  EpochInfo,
  EthBlockhashInfo,
  FormattedMultipleAccs,
  HandshakeWithNode,
  JsonHandshakeResponse,
  LitNodeClientConfig,
  MultipleAccessControlConditions,
  NodeClientErrorV0,
  NodeClientErrorV1,
  NodeCommandServerKeysResponse,
  NodeSet,
  RejectedNodePromises,
  SendNodeCommand,
  SessionSigsMap,
  SuccessNodePromises,
  SupportedJsonRequests,
} from '@lit-protocol/types';

import { composeLitUrl } from './endpoint-version';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => void;

type providerTest<T> = (
  provider: ethers.providers.JsonRpcProvider
) => Promise<T>;

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
  startTime: null | number;
}

export type LitNodeClientConfigWithDefaults = Required<
  Pick<
    LitNodeClientConfig,
    | 'alertWhenUnauthorized'
    | 'debug'
    | 'connectTimeout'
    | 'checkNodeAttestation'
    | 'litNetwork'
    | 'minNodeCount'
  >
> &
  Partial<
    Pick<LitNodeClientConfig, 'storageProvider' | 'contractContext' | 'rpcUrl'>
  > & {
    bootstrapUrls: string[];
  } & {
    nodeProtocol?: typeof HTTP | typeof HTTPS | null;
  } & {
    nodePrices: { url: string; prices: bigint[] }[]; // eg. <nodeAddress, price[]>
  };

// On epoch change, we wait this many seconds for the nodes to update to the new epoch before using the new epoch #
const EPOCH_PROPAGATION_DELAY = 45_000;
// This interval is responsible for keeping latest block hash up to date
const BLOCKHASH_SYNC_INTERVAL = 30_000;
// When fetching the blockhash from a provider (not lit), we use a 5 minutes old block to ensure the nodes centralized indexer has it
const BLOCKHASH_COUNT_PROVIDER_DELAY = -30; // 30 blocks ago. Eth block are mined every 12s. 30 blocks is 6 minutes, indexer/nodes must have it by now

// Intentionally not including datil-dev here per discussion with Howard
const NETWORKS_REQUIRING_SEV: string[] = [
  LIT_NETWORK.DatilTest,
  LIT_NETWORK.Datil,
];

/**
 * Lowest latency, highest score & privacy enabled listed on https://chainlist.org/
 */
const FALLBACK_RPC_URLS = [
  'https://ethereum-rpc.publicnode.com',
  'https://eth.llamarpc.com',
  'https://eth.drpc.org',
  'https://eth.llamarpc.com',
];

export class LitCore {
  config: LitNodeClientConfigWithDefaults = {
    alertWhenUnauthorized: false,
    debug: true,
    connectTimeout: 20000,
    checkNodeAttestation: false,
    litNetwork: LIT_NETWORK.Custom,
    minNodeCount: 2, // Default value, should be replaced
    bootstrapUrls: [], // Default value, should be replaced
    nodeProtocol: null,
    nodePrices: [],
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
  private _stakingContract: ethers.Contract | null = null;
  private _stakingContractListener: null | Listener = null;
  private _connectingPromise: null | Promise<void> = null;
  private _epochCache: EpochCache = {
    currentNumber: null,
    startTime: null,
  };
  private _blockHashUrl =
    'https://block-indexer.litgateway.com/get_most_recent_valid_block';

  // ========== Constructor ==========
  constructor(config: LitNodeClientConfig | CustomNetwork) {
    if (!(config.litNetwork in LIT_NETWORKS)) {
      const validNetworks = Object.keys(LIT_NETWORKS).join(', ');
      throw new InvalidParamType(
        {},
        'Unsupported network has been provided please use a "litNetwork" option which is supported (%s)',
        validNetworks
      );
    }

    // Initialize default config based on litNetwork
    switch (config?.litNetwork) {
      // Official networks; default value for `checkNodeAttestation` according to network provided.
      case LIT_NETWORK.DatilDev:
        this.config = {
          ...this.config,
          checkNodeAttestation: NETWORKS_REQUIRING_SEV.includes(
            config?.litNetwork
          ),
          ...config,
        };
        break;
      default:
        // `custom`; no opinion about checkNodeAttestation
        this.config = {
          ...this.config,
          ...config,
        };
    }

    // -- set bootstrapUrls to match the network litNetwork unless it's set to custom
    this.setCustomBootstrapUrls();

    // -- set global variables
    setMiscLitConfig(this.config);
    bootstrapLogManager(
      'core',
      this.config.debug ? LogLevel.DEBUG : LogLevel.OFF
    );

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

  getRequestIds = (): Set<string> => {
    return globalThis.logManager.LoggerIds;
  };

  /**
   * Retrieves the validator data including staking contract, epoch, minNodeCount, and bootstrapUrls.
   * @returns An object containing the validator data.
   * @throws Error if minNodeCount is not provided, is less than or equal to 0, or if bootstrapUrls are not available.
   */
  private async _getValidatorData(): Promise<{
    stakingContract: ethers.Contract;
    epochInfo: EpochInfo;
    minNodeCount: number;
    bootstrapUrls: string[];
    nodePrices: { url: string; prices: bigint[] }[];
  }> {
    const {
      stakingContract,
      epochInfo,
      minNodeCount,
      bootstrapUrls,
      nodePrices,
    } = await LitContracts.getConnectionInfo({
      litNetwork: this.config.litNetwork,
      networkContext: this.config.contractContext,
      rpcUrl: this.config.rpcUrl,
      nodeProtocol: this.config.nodeProtocol,
    });

    // Validate minNodeCount
    if (!minNodeCount) {
      throw new InvalidArgumentException(
        {},
        `minimum validator count is %s, which is invalid. Please check your network connection and try again.`,
        minNodeCount
      );
    }

    // Validate bootstrapUrls
    if (!Array.isArray(bootstrapUrls) || bootstrapUrls.length <= 0) {
      throw new InitError(
        {},
        `Failed to get bootstrapUrls for network %s`,
        this.config.litNetwork
      );
    }

    log('[_getValidatorData] epochInfo: ', epochInfo);
    log('[_getValidatorData] minNodeCount: ', minNodeCount);
    log('[_getValidatorData] Bootstrap urls: ', bootstrapUrls);
    log('[_getValidatorData] stakingContract: ', stakingContract.address);

    return {
      stakingContract,
      epochInfo,
      minNodeCount,
      bootstrapUrls,
      nodePrices,
    };
  }

  // ========== Scoped Class Helpers ==========

  /**
   * See rust/lit-node/common/lit-node-testnet/src/validator.rs > threshold for more details
   */
  protected _getThreshold = (): number => {
    return Math.max(3, Math.floor((this.connectedNodes.size * 2) / 3));
  };

  private async _handleStakingContractStateChange(
    state: STAKING_STATES_VALUES
  ) {
    log(`New state detected: "${state}"`);

    const validatorData = await this._getValidatorData();

    if (state === STAKING_STATES.Active) {
      // We always want to track the most recent epoch number on _all_ networks

      this._epochState = await this._fetchCurrentEpochState(
        validatorData.epochInfo
      );

      if (CENTRALISATION_BY_NETWORK[this.config.litNetwork] !== 'centralised') {
        // We don't need to handle node urls changing on centralised networks, since their validator sets are static
        try {
          log(
            'State found to be new validator set locked, checking validator set'
          );
          const existingNodeUrls: string[] = [...this.config.bootstrapUrls];

          const delta: string[] = validatorData.bootstrapUrls.filter((item) =>
            existingNodeUrls.includes(item)
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
   * @returns {Promise<void>} A promise that resolves when the listener is successfully set up.
   */
  private _listenForNewEpoch() {
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
      this._stakingContractListener = (state: STAKING_STATES_VALUES) => {
        // Intentionally not return or await; Listeners are _not async_
        this._handleStakingContractStateChange(state);
      };
      this._stakingContract.on('StateChanged', this._stakingContractListener);
    }
  }

  /**
   * Gets the set of nodes from validator data, transforming bootstrap URLs into NodeSet objects.
   *
   * @returns {Promise<NodeSet[]>} A promise that resolves with an array of NodeSet objects.
   */
  protected _getNodeSet = (bootstrapUrls: string[]): NodeSet[] => {
    return bootstrapUrls.map((url) => {
      // remove protocol from the url as we only need ip:port
      const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '') as string;

      return {
        socketAddress: urlWithoutProtocol,

        // FIXME: This is a placeholder value. Brendon said: It's not used anymore in the nodes, but leaving it as we may need it in the future.
        value: 1,
      };
    });
  };

  /**
   *  Stops internal listeners/polling that refresh network state and watch for epoch changes.
   *  Removes global objects created internally
   */
  async disconnect() {
    this.ready = false;

    this._stopListeningForNewEpoch();
    // this._stopNetworkPolling();
    setMiscLitConfig(undefined);
  }

  // _stopNetworkPolling() {
  //   if (this._networkSyncInterval) {
  //     clearInterval(this._networkSyncInterval);
  //     this._networkSyncInterval = null;
  //   }
  // }
  _stopListeningForNewEpoch() {
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
  setCustomBootstrapUrls = (): void => {
    // -- validate
    if (this.config.litNetwork === LIT_NETWORK.Custom) return;

    // -- execute
    const hasNetwork: boolean = this.config.litNetwork in LIT_NETWORKS;

    if (!hasNetwork) {
      // network not found, report error
      throw new LitNodeClientBadConfigError(
        {},
        'the litNetwork specified in the LitNodeClient config not found in LIT_NETWORKS'
      );
    }

    this.config.bootstrapUrls = LIT_NETWORKS[this.config.litNetwork];
  };

  /**
   * Return the latest blockhash from the nodes
   * @returns { Promise<string> } latest blockhash
   */
  getLatestBlockhash = async (): Promise<string> => {
    await this._syncBlockhash();
    if (!this.latestBlockhash) {
      throw new InvalidEthBlockhash(
        {},
        `latestBlockhash is not available. Received: "%s"`,
        this.latestBlockhash
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
    // this._stopNetworkPolling();

    // Initialize a contractContext if we were not given one; this allows interaction against the staking contract
    // to be handled locally from then on
    if (!this.config.contractContext) {
      this.config.contractContext = await LitContracts.getContractAddresses(
        this.config.litNetwork,
        new ethers.providers.StaticJsonRpcProvider({
          url: this.config.rpcUrl || RPC_URL_BY_NETWORK[this.config.litNetwork],
          skipFetchSetup: true,
        })
      );
    } else if (
      !this.config.contractContext.Staking &&
      !this.config.contractContext.resolverAddress
    ) {
      throw new InitError(
        {
          info: {
            contractContext: this.config.contractContext,
            litNetwork: this.config.litNetwork,
            rpcUrl: this.config.rpcUrl,
          },
        },
        'The provided contractContext was missing the "Staking" contract'
      );
    }

    if (this.config.contractContext) {
      const logAddresses = Object.entries(this.config.contractContext).reduce(
        (output, [key, val]) => {
          // @ts-expect-error since the object hash returned by `getContractAddresses` is `any`, we have no types here
          output[key] = val.address;
          return output;
        },
        {}
      );
      if (this.config.litNetwork === LIT_NETWORK.Custom) {
        log('using custom contracts: ', logAddresses);
      }
    }

    // Re-use staking contract instance from previous connect() executions that succeeded to improve performance
    // noinspection ES6MissingAwait - intentionally not `awaiting` so we can run this in parallel below
    const validatorData = await this._getValidatorData();

    this._stakingContract = validatorData.stakingContract;
    this.config.minNodeCount = validatorData.minNodeCount;
    this.config.bootstrapUrls = validatorData.bootstrapUrls;
    this.config.nodePrices = validatorData.nodePrices;

    this._epochState = await this._fetchCurrentEpochState(
      validatorData.epochInfo
    );

    // -- handshake with each node.  Note that if we've previously initialized successfully, but this call fails,
    // core will remain useable but with the existing set of `connectedNodes` and `serverKeys`.
    const { connectedNodes, serverKeys, coreNodeConfig } =
      await this._runHandshakeWithBootstrapUrls();
    Object.assign(this, { ...coreNodeConfig, connectedNodes, serverKeys });

    // this._scheduleNetworkSync();
    this._listenForNewEpoch();

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

  private async _handshakeAndVerifyNodeAttestation({
    url,
    requestId,
  }: {
    url: string;
    requestId: string;
  }): Promise<JsonHandshakeResponse> {
    const challenge = this.getRandomHexString(64);

    const handshakeResult = await this.handshakeWithNode(
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

    // We force SEV checks on some networks even if the caller attempts to construct the client with them disabled
    if (
      this.config.checkNodeAttestation ||
      NETWORKS_REQUIRING_SEV.includes(this.config.litNetwork)
    ) {
      const attestation = handshakeResult.attestation;

      if (!attestation) {
        throw new InvalidNodeAttestation(
          {},
          `Missing attestation in handshake response from %s`,
          url
        );
      }

      // actually verify the attestation by checking the signature against AMD certs
      log('Checking attestation against amd certs...');

      try {
        // ensure we won't try to use a node with an invalid attestation response
        await checkSevSnpAttestation(attestation, challenge, url);
        log(`Lit Node Attestation verified for ${url}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        throw new InvalidNodeAttestation(
          {
            cause: e,
          },
          `Lit Node Attestation failed verification for %s - %s`,
          url,
          e.message
        );
      }
    } else if (this.config.litNetwork === LIT_NETWORK.Custom) {
      log(
        `Node attestation SEV verification is disabled. You must explicitly set "checkNodeAttestation" to true when using 'custom' network`
      );
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
    const requestId: string = this._getNewRequestId();

    // track connectedNodes for the new handshake operation
    const connectedNodes = new Set<string>();
    const serverKeys: Record<string, JsonHandshakeResponse> = {};

    let timeoutHandle: ReturnType<typeof setTimeout>;
    await Promise.race([
      new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          const msg = `Error: Could not handshake with nodes after timeout of ${
            this.config.connectTimeout
          }ms. Could only connect to ${Object.keys(serverKeys).length} of ${
            this.config.bootstrapUrls.length
          } nodes. Please check your network connection and try again. Note that you can control this timeout with the connectTimeout config option which takes milliseconds.`;

          try {
            throw new InitError({}, msg);
          } catch (e) {
            logErrorWithRequestId(requestId, e);
            reject(e);
          }
        }, this.config.connectTimeout);
      }),
      Promise.all(
        this.config.bootstrapUrls.map(async (url) => {
          serverKeys[url] = await this._handshakeAndVerifyNodeAttestation({
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

      throw new InvalidEthBlockhash(
        {
          info: {
            requestId,
          },
        },
        `latestBlockhash is not available. Received: "%s"`,
        latestBlockhash
      );
    }

    // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key
    return {
      subnetPubKey: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.subnetPubKey
        )
      )!,
      networkPubKey: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.networkPubKey
        )
      )!,
      networkPubKeySet: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.networkPubKeySet
        )
      )!,
      hdRootPubkeys: mostCommonString(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.hdRootPubkeys
        )
      )!,
      latestBlockhash,
      lastBlockHashRetrieved: Date.now(),
    };
  }

  private _getProviderWithFallback = async <T>(
    providerTest: providerTest<T>
  ): Promise<{
    provider: ethers.providers.JsonRpcProvider;
    testResult: T;
  } | null> => {
    for (const url of FALLBACK_RPC_URLS) {
      try {
        const provider = new ethers.providers.JsonRpcProvider({
          url: url,

          // https://docs.ethers.org/v5/api/utils/web/#ConnectionInfo
          timeout: 60000,
        });
        const testResult = await providerTest(provider); // Check to see if the provider is working
        return {
          provider,
          testResult,
        };
      } catch (error) {
        logError(`RPC URL failed: ${url}`);
      }
    }
    return null;
  };

  /**
   * Fetches the latest block hash and log any errors that are returned
   * Nodes will accept any blockhash in the last 30 days but use the latest 10 as challenges for webauthn
   * Note: last blockhash from providers might not be propagated to the nodes yet, so we need to use a slightly older one
   * @returns void
   */
  private async _syncBlockhash() {
    const currentTime = Date.now();
    const blockHashValidityDuration = BLOCKHASH_SYNC_INTERVAL;

    if (
      this.latestBlockhash &&
      this.lastBlockHashRetrieved &&
      currentTime - this.lastBlockHashRetrieved < blockHashValidityDuration
    ) {
      log('Blockhash is still valid. No need to sync.');
      return;
    }

    log(
      'Syncing state for new blockhash ',
      'current blockhash: ',
      this.latestBlockhash
    );

    try {
      // This fetches from the lit propagation service so nodes will always have it
      const resp = await fetch(this._blockHashUrl);
      // If the blockhash retrieval failed, throw an error to trigger fallback in catch block
      if (!resp.ok) {
        throw new NetworkError(
          {
            responseResult: resp.ok,
            responseStatus: resp.status,
          },
          `Error getting latest blockhash from ${this._blockHashUrl}. Received: "${resp.status}"`
        );
      }

      const blockHashBody: EthBlockhashInfo = await resp.json();
      const { blockhash, timestamp } = blockHashBody;

      // If the blockhash retrieval does not have the required fields, throw an error to trigger fallback in catch block
      if (!blockhash || !timestamp) {
        throw new NetworkError(
          {
            responseResult: resp.ok,
            blockHashBody,
          },
          `Error getting latest blockhash from block indexer. Received: "${blockHashBody}"`
        );
      }

      this.latestBlockhash = blockHashBody.blockhash;
      this.lastBlockHashRetrieved = parseInt(timestamp) * 1000;
      log('Done syncing state new blockhash: ', this.latestBlockhash);
    } catch (error: unknown) {
      const err = error as BlockHashErrorResponse | Error;

      logError(
        'Error while attempting to fetch new latestBlockhash:',
        err instanceof Error ? err.message : err.messages,
        'Reason: ',
        err instanceof Error ? err : err.reason
      );

      log(
        'Attempting to fetch blockhash manually using ethers with fallback RPC URLs...'
      );
      const { testResult } =
        (await this._getProviderWithFallback<ethers.providers.Block>(
          // We use a previous block to avoid nodes not having received the latest block yet
          (provider) => provider.getBlock(BLOCKHASH_COUNT_PROVIDER_DELAY)
        )) || {};

      if (!testResult || !testResult.hash) {
        logError('All fallback RPC URLs failed. Unable to retrieve blockhash.');
        return;
      }

      try {
        this.latestBlockhash = testResult.hash;
        this.lastBlockHashRetrieved = testResult.timestamp;
        log(
          'Successfully retrieved blockhash manually: ',
          this.latestBlockhash
        );
      } catch (ethersError) {
        logError('Failed to manually retrieve blockhash using ethers');
      }
    }
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
  // private _scheduleNetworkSync() {
  //   if (this._networkSyncInterval) {
  //     clearInterval(this._networkSyncInterval);
  //   }

  //   this._networkSyncInterval = setInterval(async () => {
  //     if (
  //       !this.lastBlockHashRetrieved ||
  //       Date.now() - this.lastBlockHashRetrieved >= BLOCKHASH_SYNC_INTERVAL
  //     ) {
  //       await this._syncBlockhash();
  //     }
  //   }, BLOCKHASH_SYNC_INTERVAL);
  // }

  /**
   *
   * Get a new random request ID
   *
   * @returns { string }
   *
   */
  protected _getNewRequestId(): string {
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
   * Handshake with Node
   *
   * @param { HandshakeWithNode } params
   * @param { string } requestId
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
    const urlWithPath = composeLitUrl({
      url,
      endpoint: LIT_ENDPOINT.HANDSHAKE,
    });

    log(`handshakeWithNode ${urlWithPath}`);

    const data = {
      clientPublicKey: 'test',
      challenge: params.challenge,
    };

    return await this.sendCommandToNode({
      url: urlWithPath,
      data,
      requestId,
    });
  };

  private async _fetchCurrentEpochState(
    epochInfo?: EpochInfo
  ): Promise<Pick<EpochCache, 'startTime' | 'currentNumber'>> {
    if (!this._stakingContract) {
      throw new InitError(
        {},
        'Unable to fetch current epoch number; no staking contract configured. Did you forget to `connect()`?'
      );
    }

    if (!epochInfo) {
      log(
        'epochinfo not found. Not a problem, fetching current epoch state from staking contract'
      );
      try {
        const validatorData = await this._getValidatorData();
        epochInfo = validatorData.epochInfo;
      } catch (error) {
        throw new UnknownError(
          {},
          '[_fetchCurrentEpochNumber] Error getting current epoch number: %s',
          error
        );
      }
    }

    // when we transition to the new epoch, we don't store the start time.  but we
    // set the endTime to the current timestamp + epochLength.
    // by reversing this and subtracting epochLength from the endTime, we get the start time
    const startTime = epochInfo.endTime - epochInfo.epochLength;

    return {
      currentNumber: epochInfo.number,
      startTime,
    };
  }

  get currentEpochNumber(): number | null {
    // if the epoch started less than 15s ago (aka EPOCH_PROPAGATION_DELAY), use the previous epoch number
    // this gives the nodes time to sync with the chain and see the new epoch before we try to use it
    if (
      this._epochCache.currentNumber &&
      this._epochCache.startTime &&
      Math.floor(Date.now() / 1000) <
        this._epochCache.startTime +
          Math.floor(EPOCH_PROPAGATION_DELAY / 1000) &&
      this._epochCache.currentNumber >= 3 // FIXME: Why this check?
    ) {
      return this._epochCache.currentNumber - 1;
    }
    return this._epochCache.currentNumber;
  }

  private set _epochState({
    currentNumber,
    startTime,
  }: Pick<EpochCache, 'startTime' | 'currentNumber'>) {
    this._epochCache.currentNumber = currentNumber;
    this._epochCache.startTime = startTime;
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
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SendNodeCommand): Promise<any> => {
    // FIXME: Replace <any> usage with explicit, strongly typed handlers
    data = { ...data, epoch: this.currentEpochNumber };

    // If there is a `sessionSigs' object in the params remove before sending the request;
    // this line has been added as a catch all to prevent sending with the request
    if (data.sessionSigs) {
      delete data.sessionSigs;
    }

    logWithRequestId(
      requestId,
      `sendCommandToNode with url ${url} and data`,
      data
    );

    const req: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
   * @param { string[] } nodeUrls URLs of nodes to get promises for
   * @param { function } callback
   *
   * @returns { Array<Promise<any>> }
   *
   */
  getNodePromises = (
    nodeUrls: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (url: string) => Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>[] => {
    // FIXME: Replace <any> usage with explicit, strongly typed handlers

    const nodePromises = [];

    for (const url of nodeUrls) {
      nodePromises.push(callback(url));
    }

    return nodePromises;
  };

  getRandomNodePromise(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (url: string) => Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>[] {
    const randomNodeIndex = Math.floor(
      Math.random() * this.connectedNodes.size
    );

    const nodeUrlsArr = Array.from(this.connectedNodes);
    return [callback(nodeUrlsArr[randomNodeIndex])];
  }

  /**
   * Retrieves the session signature for a given URL from the sessionSigs map.
   * Throws an error if sessionSigs is not provided or if the session signature for the URL is not found.
   *
   * @param sessionSigs - The session signatures map.
   * @param url - The URL for which to retrieve the session signature.
   * @returns The session signature for the given URL.
   * @throws An error if sessionSigs is not provided or if the session signature for the URL is not found.
   */
  getSessionSigByUrl = ({
    sessionSigs,
    url,
  }: {
    sessionSigs: SessionSigsMap;
    url: string;
  }): AuthSig => {
    if (!sessionSigs) {
      throw new InvalidArgumentException(
        {},
        'You must pass in sessionSigs. Received: %s',
        sessionSigs
      );
    }

    const sigToPassToNode = sessionSigs[url];

    if (!sessionSigs[url]) {
      throw new InvalidArgumentException(
        {},
        'You passed sessionSigs but we could not find session sig for node %s',
        url
      );
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
  handleNodePromises = async <T>(
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

    if (errors.length === 0) {
      throw new UnknownError(
        {
          info: {
            requestId,
            successes,
            errors,
            minNodeCount,
            threshold: this._getThreshold(),
            numPromises: nodePromises.length,
          },
        },
        `Not enough responses from nodes, but no errors either; probably incorrect minNodeCount or threshold."`
      );
    }

    // TODO Likely a good use case for MultiError
    // -- case: if we're here, then we did not succeed.  time to handle and report errors.
    const mostCommonError = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mostCommonString(errors.map((r: any) => JSON.stringify(r)))!
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
   * Throw node error
   *
   * @param { RejectedNodePromises } res
   * @param { string } requestId
   *
   * @returns { never }
   *
   */
  _throwNodeError = (res: RejectedNodePromises, requestId: string): never => {
    if (res.error) {
      if (
        ((res.error.errorCode &&
          res.error.errorCode === LIT_ERROR_CODE.NODE_NOT_AUTHORIZED) ||
          res.error.errorCode === 'not_authorized') &&
        this.config.alertWhenUnauthorized
      ) {
        log('You are not authorized to access this content');
      }

      throw new NodeError(
        {
          info: {
            requestId,
            errorCode: res.error.errorCode,
            errorKind: res.error.errorKind,
            status: res.error.status,
          },
        },
        `There was an error getting the signing shares from the nodes: ${res.error.message}`
      );
    } else {
      throw new UnknownError(
        {
          info: {
            requestId,
          },
        },
        `There was an error getting the signing shares from the nodes`,
        JSON.stringify(res)
      );
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
   * @param {LIT_CURVE_VALUES} sigType
   * @returns {string} public key
   */
  computeHDPubKey = async (
    keyId: string,
    sigType: LIT_CURVE_VALUES = LIT_CURVE.EcdsaCaitSith
  ): Promise<string> => {
    if (!this.hdRootPubkeys) {
      logError('root public keys not found, have you connected to the nodes?');
      throw new LitNodeClientNotReadyError(
        {},
        'root public keys not found, have you connected to the nodes?'
      );
    }
    return await computeHDPubKey(
      this.hdRootPubkeys as string[],
      keyId,
      sigType
    );
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
