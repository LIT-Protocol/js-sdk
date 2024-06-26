import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  api,
  EthereumLitTransaction,
  SerializedTransaction,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

const { importPrivateKey, signTransactionWithEncryptedKey } = api;

const CUSTOM_LIT_ACTION_CODE = `(async () => {
  const LIT_PREFIX = 'lit_';

  let decryptedPrivateKey;
  decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    chain: 'ethereum',
    authSig: null,
  });

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX)
    ? decryptedPrivateKey.slice(LIT_PREFIX.length)
    : decryptedPrivateKey;
  const wallet = new ethers.Wallet(privateKey);

  const nonce = await Lit.Actions.getLatestNonce({
    address: wallet.address,
    chain: unsignedTransaction.chain,
  });

  const tx = {
    to: unsignedTransaction.toAddress,
    from: wallet.address,
    value: ethers.utils.hexlify(
      ethers.utils.parseEther(unsignedTransaction.value)
    ),
    chainId: unsignedTransaction.chainId,
    data: unsignedTransaction.dataHex,
    nonce,
    gasPrice: ethers.utils.parseUnits(unsignedTransaction.gasPrice, 'gwei'),
    gasLimit: unsignedTransaction.gasLimit,
  };

  const rpcUrl = await Lit.Actions.getRpcUrl({
    chain: unsignedTransaction.chain,
  });
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  try {
    const signedTx = await wallet.signTransaction(tx);

    if (broadcast) {
      const transactionResponse = await provider.sendTransaction(signedTx);

      Lit.Actions.setResponse({ response: transactionResponse.hash });
    } else {
      Lit.Actions.setResponse({ response: signedTx });
    }
  } catch (err) {
    const errorMessage = 'Error: When signing transaction- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
  }
})();
`;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testEthereumSignTransactionWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testEthereumSignTransactionWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testEthereumSignTransactionWrappedKey
 */
export const testCustomSignTransactionWrappedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigs);

  const solanaKeypair = Keypair.generate();
  const privateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey,
    litNodeClient: devEnv.litNodeClient,
    address: '0xdeadbeef',
    algo: 'K256',
  });

  const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
  if (pkpAddress !== alicePkpAddress) {
    throw new Error(
      `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
    );
  }

  const pkpSessionSigsSigning = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigsSigning);

  const solanaTransaction = new Transaction();
  solanaTransaction.add(
    SystemProgram.transfer({
      fromPubkey: solanaKeypair.publicKey,
      toPubkey: new PublicKey(solanaKeypair.publicKey),
      lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
    })
  );
  solanaTransaction.feePayer = solanaKeypair.publicKey;

  const solanaConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const { blockhash } = await solanaConnection.getLatestBlockhash();
  solanaTransaction.recentBlockhash = blockhash;

  const serializedTransaction = solanaTransaction
    .serialize({
      requireAllSignatures: false, // should be false as we're not signing the message
      verifySignatures: false, // should be false as we're not signing the message
    })
    .toString('base64');

  const unsignedTransaction: SerializedTransaction = {
    serializedTransaction,
    chain: 'devnet',
  };

  const signedTx = await signTransactionWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    network: 'custom',
    unsignedTransaction,
    broadcast: false,
    litNodeClient: devEnv.litNodeClient,
    litActionCode: CUSTOM_LIT_ACTION_CODE,
  });

  console.log('signedTx');
  console.log(signedTx);

  if (!ethers.utils.isHexString(signedTx)) {
    throw new Error(`signedTx isn't hex: ${signedTx}`);
  }

  log('✅ testEthereumSignTransactionWrappedKey');
};
