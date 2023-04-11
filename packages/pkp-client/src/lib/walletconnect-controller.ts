import { PKPBase } from '@lit-protocol/pkp-base';
import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { SupportedETHSigningMethods } from '@lit-protocol/pkp-ethers';
import {
  IWeb3Wallet,
  Web3Wallet,
  Web3WalletTypes,
} from '@walletconnect/web3wallet';
import { getSdkError, parseChainId } from '@walletconnect/utils';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';

export interface WalletConnectClientOptions {
  config: Web3WalletTypes.Options;
  wallets: Map<string, PKPBase>;
}

/**
 * The WalletConnectController class is responsible for managing the WalletConnect V2 SignClient.
 * It is used to pair with dapps, handle session proposal and requests, and listen to events.
 */
export class WalletConnectController {
  // WalletConnect client
  public client: IWeb3Wallet | undefined;
  // Map of PKP wallet and chains
  public wallets: Map<string, PKPBase> = new Map();

  // For logging
  private readonly PREFIX = '[PKPBase]';
  private readonly orange = '\x1b[33m';
  private readonly reset = '\x1b[0m';
  private readonly red = '\x1b[31m';

  /**
   * Initializes the WalletConnect client.
   *
   * @param {Web3WalletTypes.Options} options - The WalletConnect client configuration.
   */
  public async init(options: WalletConnectClientOptions): Promise<void> {
    this.client = await Web3Wallet.init(options.config);
    this.wallets = options.wallets;
  }

  /**
   * Pair with the given URI received from a dapp.
   */
  public pair: IWeb3Wallet['pair'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
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
  public async approveSessionProposal(
    proposal: SignClientTypes.EventArguments['session_proposal']
  ): Promise<SessionTypes.Struct | void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }

    const { id, params } = proposal;
    const { requiredNamespaces, relays } = params;
    let rejected = false;

    // Construct session namespace given the required namespaces from the dapp
    const namespaces: SessionTypes.Namespaces = {};
    const requiredNamespaceKeys = Object.keys(requiredNamespaces);
    for (const key of requiredNamespaceKeys) {
      // TODO: Remove this once we support more JSON RPC handlers
      if (key !== 'eip155') continue;
      const wallet = this.getWalletsByNamespace(key);
      if (!wallet) {
        await this.client.rejectSession({
          id,
          reason: getSdkError('UNSUPPORTED_ACCOUNTS'),
        });
        rejected = true;
        continue;
      }
      const accounts: string[] = [];
      const chains = requiredNamespaces[key].chains;
      if (chains) {
        for (const chain of chains) {
          if (this.checkIfChainIsSupported(chain)) {
            accounts.push(`${chain}:${wallet.getAccount()}`);
          } else {
            await this.client.rejectSession({
              id,
              reason: getSdkError(
                'UNSUPPORTED_CHAINS',
                `${chain} is not supported`
              ),
            });
            rejected = true;
          }
        }
      }
      namespaces[key] = {
        accounts,
        chains: key.includes(':') ? [key] : chains,
        methods: requiredNamespaces[key].methods,
        events: requiredNamespaces[key].events,
      };
    }

    // Return if session proposal was rejected
    if (rejected) return;

    // Reject session proposal if no supported chains
    if (!namespaces['eip155']) {
      return await this.client.rejectSession({
        id,
        reason: getSdkError('UNSUPPORTED_CHAINS'),
      });
    }

    // Approve session proposal with the constructed session namespace and given relay protocol
    return await this.client.approveSession({
      id,
      namespaces,
      relayProtocol: relays[0].protocol,
    });
  }

  /**
   * Parse and reject the session proposal.
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal.
   * @param {any} [reason] - The reason for rejecting the session proposal.
   *
   * @returns {Promise<any>} - The session data.
   */
  public async rejectSessionProposal(
    proposal: SignClientTypes.EventArguments['session_proposal'],
    reason?: any
  ): Promise<void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }

    const { id } = proposal;
    return await this.client.rejectSession({
      id,
      reason: reason || getSdkError('USER_REJECTED'),
    });
  }

  /**
   * Approves a session request received from a dapp, processes the request using the wallet
   * corresponding to the account in the request, and sends a response with the result or an error.
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request.
   */
  public async approveSessionRequest(
    requestEvent: SignClientTypes.EventArguments['session_request']
  ): Promise<void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }

    let response = null;

    const { id, topic, params } = requestEvent;
    const { request } = params;
    const wallet = this.findWalletByRequestParams(request);

    if (!wallet) {
      response = formatJsonRpcError(id, getSdkError('UNSUPPORTED_ACCOUNTS'));
      return await this.client.respondSessionRequest({
        topic,
        response,
      });
    }

    try {
      // TODO: revisit types
      const result = await ethRequestHandler({
        signer: wallet as PKPEthersWallet,
        payload: {
          method: request.method as SupportedETHSigningMethods,
          params: request.params,
        },
      });
      response = formatJsonRpcResult(id, result);
    } catch (err: any) {
      response = formatJsonRpcError(id, err.message);
    }

    if (response) {
      return await this.client.respondSessionRequest({
        topic,
        response,
      });
    }
  }

  /**
   * Reject a session request received from a dapp.
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request.
   * @param {any} [reason] - The reason for rejecting the session request.
   */
  public async rejectSessionRequest(
    requestEvent: SignClientTypes.EventArguments['session_request'],
    reason?: any
  ): Promise<void> {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }

    const { id, topic } = requestEvent;
    const response = formatJsonRpcError(
      id,
      reason || getSdkError('USER_REJECTED')
    );
    return await this.client.respondSessionRequest({
      topic,
      response,
    });
  }

  /**
   * Update WalletConnect session namespaces.
   */
  public updateSession: IWeb3Wallet['updateSession'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }
    return await this.client.updateSession(params);
  };

  /**
   * Extend WalletConnect session by updating session expiry.
   */
  public extendSession: IWeb3Wallet['extendSession'] = async (params) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }
    return await this.client.extendSession(params);
  };

  /**
   * Disconnect a WalletConnect session.
   */
  public disconnectSession: IWeb3Wallet['disconnectSession'] = async (
    params
  ) => {
    if (!this.client) {
      return this._throwError(
        'WalletConnect client has not yet been initialized. Please call initWalletConnect on the PKPClient class.'
      );
    }
    return await this.client.disconnectSession(params);
  };

  /**
   * Check if chain is supported by Lit.
   *
   * @param {string} chain - Chain in CAIP-2 format.
   *
   * @returns {boolean} - True if chain is supported, false otherwise.
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
   * Get wallets by namespace name.
   *
   * @param {string} namespace - Name of chain like eip155.
   */
  public getWalletsByNamespace(namespace: string): PKPBase | undefined {
    if (namespace === 'eip155') {
      return this.wallets.get('eth');
    } else {
      return this._throwError('Only Ethereum is supported for now');
    }
  }

  /**
   * Find a wallet by request event params.
   *
   * @param {any} params - Request event params.
   */
  public findWalletByRequestParams(params: any): PKPBase | null {
    const paramsString = JSON.stringify(params);

    for (const wallet of this.wallets.values()) {
      const acc = wallet.getAccount();
      if (paramsString.toLowerCase().includes(acc.toLowerCase())) {
        return wallet;
      }
    }
    return null;
  }

  /**
   * Add wallet info to the accounts map.
   *
   * @param {string} chain - The chain name.
   * @param {PKPBase} wallet - The wallet instance.
   */
  public addWallet(chain: string, wallet: PKPBase): void {
    // TODO: Remove this once we support more JSON RPC handlers
    if (chain !== 'eth') {
      return this._throwError('Only Ethereum is supported for now');
    }
    const account = wallet.getAccount();

    // Only add the account if it doesn't already exist
    if (this.wallets.has(chain)) {
      // Do nothing if the account already exists in the map
      const existingWallet = this.wallets.get(chain);
      if (existingWallet?.getAccount() === account) {
        return;
      } else {
        this.wallets.set(chain, wallet);
      }
    } else {
      this.wallets.set(chain, wallet);
    }
  }

  /**
   * Update wallets.
   *
   * @param wallets - The wallets to set.
   */
  public setWallets(wallets: Map<string, PKPBase>): void {
    this.wallets = wallets;
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
