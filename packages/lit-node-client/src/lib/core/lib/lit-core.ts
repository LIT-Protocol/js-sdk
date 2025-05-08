import { ethers } from 'ethers';

import {
  CENTRALISATION_BY_NETWORK,
  Environment,
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
  LitNodeClientNotReadyError,
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
import { getChildLogger, Logger } from '@lit-protocol/logger';
import {
  AuthSig,
  CustomNetwork,
  EpochInfo,
  JsonHandshakeResponse,
  LitNodeClientConfig,
  NodeSet,
  RejectedNodePromises,
  SessionSigsMap,
  SuccessNodePromises,
} from '@lit-protocol/types';

import {
  createEvmEventState,
  EventState,
} from '../../state-manager/createEvmEventState';
import {
  createRefreshedValue,
  RefreshedValue,
} from '../../state-manager/createRefreshedValue';
import { fetchBlockchainData } from '../../state-manager/fetchBlockchainData';
import { composeLitUrl } from './helpers/endpoint-version';
import { mostCommonValue } from './helpers/most-common-value';
import {
  CoreNodeConfig,
  EpochCache,
  HandshakeWithNode,
  NodeCommandServerKeysResponse,
  providerTest,
  SendNodeCommand,
} from './types';
import { calculateEffectiveEpochNumber } from './helpers/calculateEffectiveEpochNumber';
import { areStringArraysDifferent } from './helpers/areStringArraysDifferent';

// ==================== CONSTANTS ====================
const MINIMUM_THRESHOLD = 3;

// On epoch change, we wait this many seconds for the nodes to update to the new epoch before using the new epoch #
// const EPOCH_PROPAGATION_DELAY = 45_000;
// This interval is responsible for keeping latest block hash up to date
const BLOCKHASH_SYNC_INTERVAL = 30_000;
// When fetching the blockhash from a provider (not lit), we use a 5 minutes old block to ensure the nodes centralized indexer has it

// _sycnBlockhash was removed
// const BLOCKHASH_COUNT_PROVIDER_DELAY = -30; // 30 blocks ago. Eth block are mined every 12s. 30 blocks is 6 minutes, indexer/nodes must have it by now

// Intentionally not including datil-dev here per discussion with Howard
const NETWORKS_REQUIRING_SEV: string[] = [
  // LIT_NETWORK.NagaTest, // CHANGE: We need to add this
  // LIT_NETWORK.Naga, // CHANGE: We need to add this
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
// ==================================================

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
  };

// Use the values from the LIT_NETWORK enum/object for the type
// This assumes LIT_NETWORK is an object like { NagaDev: 'naga-dev', Custom: 'custom' }
// and it has been exported with `as const` or its values are otherwise string literals.
export type LitNetworkValue = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

export class LitCore {
  private readonly _coreLogger: Logger;
  config: LitNodeClientConfigWithDefaults = {
    alertWhenUnauthorized: false,
    debug: true,
    connectTimeout: 20000,
    checkNodeAttestation: false,
    litNetwork: LIT_NETWORK.Custom, // LIT_NETWORK.Custom is a string literal, e.g., 'custom'
    minNodeCount: 2,
    bootstrapUrls: [],
    nodeProtocol: null,
  };
  connectedNodes = new Set<string>();
  serverKeys: Record<string, JsonHandshakeResponse> = {};
  ready: boolean = false;
  subnetPubKey: string | null = null;
  networkPubKey: string | null = null;
  networkPubKeySet: string | null = null;
  hdRootPubkeys: string[] | null = null;
  // latestBlockhash: string | null = null;
  lastBlockHashRetrieved: number | null = null;
  private _stakingContract: ethers.Contract | null = null;
  private _stakingContractStateInstance: EventState<STAKING_STATES_VALUES | null> | null =
    null;
  private _connectingPromise: null | Promise<void> = null;
  public _epochCache: EpochCache = {
    currentNumber: null,
    startTime: null,
  };
  // private _blockHashUrl =
  //   'https://block-indexer.litgateway.com/get_most_recent_valid_block';

  private refreshedBlockhashManager: RefreshedValue<string>; // Declare as a class property

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

    this.refreshedBlockhashManager = createRefreshedValue<string>({
      fetch: fetchBlockchainData,
      ttlMs: BLOCKHASH_SYNC_INTERVAL,
      initialValue: '',
    });

    // Initialize default config based on litNetwork
    switch (config?.litNetwork) {
      // Official networks; default value for `checkNodeAttestation` according to network provided.
      case LIT_NETWORK.NagaDev:
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

    this._coreLogger = getChildLogger({
      module: 'LitCore',
      ...(this.config.debug ? { level: 'debug' } : {}),
    });

    // -- configure local storage if not present
    // LitNodeClientNodejs is a base for LitNodeClient
    // First check for if our runtime is node
    // If the user sets a new storage provider we respect it over our default storage
    // If the user sets a new file path, we respect it over the default path.
    if (this.config.storageProvider?.provider) {
      this._coreLogger.info(
        'localstorage api not found, injecting persistence instance found in config'
      );
      // using Object defineProperty in order to set a property previously defined as readonly.
      // if the user wants to override the storage option explicitly we override.
      Object.defineProperty(globalThis, 'localStorage', {
        value: this.config.storageProvider?.provider,
      });
    } else if (
      Environment.isNode &&
      !globalThis.localStorage &&
      !this.config.storageProvider?.provider
    ) {
      this._coreLogger.info(
        'Looks like you are running in NodeJS and did not provide a storage provider, your sessions will not be cached'
      );
    }
  }

  /**
   * Internal mechanism to
   * Retrieves the validator data including staking contract, epoch, minNodeCount, and bootstrapUrls.
   * It directly calls LitContracts.getConnectionInfo and handles logging.
   * Assumes LitContracts.getConnectionInfo performs necessary validations or throws if data is invalid.
   */
  private async _getValidatorData(): Promise<{
    stakingContract: ethers.Contract;
    epochInfo: EpochInfo;
    epochCache: EpochCache;
    minNodeCount: number;
    bootstrapUrls: string[];
    nodePrices: { url: string; prices: bigint[] }[];
  }> {
    return await LitContracts.getConnectionInfo({
      litNetwork: this.config.litNetwork,
      networkContext: this.config.contractContext,
      rpcUrl: this.config.rpcUrl,
      nodeProtocol: this.config.nodeProtocol,
    });
  }

  /**
   * module: LitNetwork
   * See rust/lit-node/common/lit-node-testnet/src/validator.rs > threshold for more details
   */
  protected _getThreshold = (): number => {
    return Math.max(
      MINIMUM_THRESHOLD,
      Math.floor((this.connectedNodes.size * 2) / 3)
    );
  };

  /**
   * @depreacted - use NodeInfoSchema instead.
   * module: LitNodeClient (we need to remove lit-core)
   * // check this in Datil.
   * Gets the set of nodes from validator data, transforming bootstrap URLs into NodeSet objects.
   *
   * @returns {Promise<NodeSet[]>} A promise that resolves with an array of NodeSet objects.
   */
  public getNodeSet = (bootstrapUrls: string[]): NodeSet[] => {
    return bootstrapUrls.map((url) => {
      // remove protocol from the url as we only need ip:port
      const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '') as string;

      return {
        socketAddress: urlWithoutProtocol,

        // CHANGE: This is a placeholder value. Brendon said: It's not used anymore in the nodes, but leaving it as we may need it in the future.
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

    this._stopStakingListenerWithEvmState();
  }

  /**
   * module: LitClient (use the chainclient to get the latest blockhash)
   * Return the latest blockhash from the nodes
   * @returns { Promise<string> } latest blockhash
   */
  public getLatestBlockhash = async (): Promise<string> => {
    const blockhash = await this.refreshedBlockhashManager.getOrRefreshAndGet();

    if (!blockhash) {
      throw new InvalidEthBlockhash(
        {},
        `latestBlockhash is not available. Received: "%s"`,
        blockhash
      );
    }

    return blockhash;
  };

  /**
   * @deprecated - soon to be replaced by the LitClient
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
    this._stopStakingListenerWithEvmState();
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
        this._coreLogger.info({ msg: 'using custom contracts', logAddresses });
      }
    }

    // Re-use staking contract instance from previous connect() executions that succeeded to improve performance
    // noinspection ES6MissingAwait - intentionally not `awaiting` so we can run this in parallel below
    const validatorData = await this._getValidatorData();

    this._stakingContract = validatorData.stakingContract;
    this.config.minNodeCount = validatorData.minNodeCount;
    this.config.bootstrapUrls = validatorData.bootstrapUrls;
    this._epochCache = validatorData.epochCache;

    // -- handshake with each node.  Note that if we've previously initialized successfully, but this call fails,
    // core will remain useable but with the existing set of `connectedNodes` and `serverKeys`.
    const { connectedNodes, serverKeys, coreNodeConfig } =
      await this._runHandshakeWithBootstrapUrls();
    Object.assign(this, { ...coreNodeConfig, connectedNodes, serverKeys });

    // this._scheduleNetworkSync();
    this._setupStakingListenerWithEvmState();

    this.ready = true;

    this._coreLogger.info(
      `🔥 lit is ready. "litNodeClient" variable is ready to use globally.`
    );
    this._coreLogger.info({
      msg: 'current network config',
      networkPubkey: this.networkPubKey,
      networkPubKeySet: this.networkPubKeySet,
      hdRootPubkeys: this.hdRootPubkeys,
      subnetPubkey: this.subnetPubKey,
      // latestBlockhash: this.latestBlockhash,
    });

    // browser only
    if (Environment.isBrowser) {
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
    const challenge = this._getRandomHexString(64);

    const handshakeResult = await this._handshakeWithNode(
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
      [
        keys.serverPubKey,
        keys.subnetPubKey,
        keys.networkPubKey,
        keys.networkPubKeySet,
      ].includes('ERR')
    ) {
      this._coreLogger.error({
        requestId,
        msg: 'Error connecting to node. Detected "ERR" in keys',
        url,
        keys,
      });
    }

    this._coreLogger.info({
      msg: `Handshake with ${url} returned keys: `,
      keys,
    });
    if (!keys.latestBlockhash) {
      this._coreLogger.error({
        requestId,
        msg: `Error getting latest blockhash from the node ${url}.`,
      });
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
      this._coreLogger.info('Checking attestation against amd certs...');

      try {
        // ensure we won't try to use a node with an invalid attestation response
        await checkSevSnpAttestation(attestation, challenge, url);
        this._coreLogger.info(`Lit Node Attestation verified for ${url}`);
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
      this._coreLogger.info(
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

          reject(new InitError({ info: { requestId } }, msg));
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
    const latestBlockhash = mostCommonValue(
      Object.values(serverKeys).map(
        (keysFromSingleNode) => keysFromSingleNode.latestBlockhash
      )
    );

    if (!latestBlockhash) {
      this._coreLogger.error({
        requestId,
        msg: 'Error getting latest blockhash from the nodes.',
      });

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
      subnetPubKey: mostCommonValue(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.subnetPubKey
        )
      )!,
      networkPubKey: mostCommonValue(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.networkPubKey
        )
      )!,
      networkPubKeySet: mostCommonValue(
        Object.values(serverKeys).map(
          (keysFromSingleNode) => keysFromSingleNode.networkPubKeySet
        )
      )!,
      hdRootPubkeys: mostCommonValue(
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
        this._coreLogger.error(`RPC URL failed: ${url}`);
      }
    }
    return null;
  };

  /**
   * LitClient's job
   * Get a new random request ID
   * @returns { string }
   */
  protected _getNewRequestId(): string {
    return Math.random().toString(16).slice(2);
  }

  /**
   * Get a random hex string for use as an attestation challenge
   * @returns { string }
   */
  private _getRandomHexString(size: number): string {
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
  protected _handshakeWithNode = async (
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

    this._coreLogger.info(`handshakeWithNode ${urlWithPath}`);

    const data = {
      clientPublicKey: 'test',
      challenge: params.challenge,
    };

    return await this._sendCommandToNode({
      url: urlWithPath,
      data,
      requestId,
    });
  };

  // private set _epochState(epochInfo: EpochInfo) {
  //   this._epochCache.currentNumber = epochInfo.number;
  //   this._epochCache.startTime = epochInfo.endTime - epochInfo.epochLength;
  // }

  // ==================== SENDING COMMAND ====================
  private async _sendRequest(
    url: string,
    req: RequestInit,
    requestId: string
  ): Promise<Response> {
    try {
      const response = await fetch(url, req);
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
    } catch (e) {
      throw new NetworkError(
        {
          info: {
            url,
            req,
            requestId,
          },
          cause: e,
        },
        `Error sending request to ${url}`
      );
    }
  }

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
    const currentEpochNumber = calculateEffectiveEpochNumber(this._epochCache);

    // FIXME: Replace <any> usage with explicit, strongly typed handlers
    data = { ...data, epoch: currentEpochNumber };

    // If there is a `sessionSigs' object in the params remove before sending the request;
    // this line has been added as a catch all to prevent sending with the request
    if (data.sessionSigs) {
      delete data.sessionSigs;
    }

    this._coreLogger.info({
      requestId,
      msg: `sendCommandToNode with url ${url} and data`,
      data,
    });

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

    return this._sendRequest(url, req, requestId);
  };

  /**
   * module: LitClient takes in the realm context/config.
   * Get and gather node promises
   *
   * @param { string[] } nodeUrls URLs of nodes to get promises for
   * @param { function } callback
   *
   * @returns { Array<Promise<any>> }
   */
  _getNodePromises = (
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

  /**
   * module: LitClient
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
      mostCommonValue(errors.map((r: any) => JSON.stringify(r)))!
    );

    this._coreLogger.error({
      requestId,
      msg: `most common error: ${JSON.stringify(mostCommonError)}`,
    });

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
  protected _throwNodeError = (
    res: RejectedNodePromises,
    requestId: string
  ): never => {
    if (res.error) {
      if (
        ((res.error.errorCode &&
          res.error.errorCode === LIT_ERROR_CODE.NODE_NOT_AUTHORIZED) ||
          res.error.errorCode === 'not_authorized') &&
        this.config.alertWhenUnauthorized
      ) {
        this._coreLogger.info('You are not authorized to access this content');
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
      this._coreLogger.error(
        'root public keys not found, have you connected to the nodes?'
      );
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

  private _setupStakingListenerWithEvmState() {
    if (!this._stakingContract) {
      this._coreLogger.warn(
        'Staking contract not available to set up listener.'
      );
      return;
    }
    // If instance exists, ensure it's listening. If called during an active connection, it might have been stopped.
    if (this._stakingContractStateInstance) {
      this._stakingContractStateInstance.listen();
      return;
    }

    this._coreLogger.info({
      msg: 'Setting up EVM event state listener for staking contract StateChanged',
      address: this._stakingContract.address,
    });

    this._stakingContractStateInstance =
      createEvmEventState<STAKING_STATES_VALUES | null>({
        contract: this._stakingContract,
        eventName: 'StateChanged',
        initialValue: null,
        transform: (args: any[]): STAKING_STATES_VALUES => {
          return args[0] as STAKING_STATES_VALUES;
        },
        onChange: async (newState) => {
          if (newState === null) return;

          this._coreLogger.info(
            `New state detected via createEvmEventState: "${newState}"`
          );

          const validatorData = await this._getValidatorData();

          if (newState === STAKING_STATES.Active) {
            // update the epoch cache
            this._epochCache = validatorData.epochCache;

            if (
              CENTRALISATION_BY_NETWORK[this.config.litNetwork] !==
              'centralised'
            ) {
              try {
                this._coreLogger.info(
                  'State found to be new validator set locked, checking validator set (via createEvmEventState)'
                );
                const existingNodeUrls: string[] = [
                  ...this.config.bootstrapUrls,
                ];
                const newBootstrapUrls: string[] = validatorData.bootstrapUrls;

                const isDifferent = areStringArraysDifferent(
                  existingNodeUrls,
                  newBootstrapUrls
                );

                if (isDifferent) {
                  this._coreLogger.info({
                    msg: 'Active validator sets changed. Starting node connection (via createEvmEventState)',
                    oldUrls: existingNodeUrls,
                    newUrls: newBootstrapUrls,
                  });
                  // Update bootstrapUrls before connecting if they have indeed changed
                  // this.config.bootstrapUrls = newBootstrapUrls; // This line might cause issues if connect() reads from a stale config or if it modifies it internally before this takes effect.
                  // It's safer for connect() to re-fetch/receive the latest bootstrapUrls as part of its own logic if it needs to.
                  // For now, relying on connect() to use the validatorData.bootstrapUrls it gets.
                  await this.connect();
                } else {
                  this._coreLogger.info(
                    'Active validator sets checked, no changes detected that require reconnect. (via createEvmEventState)'
                  );
                }
              } catch (err: unknown) {
                const { message = '' } = err as Error;
                this._coreLogger.error({
                  msg: 'Error while attempting to reconnect to nodes after epoch transition (via createEvmEventState)',
                  message,
                });
              }
            }
          }
        },
      });

    this._stakingContractStateInstance.listen();
  }

  private _stopStakingListenerWithEvmState() {
    if (this._stakingContractStateInstance) {
      this._coreLogger.info(
        'Stopping EVM event state listener for staking contract StateChanged'
      );
      this._stakingContractStateInstance.stop();
    }
  }
}
