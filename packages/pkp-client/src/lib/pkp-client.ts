import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPClientProp } from '@lit-protocol/types';
import { PKPBase } from '@lit-protocol/pkp-base';
import { WalletFactory } from './wallet-factory';
import { log } from '@lit-protocol/misc';

export class PKPClient {
  private _wallets: Map<string, PKPBase> = new Map();

  /**
   * Constructs a new PKPClient instance with the provided properties.
   * Automatically registers supported wallets.
   *
   * @param {PKPClientProp} prop - The properties required for the PKPClient instance.
   */
  constructor(prop: PKPClientProp) {
    this._registerSupportedWallets(prop);
  }

  /**
   * Registers supported wallets using the WalletFactory.
   *
   * @param {PKPClientProp} prop - The properties required for the PKPClient instance.
   * @private
   */
  private _registerSupportedWallets(prop: PKPClientProp): void {
    const chains = ['eth', 'cosmos']; // Add other chains as needed
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
   * Initializes all wallets and returns an object containing the overall readiness status
   * and an array of the initialization status for each wallet.
   *
   * @returns {Promise<{
   *  ready: boolean;
   *  res: Array<{ chain: string; success: boolean }>;
   * }>} An object containing the overall readiness status (ready) and an array (res) with the initialization status for each wallet.
   */
  public async init(): Promise<{
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
}
