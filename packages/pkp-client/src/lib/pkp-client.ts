import { PKP_CLIENT_SUPPORTED_CHAINS } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import {
  PKPClientProp,
  PKPCosmosWalletProp,
  PKPEthersWalletProp,
} from '@lit-protocol/types';

export class PKPClient {
  private cosmosWallet: PKPCosmosWallet | undefined;
  private ethWallet: PKPEthersWallet | undefined;

  public readonly pkpPubKey: string;

  /**
   * Constructs a new PKPClient instance with the provided properties.
   * Automatically registers supported wallets.
   *
   * @param {PKPClientProp} prop - The properties required for the PKPClient instance.
   */
  constructor(prop: PKPClientProp) {
    this.pkpPubKey = prop.pkpPubKey;

    this.ethWallet = new PKPEthersWallet({ ...prop } as PKPEthersWalletProp);
    this.cosmosWallet = new PKPCosmosWallet({ ...prop } as PKPCosmosWalletProp);
  }

  /**
   * Returns a list of supported chains.
   *
   * @returns {string[]} An array of supported chain names.
   */
  getSupportedChains(): string[] {
    return PKP_CLIENT_SUPPORTED_CHAINS;
  }

  /**
   * Retrieves the wallet instance for a specific chain.
   *
   * @template T - The wallet type, defaults to PKPBase if not provided.
   * @param {string} chain - The name of the chain for which to retrieve the wallet instance.
   * @returns {T} The wallet instance for the specified chain.
   * @throws Will throw an error if the chain is not supported.
   */
  getWallet(chain: 'eth'): PKPEthersWallet;
  getWallet(chain: 'cosmos'): PKPCosmosWallet;
  getWallet(chain: string): PKPEthersWallet | PKPCosmosWallet {
    switch (chain) {
      case 'eth':
        if (!this.ethWallet) {
          throw new Error('Ethereum wallet not initialized');
        }
        return this.ethWallet;
      case 'cosmos':
        if (!this.cosmosWallet) {
          throw new Error('Cosmos wallet not initialized');
        }
        return this.cosmosWallet;
      case 'btc':
        throw new Error('BTC wallet not supported yet');
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  /**
   * Retrieves the Ethereum wallet instance.
   *
   * @returns {PKPEthersWallet} The Ethereum wallet instance.
   */
  getEthWallet = (): PKPEthersWallet => {
    return this.getWallet('eth');
  };

  /**
   * Retrieves the Cosmos wallet instance.
   *
   * @returns {PKPCosmosWallet} The Cosmos wallet instance.
   */
  getCosmosWallet = (): PKPCosmosWallet => {
    return this.getWallet('cosmos');
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
    res: { chain: string; success: boolean }[];
  }> {
    const walletStatus: { chain: string; success: boolean }[] = [];

    const wallets = {
      eth: this.ethWallet,
      cosmos: this.cosmosWallet,
    };
    const walletEntries = Object.entries(wallets);

    for (const [chain, wallet] of walletEntries) {
      try {
        await wallet!.init();
        walletStatus.push({ chain, success: wallet!.litNodeClientReady });
      } catch (error) {
        walletStatus.push({ chain, success: false });
      }
    }

    const successfulInits = walletStatus.filter(
      (status) => status.success
    ).length;

    if (successfulInits !== walletEntries.length) {
      log(
        `Not all wallets initialized successfully. Details: ${JSON.stringify(
          walletStatus,
          null,
          2
        )}`
      );
    }

    return {
      ready: successfulInits === walletEntries.length,
      res: walletStatus,
    };
  }
}
