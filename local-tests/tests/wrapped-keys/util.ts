import { LIT_NETWORKS_KEYS } from '@lit-protocol/types';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import type {
  EthereumLitTransaction,
  LitActionCodeRepository,
  LitActionCodeRepositoryCommon,
} from '@lit-protocol/wrapped-keys';
import { config, SerializedTransaction } from '@lit-protocol/wrapped-keys';
import {
  litActionRepository,
  litActionRepositoryCommon,
} from '@lit-protocol/wrapped-keys-lit-actions';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

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
    case 'cayenne':
    case 'habanero':
    case 'manzano':
      return {
        chain: 'chronicleTestnet',
        chainId: LIT_CHAINS['chronicleTestnet'].chainId,
      };
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

export async function getSolanaTransaction({
  solanaKeypair,
}: {
  solanaKeypair: Keypair;
}): Promise<{
  unsignedTransaction: SerializedTransaction;
  solanaTransaction: Transaction;
}> {
  const solanaConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const solanaTransaction = new Transaction();

  solanaTransaction.add(
    SystemProgram.transfer({
      fromPubkey: solanaKeypair.publicKey,
      toPubkey: new PublicKey(solanaKeypair.publicKey),
      lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
    })
  );
  solanaTransaction.feePayer = solanaKeypair.publicKey;

  const { blockhash } = await solanaConnection.getLatestBlockhash();
  solanaTransaction.recentBlockhash = blockhash;

  const serializedTransaction = solanaTransaction
    .serialize({
      requireAllSignatures: false, // should be false as we're not signing the message
      verifySignatures: false, // should be false as we're not signing the message
    })
    .toString('base64');

  return {
    solanaTransaction,
    unsignedTransaction: {
      serializedTransaction,
      chain: 'devnet',
    },
  };
}
