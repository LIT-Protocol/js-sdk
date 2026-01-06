import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { AuthData, PKPData } from '@lit-protocol/schemas';
import {
  api as wrappedKeysApi,
  config as wrappedKeysConfig,
} from '@lit-protocol/wrapped-keys';
import {
  litActionRepository,
  litActionRepositoryCommon,
} from '@lit-protocol/wrapped-keys-lit-actions';
import { Wallet } from 'ethers';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { createEnvVars } from '../helper/createEnvVars';
import type { CreateTestAccountResult } from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';
import { fundAccount } from '../helper/fundAccount';
import { persistGeneratedAccount } from '../helper/generated-accounts';
import type { AuthContext, ViemAccount } from '../types';

const LITE_DEBUG_MINT = process.env['LITE_DEBUG_MINT'] === '1';
const LITE_DEBUG_EXIT_BEFORE_MINT =
  process.env['LITE_DEBUG_EXIT_BEFORE_MINT'] === '1';

export const LITE_CORE_FUNCTIONS = [
  'handshake',
  'pkpSign',
  'signSessionKey',
  'executeJs',
  'encryptDecrypt',
  'wrappedKeys',
] as const;

export const LITE_FUNCTIONS = [
  ...LITE_CORE_FUNCTIONS,
  'paymentDelegation',
] as const;

export type LiteFunctionName = (typeof LITE_FUNCTIONS)[number];
type LiteCoreFunctionName = (typeof LITE_CORE_FUNCTIONS)[number];

export type LiteUptimeRunner = (
  name: LiteFunctionName,
  fn: () => Promise<void>
) => Promise<void>;

export type LiteContext = {
  envVars: ReturnType<typeof createEnvVars>;
  testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  masterAccount: ViemAccount;
  masterAuthData: AuthData;
  masterEoaAuthContext: AuthContext;
  masterPkp: PKPData;
};

type LiteCreateTestAccountOpts = {
  label: string;
  fundAccount: boolean;
  fundLedger: boolean;
  hasEoaAuthContext?: boolean;
  hasPKP: boolean;
  fundPKP: boolean;
  fundPKPLedger: boolean;
  hasPKPAuthContext?: boolean;
  sponsor?: {
    restrictions: {
      totalMaxPriceInWei: string;
      requestsPerPeriod: string;
      periodSeconds: string;
    };
    userAddresses: string[] | `0x${string}`[];
  };
};

const getRpcUrl = (
  testEnv: Awaited<ReturnType<typeof createTestEnv>>,
  envVars: ReturnType<typeof createEnvVars>
) =>
  envVars.rpcUrl ??
  testEnv.networkModule.getChainConfig().rpcUrls.default.http[0];

const assertNativeBalance = async (
  testEnv: Awaited<ReturnType<typeof createTestEnv>>,
  account: ViemAccount,
  envVars: ReturnType<typeof createEnvVars>
) => {
  const rpcUrl = getRpcUrl(testEnv, envVars);
  const publicClient = createPublicClient({
    chain: testEnv.networkModule.getChainConfig(),
    transport: http(rpcUrl),
  });
  const balance = await publicClient.getBalance({
    address: account.address,
  });
  const minWei = parseEther(testEnv.config.nativeFundingAmount);

  if (balance < minWei) {
    throw new Error(
      `MASTER account ${account.address} balance ${formatEther(
        balance
      )} ETH is below minimum ${testEnv.config.nativeFundingAmount} ETH.`
    );
  }
};

const ensureLedgerBalance = async (
  testEnv: Awaited<ReturnType<typeof createTestEnv>>,
  userAddress: `0x${string}`
) => {
  const desiredWei = parseEther(testEnv.config.ledgerDepositAmount);
  const balance = await testEnv.masterPaymentManager.getBalance({
    userAddress,
  });
  const currentWei = balance.raw.availableBalance;
  const deltaWei = desiredWei > currentWei ? desiredWei - currentWei : 0n;

  if (deltaWei > 0n) {
    await testEnv.masterPaymentManager.depositForUser({
      userAddress,
      amountInEth: formatEther(deltaWei),
    });
  }
};

const ensureAuthDataPublicKey = (
  authData: AuthData,
  account: ViemAccount
): AuthData =>
  authData.publicKey ? authData : { ...authData, publicKey: account.publicKey };

const formatAuthDataForLog = (authData: AuthData) => {
  const authMethodIdBytes = authData.authMethodId
    ? (authData.authMethodId.length - 2) / 2
    : 0;
  const publicKeyBytes = authData.publicKey
    ? (authData.publicKey.length - 2) / 2
    : 0;

  let authSigAddress: string | undefined;
  let authSigLength: number | undefined;
  try {
    const parsed = JSON.parse(authData.accessToken ?? '{}') as {
      address?: string;
      sig?: string;
    };
    authSigAddress = parsed.address;
    authSigLength = parsed.sig?.length;
  } catch {
    authSigAddress = '[parse_error]';
  }

  return {
    authMethodType: authData.authMethodType,
    authMethodId: authData.authMethodId,
    authMethodIdBytes,
    publicKey: authData.publicKey ?? '[unset]',
    publicKeyBytes,
    authSigAddress,
    authSigLength,
    accessTokenLength: authData.accessToken?.length ?? 0,
  };
};

const formatPkpForLog = (pkp?: PKPData) =>
  pkp
    ? {
        tokenId: pkp.tokenId,
        pubkey: pkp.pubkey,
        ethAddress: pkp.ethAddress,
      }
    : '[none]';

const logMintDebug = (label: string, stage: string, data: unknown) => {
  if (!LITE_DEBUG_MINT) {
    return;
  }
  console.log(`[lite-mint-debug] ${label} :: ${stage}`, data);
};

const getOrCreatePkpLite = async (
  testEnv: Awaited<ReturnType<typeof createTestEnv>>,
  account: ViemAccount,
  authData: AuthData,
  label: string
): Promise<PKPData> => {
  logMintDebug(label, 'viewPKPsByAuthData.request', {
    account: account.address,
    authData: formatAuthDataForLog(authData),
  });

  const { pkps } = await testEnv.litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: 5,
    },
  });

  if (pkps && pkps[0]) {
    logMintDebug(label, 'viewPKPsByAuthData.response', {
      count: pkps.length,
      first: formatPkpForLog(pkps[0]),
    });
    return pkps[0];
  }

  logMintDebug(label, 'viewPKPsByAuthData.response', {
    count: pkps?.length ?? 0,
    first: formatPkpForLog(pkps?.[0]),
  });

  const scopes = ['sign-anything'];
  logMintDebug(label, 'mintWithAuth.request', {
    account: account.address,
    authData: formatAuthDataForLog(authData),
    scopes,
  });

  if (LITE_DEBUG_EXIT_BEFORE_MINT) {
    console.log('❌ Exiting before mint for debug.');
    console.log('label:', label);
    console.log('account.address:', account.address);
    console.log('account.publicKey:', account.publicKey);
    console.log('authData.authMethodType:', authData.authMethodType);
    console.log('authData.authMethodId:', authData.authMethodId);
    console.log('authData.publicKey:', authData.publicKey ?? '[unset]');
    console.log(
      'authData.accessToken.length:',
      authData.accessToken?.length ?? 0
    );
    process.exit(1);
  }

  let mintResult: unknown;
  try {
    mintResult = await testEnv.litClient.mintWithAuth({
      authData,
      account,
      scopes,
    });
  } catch (error) {
    logMintDebug(label, 'mintWithAuth.error', error);
    throw error;
  }

  logMintDebug(label, 'mintWithAuth.response', {
    txHash: (mintResult as { txHash?: string })?.txHash,
    data: (mintResult as { data?: PKPData })?.data
      ? formatPkpForLog((mintResult as { data?: PKPData }).data)
      : mintResult,
  });

  const { pkps: mintedPkps } = await testEnv.litClient.viewPKPsByAuthData({
    authData,
    pagination: {
      limit: 5,
    },
  });

  logMintDebug(label, 'viewPKPsByAuthData.afterMint', {
    count: mintedPkps?.length ?? 0,
    first: formatPkpForLog(mintedPkps?.[0]),
  });

  if (!mintedPkps?.[0]) {
    throw new Error('PKP mint completed but no PKP returned via lookup.');
  }

  return mintedPkps[0];
};

const createTestAccountLite = async (
  testEnv: Awaited<ReturnType<typeof createTestEnv>>,
  opts: LiteCreateTestAccountOpts
): Promise<CreateTestAccountResult> => {
  console.log(`--- ${`[${opts.label}]`} Creating test account ---`);
  const privateKey = generatePrivateKey();
  persistGeneratedAccount({
    label: `createTestAccount:${opts.label}`,
    privateKey,
    network:
      typeof testEnv.networkModule.getNetworkName === 'function'
        ? testEnv.networkModule.getNetworkName()
        : process.env['NETWORK'],
  });

  const account = privateKeyToAccount(privateKey);
  const baseAuthData = await ViemAccountAuthenticator.authenticate(account);
  const authData = ensureAuthDataPublicKey(baseAuthData, account);

  const person: CreateTestAccountResult = {
    account,
    pkp: undefined,
    eoaAuthContext: undefined,
    pkpAuthContext: undefined,
    pkpViemAccount: undefined,
    paymentManager: undefined,
    authData,
  };

  console.log(`Address`, person.account.address);
  console.log(`opts:`, opts);

  if (opts.fundAccount) {
    await fundAccount(
      person.account,
      testEnv.masterAccount,
      testEnv.networkModule,
      {
        label: 'owner',
        ifLessThan: testEnv.config.nativeFundingAmount,
        thenFund: testEnv.config.nativeFundingAmount,
      }
    );

    if (opts.hasEoaAuthContext) {
      person.eoaAuthContext = await testEnv.authManager.createEoaAuthContext({
        config: {
          account: person.account,
        },
        authConfig: {
          statement: 'I authorize the Lit Protocol to execute this Lit Action.',
          domain: 'example.com',
          resources: [
            ['lit-action-execution', '*'],
            ['pkp-signing', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        },
        litClient: testEnv.litClient,
      });
    }
  }

  if (opts.fundLedger) {
    const desiredWei = parseEther(testEnv.config.ledgerDepositAmount);
    const balance = await testEnv.masterPaymentManager.getBalance({
      userAddress: person.account.address,
    });
    const currentWei = balance.raw.availableBalance;
    const deltaWei = desiredWei > currentWei ? desiredWei - currentWei : 0n;

    if (deltaWei > 0n) {
      await testEnv.masterPaymentManager.depositForUser({
        userAddress: person.account.address,
        amountInEth: formatEther(deltaWei),
      });
    }
  }

  if (opts.hasPKP) {
    person.pkp = await getOrCreatePkpLite(
      testEnv,
      account,
      authData,
      opts.label
    );

    if (opts.fundPKP) {
      await fundAccount(
        person.pkp.ethAddress as `0x${string}`,
        testEnv.masterAccount,
        testEnv.networkModule,
        {
          label: 'PKP',
          ifLessThan: testEnv.config.nativeFundingAmount,
          thenFund: testEnv.config.nativeFundingAmount,
        }
      );
    }

    if (opts.fundPKPLedger) {
      const desiredWei = parseEther(testEnv.config.ledgerDepositAmount);
      const balance = await testEnv.masterPaymentManager.getBalance({
        userAddress: person.pkp.ethAddress as `0x${string}`,
      });
      const currentWei = balance.raw.availableBalance;
      const deltaWei = desiredWei > currentWei ? desiredWei - currentWei : 0n;

      if (deltaWei > 0n) {
        await testEnv.masterPaymentManager.depositForUser({
          userAddress: person.pkp.ethAddress as `0x${string}`,
          amountInEth: formatEther(deltaWei),
        });
      }
    }

    if (opts.hasPKPAuthContext) {
      person.pkpAuthContext = await testEnv.authManager.createPkpAuthContext({
        authData,
        pkpPublicKey: person.pkp.pubkey,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        },
        litClient: testEnv.litClient,
      });
    }

    const authContext = person.pkpAuthContext ?? person.eoaAuthContext;
    if (authContext) {
      person.pkpViemAccount = await testEnv.litClient.getPkpViemAccount({
        pkpPublicKey: person.pkp.pubkey,
        authContext,
        chainConfig: testEnv.networkModule.getChainConfig(),
      });
    }
  }

  if (opts.sponsor) {
    person.paymentManager = await testEnv.litClient.getPaymentManager({
      account: person.account,
    });

    try {
      const tx = await person.paymentManager.setRestriction({
        totalMaxPrice: opts.sponsor.restrictions.totalMaxPriceInWei,
        requestsPerPeriod: opts.sponsor.restrictions.requestsPerPeriod,
        periodSeconds: opts.sponsor.restrictions.periodSeconds,
      });
      console.log(`- [setRestriction] TX Hash: ${tx.hash}`);
    } catch (e) {
      throw new Error(`❌ Failed to set sponsorship restrictions: ${e}`);
    }

    const userAddresses = opts.sponsor.userAddresses;
    if (!userAddresses || userAddresses.length === 0) {
      throw new Error(
        '❌ User addresses are required for the sponsor to fund.'
      );
    }

    try {
      console.log(`- Sponsoring users:`, userAddresses);
      const tx = await person.paymentManager.delegatePaymentsBatch({
        userAddresses: userAddresses,
      });
      console.log(`[delegatePaymentsBatch] TX Hash: ${tx.hash}`);
    } catch (e) {
      throw new Error(`❌ Failed to delegate sponsorship to users: ${e}`);
    }
  }

  return person;
};

/**
 * Initialize shared lite mainnet context for e2e runs.
 *
 * Validates the network, builds the test environment, ensures the master
 * account and PKP are ready, and configures wrapped keys actions.
 */
export const initLiteMainnetContext = async (): Promise<LiteContext> => {
  const envVars = createEnvVars();
  if (envVars.network !== 'naga') {
    throw new Error(
      `Lite mainnet suite requires NETWORK=naga, received ${envVars.network}`
    );
  }

  const testEnv = await createTestEnv(envVars);
  const masterAccount = testEnv.masterAccount;

  await assertNativeBalance(testEnv, masterAccount, envVars);

  const baseAuthData = await ViemAccountAuthenticator.authenticate(
    masterAccount
  );
  const masterAuthData = ensureAuthDataPublicKey(baseAuthData, masterAccount);
  const masterEoaAuthContext = await testEnv.authManager.createEoaAuthContext({
    config: {
      account: masterAccount,
    },
    authConfig: {
      statement: 'Lite mainnet e2e authorization.',
      domain: 'lite-mainnet.e2e',
      resources: [
        ['lit-action-execution', '*'],
        ['pkp-signing', '*'],
        ['access-control-condition-decryption', '*'],
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    },
    litClient: testEnv.litClient,
  });

  const masterPkp = await getOrCreatePkpLite(
    testEnv,
    masterAccount,
    masterAuthData,
    'MASTER'
  );

  await ensureLedgerBalance(testEnv, masterAccount.address);
  await ensureLedgerBalance(testEnv, masterPkp.ethAddress as `0x${string}`);

  wrappedKeysConfig.setLitActionsCode(litActionRepository);
  wrappedKeysConfig.setLitActionsCodeCommon(litActionRepositoryCommon);

  return {
    envVars,
    testEnv,
    masterAccount,
    masterAuthData,
    masterEoaAuthContext,
    masterPkp,
  };
};

/**
 * Ensure the master EOA and its PKP have the minimum ledger balances.
 */
export const ensureMasterLedgerBalances = async (ctx: LiteContext) => {
  await ensureLedgerBalance(ctx.testEnv, ctx.masterAccount.address);
  await ensureLedgerBalance(
    ctx.testEnv,
    ctx.masterPkp.ethAddress as `0x${string}`
  );
};

const LITE_EXECUTE_JS_CODE = `
(async () => {
  const { sigName, toSign, publicKey } = jsParams;
  const { keccak256, arrayify } = ethers.utils;

  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);

  await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });
})();`;

/**
 * Test 1: Handshake
 *
 * Confirms the client handshake returns server keys and meets threshold.
 */
export const runHandshakeTest = async (ctx: LiteContext) => {
  const clientContext = await ctx.testEnv.litClient.getContext();

  expect(clientContext?.handshakeResult).toBeDefined();

  const { serverKeys, connectedNodes, threshold } =
    clientContext.handshakeResult!;
  const numServers = serverKeys ? Object.keys(serverKeys).length : 0;
  const numConnected = connectedNodes ? connectedNodes.size : 0;

  expect(numServers).toBeGreaterThan(0);

  if (typeof threshold === 'number') {
    expect(numConnected).toBeGreaterThanOrEqual(threshold);
  }
};

/**
 * Test 2: PKP Sign
 *
 * Verifies the PKP signing endpoint works for the master PKP.
 */
export const runPkpSignTest = async (ctx: LiteContext) => {
  const result = await ctx.testEnv.litClient.chain.ethereum.pkpSign({
    authContext: ctx.masterEoaAuthContext,
    pubKey: ctx.masterPkp.pubkey,
    toSign: 'Hello from lite mainnet e2e',
  });

  expect(result.signature).toBeDefined();
};

/**
 * Test 3: Sign Session Key
 *
 * Creates a PKP auth context to exercise the signSessionKey endpoint.
 */
export const runSignSessionKeyTest = async (ctx: LiteContext) => {
  const pkpAuthContext = await ctx.testEnv.authManager.createPkpAuthContext({
    authData: ctx.masterAuthData,
    pkpPublicKey: ctx.masterPkp.pubkey,
    authConfig: {
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    },
    litClient: ctx.testEnv.litClient,
  });

  expect(pkpAuthContext).toBeDefined();
};

/**
 * Test 4: Execute JS
 *
 * Executes a Lit Action that signs a payload to validate the runtime.
 */
export const runExecuteJsTest = async (ctx: LiteContext) => {
  const result = await ctx.testEnv.litClient.executeJs({
    code: LITE_EXECUTE_JS_CODE,
    authContext: ctx.masterEoaAuthContext,
    jsParams: {
      sigName: 'lite-mainnet-sig',
      toSign: 'Lite mainnet executeJs',
      publicKey: ctx.masterPkp.pubkey,
    },
  });

  expect(result).toBeDefined();
  expect(result.signatures).toBeDefined();
};

/**
 * Test 5: Encrypt/Decrypt
 *
 * Encrypts data with ACCs and decrypts it using the master auth context.
 */
export const runEncryptDecryptTest = async (ctx: LiteContext) => {
  const builder = createAccBuilder();
  const accs = builder
    .requireWalletOwnership(ctx.masterAccount.address)
    .on('ethereum')
    .build();

  const testData = 'Lite mainnet decrypt test';
  const encryptedData = await ctx.testEnv.litClient.encrypt({
    dataToEncrypt: testData,
    unifiedAccessControlConditions: accs,
    chain: 'ethereum',
  });

  expect(encryptedData.ciphertext).toBeDefined();
  expect(encryptedData.dataToEncryptHash).toBeDefined();

  const decryptedData = await ctx.testEnv.litClient.decrypt({
    data: encryptedData,
    unifiedAccessControlConditions: accs,
    chain: 'ethereum',
    authContext: ctx.masterEoaAuthContext,
  });

  expect(decryptedData.convertedData).toBe(testData);
};

/**
 * Test 6: Wrapped Keys
 *
 * Imports and exports a private key via wrapped keys using PKP session sigs.
 */
export const runWrappedKeysTest = async (ctx: LiteContext) => {
  const sessionKeyPair = ctx.testEnv.sessionKeyPair;
  const delegationAuthSig =
    await ctx.testEnv.authManager.generatePkpDelegationAuthSig({
      pkpPublicKey: ctx.masterPkp.pubkey,
      authData: ctx.masterAuthData,
      sessionKeyPair,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: ctx.testEnv.litClient,
    });

  const pkpSessionSigs = await ctx.testEnv.authManager.createPkpSessionSigs({
    pkpPublicKey: ctx.masterPkp.pubkey,
    sessionKeyPair,
    delegationAuthSig,
    litClient: ctx.testEnv.litClient,
  });

  const wallet = Wallet.createRandom();
  const memo = `lite-mainnet-import-${Date.now()}`;

  const importResult = await wrappedKeysApi.importPrivateKey({
    pkpSessionSigs,
    litClient: ctx.testEnv.litClient,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    keyType: 'K256',
    memo,
  });

  expect(importResult.id).toBeDefined();

  const exportResult = await wrappedKeysApi.exportPrivateKey({
    pkpSessionSigs,
    litClient: ctx.testEnv.litClient,
    id: importResult.id,
    network: 'evm',
  });

  expect(exportResult.decryptedPrivateKey?.toLowerCase()).toBe(
    wallet.privateKey.toLowerCase()
  );
};

/**
 * Test 7: Payment Delegation
 *
 * Ensures Alice can sponsor Bob's PKP execution and that removing sponsorship
 * causes Bob's next request to fail while reducing Alice's ledger balance.
 */
export const runPaymentDelegationTest = async (
  testEnv: Awaited<ReturnType<typeof createTestEnv>>
) => {
  const bobAccount = await createTestAccountLite(testEnv, {
    label: 'Bob',
    fundAccount: true,
    hasEoaAuthContext: true,
    fundLedger: false,
    hasPKP: true,
    fundPKP: false,
    hasPKPAuthContext: false,
    fundPKPLedger: false,
  });

  console.log('bobAccount:', bobAccount);

  if (!bobAccount.pkp?.ethAddress) {
    throw new Error("Bob's PKP does not have an ethAddress");
  }

  const alice = await createTestAccountLite(testEnv, {
    label: 'Alice',
    fundAccount: true,
    fundLedger: true,
    hasPKP: true,
    fundPKP: true,
    fundPKPLedger: true,
    sponsor: {
      restrictions: {
        totalMaxPriceInWei: testEnv.config.sponsorshipLimits.totalMaxPriceInWei,
        requestsPerPeriod: '100',
        periodSeconds: '600',
      },
      userAddresses: [bobAccount.account.address],
    },
  });

  const aliceBeforeBalance = await testEnv.masterPaymentManager.getBalance({
    userAddress: alice.account.address,
  });

  console.log(
    "[BEFORE] Alice's Ledger balance before Bob's request:",
    aliceBeforeBalance
  );

  await testEnv.litClient.chain.ethereum.pkpSign({
    authContext: bobAccount.eoaAuthContext!,
    pubKey: bobAccount.pkp?.pubkey!,
    toSign: 'Hello, world!',
    userMaxPrice: testEnv.config.sponsorshipLimits.userMaxPrice,
  });

  await alice.paymentManager!.undelegatePaymentsBatch({
    userAddresses: [bobAccount.account.address],
  });

  let didFail = false;
  try {
    await testEnv.litClient.chain.ethereum.pkpSign({
      authContext: bobAccount.eoaAuthContext!,
      pubKey: bobAccount.pkp?.pubkey!,
      toSign: 'Hello again, world!',
      userMaxPrice: testEnv.config.sponsorshipLimits.userMaxPrice,
    });
  } catch (e) {
    didFail = true;
    console.log(
      "As expected, Bob's PKP sign failed after Alice removed sponsorship:",
      e
    );
  }

  expect(didFail).toBe(true);

  await new Promise((resolve) => setTimeout(resolve, 5000));
  const aliceBalanceAfter = await testEnv.masterPaymentManager.getBalance({
    userAddress: alice.account.address,
  });

  console.log(
    "[AFTER] Alice's Ledger balance after Bob's request:",
    aliceBalanceAfter
  );

  expect(BigInt(aliceBalanceAfter.raw.availableBalance)).toBeLessThan(
    BigInt(aliceBeforeBalance.raw.availableBalance)
  );
};

/**
 * Run the core lite endpoints in sequence, topping up balances as needed.
 */
const runCoreEndpointsSuite = async (
  ctx: LiteContext,
  runner: LiteUptimeRunner
) => {
  const steps: Array<[LiteCoreFunctionName, () => Promise<void>]> = [
    ['handshake', () => runHandshakeTest(ctx)],
    ['pkpSign', () => runPkpSignTest(ctx)],
    ['signSessionKey', () => runSignSessionKeyTest(ctx)],
    ['executeJs', () => runExecuteJsTest(ctx)],
    ['encryptDecrypt', () => runEncryptDecryptTest(ctx)],
    ['wrappedKeys', () => runWrappedKeysTest(ctx)],
  ];

  for (const [name, fn] of steps) {
    await ensureMasterLedgerBalances(ctx);
    await runner(name, fn);
  }
};

/**
 * Run the full lite mainnet suite once, including payment delegation.
 */
export const runLiteMainnetOnce = async (runner: LiteUptimeRunner) => {
  const ctx = await initLiteMainnetContext();
  await runCoreEndpointsSuite(ctx, runner);

  const envVars = createEnvVars();
  const testEnv = await createTestEnv(envVars);
  await runner('paymentDelegation', () => runPaymentDelegationTest(testEnv));
};
