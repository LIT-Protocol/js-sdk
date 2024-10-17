import { Cluster, clusterApiUrl, Connection, Keypair, Transaction } from '@solana/web3.js';

/* global ethers */

interface UnsignedTransaction {
  chain: string;
  serializedTransaction: string;
}

export function validateUnsignedTransaction(unsignedTransaction: UnsignedTransaction) {
  const VALID_NETWORKS = ['devnet', 'testnet', 'mainnet-beta'];

  if (!VALID_NETWORKS.includes(unsignedTransaction.chain)) {
    throw new Error(`Invalid Solana network: ${unsignedTransaction.chain}`);
  }

  if (
    !unsignedTransaction.serializedTransaction ||
    unsignedTransaction.serializedTransaction.length === 0
  ) {
    throw new Error(
      `Invalid serializedTransaction: ${unsignedTransaction.serializedTransaction}`
    );
  }
}

function signTransaction({ solanaKeyPair, transaction }: { solanaKeyPair: Keypair; transaction: Transaction }) {
  try {
    transaction.sign(solanaKeyPair);

    if (!transaction.signature) {
      throw new Error('Transaction signature is null');
    }

    return { signature: ethers.utils.base58.encode(transaction.signature) };
  } catch (err: unknown) {
    throw new Error(`When signing transaction - ${(err as Error).message}`);
  }
}

async function sendTransaction({ chain, transaction }: { chain: Cluster; transaction: Transaction }) {

  try {
    const solanaConnection = new Connection(clusterApiUrl(chain), 'confirmed');
    return await solanaConnection.sendRawTransaction(transaction.serialize());
  } catch (err: unknown) {
    throw new Error(`When sending transaction - ${(err as Error).message}`);
  }
}

export async function signTransactionSolanaKey({
  broadcast,
  privateKey,
  unsignedTransaction,
}: {
  broadcast: boolean;
  privateKey: string;
  unsignedTransaction: UnsignedTransaction;
}) {
  // Be sure you call validateUnsignedTransaction(unsignedTransaction); before calling this method!

  const solanaKeyPair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));

  const transaction = Transaction.from(
    Buffer.from(unsignedTransaction.serializedTransaction, 'base64')
  );

  const { signature } = signTransaction({ transaction, solanaKeyPair });

  if (!broadcast) {
    return signature;
  }
  // Ensure the chain is a valid Cluster type
  const chain: Cluster = unsignedTransaction.chain as Cluster;

  return await sendTransaction({
    chain,
    transaction,
  });
}