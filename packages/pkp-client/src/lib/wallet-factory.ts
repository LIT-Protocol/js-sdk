import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import {
  PKPBaseProp,
  PKPEthersWalletProp,
  PKPCosmosWalletProp,
} from '@lit-protocol/types';

import { PKPBase } from '@lit-protocol/pkp-base';

export class WalletFactory {
  static createWallet(chain: string, prop: PKPBaseProp): PKPBase {
    switch (chain) {
      case 'eth':
        prop.rpc = prop.rpcs?.eth;
        return new PKPEthersWallet({ ...prop } as PKPEthersWalletProp);
      case 'cosmos':
        prop.rpc = prop.rpcs?.cosmos;
        return new PKPCosmosWallet(prop as PKPCosmosWalletProp);
      case 'btc':
        throw new Error('BTC wallet is not supported yet');
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }
}
