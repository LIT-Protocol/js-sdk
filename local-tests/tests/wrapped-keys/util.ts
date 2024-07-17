import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import { EthereumLitTransaction } from '@lit-protocol/wrapped-keys';

export function getChainForNetwork(network: LIT_NETWORKS_KEYS): {
  chain: string;
  chainId: number;
} {
  switch (network) {
    case 'cayenne':
    case 'habanero':
    case 'manzano':
      return {
        chain: 'chronicleTestnet',
        chainId: LIT_CHAINS['chronicleTestnet'].chainId,
      };
    case 'datil-dev':
      return {
        chain: 'vesuvius',
        chainId: LIT_CHAINS['vesuvius'].chainId,
      };
    case 'datil-test':
      return {
        chain: 'yellowstone',
        chainId: LIT_CHAINS['yellowstone'].chainId,
      };
    default:
      throw new Error(`Cannot identify chain params for ${network}`);
  }
}

export function getGasParamsForNetwork(network: LIT_NETWORKS_KEYS): {
  gasPrice?: string;
  gasLimit: number;
} {
  switch (network) {
    case 'cayenne':
    case 'habanero':
    case 'manzano':
      return {
        gasPrice: '0.001',
        gasLimit: 30000,
      };
    case 'datil-dev':
      return { gasLimit: 5000000 };
    case 'datil-test':
      return { gasLimit: 5000000 };
    default:
      throw new Error(`Cannot identify chain params for ${network}`);
  }
}

export function getBaseTransactionForNetwork({
  toAddress,
  network,
}: {
  toAddress: string;
  network: LIT_NETWORKS_KEYS;
}): EthereumLitTransaction {
  return {
    toAddress,
    value: '0.0001', // in ethers (Lit tokens)
    ...getChainForNetwork(network),
    ...getGasParamsForNetwork(network),
    dataHex: ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes('Test transaction from Alice to bob')
    ),
  };
}
