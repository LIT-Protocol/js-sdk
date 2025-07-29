import { createLitClient } from "@lit-protocol/lit-client";
import * as NetworkManager from "../../src/helper/NetworkManager";
import * as AccountManager from '../src/AccountManager';

(async () => {

  // 1. Setup network and chain client
  const networkModule = await NetworkManager.getLitNetworkModule();
  const publicClient = await NetworkManager.getViemPublicClient({ networkModule });
  const litClient = await createLitClient({ network: networkModule });

  // 2. Get the master account
  const masterAccount = await AccountManager.getMasterAccount();

  // every 5 seconds, check the balance of the master account
  setInterval(async () => {
    await AccountManager.getAccountDetails({
      accountLabel: "Master Account",
      account: masterAccount,
      publicClient,
      litClient,
    });
  }, 3000);

})();