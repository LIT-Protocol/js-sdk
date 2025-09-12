import { createLitClient } from '@lit-protocol/lit-client';
import { getLitNetworkModule, getViemPublicClient } from '@lit-protocol/e2e';
import * as AccountManager from '../src/AccountManager';

(async () => {
  // 1. Setup network and chain client
  const networkModule = await getLitNetworkModule();
  const publicClient = await getViemPublicClient({
    networkModule,
  });
  const litClient = await createLitClient({ network: networkModule });

  // 2. Get the master account
  const masterAccount = await AccountManager.getMasterAccount();

  // every 5 seconds, check the balance of the master account
  setInterval(async () => {
    await AccountManager.getAccountDetails({
      accountLabel: 'Master Account',
      account: masterAccount,
      publicClient,
      litClient,
    });
  }, 3000);
})();
