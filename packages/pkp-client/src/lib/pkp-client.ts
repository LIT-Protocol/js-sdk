import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import {
  PKPBaseProp,
  PKPEthersWalletProp,
  PKPCosmosWalletProp,
  PKPClientProp,
} from '@lit-protocol/types';

import { PKPBase } from '@lit-protocol/pkp-base';

export class PKPClient {
  private wallets: Map<string, PKPBase> = new Map();

  constructor(prop: PKPClientProp) {
    this.wallets = new Map<string, PKPBase>();
    this.registerWallet('eth', new PKPEthersWallet(prop));
    this.registerWallet('cosmos', new PKPCosmosWallet(prop));
  }

  registerWallet(chain: string, wallet: PKPBase) {
    this.wallets.set(chain, wallet);
  }

  getSupportedChains() {
    return Array.from(this.wallets.keys());
  }

  getWallet(chain: string) {
    const wallet = this.wallets.get(chain);
    if (!wallet) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return wallet;
  }

  getEtherWallet() {
    return this.getWallet('eth') as PKPEthersWallet;
  }

  getCosmosWallet() {
    return this.getWallet('cosmos') as PKPCosmosWallet;
  }

  public async init() {}
}
