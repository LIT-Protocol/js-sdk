import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPClientProp } from '@lit-protocol/types';
import { PKPBase } from '@lit-protocol/pkp-base';
import { WalletFactory } from './wallet-factory';
import { log } from '@lit-protocol/misc';
import { PKP_CLIENT_SUPPORTED_CHAINS } from '@lit-protocol/constants';
import { WalletConnectController } from './walletconnect-controller';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import { Core } from '@walletconnect/core';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';

export class PKPClient {
  public walletConnect: WalletConnectController;
  private _wallets: Map<string, PKPBase> = new Map();

  /**
   * Constructs a new PKPClient instance with the provided properties.
   * Automatically registers supported wallets.
   *
   * @param {PKPClientProp} prop - The properties required for the PKPClient instance.
   */
  constructor(prop: PKPClientProp) {
    this._registerSupportedWallets(prop);
    this.walletConnect = new WalletConnectController();
  }

  /**
   * Registers supported wallets using the WalletFactory.
   *
   * @param {PKPClientProp} prop - The properties required for the PKPClient instance.
   * @private
   */
  private _registerSupportedWallets(prop: PKPClientProp): void {
    const chains = PKP_CLIENT_SUPPORTED_CHAINS; // Add other chains as needed
    for (const chain of chains) {
      this._wallets.set(chain, WalletFactory.createWallet(chain, prop));
    }
  }

  /**
   * Returns a list of supported chains.
   *
   * @returns {string[]} An array of supported chain names.
   */
  getSupportedChains(): string[] {
    return Array.from(this._wallets.keys());
  }

  /**
   * Retrieves the wallet instance for a specific chain.
   *
   * @template T - The wallet type, defaults to PKPBase if not provided.
   * @param {string} chain - The name of the chain for which to retrieve the wallet instance.
   * @returns {T} The wallet instance for the specified chain.
   * @throws Will throw an error if the chain is not supported.
   */
  getWallet<T extends PKPBase = PKPBase>(chain: string): T {
    const wallet = this._wallets.get(chain);
    if (!wallet) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return wallet as T;
  }

  /**
   * Retrieves the Ethereum wallet instance.
   *
   * @returns {PKPEthersWallet} The Ethereum wallet instance.
   */
  getEthWallet = (): PKPEthersWallet => {
    return this.getWallet<PKPEthersWallet>('eth');
  };

  /**
   * Retrieves the Cosmos wallet instance.
   *
   * @returns {PKPCosmosWallet} The Cosmos wallet instance.
   */
  getCosmosWallet = (): PKPCosmosWallet => {
    return this.getWallet<PKPCosmosWallet>('cosmos');
  };

  /**
   * Retrieves the Bitcoin wallet instance.
   *
   * @returns {never} Will throw an error as Bitcoin is not supported yet.
   */
  getBtcWallet = (): never => {
    throw new Error('BTC wallet not supported yet');
  };

  /**
   * Connects all wallets and returns an object containing the overall readiness status
   * and an array of the initialization status for each wallet.
   *
   * @returns {Promise<{
   *  ready: boolean;
   *  res: Array<{ chain: string; success: boolean }>;
   * }>} An object containing the overall readiness status (ready) and an array (res) with the initialization status for each wallet.
   */
  public async connect(): Promise<{
    ready: boolean;
    res: Array<{ chain: string; success: boolean }>;
  }> {
    const walletStatus: { chain: string; success: boolean }[] = [];

    for (const [chain, wallet] of this._wallets.entries()) {
      try {
        await wallet.init();
        walletStatus.push({ chain, success: wallet.litNodeClientReady });
      } catch (error) {
        walletStatus.push({ chain, success: false });
      }
    }

    const successfulInits = walletStatus.filter(
      (status) => status.success
    ).length;

    if (successfulInits !== this._wallets.size) {
      log(
        `Not all wallets initialized successfully. Details: ${JSON.stringify(
          walletStatus,
          null,
          2
        )}`
      );
    }

    return {
      ready: successfulInits === this._wallets.size,
      res: walletStatus,
    };
  }

  // --------- WalletConnect ---------
  /**
   * Initialize the WalletConnect client.
   *
   * @param {string} projectId - The WalletConnect project ID.
   * @param {Web3WalletTypes.Options} options - The configuration options for the Web3Wallet.
   */
  public async initWalletConnect(
    projectId: string,
    options: Web3WalletTypes.Options
  ): Promise<void> {
    const core = new Core({
      projectId,
    });
    const config = { ...options, core };
    await this.walletConnect.init({ config, wallets: this._wallets });
  }

  /**
   * Pair with the given URI received from a dapp.
   */
  public async pairWalletConnect(params: {
    uri: string;
    activatePairing?: boolean;
  }): Promise<void> {
    return this.walletConnect.pair(params);
  }

  /**
   * Parse the session proposal received from a dapp, construct the session namespace,
   * and approve the session proposal if the chain is supported.
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal.
   * @returns {Promise<SessionTypes.Struct | void>} - The session data if approved.
   */
  public async approveWalletConnectSessionProposal(
    proposal: SignClientTypes.EventArguments['session_proposal']
  ): Promise<SessionTypes.Struct | void> {
    return this.walletConnect.approveSessionProposal(proposal);
  }

  /**
   * Parse and reject the session proposal.
   *
   * @param {SignClientTypes.EventArguments['session_proposal']} proposal - The session proposal.
   * @param {any} [reason] - The reason for rejecting the session proposal.
   *
   * @returns {Promise<any>} - The session data.
   */
  public async rejectWalletConnectSessionProposal(
    proposal: SignClientTypes.EventArguments['session_proposal'],
    reason?: any
  ): Promise<void> {
    return this.walletConnect.rejectSessionProposal(proposal, reason);
  }

  /**
   * Approves a session request received from a dapp, processes the request using the wallet
   * corresponding to the account in the request, and sends a response with the result or an error.
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request.
   */
  public async approveWalletConnectSessionRequest(
    requestEvent: SignClientTypes.EventArguments['session_request']
  ): Promise<void> {
    return this.walletConnect.approveSessionRequest(requestEvent);
  }

  /**
   * Reject a session request received from a dapp.
   *
   * @param {SignClientTypes.EventArguments['session_request']} requestEvent - The session request.
   * @param {any} [reason] - The reason for rejecting the session request.
   */
  public async rejectWalletConnectSessionRequest(
    requestEvent: SignClientTypes.EventArguments['session_request'],
    reason?: any
  ): Promise<void> {
    return this.walletConnect.rejectSessionRequest(requestEvent, reason);
  }

  /**
   * Update WalletConnect session namespaces.
   */
  public async updateWalletConnectSession(params: {
    topic: string;
    namespaces: SessionTypes.Namespaces;
  }): Promise<void> {
    return this.walletConnect.updateSession(params);
  }

  /**
   * Extend WalletConnect session by updating session expiry.
   */
  public async extendWalletConnectSession(params: {
    topic: string;
  }): Promise<void> {
    return this.walletConnect.extendSession(params);
  }

  /**
   * Disconnect a WalletConnect session.
   */
  public async disconnectWalletConnect(params: {
    topic: string;
    reason: any;
  }): Promise<void> {
    return this.walletConnect.disconnectSession(params);
  }
}
