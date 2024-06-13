import {
  SupportedETHSigningMethods,
  ethRequestHandler,
  methodHandlers,
  isEthRequest,
} from '@lit-protocol/pkp-ethers';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { Core } from '@walletconnect/core';
import {
  IWeb3Wallet,
  Web3Wallet,
  Web3WalletTypes,
} from '@walletconnect/web3wallet';
import {
  formatAccountWithChain,
  getSdkError,
  parseChainId,
} from '@walletconnect/utils';
import {
  ErrorResponse,
  formatJsonRpcError,
  formatJsonRpcResult,
  JsonRpcResponse,
} from '@walletconnect/jsonrpc-utils';
import {
  CoreTypes,
  ISignClient,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';
import { PKPClient } from '@lit-protocol/pkp-client';
import { PKPBase } from '@lit-protocol/pkp-base';

const DEFAULT_RELAY_URL = 'wss://relay.walletconnect.com';

export interface InitWalletConnectParams
  extends Omit<Web3WalletTypes.Options, 'core'> {
  projectId: string;
  relayUrl?: string;
}

export class PKPWalletConnect {
  // WalletConnect client
  private client: IWeb3Wallet | undefined;
  // List of PKPClients
  private pkpClients: PKPClient[] = [];
  // Supported chains
  private supportedChains: string[] = ['eip155'];

  // For logging
  private readonly debug: boolean = false;
  private readonly PREFIX = '[PKPWalletConnect]';
  private readonly orange = '\x1b[33m';
  private readonly reset = '\x1b[0m';
  private readonly red = '\x1b[31m';

  constructor(debug?: boolean) {
    this.debug = debug || false;
  }

  /**
   * Initializes the WalletConnect client
   *
   * @param {InitWalletConnectParams} params
   * @param {string} params.projectId - The WalletConnect project ID
   * @param {string} [params.relayUrl] - The WalletConnect relay URL
   */
  public async initWalletConnect(
    params: InitWalletConnectParams
  ): Promise<void> {
    if (!params.projectId) {
      throw new Error('WalletConnect project ID is required');
    }

    const coreOpts: CoreTypes.Options = {
      projectId: params.projectId,
      relayUrl: params.relayUrl || DEFAULT_RELAY_URL,
      ...(this.debug && { logger: 'debug' }),
    };

    // we might have a version mismatch here due to multiple versions of WalletConnect
    // libs `@walletconnect/types` hence temp fix with `any` for now. but above `coreOpts`
    // type is enforced
    const core = new Core(coreOpts as any);

    this.client = await Web3Wallet.init({
      core,
      metadata: params.metadata,
      name: params.name,
    } as unknown as Web3WalletTypes.Options);
  }

  /**
   * Pair with the given URI received from a dapp
   */
  public pair: IWeb3Wallet['pair'] = async (params) => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.pair(params);
  };

  /**
   * Parse the session proposal received from a dapp, construct the session namespace,
   * and approve the session proposal if the chain is supported.
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal
   * @returns {Promise<SessionTypes.Struct | void>} - The session data if approved
   */
  public async approveSessionProposal(
    proposal: SignClientTypes.EventArguments['session_proposal']
  ): Promise<SessionTypes.Struct | void> {
    this.client = this._isWalletConnectInitialized(this.client);

    // Parse the session proposal
    const { id, params } = proposal;
    const { optionalNamespaces, requiredNamespaces, relays } = params;

    // Ensure that the PKPClients can support the requested session proposal
    const namespaces: SessionTypes.Namespaces = {};
    const requiredNamespaceKeys = Object.keys(requiredNamespaces);
    for (const key of requiredNamespaceKeys) {
      // Check if required chain networks are supported by Lit. If so, get a list of accounts for the given chain
      const accounts: string[] = [];
      const chains = requiredNamespaces[key].chains;
      if (chains) {
        for (const chain of chains) {
          let accountsByChain: string[] = [];
          if (!this.checkIfChainIsSupported(chain)) {
            return await this.client.rejectSession({
              id,
              reason: getSdkError(
                'UNSUPPORTED_CHAINS',
                `${chain} is not supported`
              ),
            });
          }
          const supportedMethods = this.filterUnsupportedMethods(
            requiredNamespaces[key].methods
          );
          if (
            requiredNamespaces[key].methods.length !== supportedMethods.length
          ) {
            const unsupportedMethods = requiredNamespaces[key].methods.filter(
              (method) => !supportedMethods.includes(method)
            );
            return await this.client.rejectSession({
              id,
              reason: getSdkError(
                'UNSUPPORTED_METHODS',
                `Unsupported methods: ${unsupportedMethods.join(', ')}`
              ),
            });
          }

          accountsByChain = await this.getAccountsWithPrefix(chain);
          // If no accounts are found for the given chain, reject the session proposal
          if (accountsByChain.length === 0) {
            await this.client.rejectSession({
              id,
              reason: getSdkError('UNSUPPORTED_ACCOUNTS'),
            });
          } else {
            // Add accounts with prefix to the list of accounts
            accounts.push(...accountsByChain);
          }
        }
      }

      // Construct the session namespace
      namespaces[key] = {
        accounts,
        chains: key.includes(':') ? [key] : chains,
        methods: requiredNamespaces[key].methods,
        events: requiredNamespaces[key].events,
      };
    }
    const optionalNamespaceKeys = Object.keys(optionalNamespaces);
    for (const key of optionalNamespaceKeys) {
      if (!this.supportedChains.includes(key)) continue;

      // Check if optional chain networks are supported by Lit. If so, get a list of accounts for the given chain
      const accounts: string[] = [];
      const chains = optionalNamespaces[key].chains;
      if (chains) {
        for (const chain of chains) {
          let accountsByChain: string[] = [];
          if (this.checkIfChainIsSupported(chain)) {
            accountsByChain = await this.getAccountsWithPrefix(chain);
            // If no accounts are found for the given chain, reject the session proposal
            if (accountsByChain.length !== 0) {
              // Add accounts with prefix to the list of accounts
              accounts.push(...accountsByChain);
            }
          }
        }
      }

      // Add to the session namespace but considering what we previously had (a chain can require some methods and have other optional methods)
      const optionalNamespaceSupportedMethods = this.filterUnsupportedMethods(
        optionalNamespaces[key].methods
      );
      if (!namespaces[key]) {
        namespaces[key] = {
          accounts,
          chains: key.includes(':') ? [key] : chains,
          methods: optionalNamespaceSupportedMethods,
          events: optionalNamespaces[key].events,
        };
      } else {
        namespaces[key].accounts = [
          ...new Set([...namespaces[key].accounts, ...accounts]),
        ];
        namespaces[key].chains = [
          ...new Set([...(namespaces[key].chains || []), ...(chains || [])]),
        ];
        namespaces[key].methods = [
          ...new Set([
            ...namespaces[key].methods,
            ...optionalNamespaceSupportedMethods,
          ]),
        ];
        namespaces[key].events = [
          ...new Set([
            ...namespaces[key].events,
            ...optionalNamespaces[key].events,
          ]),
        ];
      }
    }

    // Approve session proposal with the constructed session namespace and given relay protocol
    return await this.approveSession({
      id,
      namespaces,
      relayProtocol: relays[0].protocol,
    });
  }

  /**
   * Approve a session proposal from a dapp
   * @property {number} params.id - The session ID
   * @property {SessionTypes.Namespaces} params.namespaces - The session namespace
   * @property {string} [params.relayProtocol] - The relay protocol
   *
   * @returns { Promise<SessionTypes.Struct> } - The session data
   */
  public approveSession: IWeb3Wallet['approveSession'] = async (params: {
    id: number;
    namespaces: Record<string, SessionTypes.Namespace>;
    relayProtocol?: string;
  }) => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.approveSession(params);
  };

  /**
   * Parse and reject the session proposal
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal
   * @param {ErrorResponse} [reason] - The reason for rejecting the session proposal
   */
  public async rejectSessionProposal(
    proposal: SignClientTypes.EventArguments['session_proposal'],
    reason?: ErrorResponse
  ): Promise<void> {
    this.client = this._isWalletConnectInitialized(this.client);

    const { id } = proposal;
    return await this.rejectSession({
      id,
      reason: reason || getSdkError('USER_REJECTED'),
    });
  }

  /**
   * Reject a session proposal from a dapp
   * @property {number} params.id - The session ID
   * @property {ErrorResponse} params.reason - The reason for rejecting the session proposal
   *
   * @returns { Promise<void> }
   */
  public rejectSession: IWeb3Wallet['rejectSession'] = async (params: {
    id: number;
    reason: ErrorResponse;
  }) => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.rejectSession(params);
  };

  /**
   * Approves a session request received from a dapp, processes the request using the wallet
   * corresponding to the account in the request, and sends a response with the result or an error.
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request
   */
  public async approveSessionRequest(
    requestEvent: SignClientTypes.EventArguments['session_request']
  ): Promise<void> {
    this.client = this._isWalletConnectInitialized(this.client);

    // Parse the session request
    let response = null;

    const { id, topic, params } = requestEvent;
    const { request } = params;
    const pkpClient = await this.findPKPClientByRequestParams(request);

    // Find the PKPClient corresponding to the account in the request
    if (!pkpClient) {
      response = formatJsonRpcError(id, getSdkError('UNSUPPORTED_ACCOUNTS'));
      return await this.respondSessionRequest({
        topic,
        response,
      });
    }

    // Process the request using specified wallet and JSON RPC handlers
    try {
      // Handle Ethereum request
      if (isEthRequest(request.method)) {
        const wallet = pkpClient.getEthWallet();
        const result = await ethRequestHandler({
          signer: wallet,
          payload: {
            method: request.method as SupportedETHSigningMethods,
            params: request.params,
          },
        });
        response = formatJsonRpcResult(id, result);
      } else {
        throw new Error(`Unsupported method: ${request.method}`);
      }
    } catch (err: unknown) {
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else {
        message = `Unable to approve session request ${id} due to an unknown error`;
      }
      response = formatJsonRpcError(id, message);
    }

    // Send a response with the result or an error
    if (response) {
      return await this.respondSessionRequest({
        topic,
        response,
      });
    }
  }

  /**
   * Reject a session request received from a dapp
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request
   * @param {ErrorResponse} [reason] - The reason for rejecting the session request
   */
  public async rejectSessionRequest(
    requestEvent: SignClientTypes.EventArguments['session_request'],
    reason?: ErrorResponse
  ): Promise<void> {
    this.client = this._isWalletConnectInitialized(this.client);
    const { id, topic } = requestEvent;
    const response = formatJsonRpcError(
      id,
      reason || getSdkError('USER_REJECTED')
    );
    return await this.respondSessionRequest({
      topic,
      response,
    });
  }

  /**
   * Respond to a session request received from a dapp
   */
  public respondSessionRequest: IWeb3Wallet['respondSessionRequest'] =
    async (params: {
      topic: string;
      response: JsonRpcResponse;
    }): Promise<void> => {
      this.client = this._isWalletConnectInitialized(this.client);
      return await this.client.respondSessionRequest(params);
    };

  /**
   * Update WalletConnect session namespaces
   *
   * @property {string} params.topic - The session topic
   * @property {SessionTypes.Namespaces} params.namespaces - The session namespace
   *
   * @returns { Promise<void> }
   */
  public updateSession: IWeb3Wallet['updateSession'] = async (params: {
    topic: string;
    namespaces: SessionTypes.Namespaces;
  }): Promise<void> => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.updateSession(params);
  };

  /**
   * Extend WalletConnect session by updating session expiry
   *
   * @property {string} params.topic - The session topic
   *
   * @returns { Promise<void> }
   */
  public extendSession: IWeb3Wallet['extendSession'] = async (params: {
    topic: string;
  }): Promise<void> => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.extendSession(params);
  };

  /**
   * Disconnect a WalletConnect session
   *
   * @property {string} params.topic - The session topic
   * @property {ErrorResponse} params.reason - The reason for disconnecting the session
   *
   * @returns { Promise<void> }
   */
  public disconnectSession: IWeb3Wallet['disconnectSession'] = async (params: {
    topic: string;
    reason: ErrorResponse;
  }): Promise<void> => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.disconnectSession(params);
  };

  /**
   * Emit session events
   *
   * @property {string} params.topic - The session topic
   * @property {any} params.event - The session event
   *
   * @returns { Promise<void> }
   */
  public emitSessionEvent: IWeb3Wallet['emitSessionEvent'] = async (params: {
    topic: string;
    event: any;
    chainId: string;
  }): Promise<void> => {
    this.client = this._isWalletConnectInitialized(this.client);
    return await this.client.emitSessionEvent(params);
  };

  /**
   * Get active sessions
   *
   * @returns { Promise<Record<string, SessionTypes.Struct>> }
   */
  public getActiveSessions: IWeb3Wallet['getActiveSessions'] = () => {
    this.client = this._isWalletConnectInitialized(this.client);
    return this.client.getActiveSessions();
  };

  /**
   * Get pending session proposals
   *
   * @returns { Record<number, ProposalTypes.Struct> }
   */
  public getPendingSessionProposals: IWeb3Wallet['getPendingSessionProposals'] =
    () => {
      this.client = this._isWalletConnectInitialized(this.client);
      return this.client.getPendingSessionProposals();
    };

  /**
   * Get pending session requests
   *
   * @returns { PendingRequestTypes.Struct[] }
   */
  public getPendingSessionRequests: IWeb3Wallet['getPendingSessionRequests'] =
    () => {
      this.client = this._isWalletConnectInitialized(this.client);
      return this.client.getPendingSessionRequests();
    };

  // ----------------- WalletConnect clients -----------------

  /**
   * Get the Sign Client that is initialized on the WalletConnect client
   *
   * @returns {ISignClient} - SignClient instance
   */
  public getSignClient(): ISignClient {
    this.client = this._isWalletConnectInitialized(this.client);
    return this.client.engine.signClient;
  }

  // ----------------- WalletConnect event handlers -----------------

  public on(name: Web3WalletTypes.Event, listener: (args: any) => void) {
    this.client = this._isWalletConnectInitialized(this.client);
    return this.client.on(name, listener);
  }

  public once(name: Web3WalletTypes.Event, listener: (args: any) => void) {
    this.client = this._isWalletConnectInitialized(this.client);
    return this.client.once(name, listener);
  }

  public off(name: Web3WalletTypes.Event, listener: (args: any) => void) {
    this.client = this._isWalletConnectInitialized(this.client);
    return this.client.off(name, listener);
  }

  public removeListener(
    name: Web3WalletTypes.Event,
    listener: (args: any) => void
  ) {
    this.client = this._isWalletConnectInitialized(this.client);
    return this.client.removeListener(name, listener);
  }

  // ----------------- Helpers -----------------

  /**
   * Get addresses by chain name
   *
   * @param {string} chainName - Chain in CAIP-2 namespace
   *
   * @returns {Promise<string[]>} - Array of addresses
   */
  public async getAccounts(chainName: string): Promise<string[]> {
    const addresses: string[] = [];
    if (this.pkpClients.length === 0) {
      return addresses;
    }
    // TODO: Update this once we support more JSON RPC handlers
    for (const pkpClient of this.pkpClients) {
      let wallet: PKPBase;
      let address: string;
      switch (chainName) {
        case 'eip155':
          wallet = pkpClient.getEthWallet();
          address = await wallet.getAddress();
          addresses.push(address);
          break;
        default:
          break;
      }
    }
    return addresses;
  }

  /**
   * Return list of addresses with namespace prefix given a chain
   *
   * @param {string} chain - Chain in CAIP-2 format
   *
   * @returns {string[]} - List of addresses with namespace prefix
   */
  public async getAccountsWithPrefix(chain: string): Promise<string[]> {
    const addresses: string[] = [];
    if (this.pkpClients.length === 0) {
      return addresses;
    }
    const parsedChain = parseChainId(chain);
    const chainName = parsedChain.namespace;
    // TODO: Update this once we support more JSON RPC handlers
    for (const pkpClient of this.pkpClients) {
      let wallet: PKPBase;
      let address: string;
      switch (chainName) {
        case 'eip155':
          wallet = pkpClient.getEthWallet();
          address = await wallet.getAddress();
          addresses.push(formatAccountWithChain(address, chain));
          break;
        default:
          break;
      }
    }
    return addresses;
  }

  /**
   * Check if chain is supported by Lit
   *
   * @param {string} chain - Chain in CAIP-2 format
   *
   * @returns {boolean} - True if chain is supported, false otherwise
   */
  public checkIfChainIsSupported(chain: string): boolean {
    const parsedChain = parseChainId(chain);
    const chainId = Number.parseInt(parsedChain.reference, 10);
    // TODO: Update this once we support more JSON RPC handlers
    if (parsedChain.namespace === 'eip155') {
      for (const key in LIT_CHAINS) {
        const chain = LIT_CHAINS[key];
        if (chain.chainId === chainId) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  public filterUnsupportedMethods(methods: string[]): string[] {
    const pkpSupportedMethods = Object.keys(methodHandlers);
    return methods.filter((method) => pkpSupportedMethods.includes(method));
  }

  /**
   * Find PKPClient by request event params
   *
   * @param {any} params - Request event params
   */
  public async findPKPClientByRequestParams(
    params: any
  ): Promise<PKPClient | null> {
    const paramsString = JSON.stringify(params);

    // Loop through all wallets and find the one that has an address that can be found within the request params
    for (const pkpClient of this.pkpClients) {
      // TODO: Update this once we support more JSON RPC handlers
      const ethWallet = pkpClient.getEthWallet();
      const ethAddress = await ethWallet.getAddress();
      if (paramsString.toLowerCase().includes(ethAddress.toLowerCase())) {
        return pkpClient;
      }
    }
    return null;
  }

  /**
   * Add a PKPClient to list of PKPClients if not already added
   *
   * @param {PKPClient} pkpClient - The PKPClient instance
   */
  public addPKPClient(pkpClient: PKPClient): void {
    const existingClient = this.pkpClients.find(
      (client) => client.pkpPubKey === pkpClient.pkpPubKey
    );
    if (!existingClient) {
      this.pkpClients.push(pkpClient);
    }
  }

  /**
   * Get current list of PKPClients
   *
   * @returns {PKPClient[]} - List of PKPClients
   */
  public getPKPClients(): PKPClient[] {
    return this.pkpClients;
  }

  /**
   * Replace list of PKPClients
   *
   * @param {PKPClient[]} clients - List of PKPClients
   */
  public setPKPClients(clients: PKPClient[]): void {
    this.pkpClients = clients;
  }

  // ----------------- Private methods -----------------

  /**
   * Checks if the given WalletConnect client is initialized and returns it. If it's not initialized, throws an error.
   *
   * @private
   * @param {IWeb3Wallet | undefined} client - The WalletConnect client instance to check for initialization
   * @returns {IWeb3Wallet} - The initialized WalletConnect client instance
   * @throws {Error} - If the WalletConnect client instance is not initialized
   */
  private _isWalletConnectInitialized(
    client: IWeb3Wallet | undefined
  ): IWeb3Wallet {
    if (!client) {
      this._log('WalletConnect client has not yet been initialized.');
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect().'
      );
    }
    return client;
  }

  /**
   * Logs the provided arguments to the console if the `debug` property is set to true.
   *
   * @private
   * @param {...any[]} args - The arguments to log to the console.
   */
  private _log(...args: any[]): void {
    if (this.debug) {
      console.log(this.orange + this.PREFIX + this.reset, ...args);
    }
  }

  /**
   * Logs an error message to the console and throws an Error with the same message.
   *
   * @param {string} message - The error message to be logged and thrown.
   *
   * @returns {never} - This function does not return a value since it always throws an Error.
   */
  private _throwError = (message: string): never => {
    console.error(
      this.orange + this.PREFIX + this.reset,
      this.red + message + this.reset
    );
    throw new Error(message);
  };
}
