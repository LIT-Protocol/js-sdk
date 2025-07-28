import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { nagaDev } from "@lit-protocol/networks";
import { createPublicClient, formatEther, http, parseEther } from "viem";
import { createAuthManager, storagePlugins, ViemAccountAuthenticator } from "@lit-protocol/auth";
import { fundAccount } from "../../../e2e/src/helper/fundAccount";
import * as StateManager from "./StateManager";
import { createLitClient } from "@lit-protocol/lit-client";
import { getOrCreatePkp } from "../../../e2e/src/helper/pkp-utils";

const _network = process.env['NETWORK'];

// CONFIGURATIONS
const REJECT_BALANCE_THRESHOLD = 0;
const FUNDING_IF_LESS_THAN = 0.1;
const FUNDING_AMOUNT = 0.1;
const LEDGER_MINIMUM_BALANCE = 500;

const NETWORK_CONFIG = {
  'naga-dev': { importName: 'nagaDev', type: 'live' },
  'naga-test': { importName: 'nagaTest', type: 'live' },
  'naga-local': { importName: 'nagaLocal', type: 'local' },
  'naga-staging': { importName: 'nagaStaging', type: 'live' },
} as const;

const config = NETWORK_CONFIG[_network as keyof typeof NETWORK_CONFIG];
if (!config) {
  throw new Error(`❌ Invalid network: ${_network}`);
}

(async () => {

  // -- Setup
  const networksModule = await import('@lit-protocol/networks');
  const _networkModule = networksModule[config.importName];

  const viemChainConfig = _networkModule.getChainConfig();

  const publicClient = createPublicClient({
    chain: viemChainConfig,
    transport: http(),
  });

  // -- Start 
  console.log("\x1b[90m✅ Initialising Artillery...\x1b[0m");

  // 1. Setup the master account (only for Live network for load testing))
  const liveMasterAccount = privateKeyToAccount(process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`);
  console.log("🔑 Live Master Account:", liveMasterAccount.address);

  const balance = formatEther(await publicClient.getBalance({
    address: liveMasterAccount.address,
  }));

  if (Number(balance) < REJECT_BALANCE_THRESHOLD) {
    throw new Error(`🚨 Live Master Account Balance is less than REJECT_BALANCE_THRESHOLD: ${REJECT_BALANCE_THRESHOLD} ETH`);
  }

  console.log("💰 Live Master Account Balance:", balance, "ETH");

  // 2. Create an PKP Auth EOA account
  console.log("\x1b[90m✅ Creating PKP EOA Account...\x1b[0m");
  const aliceEoaPrivateKey = await StateManager.getOrUpdate(
    'aliceViemEoaAccount.privateKey',
    generatePrivateKey()
  ) as `0x${string}`;

  console.log("🔑 Alice Viem EOA Account Private Key:", aliceEoaPrivateKey);

  const aliceViemEoaAccount = privateKeyToAccount(aliceEoaPrivateKey);
  const aliceViemEoaAccountAuthData = await StateManager.getOrUpdate(
    'aliceViemEoaAccount.authData',
    JSON.stringify(await ViemAccountAuthenticator.authenticate(aliceViemEoaAccount))
  );

  console.log("🔑 Alice Viem EOA Account:", aliceViemEoaAccount.address);
  console.log("🔑 Alice Viem EOA Account Auth Data:", aliceViemEoaAccountAuthData);

  // 3. Fund the PKP Auth EOA account
  console.log("\x1b[90m✅ Funding PKP Auth EOA Account...\x1b[0m");
  await fundAccount(aliceViemEoaAccount, liveMasterAccount, _networkModule, {
    ifLessThan: FUNDING_IF_LESS_THAN.toString(),
    thenFundWith: FUNDING_AMOUNT.toString(),
  });

  console.log("\x1b[90m✅ Creating Lit Client...\x1b[0m");
  const litClient = await createLitClient({ network: _networkModule });

  console.log("\x1b[90m✅ Getting Live Master Account Payment Manager...\x1b[0m");
  const masterPaymentManager = await litClient.getPaymentManager({
    account: liveMasterAccount,
  });

  // Deposit
  const masterPaymentBalance = await masterPaymentManager.getBalance({ userAddress: liveMasterAccount.address })
  console.log('✅ Live Master Account Payment Balance:', masterPaymentBalance);

  if (LEDGER_MINIMUM_BALANCE > Number(masterPaymentBalance.availableBalance)) {

    // find the difference between the minimum balance and the current balance
    const difference = LEDGER_MINIMUM_BALANCE - Number(masterPaymentBalance.availableBalance);
    console.log('💰 Difference:', difference);

    // deposit the difference
    console.log("\x1b[90m✅ Depositing the difference to Live Master Account Payment Manager...\x1b[0m");
    await masterPaymentManager.deposit({ amountInEth: difference.toString() });

    // get the new balance
    const newBalance = await masterPaymentManager.getBalance({ userAddress: liveMasterAccount.address })
    console.log('✅ New Live Master Account Payment Balance:', newBalance);
  } else {
    console.log('🔥 Live Master Account Payment Balance is greater than the minimum balance');
  }

  /**
   * ====================================
   * Initialise the AuthManager
   * ====================================
   */
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'artillery-testing-app',
      networkName: `${_network}-artillery`,
      storagePath: './lit-auth-artillery',
    }),
  });

  /**
 * ====================================
 * Create the auth context (recreate each time since it contains functions)
 * ====================================
 */
  console.log("\x1b[90m✅ Creating Alice EOA Auth Context...\x1b[0m");
  const aliceEoaAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: aliceViemEoaAccount,
    },
    authConfig: {
      statement: 'I authorize the Lit Protocol to execute this Lit Action.',
      domain: 'example.com',
      resources: [
        ['lit-action-execution', '*'],
        ['pkp-signing', '*'],
        ['access-control-condition-decryption', '*'],
      ],
      capabilityAuthSigs: [],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    },
    litClient: litClient,
  });

  console.log('✅ Alice EOA Auth Context created');

  // Get or create a PKP for alice
  console.log("\x1b[90m✅ Getting or creating PKP for Alice...\x1b[0m");
  const aliceViemAccountPkp = await StateManager.getOrUpdate(
    'aliceViemEoaAccount.pkp',
    await getOrCreatePkp(
      litClient,
      aliceViemEoaAccountAuthData,
      aliceViemEoaAccount,
      './pkp-tokens',
      `${_network}-artillery`
    )
  );

  console.log('✅ Alice Viem Account PKP:', aliceViemAccountPkp);

  // Deposit for the aliceViemEoaAccount
  const aliceEoaViemAccountPaymentBalance = await masterPaymentManager.getBalance({ userAddress: aliceViemEoaAccount.address })
  console.log('✅ Alice EOA Viem Account Payment Balance:', aliceEoaViemAccountPaymentBalance);

  if (LEDGER_MINIMUM_BALANCE > Number(aliceEoaViemAccountPaymentBalance.availableBalance)) {

    // find the difference between the minimum balance and the current balance
    const difference = LEDGER_MINIMUM_BALANCE - Number(aliceEoaViemAccountPaymentBalance.availableBalance);
    console.log('💰 Difference:', difference);

    // deposit the difference
    console.log("\x1b[90m✅ Depositing the difference to Alice EOA Viem Account Payment Manager...\x1b[0m");
    await masterPaymentManager.depositForUser({ userAddress: aliceViemEoaAccount.address, amountInEth: difference.toString() });

    // get the new balance  
    const newBalance = await masterPaymentManager.getBalance({ userAddress: aliceViemEoaAccount.address })
    console.log('✅ New Alice EOA Viem Account Payment Balance:', newBalance);
  } else {
    console.log('🔥 Alice EOA Viem Account Payment Balance is greater than the minimum balance');
  }

  // run pkpSign test
  // console.log("\x1b[90m✅ Running PKP Sign Test...\x1b[0m");
  // const res = await litClient.chain.ethereum.pkpSign({
  //   authContext: aliceEoaAuthContext,
  //   pubKey: aliceViemAccountPkp.publicKey,
  //   toSign: 'Hello, world!',
  // });

  // console.log('✅ PKP Sign Test Result:', res);
  process.exit();
})();