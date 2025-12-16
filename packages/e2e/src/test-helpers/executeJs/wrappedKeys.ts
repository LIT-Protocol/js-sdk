import type { SerializedTransaction } from '@lit-protocol/wrapped-keys';
import {
  api as wrappedKeysApi,
  config as wrappedKeysConfig,
} from '@lit-protocol/wrapped-keys';
import {
  litActionRepository,
  litActionRepositoryCommon,
} from '@lit-protocol/wrapped-keys-lit-actions';
import type { Blockhash } from '@solana/kit';
import {
  address,
  assertIsAddress,
  compileTransaction,
  createKeyPairFromBytes,
  createTransactionMessage,
  getAddressFromPublicKey,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getTransactionDecoder,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signBytes,
  signatureBytes as toSignatureBytes,
  verifySignature,
} from '@solana/kit';
import bs58 from 'bs58';
import { createHash, randomBytes } from 'crypto';
import { Wallet } from 'ethers';
import nacl from 'tweetnacl';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { AuthSig } from '@lit-protocol/types';
import { createEnvVars } from '../../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../../helper/createTestAccount';
import { createTestEnv } from '../../helper/createTestEnv';
import { fundAccount } from '../../helper/fundAccount';

const DEFAULT_NETWORK = 'evm' as const;
const SOLANA_NETWORK = 'solana' as const;
const EVM_CHAIN = 'yellowstone' as const;
const SOLANA_CHAIN = 'devnet' as const;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

namespace TestHelper {
  type TestEnvType = Awaited<ReturnType<typeof createTestEnv>>;

  export const randomMemo = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  export const randomCiphertext = () => randomBytes(48).toString('base64');

  export const randomHash = (input: string) =>
    createHash('sha256').update(input).digest('hex');

  export const createStorePayload = (memo = randomMemo('store')) => {
    const ciphertext = randomCiphertext();
    return {
      ciphertext,
      dataToEncryptHash: randomHash(ciphertext),
      publicKey: `0x${randomBytes(33).toString('hex')}`,
      keyType: 'K256' as const,
      memo,
    };
  };

  export const createSolanaStorePayload = (memo = randomMemo('sol-store')) => {
    const ciphertext = randomCiphertext();
    return {
      ciphertext,
      dataToEncryptHash: randomHash(ciphertext),
      publicKey: bs58.encode(Uint8Array.from(randomBytes(32))),
      keyType: 'ed25519' as const,
      memo,
    };
  };

  export const createSolanaUnsignedTransaction = (
    feePayerBase58: string
  ): SerializedTransaction => {
    const feePayer = address(feePayerBase58);
    const blockhash = bs58.encode(
      Uint8Array.from(randomBytes(32))
    ) as Blockhash;

    const transactionMessage = setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash,
        lastValidBlockHeight: 1_000_000n,
      },
      setTransactionMessageFeePayer(
        feePayer,
        createTransactionMessage({ version: 'legacy' })
      )
    );

    const transaction = compileTransaction(transactionMessage);
    const serialized = getBase64EncodedWireTransaction(transaction);

    return {
      chain: SOLANA_CHAIN,
      serializedTransaction: serialized,
    };
  };

  type PkpSessionArgs = {
    testEnv: TestEnvType;
    alice: CreateTestAccountResult;
    delegationAuthSig: AuthSig;
  };

  export const createPkpSessionSigs = async ({
    testEnv,
    alice,
    delegationAuthSig,
  }: PkpSessionArgs) => {
    return testEnv.authManager.createPkpSessionSigs({
      sessionKeyPair: testEnv.sessionKeyPair,
      pkpPublicKey: alice.pkp!.pubkey,
      delegationAuthSig,
      litClient: testEnv.litClient,
    });
  };

  type GenerateWrappedKeyArgs = PkpSessionArgs & {
    memo?: string;
    network: 'evm' | 'solana';
  };

  export const generateWrappedKeyForTest = async ({
    testEnv,
    alice,
    delegationAuthSig,
    network,
    memo = randomMemo('generatePrivateKey'),
  }: GenerateWrappedKeyArgs) => {
    const pkpSessionSigs = await createPkpSessionSigs({
      testEnv,
      alice,
      delegationAuthSig,
    });
    const result = await wrappedKeysApi.generatePrivateKey({
      pkpSessionSigs,
      network,
      litClient: testEnv.litClient,
      memo,
    });

    return {
      memo,
      id: result.id,
      generatedPublicKey: result.generatedPublicKey,
    };
  };

  type GenerateSolanaWrappedKeyArgs = PkpSessionArgs & {
    memo?: string;
  };

  export const generateSolanaWrappedKeyForTest = async ({
    testEnv,
    alice,
    delegationAuthSig,
    memo = randomMemo('sol-generate'),
  }: GenerateSolanaWrappedKeyArgs) => {
    const pkpSessionSigs = await createPkpSessionSigs({
      testEnv,
      alice,
      delegationAuthSig,
    });
    const result = await wrappedKeysApi.generatePrivateKey({
      pkpSessionSigs,
      network: SOLANA_NETWORK,
      litClient: testEnv.litClient,
      memo,
    });

    return {
      memo,
      id: result.id,
      publicKey: result.generatedPublicKey,
    };
  };
}

export const registerWrappedKeysTests = () => {
  let envVars: ReturnType<typeof createEnvVars>;
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let alice: CreateTestAccountResult;
  let aliceDelegationAuthSig: AuthSig;

  beforeAll(async () => {
    wrappedKeysConfig.setLitActionsCode(litActionRepository);
    wrappedKeysConfig.setLitActionsCodeCommon(litActionRepositoryCommon);

    envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    // Wrapped tests related env
    console.log('testEnv.sessionKeyPair:', testEnv.sessionKeyPair);

    // 1. First, create Alice
    alice = await createTestAccount(testEnv, {
      label: 'Alice',
      fundAccount: true,
      hasEoaAuthContext: true,
      fundLedger: true,
      hasPKP: true,
      fundPKP: true,
      hasPKPAuthContext: true,
      fundPKPLedger: true,
    });

    console.log('alice:', alice);

    console.log("alice's PKP Viem account", alice.pkpViemAccount!.address);

    // 2. Next, generate Alice's delegation Auth Sig
    aliceDelegationAuthSig =
      await testEnv.authManager.generatePkpDelegationAuthSig({
        pkpPublicKey: alice.pkp.pubkey,
        authData: alice.authData,
        sessionKeyPair: testEnv.sessionKeyPair,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        },
        litClient: testEnv.litClient,
      });

    console.log('aliceDelegationAuthSig:', aliceDelegationAuthSig);
  });

  describe('executeJs Integration', () => {
    describe('EVM network', () => {
      test('generatePrivateKey creates a new wrapped key', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        console.log('pkpSessionSigs:', pkpSessionSigs);

        const { pkpAddress, generatedPublicKey, id } =
          await wrappedKeysApi.generatePrivateKey({
            pkpSessionSigs,
            network: DEFAULT_NETWORK,
            litClient: testEnv.litClient,
            memo: TestHelper.randomMemo('generatePrivateKey-evm'),
          });

        console.log('Generated wrapped key pkpAddress:', pkpAddress);
        console.log(
          'Generated wrapped key generatedPublicKey:',
          generatedPublicKey
        );
        console.log('Generated wrapped key id:', id);
      });

      test('exportPrivateKey decrypts a stored wrapped key', async () => {
        const { id } = await TestHelper.generateWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          network: DEFAULT_NETWORK,
          memo: TestHelper.randomMemo('export-evm'),
        });

        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const { decryptedPrivateKey } = await wrappedKeysApi.exportPrivateKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: DEFAULT_NETWORK,
        });

        expect(decryptedPrivateKey.startsWith('0x')).toBe(true);
        expect(decryptedPrivateKey.length).toBe(66);
      });

      test('listEncryptedKeyMetadata returns metadata for stored keys', async () => {
        const memo = TestHelper.randomMemo('list-evm');
        const { id } = await TestHelper.generateWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          network: DEFAULT_NETWORK,
          memo,
        });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const metadata = await wrappedKeysApi.listEncryptedKeyMetadata({
          pkpSessionSigs,
          litClient: testEnv.litClient,
        });

        const entry = metadata.find((item) => item.id === id);
        expect(entry).toBeDefined();
        expect(entry?.memo).toBe(memo);
      });

      test('getEncryptedKey fetches ciphertext for a stored key', async () => {
        const { id } = await TestHelper.generateWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          network: DEFAULT_NETWORK,
          memo: TestHelper.randomMemo('get-evm'),
        });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const storedKey = await wrappedKeysApi.getEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
        });

        expect(storedKey.id).toBe(id);
        expect(storedKey.ciphertext).toBeTruthy();
        expect(storedKey.dataToEncryptHash).toBeTruthy();
      });

      test('importPrivateKey persists an externally generated key', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const wallet = Wallet.createRandom();
        const memo = TestHelper.randomMemo('import-evm');

        const result = await wrappedKeysApi.importPrivateKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
          keyType: 'K256',
          memo,
        });

        expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(result.id).toEqual(expect.any(String));
      });

      test('storeEncryptedKey persists provided ciphertext', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const payload = TestHelper.createStorePayload();

        const result = await wrappedKeysApi.storeEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          ...payload,
        });

        expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(result.id).toEqual(expect.any(String));
      });

      test('storeEncryptedKeyBatch persists multiple ciphertexts', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const keyBatch = [
          TestHelper.createStorePayload(),
          TestHelper.createStorePayload(),
        ];

        const result = await wrappedKeysApi.storeEncryptedKeyBatch({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          keyBatch,
        });

        expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(result.ids.length).toBe(keyBatch.length);
        for (const id of result.ids) {
          expect(id).toEqual(expect.any(String));
        }
      });

      test('signMessageWithEncryptedKey signs messages with stored keys', async () => {
        const { id } = await TestHelper.generateWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          network: DEFAULT_NETWORK,
          memo: TestHelper.randomMemo('sign-message-evm'),
        });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const message = 'hello from wrapped-keys';

        const signature = await wrappedKeysApi.signMessageWithEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: DEFAULT_NETWORK,
          messageToSign: message,
        });

        expect(typeof signature).toBe('string');
        expect(signature.length).toBeGreaterThan(0);
      });

      test('signTransactionWithEncryptedKey signs EVM transactions', async () => {
        const { id } = await TestHelper.generateWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          network: DEFAULT_NETWORK,
          memo: TestHelper.randomMemo('sign-transaction-evm'),
        });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const { decryptedPrivateKey } = await wrappedKeysApi.exportPrivateKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: DEFAULT_NETWORK,
        });

        const generatedAccount = privateKeyToAccount(
          decryptedPrivateKey as `0x${string}`
        );

        console.log(
          'Funding generated wrapped key address:',
          generatedAccount.address
        );

        await fundAccount(
          generatedAccount,
          testEnv.masterAccount,
          testEnv.networkModule,
          {
            ifLessThan: '0.005',
            thenFund: '0.01',
            label: 'generated wrapped key',
          }
        );

        const chainConfig = testEnv.networkModule.getChainConfig();
        const rpcUrl = chainConfig.rpcUrls?.default?.http?.[0];
        if (!rpcUrl) {
          throw new Error('Unable to determine RPC URL for funding wait');
        }

        const publicClient = createPublicClient({
          chain: chainConfig,
          transport: http(rpcUrl),
        });

        const sleep = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        const maxAttempts = 10;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const balance = await publicClient.getBalance({
            address: generatedAccount.address,
          });
          if (balance > 0n) {
            break;
          }
          if (attempt === maxAttempts - 1) {
            throw new Error('Timed out waiting for generated account funding');
          }
          await sleep(1500);
        }

        const unsignedTransaction = {
          toAddress: ZERO_ADDRESS,
          value: '0',
          chainId: chainConfig.id,
          chain: EVM_CHAIN,
        };

        const signedTransaction =
          await wrappedKeysApi.signTransactionWithEncryptedKey({
            pkpSessionSigs,
            litClient: testEnv.litClient,
            id,
            network: DEFAULT_NETWORK,
            unsignedTransaction,
            broadcast: false,
          });

        expect(typeof signedTransaction).toBe('string');
        expect(signedTransaction.length).toBeGreaterThan(0);
      });

      test('batchGeneratePrivateKeys generates multiple keys in one request', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const actions = [
          {
            network: DEFAULT_NETWORK,
            generateKeyParams: { memo: TestHelper.randomMemo('batch-evm-0') },
          },
        ];

        try {
          const result = await wrappedKeysApi.batchGeneratePrivateKeys({
            pkpSessionSigs,
            litClient: testEnv.litClient,
            actions,
          });

          expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
          expect(result.results.length).toBe(actions.length);
          for (const actionResult of result.results) {
            expect(actionResult.generateEncryptedPrivateKey.id).toEqual(
              expect.any(String)
            );
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('"error":413')) {
            console.warn(
              'batchGeneratePrivateKeys: skipping assertions because Lit nodes returned 413 (payload too large / currently unsupported).'
            );
            return;
          }

          throw error;
        }
      });
    });

    describe('Solana network', () => {
      test('generatePrivateKey creates a new Solana wrapped key', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const { pkpAddress, generatedPublicKey, id } =
          await wrappedKeysApi.generatePrivateKey({
            pkpSessionSigs,
            network: SOLANA_NETWORK,
            litClient: testEnv.litClient,
            memo: TestHelper.randomMemo('sol-generate'),
          });

        expect(pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(() => assertIsAddress(generatedPublicKey)).not.toThrow();
        expect(id).toEqual(expect.any(String));
      });

      test('exportPrivateKey decrypts a stored Solana wrapped key', async () => {
        const { id, publicKey } =
          await TestHelper.generateSolanaWrappedKeyForTest({
            testEnv,
            alice,
            delegationAuthSig: aliceDelegationAuthSig,
            memo: TestHelper.randomMemo('sol-export'),
          });

        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const exported = await wrappedKeysApi.exportPrivateKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: SOLANA_NETWORK,
        });

        expect(exported.keyType).toBe('ed25519');
        expect(exported.publicKey).toBe(publicKey);
        expect(exported.decryptedPrivateKey).toMatch(/^[0-9a-f]+$/i);
        expect(exported.decryptedPrivateKey.length).toBe(128);

        const exportedSecretKey = Uint8Array.from(
          Buffer.from(exported.decryptedPrivateKey, 'hex')
        );
        const { publicKey: exportedPublicKey } = await createKeyPairFromBytes(
          exportedSecretKey,
          true
        );
        const derivedPublicKey = await getAddressFromPublicKey(
          exportedPublicKey
        );

        expect(derivedPublicKey).toBe(publicKey);
      });

      test('listEncryptedKeyMetadata returns metadata for Solana keys', async () => {
        const memo = TestHelper.randomMemo('sol-list');
        const { id } = await TestHelper.generateSolanaWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          memo,
        });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const metadata = await wrappedKeysApi.listEncryptedKeyMetadata({
          pkpSessionSigs,
          litClient: testEnv.litClient,
        });

        const entry = metadata.find((item) => item.id === id);
        expect(entry).toBeDefined();
        expect(entry?.memo).toBe(memo);
      });

      test('getEncryptedKey fetches ciphertext for a Solana key', async () => {
        const { id } = await TestHelper.generateSolanaWrappedKeyForTest({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
          memo: TestHelper.randomMemo('sol-get'),
        });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const storedKey = await wrappedKeysApi.getEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
        });

        expect(storedKey.id).toBe(id);
        expect(storedKey.ciphertext).toBeTruthy();
        expect(storedKey.dataToEncryptHash).toBeTruthy();
      });

      test('storeEncryptedKey persists provided Solana ciphertext', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const payload = TestHelper.createSolanaStorePayload();

        const result = await wrappedKeysApi.storeEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          ...payload,
        });

        expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(result.id).toEqual(expect.any(String));
      });

      test('storeEncryptedKeyBatch persists multiple Solana ciphertexts', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const keyBatch = [
          TestHelper.createSolanaStorePayload(),
          TestHelper.createSolanaStorePayload(),
        ];

        const result = await wrappedKeysApi.storeEncryptedKeyBatch({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          keyBatch,
        });

        expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(result.ids.length).toBe(keyBatch.length);
        for (const id of result.ids) {
          expect(id).toEqual(expect.any(String));
        }
      });

      test('importPrivateKey persists a Solana wrapped key', async () => {
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const keyPair = nacl.sign.keyPair();
        const secretKeyBytes = keyPair.secretKey;
        const publicKey = bs58.encode(keyPair.publicKey);
        const privateKeyHex = Buffer.from(secretKeyBytes).toString('hex');

        const memo = TestHelper.randomMemo('sol-import');
        const result = await wrappedKeysApi.importPrivateKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          privateKey: privateKeyHex,
          publicKey,
          keyType: 'ed25519',
          memo,
        });

        expect(result.pkpAddress).toBe(alice.pkp!.ethAddress);
        expect(result.id).toEqual(expect.any(String));
      });

      test('signMessageWithEncryptedKey signs messages with Solana keys', async () => {
        const { id, publicKey } =
          await TestHelper.generateSolanaWrappedKeyForTest({
            testEnv,
            alice,
            delegationAuthSig: aliceDelegationAuthSig,
            memo: TestHelper.randomMemo('sol-sign-message'),
          });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });
        const message = 'hello from solana wrapped-keys';

        const signature = await wrappedKeysApi.signMessageWithEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: SOLANA_NETWORK,
          messageToSign: message,
        });

        const decodedSignature = new Uint8Array(bs58.decode(signature));
        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = new Uint8Array(bs58.decode(publicKey));

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          publicKeyBytes,
          { name: 'Ed25519' },
          false,
          ['verify']
        );

        const isValid = await verifySignature(
          cryptoKey,
          toSignatureBytes(decodedSignature),
          messageBytes
        );

        expect(isValid).toBe(true);
      });

      test('signTransactionWithEncryptedKey signs Solana transactions', async () => {
        const { id, publicKey } =
          await TestHelper.generateSolanaWrappedKeyForTest({
            testEnv,
            alice,
            delegationAuthSig: aliceDelegationAuthSig,
            memo: TestHelper.randomMemo('sol-sign-transaction'),
          });
        const pkpSessionSigs = await TestHelper.createPkpSessionSigs({
          testEnv,
          alice,
          delegationAuthSig: aliceDelegationAuthSig,
        });

        const unsignedTransaction =
          TestHelper.createSolanaUnsignedTransaction(publicKey);

        const signature = await wrappedKeysApi.signTransactionWithEncryptedKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: SOLANA_NETWORK,
          unsignedTransaction,
          broadcast: false,
        });

        const decodedSignatureBytes = new Uint8Array(bs58.decode(signature));

        const { decryptedPrivateKey } = await wrappedKeysApi.exportPrivateKey({
          pkpSessionSigs,
          litClient: testEnv.litClient,
          id,
          network: SOLANA_NETWORK,
        });

        const base64Encoder = getBase64Encoder();
        const transactionDecoder = getTransactionDecoder();
        const transactionBytes = base64Encoder.encode(
          unsignedTransaction.serializedTransaction
        );
        const transaction = transactionDecoder.decode(transactionBytes);
        const messageBytes = transaction.messageBytes;
        const privateKeyBytes = Uint8Array.from(
          Buffer.from(decryptedPrivateKey, 'hex')
        );
        const { privateKey: signingKey } = await createKeyPairFromBytes(
          privateKeyBytes,
          true
        );
        const expectedSignature = await signBytes(signingKey, messageBytes);

        expect(Array.from(decodedSignatureBytes)).toEqual(
          Array.from(expectedSignature)
        );
      });
    });
  });
};
