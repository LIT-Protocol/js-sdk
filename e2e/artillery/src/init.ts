import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import * as NetworkManager from '../../../e2e/src/helper/NetworkManager';
import { getOrCreatePkp } from '../../../e2e/src/helper/pkp-utils';
import '../../src/helper/supressLogs';
import * as AccountManager from '../src/AccountManager';
import * as StateManager from './StateManager';

const _network = process.env['NETWORK'];

const AUTO_TOP_UP_FLAG = '--auto-topup';
const args = process.argv.slice(2);

// CONFIGURATIONS
const REJECT_BALANCE_THRESHOLD = 0;
const LEDGER_MINIMUM_BALANCE = 10000;
const AUTO_TOP_UP_ENABLED = args.includes(AUTO_TOP_UP_FLAG);
const AUTO_TOP_UP_INTERVAL = 10_000;
const AUTO_TOP_UP_THRESHOLD = LEDGER_MINIMUM_BALANCE;

if (Number.isNaN(LEDGER_MINIMUM_BALANCE) || LEDGER_MINIMUM_BALANCE < 0) {
  throw new Error('❌ LEDGER_MINIMUM_BALANCE must be a non-negative number');
}

const ensureLedgerThreshold = async ({
  paymentManager,
  accountAddress,
  minimumBalance,
}: {
  paymentManager: Awaited<
    ReturnType<typeof AccountManager.getAccountDetails>
  >['paymentManager'];
  accountAddress: `0x${string}`;
  minimumBalance: number;
}) => {
  const { availableBalance } = await paymentManager.getBalance({
    userAddress: accountAddress,
  });

  const currentAvailable = Number(availableBalance);

  if (currentAvailable >= minimumBalance) {
    return currentAvailable;
  }

  const diff = minimumBalance - currentAvailable;

  console.log(
    `🚨 Live Master Account Ledger Balance (${currentAvailable}) is below threshold (${minimumBalance}). Depositing ${difference} ETH.`
  );

  await paymentManager.deposit({
    amountInEth: diff.toString(),
  });

  const { availableBalance: postTopUpBalance } =
    await paymentManager.getBalance({
      userAddress: accountAddress,
    });

  console.log('✅ New Live Master Account Payment Balance:', postTopUpBalance);

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

  await ensureLedgerThreshold({
    paymentManager: masterAccountDetails.paymentManager,
    accountAddress: masterAccount.address,
    minimumBalance: LEDGER_MINIMUM_BALANCE,
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

  if (AUTO_TOP_UP_ENABLED) {
    console.log(
      `\n✅ Auto top-up enabled. Monitoring every ${AUTO_TOP_UP_INTERVAL}ms with threshold ${AUTO_TOP_UP_THRESHOLD} ETH. Press Ctrl+C to exit.`
    );

    let isTopUpInProgress = false;

    const poll = async () => {
      if (isTopUpInProgress) {
        return;
      }

      isTopUpInProgress = true;

      try {
        await ensureLedgerThreshold({
          paymentManager: masterAccountDetails.paymentManager,
          accountAddress: masterAccount.address,
          minimumBalance: AUTO_TOP_UP_THRESHOLD,
        });
      } catch (error) {
        console.error('❌ Auto top-up check failed:', error);
      } finally {
        isTopUpInProgress = false;
      }
    };

    await poll();
    setInterval(() => {
      void poll();
    }, AUTO_TOP_UP_INTERVAL);
  } else {
    process.exit();
  }
})();
