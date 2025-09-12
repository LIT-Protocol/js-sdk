import '../../e2e/src/helper/supressLogs';
import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import * as StateManager from './StateManager';
import { createLitClient } from '@lit-protocol/lit-client';
import {
  getOrCreatePkp,
  getLitNetworkModule,
  getViemPublicClient,
} from '@lit-protocol/e2e';
import * as AccountManager from '../src/AccountManager';

const _network = process.env['NETWORK'];

// CONFIGURATIONS
const REJECT_BALANCE_THRESHOLD = 0;
const LEDGER_MINIMUM_BALANCE = 20000;

(async () => {
  // -- Start
  console.log('\x1b[90m✅ Initialising Artillery...\x1b[0m');

  // 1. Setup network and chain client
  const networkModule = await getLitNetworkModule();
  const publicClient = await getViemPublicClient({
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

  if (LEDGER_MINIMUM_BALANCE > Number(masterAccountDetails.ledgerBalance)) {
    // find the difference between the minimum balance and the current balance
    const difference =
      LEDGER_MINIMUM_BALANCE - Number(masterAccountDetails.ledgerBalance);

    console.log(
      `🚨 Live Master Account Ledger Balance is less than LEDGER_MINIMUM_BALANCE: ${LEDGER_MINIMUM_BALANCE} ETH. Attempting to top up the difference of ${difference} ETH to the master account.`
    );

    // deposit the difference
    console.log(
      '\x1b[90m✅ Depositing the difference to Live Master Account Payment Manager...\x1b[0m'
    );
    await masterAccountDetails.paymentManager.deposit({
      amountInEth: difference.toString(),
    });

    // print the new balance
    const newBalance = await masterAccountDetails.paymentManager.getBalance({
      userAddress: masterAccount.address,
    });
    console.log(
      '✅ New Live Master Account Payment Balance:',
      newBalance.availableBalance
    );
  }

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
    await getOrCreatePkp(litClient, masterAccountAuthData, masterAccount)
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

  process.exit();
})();
