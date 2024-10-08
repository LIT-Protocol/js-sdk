const {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} = require('@solana/web3.js');

/* global ethers */

function validateUnsignedTransaction(unsignedTransaction) {
  const VALID_NETWORKS = ['devnet', 'testnet', 'mainnet-beta'];

  if (!VALID_NETWORKS.includes(unsignedTransaction.chain)) {
    throw new Error(`Invalid Solana network: ${unsignedTransaction.chain}`);
  }

  if (
    !unsignedTransaction.serializedTransaction ||
    !unsignedTransaction.serializedTransaction.length === 0
  ) {
    throw new Error(
      `Invalid serializedTransaction: ${unsignedTransaction.serializedTransaction}`
    );
  }
}

function signTransaction({ solanaKeyPair, transaction }) {
  try {
    transaction.sign(solanaKeyPair);

    return { signature: ethers.utils.base58.encode(transaction.signature) };
  } catch (err) {
    throw new Error(`When signing transaction - ${err.message}`);
  }
}

async function sendTransaction({ chain, transaction }) {
  try {
    const solanaConnection = new Connection(clusterApiUrl(chain), 'confirmed');
    return await solanaConnection.sendRawTransaction(transaction.serialize());
  } catch (err) {
    throw new Error(`When sending transaction - ${err.message}`);
  }
}

export async function signTransactionSolanaKey({
  broadcast,
  privateKey,
  unsignedTransaction,
}) {
  validateUnsignedTransaction(unsignedTransaction);

  const solanaKeyPair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));

  const transaction = Transaction.from(
    Buffer.from(unsignedTransaction.serializedTransaction, 'base64')
  );

  const { signature } = signTransaction({ transaction, solanaKeyPair });

  if (!broadcast) {
    return signature;
  }

  return await sendTransaction({
    chain: unsignedTransaction.chain,
    transaction,
  });
}
