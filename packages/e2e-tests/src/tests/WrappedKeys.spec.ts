import { expect, jest } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';
import {
  EthereumLitTransaction,
  SerializedTransaction,
  api,
} from '@lit-protocol/wrapped-keys';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import { getPkpSessionSigs } from '../../setup/session-sigs/get-pkp-session-sigs';

import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { ethers } from 'ethers';
import {
  AuthSig,
  LIT_NETWORKS_KEYS,
  SessionSigsMap,
} from '@lit-protocol/types';
import { encryptString } from '@lit-protocol/encryption';
import { getEoaSessionSigs } from '../../setup/session-sigs/get-eoa-session-sigs';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { LIT_ACTION_CID_REPOSITORY } from '../../../wrapped-keys/src/lib/lit-actions-client/constants';
import { getPkpAccessControlCondition } from '../../../wrapped-keys/src/lib/utils';
import { LIT_PREFIX } from '../../../wrapped-keys/src/lib/constants';

const {
  importPrivateKey,
  signTransactionWithEncryptedKey,
  signMessageWithEncryptedKey,
  generatePrivateKey,
  exportPrivateKey,
} = api;

/**
 * Helper migrated from tinny utils due to an issue with root level dependency resolve
 * Migration is acceptible due to aggreagation of test casses into a snigle file context.
 * @returns {string}
 */
export function randomSolanaPrivateKey() {
  const BASE58_ALPHABET =
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const SOLANA_PRIVATE_KEY_LENGTH = 88;

  let result = '';
  const charactersLength = BASE58_ALPHABET.length;
  for (let i = 0; i < SOLANA_PRIVATE_KEY_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += BASE58_ALPHABET.charAt(randomIndex);
  }
  return result;
}

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('Wrapped Keys', () => {
  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    devEnv = new TinnyEnvironment();
    await devEnv.init();
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  it('Sign Tx Sol Encrypted Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const solanaKeypair = Keypair.generate();
    const privateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv?.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const solanaTransaction = new Transaction();
    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: solanaKeypair.publicKey,
        toPubkey: new PublicKey(solanaKeypair.publicKey),
        lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
      })
    );
    solanaTransaction.feePayer = solanaKeypair.publicKey;

    const solanaConnection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed'
    );
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
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'solana',
      unsignedTransaction,
      broadcast: false,
      litNodeClient: devEnv?.litNodeClient!,
    });

    console.log('signedTx');
    console.log(signedTx);

    const signatureBuffer = Buffer.from(signedTx, 'base64');
    solanaTransaction.addSignature(solanaKeypair.publicKey, signatureBuffer);

    if (!solanaTransaction.verifySignatures()) {
      throw new Error(
        `Signature: ${signedTx} doesn't validate for the Solana transaction.`
      );
    }
  });

  it('Sign Message Sol Encryption Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const solanaKeypair = Keypair.generate();
    const privateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv?.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const messageToSign = 'This is a test message';

    const signature = await signMessageWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'solana',
      messageToSign,
      litNodeClient: devEnv?.litNodeClient!,
    });

    console.log('signature');
    console.log(signature);

    const signatureIsValidForPublicKey = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      bs58.decode(signature),
      solanaKeypair.publicKey.toBuffer()
    );

    if (!signatureIsValidForPublicKey)
      throw new Error(
        `signature: ${signature} doesn't validate for the Solana public key: ${solanaKeypair.publicKey.toString()}`
      );
  });

  it('Import Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey = randomSolanaPrivateKey();
    // '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB';

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv?.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }
  });

  it('Generate Solana Wrapped Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      network: 'solana',
      litNodeClient: devEnv?.litNodeClient!,
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const messageToSign = 'This is a test message';

    const signature = await signMessageWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      litNodeClient: devEnv?.litNodeClient!,
      network: 'solana',
      messageToSign,
    });

    const signatureIsValidForPublicKey = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      bs58.decode(signature),
      bs58.decode(generatedPublicKey)
    );

    if (!signatureIsValidForPublicKey)
      throw new Error(
        `signature: ${signature} doesn't validate for the Solana public key: ${generatedPublicKey}`
      );

    const pkpSessionSigsExport = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const { decryptedPrivateKey } = await exportPrivateKey({
      pkpSessionSigs: pkpSessionSigsExport!,
      litNodeClient: devEnv?.litNodeClient!,
      network: 'solana',
    });

    const solanaKeyPair = Keypair.fromSecretKey(
      Buffer.from(decryptedPrivateKey, 'hex')
    );
    const decryptedPublicKey = solanaKeyPair.publicKey;

    if (decryptedPublicKey.toString() !== generatedPublicKey) {
      throw new Error(
        `Decrypted decryptedPublicKey: ${decryptedPublicKey} doesn't match with the original generatedPublicKey: ${generatedPublicKey}`
      );
    }
  });

  it('Generate ETH Wrapped Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      network: 'evm',
      litNodeClient: devEnv.litNodeClient!,
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsExport = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsExport);

    const { decryptedPrivateKey } = await exportPrivateKey({
      pkpSessionSigs: pkpSessionSigsExport!,
      litNodeClient: devEnv.litNodeClient!,
      network: 'evm',
    });

    const wallet = new ethers.Wallet(decryptedPrivateKey);
    const decryptedPublicKey = wallet.publicKey;

    if (decryptedPublicKey !== generatedPublicKey) {
      throw new Error(
        `Decrypted decryptedPublicKey: ${decryptedPublicKey} doesn't match with the original generatedPublicKey: ${generatedPublicKey}`
      );
    }
  });

  it('Fail Import Wrapped Key Same Private Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey =
      '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB'; // Already exists in the DB

    try {
      await importPrivateKey({
        pkpSessionSigs: pkpSessionSigs!,
        privateKey,
        litNodeClient: devEnv.litNodeClient!,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
      });
    } catch (e: any) {
      if (
        e.message.includes(
          'Failed to make request for wrapped key: There is already a wrapped key stored with the same dataToEncryptHash. A wrapped key may only be associated with a single pkpAddress'
        )
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithSamePrivateKey is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Import Wrapped Key Same PKP', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey1 = randomSolanaPrivateKey();

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey: privateKey1,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    console.log('✅ testFailImportWrappedKeysWithSamePkp');

    try {
      const privateKey2 = randomSolanaPrivateKey();

      await importPrivateKey({
        pkpSessionSigs: pkpSessionSigs!,
        privateKey: privateKey2,
        litNodeClient: devEnv.litNodeClient!,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
      });
    } catch (e: any) {
      if (
        e.message.includes(
          'There is already a wrapped key stored, either for the provided pkpAddress, or with the same dataToEncryptHash; a pkpAddress may only have 1 wrapped key, and a wrapped key may only be associated with a single pkpAddress.'
        )
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithSamePkp is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Max Expiration Session Sig', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

    console.log(pkpSessionSigs);

    try {
      const privateKey = randomSolanaPrivateKey();

      await importPrivateKey({
        pkpSessionSigs: pkpSessionSigs!,
        privateKey,
        litNodeClient: devEnv.litNodeClient!,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
      });
    } catch (e: any) {
      if (e.message.includes('Expires too far in the future')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithMaxExpirySessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Import Invalid Session Sig', async () => {
    const tamperPkpSessionSigs = (
      pkpSessionSig: SessionSigsMap
    ): SessionSigsMap => {
      const tamperedPkpSessionSigs: SessionSigsMap = {};

      for (const key in pkpSessionSig) {
        if (pkpSessionSig.hasOwnProperty(key)) {
          const authSig = pkpSessionSig[key];
          const updatedAuthSig: AuthSig = {
            ...authSig,
            address: authSig.address.slice(0, -1),
          };
          tamperedPkpSessionSigs[key] = updatedAuthSig;
        }
      }

      console.log(tamperedPkpSessionSigs);

      return tamperedPkpSessionSigs;
    };

    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

    console.log(pkpSessionSigs);

    try {
      const privateKey = randomSolanaPrivateKey();

      await importPrivateKey({
        pkpSessionSigs: tamperPkpSessionSigs(pkpSessionSigs!),
        privateKey,
        litNodeClient: devEnv.litNodeClient!,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
      });
    } catch (e: any) {
      if (e.message.includes('bad public key size')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithInvalidSessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Import Expired Session Sig', async () => {
    const pkpSessionSigs: SessionSigsMap = {
      'https://207.244.70.36:8474': {
        sig: '1827d1c7b79c979ce76d0b9e130f6804dbf7c7838b6dfa41d4cadf690b9a8bec23321dde6cc573e8a592c395193074ade303d94f3c198d8f0017ca0aca91bd0f',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8474"}`,
        address:
          '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
        algo: 'ed25519',
      },
      'https://207.244.70.36:8473': {
        sig: '762b9849d2cc77d0c75aa354c3cce63abca008a9a07ec3efc69ee8a4954650c3362b8cb83cd3d63310ad98b446be5e68cb8193f9d486453b2df72188dc698d0e',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8473"}`,
        address:
          '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
        algo: 'ed25519',
      },
      'https://207.244.70.36:8475': {
        sig: '5e506dc973cc1540dcb3bd1de251afa687caf277cb5f3efe107339ecf4c25607d4bdf5d8c8910874519252e026a49cc66cea0b07bc5d38342c7cb2613decbe0a',
        derivedVia: 'litSessionSignViaNacl',
        signedMessage: `{"sessionKey":"4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"{\\"ProofOfPossession\\":\\"8f060f34f55e996e8396c5036cb456dbf3b3cf79a6c9d2a9c036a27dae6be5cb286c0170c45404ce60d45ad5df384a030450f4eabe61af68d7267d2de035a1ff0697097b3b32413581d8550b198599b8ee5c29a78999c05f8806e33923705748\\"}","algo":"LIT_BLS","derivedVia":"lit.bls","signedMessage":"litprotocol.com wants you to sign in with your Ethereum account:\\n0xd1Af1AAC50aC837C873200D17b78664aFCde597C\\n\\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\\n\\nURI: lit:session:4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b\\nVersion: 1\\nChain ID: 1\\nNonce: 0xa8b687976835989b8ac57e8e6cb17fa316cc9ef74ea6174a588f08b11571829c\\nIssued At: 2024-06-02T19:46:47Z\\nExpiration Time: 2024-06-03T19:47:14.907Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOltdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTc0NDQwMjAsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4MkY2ZjU4NzRhNGQyNTFlMzVDZDc4YjM1NzZDQTkwYkQyZjA1RmUwQiJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsImN1c3RvbUF1dGhSZXNvdXJjZSI6IiIsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0","address":"0xd1Af1AAC50aC837C873200D17b78664aFCde597C"}],"issuedAt":"2024-06-02T19:47:16.707Z","expiration":"2024-06-03T19:47:14.907Z","nodeAddress":"https://207.244.70.36:8475"}`,
        address:
          '4fd3d6ae41190cdd33a07bc5feb4a51b0c882474e6b51eb37cf799d6668eb44b',
        algo: 'ed25519',
      },
    };

    try {
      const privateKey = randomSolanaPrivateKey();

      const res = await importPrivateKey({
        pkpSessionSigs,
        privateKey,
        litNodeClient: devEnv.litNodeClient!,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
      });
      console.log(res);
    } catch (e: any) {
      if (e.message.includes('Invalid sessionSig: Expired')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithExpiredSessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail EOA Session Sig', async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    console.log(eoaSessionSigs);

    const privateKey = randomSolanaPrivateKey();

    try {
      await importPrivateKey({
        pkpSessionSigs: eoaSessionSigs!,
        privateKey,
        litNodeClient: devEnv.litNodeClient!,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
      });
    } catch (e: any) {
      if (e.message.includes('SessionSig is not from a PKP')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithEoaSessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Eth Sign Tx Missing Params', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const privateKey = ethers.Wallet.createRandom().privateKey;

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    try {
      const _res = await signTransactionWithEncryptedKey({
        pkpSessionSigs: pkpSessionSigsSigning!,
        network: 'evm',
        unsignedTransaction: {
          ...getChainForNetwork(devEnv.litNodeClient?.config?.litNetwork!),
          // @ts-expect-error This test is intentionally using the type incorrectly.
          serializedTransaction: 'random-value',
        },
        broadcast: false,
        litNodeClient: devEnv.litNodeClient!,
      });
    } catch (e: any) {
      if (
        e.message.includes(
          'Error executing the Signing Lit Action: Error: Missing required field: toAddress'
        )
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailEthereumSignTransactionWrappedKeyWithMissingParam is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Eth Sign Invalid Param', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey = ethers.Wallet.createRandom().privateKey;

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedTransaction: EthereumLitTransaction = {
      ...getBaseTransactionForNetwork({
        network: devEnv.litNodeClient!.config.litNetwork,
        toAddress: alice.wallet.address,
      }),
      dataHex: 'Test transaction from Alice to bob',
    };

    try {
      const _res = await signTransactionWithEncryptedKey({
        pkpSessionSigs: pkpSessionSigsSigning!,
        network: 'evm',
        unsignedTransaction,
        broadcast: false,
        litNodeClient: devEnv.litNodeClient!,
      });
    } catch (e: any) {
      if (
        e.message.includes(
          'Error executing the Signing Lit Action: Error: When signing transaction- invalid hexlify value'
        )
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailEthereumSignTransactionWrappedKeyWithInvalidParam is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Fail Eth TX Invalid Decryption', async () => {
    const alice = await devEnv.createRandomPerson();
    const privateKey = ethers.Wallet.createRandom().privateKey;
    const alicePkpAddress = alice.authMethodOwnedPkp!.ethAddress;
    const decryptionAccessControlCondition =
      getPkpAccessControlCondition(alicePkpAddress);
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions: [decryptionAccessControlCondition],
        dataToEncrypt: LIT_PREFIX + privateKey,
      },
      devEnv.litNodeClient!
    );

    const bob = await devEnv.createRandomPerson();
    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      bob,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry
    console.log(pkpSessionSigsSigning);

    const unsignedTransaction = getBaseTransactionForNetwork({
      network: devEnv.litNodeClient?.config.litNetwork!,
      toAddress: alice.wallet.address,
    });

    try {
      const _res = await devEnv.litNodeClient?.executeJs({
        sessionSigs: pkpSessionSigsSigning,
        ipfsId: LIT_ACTION_CID_REPOSITORY.signTransaction.evm,
        jsParams: {
          ciphertext,
          dataToEncryptHash,
          unsignedTransaction,
          accessControlConditions: [decryptionAccessControlCondition],
        },
      });
    } catch (e: any) {
      if (
        e.message.includes(
          'There was an error getting the signing shares from the nodes'
        )
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailEthereumSignTransactionWrappedKeyInvalidDecryption is expected to have an error'
        );
      } else {
        throw e;
      }
    }
  });

  it('Export', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigsImport = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsImport);

    const privateKey = randomSolanaPrivateKey();

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigsImport!,
      privateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsExport = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsExport);

    const { decryptedPrivateKey } = await exportPrivateKey({
      pkpSessionSigs: pkpSessionSigsExport!,
      litNodeClient: devEnv.litNodeClient!,
      network: 'solana',
    });

    if (decryptedPrivateKey !== privateKey) {
      throw new Error(
        `Decrypted private key: ${decryptedPrivateKey} doesn't match with the original private key: ${privateKey}`
      );
    }
  });

  it('Eth Sign Tx', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey = ethers.Wallet.createRandom().privateKey;

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedTransaction = getBaseTransactionForNetwork({
      network: devEnv.litNodeClient?.config.litNetwork!,
      toAddress: alice.wallet.address,
    });

    const signedTx = await signTransactionWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      unsignedTransaction,
      broadcast: false,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signedTx');
    console.log(signedTx);

    if (!ethers.utils.isHexString(signedTx)) {
      throw new Error(`signedTx isn't hex: ${signedTx}`);
    }
  });

  it('Eth Sign Message', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey = ethers.Wallet.createRandom().privateKey;

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedStringMessage = 'This is a test message';

    const signature = await signMessageWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      messageToSign: unsignedStringMessage,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signature');
    console.log(signature);

    if (!ethers.utils.isHexString(signature)) {
      throw new Error(`signature isn't hex: ${signature}`);
    }

    const unsignedBinaryMessage = ethers.utils.arrayify(
      ethers.utils.toUtf8Bytes(unsignedStringMessage)
    );

    const signatureBinary = await signMessageWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      messageToSign: unsignedBinaryMessage,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signatureBinary');
    console.log(signatureBinary);

    if (!ethers.utils.isHexString(signatureBinary)) {
      throw new Error(`signatureBinary isn't hex: ${signatureBinary}`);
    }

    if (signatureBinary !== signature) {
      throw new Error(
        `signature: ${signature} doesn't match it's signatureBinary form: ${signatureBinary}`
      );
    }
  });

  it('Eth Sign Message Generate Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const privateKey = ethers.Wallet.createRandom().privateKey;

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedStringMessage = 'This is a test message';

    const signature = await signMessageWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      messageToSign: unsignedStringMessage,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signature');
    console.log(signature);

    if (!ethers.utils.isHexString(signature)) {
      throw new Error(`signature isn't hex: ${signature}`);
    }

    const unsignedBinaryMessage = ethers.utils.arrayify(
      ethers.utils.toUtf8Bytes(unsignedStringMessage)
    );

    const signatureBinary = await signMessageWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      messageToSign: unsignedBinaryMessage,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signatureBinary');
    console.log(signatureBinary);

    if (!ethers.utils.isHexString(signatureBinary)) {
      throw new Error(`signatureBinary isn't hex: ${signatureBinary}`);
    }

    if (signatureBinary !== signature) {
      throw new Error(
        `signature: ${signature} doesn't match it's signatureBinary form: ${signatureBinary}`
      );
    }
  });

  it('Eth Broadcast With Fetch Gas Params', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const wrappedKeysWallet = ethers.Wallet.createRandom();
    const wrappedKeysWalletPrivateKey = wrappedKeysWallet.privateKey;

    const wrappedKeysWalletAddress = wrappedKeysWallet.address;
    console.log(`Sending funds to ${wrappedKeysWalletAddress}`);
    await devEnv.getFunds(wrappedKeysWallet.address, '0.005');

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey: wrappedKeysWalletPrivateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedTransaction: EthereumLitTransaction = {
      toAddress: alice.wallet.address,
      value: '0.0001', // in ethers (Lit tokens)
      dataHex: ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes('Test transaction from Alice to bob')
      ),
      ...getChainForNetwork(devEnv.litNodeClient?.config.litNetwork!),
    };

    const signedTx = await signTransactionWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      unsignedTransaction,
      broadcast: true,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signedTx');
    console.log(signedTx);

    // TODO: Get the raw input from the tx hash, convert it to UTF-8 and assert that it contains "Test transaction from Alice to bob"
    if (!ethers.utils.isHexString(signedTx)) {
      throw new Error(`signedTx isn't hex: ${signedTx}`);
    }
  });

  it('Eth Broadcast Tx', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const wrappedKeysWallet = ethers.Wallet.createRandom();
    const wrappedKeysWalletPrivateKey = wrappedKeysWallet.privateKey;

    const wrappedKeysWalletAddress = wrappedKeysWallet.address;
    console.log(`Sending funds to ${wrappedKeysWalletAddress}`);
    await devEnv.getFunds(wrappedKeysWallet.address, '0.005');

    const pkpAddress = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      privateKey: wrappedKeysWalletPrivateKey,
      litNodeClient: devEnv.litNodeClient!,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedTransaction = getBaseTransactionForNetwork({
      network: devEnv.litNodeClient?.config.litNetwork!,
      toAddress: alice.wallet.address,
    });

    const signedTx = await signTransactionWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      unsignedTransaction,
      broadcast: true,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signedTx');
    console.log(signedTx);

    // TODO: Get the raw input from the tx hash, convert it to UTF-8 and assert that it contains "Test transaction from Alice to bob"
    if (!ethers.utils.isHexString(signedTx)) {
      throw new Error(`signedTx isn't hex: ${signedTx}`);
    }
  });

  it('Eth Broadcast Tx Generated Key', async () => {
    const alice = await devEnv.createRandomPerson();

    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigs);

    const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
      pkpSessionSigs: pkpSessionSigs!,
      network: 'evm',
      litNodeClient: devEnv.litNodeClient!,
    });

    const generatedKeysWalletAddress =
      ethers.utils.computeAddress(generatedPublicKey);
    console.log(`Sending funds to ${generatedKeysWalletAddress}`);
    await devEnv.getFunds(generatedKeysWalletAddress, '0.005');

    const alicePkpAddress = alice.authMethodOwnedPkp?.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      undefined,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log(pkpSessionSigsSigning);

    const unsignedTransaction = getBaseTransactionForNetwork({
      network: devEnv.litNodeClient?.config.litNetwork!,
      toAddress: alice.wallet.address,
    });

    const signedTx = await signTransactionWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning!,
      network: 'evm',
      unsignedTransaction,
      broadcast: true,
      litNodeClient: devEnv.litNodeClient!,
    });

    console.log('signedTx');
    console.log(signedTx);

    if (!ethers.utils.isHexString(signedTx)) {
      throw new Error(`signedTx isn't hex: ${signedTx}`);
    }
  });
});

/**
 * UTILITIES
 */
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
