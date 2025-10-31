import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import { config } from '@lit-protocol/wrapped-keys';
import {
  litActionRepositoryCommon,
  litActionRepository,
} from '@lit-protocol/wrapped-keys-lit-actions';

import type {
  LitActionCodeRepository,
  LitActionCodeRepositoryCommon,
  EthereumLitTransaction,
} from '@lit-protocol/wrapped-keys';

const emptyLitActionRepositoryCommon: LitActionCodeRepositoryCommon = {
  batchGenerateEncryptedKeys: '',
};

const emptyLitActionRepository: LitActionCodeRepository = {
  signTransaction: {
    evm: '',
    solana: '',
  },
  signMessage: {
    evm: '',
    solana: '',
  },
  signTypedData: {
    evm: '',
    solana: '',
  },
  generateEncryptedKey: {
    evm: '',
    solana: '',
  },
  exportPrivateKey: {
    evm: '',
    solana: '',
  },
};

export function resetLitActionsCode() {
  config.setLitActionsCodeCommon(emptyLitActionRepositoryCommon);
  config.setLitActionsCode(emptyLitActionRepository);
}

export function setLitActionsCodeToLocal() {
  config.setLitActionsCodeCommon(litActionRepositoryCommon);
  config.setLitActionsCode(litActionRepository);
}

export function getChainForNetwork(network: LIT_NETWORKS_KEYS): {
  chain: string;
  chainId: number;
} {
  switch (network) {
    case 'datil-dev':
      return {
        chain: 'yellowstone',
        chainId: LIT_CHAINS['yellowstone'].chainId,
      };
    case 'datil-test':
      return {
        chain: 'yellowstone',
        chainId: LIT_CHAINS['yellowstone'].chainId,
      };
    case 'datil':
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
    case 'datil-dev':
      return { gasLimit: 5000000 };
    case 'datil-test':
      return { gasLimit: 5000000 };
    case 'datil':
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

/**
 * Derives an Ethereum address from a generated public key
 * @param generatedPublicKey The public key string (with or without 0x prefix, with or without 0x04 prefix)
 * @returns The derived Ethereum address
 */
export function deriveAddressFromGeneratedPublicKey(
  generatedPublicKey: string
): string {
  const sanitizedPublicKey = generatedPublicKey.slice(
    generatedPublicKey.startsWith('0x04') ? 4 : 2
  );
  const addressHash = ethers.utils.keccak256(`0x${sanitizedPublicKey}`);
  return ethers.utils.getAddress(
    `0x${addressHash.substring(addressHash.length - 40)}`
  );
}
