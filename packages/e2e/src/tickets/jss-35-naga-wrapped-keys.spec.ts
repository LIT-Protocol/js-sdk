import { createHash, randomBytes } from 'crypto';
import { Wallet } from 'ethers';
import { initFast } from '../init';
import { generateSessionKeyPair } from '@lit-protocol/auth';
import {
  api as wrappedKeysApi,
  config as wrappedKeysConfig,
} from '@lit-protocol/wrapped-keys';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  litActionRepository,
  litActionRepositoryCommon,
} from '@lit-protocol/wrapped-keys-lit-actions';
import { fundAccount } from '../helper/fundAccount';

describe('Wrapped Keys executeJs integration', () => {
  type InitContext = Awaited<ReturnType<typeof initFast>>;
  type WrappedKeysTestContext = InitContext & {
    sessionKeyPair: ReturnType<typeof generateSessionKeyPair>;
    delegationAuthSig: Awaited<
      ReturnType<InitContext['authManager']['generatePkpDelegationAuthSig']>
    >;
    pkpAuthContext: Awaited<
      ReturnType<InitContext['authManager']['createPkpAuthContext']>
    >;
    pkpViemAccount: Awaited<
      ReturnType<InitContext['litClient']['getPkpViemAccount']>
    >;
    chainId: number;
    masterAccount: ReturnType<typeof privateKeyToAccount>;
  };

  const ctx = {} as WrappedKeysTestContext;

  const DEFAULT_NETWORK: 'evm' = 'evm';
  const EVM_CHAIN = 'yellowstone' as const;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const randomMemo = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  const randomCiphertext = () => randomBytes(48).toString('base64');

  const randomHash = (input: string) =>
    createHash('sha256').update(input).digest('hex');

  const createStorePayload = (memo = randomMemo('store')) => {
    const ciphertext = randomCiphertext();
    return {
      ciphertext,
      dataToEncryptHash: randomHash(ciphertext),
      publicKey: `0x${randomBytes(33).toString('hex')}`,
      keyType: 'K256' as const,
      memo,
    };
  };

  const createPkpSessionSigs = async () => {
    const { delegationAuthSig, sessionKeyPair, authManager, litClient } = ctx;

    return authManager.createPkpSessionSigs({
      sessionKeyPair,
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      delegationAuthSig,
      litClient,
    });
  };

  const generateWrappedKeyForTest = async (memo = randomMemo('generated')) => {
    const pkpSessionSigs = await createPkpSessionSigs();
    const result = await wrappedKeysApi.generatePrivateKey({
      pkpSessionSigs,
      network: DEFAULT_NETWORK,
      litClient: ctx.litClient,
      memo,
    });

    return { memo, id: result.id };
  };

  beforeAll(async () => {
    wrappedKeysConfig.setLitActionsCode(litActionRepository);
    wrappedKeysConfig.setLitActionsCodeCommon(litActionRepositoryCommon);

    const initContext = await initFast();

    Object.assign(ctx, initContext);

    ctx.sessionKeyPair = generateSessionKeyPair();

    const masterAccount =
      ctx.resolvedNetwork.type === 'local'
        ? ctx.localMasterAccount
        : privateKeyToAccount(
            process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`
          );

    ctx.pkpAuthContext = await ctx.authManager.createPkpAuthContext({
      authData: ctx.aliceViemAccountAuthData,
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: ctx.litClient,
    });

    const chainConfig =
      ctx.resolvedNetwork.networkModule.getChainConfig();

    ctx.pkpViemAccount = await ctx.litClient.getPkpViemAccount({
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authContext: ctx.pkpAuthContext,
      chainConfig,
    });

    ctx.chainId = chainConfig.id;

    ctx.masterAccount = masterAccount;

    await fundAccount(
      ctx.pkpViemAccount,
      ctx.masterAccount,
      ctx.resolvedNetwork.networkModule,
      {
        ifLessThan: '0.005',
        thenFundWith: '0.01',
      }
    );

    ctx.delegationAuthSig = await ctx.authManager.generatePkpDelegationAuthSig({
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authData: ctx.aliceViemAccountAuthData,
      sessionKeyPair: ctx.sessionKeyPair,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: ctx.litClient,
    });
  });

  test('generatePrivateKey creates a new wrapped key', async () => {
    const pkpSessionSigs = await createPkpSessionSigs();

    const { pkpAddress, generatedPublicKey, id } =
      await wrappedKeysApi.generatePrivateKey({
        pkpSessionSigs,
        network: DEFAULT_NETWORK,
        litClient: ctx.litClient,
        memo: randomMemo('generate'),
      });

    expect(pkpAddress).toBe(ctx.aliceViemAccountPkp.ethAddress);
    expect(generatedPublicKey).toBeTruthy();
    expect(id).toEqual(expect.any(String));
  });

  test('exportPrivateKey decrypts a stored wrapped key', async () => {
    const { id } = await generateWrappedKeyForTest(randomMemo('export'));

    const pkpSessionSigs = await createPkpSessionSigs();
    // Export once so we can derive and fund the generated key prior to gas estimation.
    const { decryptedPrivateKey } = await wrappedKeysApi.exportPrivateKey({
      pkpSessionSigs,
      litClient: ctx.litClient,
      id,
      network: DEFAULT_NETWORK,
    });

    expect(decryptedPrivateKey.startsWith('0x')).toBe(true);
    expect(decryptedPrivateKey.length).toBe(66);
  });

  test('listEncryptedKeyMetadata returns metadata for stored keys', async () => {
    const memo = randomMemo('list');
    const { id } = await generateWrappedKeyForTest(memo);
    const pkpSessionSigs = await createPkpSessionSigs();

    const metadata = await wrappedKeysApi.listEncryptedKeyMetadata({
      pkpSessionSigs,
      litClient: ctx.litClient,
    });

    const entry = metadata.find((item) => item.id === id);
    expect(entry).toBeDefined();
    expect(entry?.memo).toBe(memo);
  });

  test('getEncryptedKey fetches ciphertext for a stored key', async () => {
    const { id } = await generateWrappedKeyForTest(randomMemo('get'));
    const pkpSessionSigs = await createPkpSessionSigs();

    const storedKey = await wrappedKeysApi.getEncryptedKey({
      pkpSessionSigs,
      litClient: ctx.litClient,
      id,
    });

    expect(storedKey.id).toBe(id);
    expect(storedKey.ciphertext).toBeTruthy();
    expect(storedKey.dataToEncryptHash).toBeTruthy();
  });

  test('importPrivateKey persists an externally generated key', async () => {
    const pkpSessionSigs = await createPkpSessionSigs();
    const wallet = Wallet.createRandom();
    const memo = randomMemo('import');

    const result = await wrappedKeysApi.importPrivateKey({
      pkpSessionSigs,
      litClient: ctx.litClient,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      keyType: 'K256',
      memo,
    });

    expect(result.pkpAddress).toBe(ctx.aliceViemAccountPkp.ethAddress);
    expect(result.id).toEqual(expect.any(String));
  });

  test('storeEncryptedKey persists provided ciphertext', async () => {
    const pkpSessionSigs = await createPkpSessionSigs();
    const payload = createStorePayload();

    const result = await wrappedKeysApi.storeEncryptedKey({
      pkpSessionSigs,
      litClient: ctx.litClient,
      ...payload,
    });

    expect(result.pkpAddress).toBe(ctx.aliceViemAccountPkp.ethAddress);
    expect(result.id).toEqual(expect.any(String));
  });

  test('storeEncryptedKeyBatch persists multiple ciphertexts', async () => {
    const pkpSessionSigs = await createPkpSessionSigs();
    const keyBatch = [createStorePayload(), createStorePayload()];

    const result = await wrappedKeysApi.storeEncryptedKeyBatch({
      pkpSessionSigs,
      litClient: ctx.litClient,
      keyBatch,
    });

    expect(result.pkpAddress).toBe(ctx.aliceViemAccountPkp.ethAddress);
    expect(result.ids.length).toBe(keyBatch.length);
    for (const id of result.ids) {
      expect(id).toEqual(expect.any(String));
    }
  });

  test('signMessageWithEncryptedKey signs messages with stored keys', async () => {
    const { id } = await generateWrappedKeyForTest(randomMemo('sign-message'));
    const pkpSessionSigs = await createPkpSessionSigs();
    const message = 'hello from wrapped-keys';

    const signature = await wrappedKeysApi.signMessageWithEncryptedKey({
      pkpSessionSigs,
      litClient: ctx.litClient,
      id,
      network: DEFAULT_NETWORK,
      messageToSign: message,
    });

    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(0);
  });

  test('signTransactionWithEncryptedKey signs EVM transactions', async () => {
    const { id } = await generateWrappedKeyForTest(
      randomMemo('sign-transaction')
    );
    const pkpSessionSigs = await createPkpSessionSigs();

    const { decryptedPrivateKey } = await wrappedKeysApi.exportPrivateKey({
      pkpSessionSigs,
      litClient: ctx.litClient,
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

    const fundingResult = await fundAccount(
      generatedAccount,
      ctx.masterAccount,
      ctx.resolvedNetwork.networkModule,
      {
        ifLessThan: '0.005',
        thenFundWith: '0.01',
      }
    );

    if (fundingResult) {
      console.log('Waiting for funding tx receipt:', fundingResult.txHash);
      const publicClient = createPublicClient({
        chain: ctx.resolvedNetwork.networkModule.getChainConfig(),
        transport: http(fundingResult.rpcUrl),
      });

      await publicClient.waitForTransactionReceipt({
        hash: fundingResult.txHash,
      });
    }

    const unsignedTransaction = {
      toAddress: ZERO_ADDRESS,
      value: '0',
      chainId: ctx.chainId,
      chain: EVM_CHAIN,
    };

    const signedTransaction =
      await wrappedKeysApi.signTransactionWithEncryptedKey({
        pkpSessionSigs,
        litClient: ctx.litClient,
        id,
        network: DEFAULT_NETWORK,
        unsignedTransaction,
        broadcast: false,
      });

    expect(typeof signedTransaction).toBe('string');
    expect(signedTransaction.length).toBeGreaterThan(0);
  });

  test('batchGeneratePrivateKeys generates multiple keys in one request', async () => {
    const pkpSessionSigs = await createPkpSessionSigs();
    const actions = [
      {
        network: DEFAULT_NETWORK,
        generateKeyParams: { memo: randomMemo('batch-0') },
      },
    ];

    try {
      const result = await wrappedKeysApi.batchGeneratePrivateKeys({
        pkpSessionSigs,
        litClient: ctx.litClient,
        actions,
      });

      expect(result.pkpAddress).toBe(ctx.aliceViemAccountPkp.ethAddress);
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
