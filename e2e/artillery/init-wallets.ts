import { getBalance } from "viem/actions";
import * as MasterAccountManager from "../src/helper/MasterAccountManager";
import { createPublicClient, formatEther, http } from "viem";
import { nagaDev } from "@lit-protocol/networks";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { fundAccount } from "../src/helper/fundAccount";

const FUNDING_AMOUNT = 0.1;
const TOPUP_IF_LESS_THAN = 0.05;
const NUMBER_OF_WALLETS = 500;

(async () => {
  console.log("🛜  Network:", process.env['NETWORK']);
  console.log("🔗 RPC URL:", nagaDev.getRpcUrl());
  const masterAccount = MasterAccountManager.getMasterAccount();

  console.log("🔑 Master account address:", masterAccount.address);

  const publicClient = createPublicClient({
    chain: nagaDev.getChainConfig(),
    transport: http(),
  })


  const balance = formatEther(await getBalance(publicClient, {
    address: masterAccount.address,
  }));

  console.log("💰 Master account balance:", balance);

  if (Number(balance) < 0) {
    throw new Error("🚨 Master account balance is less than 0 ETH");
  }

  // --- Fund Wallets ---
  const masterAccountsFromPool = MasterAccountManager.getMasterAccountsFromPool();
  console.log("🔑 Total master accounts in pool:", masterAccountsFromPool.length);

  // Check and top up wallets from pool
  await MasterAccountManager.checkAndTopupWalletsFromPool({
    publicClient,
    masterAccount,
    networkModule: nagaDev,
    lessThan: TOPUP_IF_LESS_THAN,
    thenFundWith: FUNDING_AMOUNT,
  });

  if (masterAccountsFromPool.length < NUMBER_OF_WALLETS) {
    // find the difference
    const walletsToGenerateAndFund = NUMBER_OF_WALLETS - masterAccountsFromPool.length;
    console.log("🔑 Wallets to generate and fund:", walletsToGenerateAndFund);

    // check the current balance of the available wallets first
    // generate and fund wallets
    await MasterAccountManager.generateAndFundWalletsFromPool({
      publicClient,
      masterAccount,
      networkModule: nagaDev,
      walletsToGenerateAndFund,
      lessThan: TOPUP_IF_LESS_THAN,
      thenFundWith: FUNDING_AMOUNT,
    });
  }

})();