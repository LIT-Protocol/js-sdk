import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { SupportedETHSigningMethods } from '@lit-protocol/pkp-ethers';
import { Core } from '@walletconnect/core';
import {
  IWeb3Wallet,
  Web3Wallet,
  Web3WalletTypes,
} from '@walletconnect/web3wallet';
import { getSdkError, parseChainId } from '@walletconnect/utils';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import {
  ISignClient,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';
import { PKPClient } from '@lit-protocol/pkp-client';
import { PKPBase } from '@lit-protocol/pkp-base';

export interface InitWalletConnectParams
  extends Omit<Web3WalletTypes.Options, 'core'> {
  projectId: string;
  relayUrl?: string;
}

export class PKPWalletConnect {
  // WalletConnect client
  private client: IWeb3Wallet | undefined;
  // Map of chains and PKPWallet instances
  private pkpWallets: Map<string, PKPBase[]>;
  // Supported chains
  private supportedChains: string[] = ['eip155'];

  // For logging
  private readonly debug: boolean = false;
  private readonly PREFIX = '[PKPWalletConnect]';
  private readonly orange = '\x1b[33m';
  private readonly reset = '\x1b[0m';
  private readonly red = '\x1b[31m';

  constructor(debug?: boolean) {
    this.pkpWallets = new Map();
    for (const chain of this.supportedChains) {
      this.pkpWallets.set(chain, []);
    }

    this.debug = debug || false;
  }

  /**
   * Initializes the WalletConnect client
   *
   * @param {InitWalletConnectParams} params
   * @param {string} params.projectId - The WalletConnect configuration
   */
  public async initWalletConnect(
    params: InitWalletConnectParams
  ): Promise<void> {
    const core = new Core({
      logger: 'debug',
      projectId: params.projectId,
      relayUrl: params.relayUrl || 'wss://relay.walletconnect.com',
    });
    this.client = await Web3Wallet.init({
      core,
      metadata: params.metadata,
      name: params.name,
    } as Web3WalletTypes.Options);
  }

  /**
   * Pair with the given URI received from a dapp
   */
  public pair: IWeb3Wallet['pair'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.pair(params);
  };

  /**
   * Parse the session proposal received from a dapp, construct the session namespace,
   * and approve the session proposal if the chain is supported.
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal.
   * @returns {Promise<SessionTypes.Struct | void>} - The session data if approved.
   */
  public async approveSessionProposal(proposal: any): Promise<any> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }

    // Parse the session proposal
    const { id, params } = proposal;
    const { requiredNamespaces, relays } = params;
    let rejected = false;

    // Ensure that the PKPClients can support the requested chains
    const namespaces: SessionTypes.Namespaces = {};
    const requiredNamespaceKeys = Object.keys(requiredNamespaces);
    for (const key of requiredNamespaceKeys) {
      if (!this.supportedChains.includes(key)) continue;

      // Check if there are any wallets for the given chain
      if (!this.pkpWallets.has(key) || this.pkpWallets.get(key)?.length === 0) {
        await this.client.rejectSession({
          id,
          reason: getSdkError('UNSUPPORTED_CHAINS'),
        });
        rejected = true;
        break;
      }

      const wallets = this.pkpWallets.get(key);
      if (!wallets || wallets.length === 0) {
        await this.client.rejectSession({
          id,
          reason: getSdkError('UNSUPPORTED_ACCOUNTS'),
        });
        rejected = true;
        break;
      }

      // Check if specified chain networks are supported by Lit. If so, get a list of accounts for the given chain
      const accounts: string[] = [];
      const chains = requiredNamespaces[key].chains;
      if (chains) {
        for (const chain of chains) {
          if (this.checkIfChainIsSupported(chain)) {
            for (const wallet of wallets) {
              const address = await wallet.getAddress();
              accounts.push(`${chain}:${address}`);
            }
          } else {
            await this.client.rejectSession({
              id,
              reason: getSdkError(
                'UNSUPPORTED_CHAINS',
                `${chain} is not supported`
              ),
            });
            rejected = true;
            break;
          }
        }
      }

      // Return if session proposal was rejected
      if (rejected) break;

      // Construct the session namespace
      namespaces[key] = {
        accounts,
        chains: key.includes(':') ? [key] : chains,
        methods: requiredNamespaces[key].methods,
        events: requiredNamespaces[key].events,
      };
    }

    // Reject session proposal if there are no constructed namespaces for supported chains
    for (const chain of this.supportedChains) {
      if (!namespaces[chain]) {
        return await this.client.rejectSession({
          id,
          reason: getSdkError('UNSUPPORTED_CHAINS'),
        });
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
   */
  public approveSession: IWeb3Wallet['approveSession'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.approveSession(params);
  };

  /**
   * Parse and reject the session proposal
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal.
   * @param {any} [reason] - The reason for rejecting the session proposal.
   *
   * @returns {Promise<any>} - The session data.
   */
  public async rejectSessionProposal(
    proposal: any,
    reason?: any
  ): Promise<void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }

    const { id } = proposal;
    return await this.rejectSession({
      id,
      reason: reason || getSdkError('USER_REJECTED'),
    });
  }

  /**
   * Reject a session proposal from a dapp
   */
  public rejectSession: IWeb3Wallet['rejectSession'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.rejectSession(params);
  };

  /**
   * Approves a session request received from a dapp, processes the request using the wallet
   * corresponding to the account in the request, and sends a response with the result or an error.
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request.
   */
  public async approveSessionRequest(requestEvent: any): Promise<void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }

    // Parse the session request
    let response = null;

    const { id, topic, params } = requestEvent;
    const { request } = params;
    const wallet = await this.findWalletByRequestParams(request);

    // Find the wallet corresponding to the account in the request
    if (!wallet) {
      response = formatJsonRpcError(id, getSdkError('UNSUPPORTED_ACCOUNTS'));
      return await this.respondSessionRequest({
        topic,
        response,
      });
    }

    // Process the request using specified wallet and JSON RPC handlers
    try {
      // Handle Ethereum request
      const result = await ethRequestHandler({
        signer: wallet as PKPEthersWallet,
        payload: {
          method: request.method as SupportedETHSigningMethods,
          params: request.params,
        },
      });
      this._log(`request event ${id} - result`, result);
      response = formatJsonRpcResult(id, result);
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
      this._log(`request event ${id} - response`, response);
      return await this.respondSessionRequest({
        topic,
        response,
      });
    }
  }

  /**
   * Reject a session request received from a dapp
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request.
   * @param {any} [reason] - The reason for rejecting the session request.
   */
  public async rejectSessionRequest(
    requestEvent: any,
    reason?: any
  ): Promise<void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
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
  public respondSessionRequest: IWeb3Wallet['respondSessionRequest'] = async (
    params
  ) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    this._log('respondSessionRequest', params);
    return await this.client.respondSessionRequest(params);
  };

  /**
   * Update WalletConnect session namespaces
   */
  public updateSession: IWeb3Wallet['updateSession'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.updateSession(params);
  };

  /**
   * Extend WalletConnect session by updating session expiry
   */
  public extendSession: IWeb3Wallet['extendSession'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.extendSession(params);
  };

  /**
   * Disconnect a WalletConnect session
   */
  public disconnectSession: IWeb3Wallet['disconnectSession'] = async (
    params
  ) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.disconnectSession(params);
  };

  /**
   * Emit session events
   */
  public emitSessionEvent: IWeb3Wallet['emitSessionEvent'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return await this.client.emitSessionEvent(params);
  };

  /**
   * Get active sessions
   */
  public getActiveSessions: IWeb3Wallet['getActiveSessions'] = () => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return this.client.getActiveSessions();
  };

  /**
   * Get pending session proposals
   */
  public getPendingSessionProposals: IWeb3Wallet['getPendingSessionProposals'] =
    () => {
      if (!this.client) {
        return this._throwError(
          'WalletConnect client has not yet been initialized. Please call init().'
        );
      }
      return this.client.getPendingSessionProposals();
    };

  /**
   * Get pending session requests
   */
  public getPendingSessionRequests: IWeb3Wallet['getPendingSessionRequests'] =
    () => {
      if (!this.client) {
        return this._throwError(
          'WalletConnect client has not yet been initialized. Please call init().'
        );
      }
      return this.client.getPendingSessionRequests();
    };

  // ----------------- WalletConnect clients -----------------

  public getSignClient(): ISignClient {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return this.client.engine.signClient;
  }

  // ----------------- WalletConnect event handlers -----------------

  public on: IWeb3Wallet['on'] = (name, listener) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return this.client.on(name, listener);
  };

  public once: IWeb3Wallet['once'] = (name, listener) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return this.client.once(name, listener);
  };

  public off: IWeb3Wallet['off'] = (name, listener) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return this.client.off(name, listener);
  };

  public removeListener: IWeb3Wallet['removeListener'] = (name, listener) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call init().'
      );
    }
    return this.client.removeListener(name, listener);
  };

  // ----------------- Helpers -----------------

  /**
   * Get addresses by chain
   *
   * @param {string} chain - Chain in CAIP-2 format
   *
   * @returns {Promise<string[]>} - Array of addresses
   */
  public async getAddresses(chain: string): Promise<string[]> {
    const addresses: string[] = [];
    const wallets = this.pkpWallets.get(chain);
    if (!wallets) {
      return addresses;
    }
    for (const wallet of wallets) {
      addresses.push(await wallet.getAddress());
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

  /**
   * Find a wallet by request event params.
   *
   * @param {any} params - Request event params.
   */
  public async findWalletByRequestParams(params: any): Promise<PKPBase | null> {
    const paramsString = JSON.stringify(params);

    // Loop through all wallets and find the one that has an address that can be found within the request params
    for (const [key, value] of this.pkpWallets) {
      if (!this.supportedChains.includes(key)) {
        continue;
      }
      const wallets = value;
      for (const wallet of wallets) {
        const acc = await wallet.getAddress();
        if (paramsString.toLowerCase().includes(acc.toLowerCase())) {
          return wallet;
        }
      }
    }
    return null;
  }

  /**
   * Add wallets from PKPClient to the map
   *
   * @param {PKPClient} pkpClient - The PKPClient instance
   */
  public addPKPClient(pkpClient: PKPClient): void {
    for (const chain of this.supportedChains) {
      const wallets = this.pkpWallets.get(chain);
      if (!wallets) {
        continue;
      }
      let wallet: PKPBase | null = null;
      switch (chain) {
        case 'eip155':
          wallet = pkpClient.getEthWallet();
          break;
        default:
          break;
      }
      if (wallet) {
        wallets.push(wallet);
      }
      this.pkpWallets.set(chain, wallets);
    }
  }

  // ----------------- Private methods -----------------

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
