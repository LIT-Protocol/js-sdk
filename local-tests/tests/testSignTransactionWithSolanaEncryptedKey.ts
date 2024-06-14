import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { signTransactionWithSolanaEncryptedKeyLitActionIpfsCid } from '@lit-protocol/wrapped-keys';
import {
  AccessControlConditions,
  ILitNodeClient,
  LitAbility,
} from '@lit-protocol/types';
import { encryptString } from '@lit-protocol/lit-node-client-nodejs';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 * ❔ NETWORK=localchain yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 */
export const testSignTransactionWithSolanaEncryptedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const solanaKeypair = Keypair.generate();
  const decryptionAccessControlConditions: AccessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '=',
        value: await alice.wallet.getAddress(),
      },
    },
  ];

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions: decryptionAccessControlConditions,
      dataToEncrypt: Buffer.from(solanaKeypair.secretKey).toString('hex'),
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  const sessionSigs = await devEnv.litNodeClient.getSessionSigs({
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
      {
        resource: new LitAccessControlConditionResource('*'),
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback: async ({ uri, resourceAbilityRequests }) => {
      const toSign = await createSiweMessageWithRecaps({
        uri: uri!,
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        resources: resourceAbilityRequests!,
        walletAddress: await alice.wallet.getAddress(),
        nonce: await devEnv.litNodeClient!.getLatestBlockhash(),
        litNodeClient: devEnv.litNodeClient,
      });
      return await generateAuthSig({
        signer: alice.wallet,
        toSign,
      });
    },
  });

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
      requireAllSignatures: false,
      verifySignatures: false,
    })
    .toString('base64');

  const result = await devEnv.litNodeClient.executeJs({
    sessionSigs,
    ipfsId: signTransactionWithSolanaEncryptedKeyLitActionIpfsCid,
    jsParams: {
      accessControlConditions: decryptionAccessControlConditions,
      ciphertext,
      dataToEncryptHash,
      serializedTransaction,
      broadcast: false,
      solanaNetwork: 'devnet',
    },
  });

  const signatureBuffer = Buffer.from(result.response as string, 'base64');
  solanaTransaction.addSignature(solanaKeypair.publicKey, signatureBuffer);

  if (!solanaTransaction.verifySignatures()) {
    throw new Error(
      `Signature: ${result.response} doesn't validate for the Solana transaction.`
    );
  }

  log('✅ testSignMessageWithSolanaEncryptedKey');
};
