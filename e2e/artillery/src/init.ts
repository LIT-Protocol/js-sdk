import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import * as NetworkManager from '../../../e2e/src/helper/NetworkManager';
import { getOrCreatePkp } from '../../../e2e/src/helper/pkp-utils';
import { printAligned } from '../../../e2e/src/helper/utils';
import '../../src/helper/supressLogs';
import * as AccountManager from '../src/AccountManager';
import * as StateManager from './StateManager';

const _network = process.env['NETWORK'];

// CONFIGURATIONS
const REJECT_BALANCE_THRESHOLD = 0;
const MASTER_LEDGER_MINIMUM_BALANCE = 3_000;
const PKP_LEDGER_MINIMUM_BALANCE = 3_000;

if (MASTER_LEDGER_MINIMUM_BALANCE < 0 || PKP_LEDGER_MINIMUM_BALANCE < 0) {
  throw new Error(
    '❌ Ledger minimum balances must be non-negative numbers'
  );
}

const ensureLedgerBalance = async ({
  label,
  balanceFetcher,
  minimumBalance,
  topUp,
}: {
  label: string;
  balanceFetcher: () => Promise<{ availableBalance: string }>;
  minimumBalance: number;
  topUp: (difference: number) => Promise<void>;
}) => {
  const { availableBalance } = await balanceFetcher();

  const currentAvailable = Number(availableBalance);

  if (currentAvailable >= minimumBalance) {
    console.log(
      `✅ ${label} ledger balance healthy (${currentAvailable} ETH, threshold ${minimumBalance} ETH)`
    );
    return currentAvailable;
  }

  const difference = minimumBalance - currentAvailable;

  console.log(
    `🚨 ${label} ledger balance (${currentAvailable} ETH) is below threshold (${minimumBalance} ETH). Depositing ${difference} ETH.`
  );

  await topUp(difference);

  const { availableBalance: postTopUpBalance } = await balanceFetcher();

  console.log(`✅ ${label} ledger balance after top-up: ${postTopUpBalance} ETH`);

  return Number(postTopUpBalance);
};

(async () => {
  // -- Start
  console.log('\x1b[90m✅ Initialising Artillery...\x1b[0m');

  // 1. Setup network and chain client
  const networkModule = await NetworkManager.getLitNetworkModule();
  const publicClient = await NetworkManager.getViemPublicClient({
    networkModule,
  });
  const litClient = await createLitClient({ network: networkModule });

  // 2. Setup the master account
  const masterAccount = await AccountManager.getMasterAccount();

  const masterAccountDetails = await AccountManager.getAccountDetails({
    accountLabel: 'Master Account',
    account: masterAccount,
    publicClient,
    litClient,
  });

  if (Number(masterAccountDetails.ethBalance) < REJECT_BALANCE_THRESHOLD) {
    throw new Error(
      `🚨 Live Master Account Balance is less than REJECT_BALANCE_THRESHOLD: ${REJECT_BALANCE_THRESHOLD} ETH`
    );
  }

  await ensureLedgerBalance({
    label: 'Master Account',
    balanceFetcher: () =>
      masterAccountDetails.paymentManager.getBalance({
        userAddress: masterAccount.address,
      }),
    minimumBalance: MASTER_LEDGER_MINIMUM_BALANCE,
    topUp: async (difference) => {
      await masterAccountDetails.paymentManager.deposit({
        amountInEth: difference.toString(),
      });
    },
  });

  // 3. Authenticate the master account and store the auth data
  const masterAccountAuthData = await StateManager.getOrUpdate(
    'masterAccount.authData',
    await ViemAccountAuthenticator.authenticate(masterAccount)
  );
  console.log('✅ Master Account Auth Data:', masterAccountAuthData);

  // 4. initialise the auth manager
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'artillery-testing-app',
      networkName: `${_network}-artillery`,
      storagePath: './lit-auth-artillery',
    }),
  });

  // 5. get or mint a PKP for the master account
  const masterAccountPkp = await StateManager.getOrUpdate(
    'masterAccount.pkp',
    await getOrCreatePkp(
      litClient,
      masterAccountAuthData,
      masterAccount,
      './artillery-pkp-tokens',
      `${_network}-artillery`
    )
  );

  console.log('✅ Master Account PKP:', masterAccountPkp);

  const pkpEthAddress = masterAccountPkp?.ethAddress;

  if (!pkpEthAddress) {
    throw new Error('❌ Master Account PKP is missing an ethAddress');
  }

  const pkpLedgerBalance = await masterAccountDetails.paymentManager.getBalance(
    {
      userAddress: pkpEthAddress,
    }
  );

  console.log('\n========== Master Account PKP Details ==========');

  const pkpStatus =
    Number(pkpLedgerBalance.availableBalance) < 0
      ? {
          label: '🚨 Status:',
          value: `Negative balance (debt): ${pkpLedgerBalance.availableBalance}`,
        }
      : { label: '', value: '' };

  printAligned(
    [
      { label: '🔑 PKP ETH Address:', value: pkpEthAddress },
      {
        label: '💳 Ledger Total Balance:',
        value: pkpLedgerBalance.totalBalance,
      },
      {
        label: '💳 Ledger Available Balance:',
        value: pkpLedgerBalance.availableBalance,
      },
      pkpStatus,
    ].filter((item) => item.label)
  );

  await ensureLedgerBalance({
    label: 'Master Account PKP',
    balanceFetcher: () =>
      masterAccountDetails.paymentManager.getBalance({
        userAddress: pkpEthAddress,
      }),
    minimumBalance: PKP_LEDGER_MINIMUM_BALANCE,
    topUp: async (difference) => {
      await masterAccountDetails.paymentManager.depositForUser({
        userAddress: pkpEthAddress,
        amountInEth: difference.toString(),
      });
    },
  });

  // create pkp auth context
  // const masterAccountPkpAuthContext = await authManager.createPkpAuthContext({
  //   authData: masterAccountAuthData,
  //   pkpPublicKey: masterAccountPkp.publicKey,
  //   authConfig: {
  //     resources: [
  //       ['pkp-signing', '*'],
  //       ['lit-action-execution', '*'],
  //       ['access-control-condition-decryption', '*'],
  //     ],
  //     expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
  //   },
  //   litClient: litClient,
  // });

  // console.log('✅ Master Account PKP Auth Context:', masterAccountPkpAuthContext);

  // 6. create the auth context (this should be generated each time)
  // const masterAccountAuthContext = await authManager.createEoaAuthContext({
  //   config: {
  //     account: masterAccount,
  //   },
  //   authConfig: {
  //     statement: 'I authorize the Lit Protocol to execute this Lit Action.',
  //     domain: 'example.com',
  //     resources: [
  //       ['lit-action-execution', '*'],
  //       ['pkp-signing', '*'],
  //       ['access-control-condition-decryption', '*'],
  //     ],
  //     capabilityAuthSigs: [],
  //     expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
  //   },
  //   litClient: litClient,
  // });

  // (uncomment to test) run the pkpSign endpoint
  // const res = await litClient.chain.ethereum.pkpSign({
  //   authContext: masterAccountAuthContext,
  //   pubKey: masterAccountPkp.publicKey,
  //   toSign: 'Hello, world!',
  // });

  // console.log('✅ PKP Sign Test Result:', res);

  process.exit();
})();
