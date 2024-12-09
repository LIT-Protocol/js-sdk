import { log } from '@lit-protocol/misc';
import { api } from '@lit-protocol/wrapped-keys';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, } from '@solana/web3.js';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { ethers } from 'ethers';
const { importPrivateKey, signTransactionWithEncryptedKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 * ✅ NETWORK=custom yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 */
export const testSignTransactionWithSolanaEncryptedKey = async (devEnv) => {
    /**
     * The commented code tests the following. We're commenting it as Solana heavily rate limits its Air Dropping
     * 1. Importing with the actual Solana publicKey
     * 2. Requesting a Solana Airdrop on devnet
     * 3. Setting broadcast as true so that the Lit Action returns the transaction signature which can be used to confirm the tx
     * 4. Checking the status of the tx as well as confirming it
     */
    const alice = await devEnv.createRandomPerson();
    try {
        const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice, null, new Date(Date.now() + 1000 * 60 * 10).toISOString()); // 10 mins expiry
        const solanaKeypair = Keypair.generate();
        const privateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');
        // const publicKey = solanaKeypair.publicKey;
        // console.log("publicKey");
        // console.log(publicKey); // https://explorer.solana.com/address/jnu7wE8XMWXDmghQuVUZUUtQ1HFRkn8mwoquVif3e8q?cluster=devnet
        const { pkpAddress, id } = await importPrivateKey({
            pkpSessionSigs,
            privateKey,
            litNodeClient: devEnv.litNodeClient,
            publicKey: '0xdeadbeef',
            // publicKey: publicKey.toBase58(),
            keyType: 'K256',
            memo: 'Test key',
        });
        const solanaConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        // Request Solana Airdrop
        // const balance = await solanaConnection.getBalance(solanaKeypair.publicKey);
        // console.log("balance- ", balance); // Should be 0, in fact if we get the balance right after the Air Drop it will also be 0 unless we wait. We're skipping the balance confirmation
        // await solanaConnection.requestAirdrop(solanaKeypair.publicKey, 1000000000);
        const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
        if (pkpAddress !== alicePkpAddress) {
            throw new Error(`Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`);
        }
        const pkpSessionSigsSigning = await getPkpSessionSigs(devEnv, alice, null, new Date(Date.now() + 1000 * 60 * 10).toISOString()); // 10 mins expiry
        const solanaTransaction = new Transaction();
        solanaTransaction.add(SystemProgram.transfer({
            fromPubkey: solanaKeypair.publicKey,
            toPubkey: new PublicKey(solanaKeypair.publicKey),
            lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
        }));
        solanaTransaction.feePayer = solanaKeypair.publicKey;
        const { blockhash } = await solanaConnection.getLatestBlockhash();
        solanaTransaction.recentBlockhash = blockhash;
        const serializedTransaction = solanaTransaction
            .serialize({
            requireAllSignatures: false, // should be false as we're not signing the message
            verifySignatures: false, // should be false as we're not signing the message
        })
            .toString('base64');
        const unsignedTransaction = {
            serializedTransaction,
            chain: 'devnet',
        };
        const signedTx = await signTransactionWithEncryptedKey({
            pkpSessionSigs: pkpSessionSigsSigning,
            network: 'solana',
            unsignedTransaction,
            broadcast: false,
            // broadcast: true,
            litNodeClient: devEnv.litNodeClient,
            id,
        });
        // The following Explorer link show that the imported Solana wallet was sent an Air Drop and then broadcasted a tx from within the Lit Action
        // https://explorer.solana.com/address/jnu7wE8XMWXDmghQuVUZUUtQ1HFRkn8mwoquVif3e8q?cluster=devnet
        // Transaction Signature upon broadcast from `sendRawTransaction()`. We use this below to check the status of the tx and check whether it's confirmed.
        // console.log(signedTx); // 5YEthLprbhk5Zwn47YU7qZW6qZEFFhJTEK37B53vLLzGNXis436SLk5vYD7QQK7LuERtKunuSuxdwTYkS48Bb1Vf
        // const status = await solanaConnection.getSignatureStatus(signedTx);
        // console.log(status); // { context: { apiVersion: '2.0.5', slot: 321490377 }, value: { confirmationStatus: 'confirmed', confirmations: 0, err: null, slot: 321490377, status: { Ok: null } } }
        // const confirmation = await solanaConnection.confirmTransaction(signedTx);
        // console.log(confirmation); // { context: { slot: 321490379 }, value: { err: null } }
        const signatureBuffer = Buffer.from(ethers.utils.base58.decode(signedTx));
        solanaTransaction.addSignature(solanaKeypair.publicKey, signatureBuffer);
        if (!solanaTransaction.verifySignatures()) {
            throw new Error(`Signature: ${signedTx} doesn't validate for the Solana transaction.`);
        }
        log('✅ testSignMessageWithSolanaEncryptedKey');
    }
    finally {
        devEnv.releasePrivateKeyFromUser(alice);
    }
};
//# sourceMappingURL=testSignTransactionWithSolanaEncryptedKey.js.map