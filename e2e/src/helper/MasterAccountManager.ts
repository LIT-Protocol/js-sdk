import { generatePrivateKey, PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import fs from 'fs';
import { getBalance } from "viem/actions";
import { formatEther, PublicClient, createWalletClient, http, parseEther } from "viem";
// import { fundAccountWithClient } from './fundAccount';
import { nonceManager } from 'viem/nonce';
import { nagaDev } from "@lit-protocol/networks";

const RPC_URL = process.env['LIT_YELLOWSTONE_PRIVATE_RPC_URL'];
const BATCH_SIZE = 200; // Process x transactions at a time

// clone the viemChainConfig
let LitViemChainConfig = {
  ...nagaDev.getChainConfig(),
}

LitViemChainConfig.rpcUrls.default.http = [RPC_URL];
LitViemChainConfig.rpcUrls.public.http = [RPC_URL];

/**
 * Helper function to get the appropriate master account based on network type
 * Automatically detects if using local network by checking if NETWORK env var contains "local"
 * @returns The appropriate master account (PrivateKeyAccount)
 */
export const getMasterAccount = (): PrivateKeyAccount => {
  const network = process.env['NETWORK'];
  const isLocal = network?.includes('local');

  if (isLocal) {
    return privateKeyToAccount(
      process.env['LOCAL_MASTER_ACCOUNT'] as `0x${string}`,
      { nonceManager }
    );
  } else {
    return privateKeyToAccount(
      process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`,
      { nonceManager }
    );
  }
};

type MasterAccountStatus = {
  privateKey: `0x${string}`;
  address: string;
  balance: string;
  available: boolean;
}

type MasterAccountPool = MasterAccountStatus[];

export const getMasterAccountFromPool = (): PrivateKeyAccount => {
  const network = process.env['NETWORK'];
  const isLocal = network?.includes('local');

  if (isLocal) {
    throw new Error("🚨 Local network not supported for master account from pool");
  } else {

    // read from the master-account-pool.json file
    const masterAccountPool: MasterAccountPool = JSON.parse(fs.readFileSync('master-account-pool.json', 'utf8'));

    // Find and return the first available master account
    const availableMasterAccount: MasterAccountStatus = masterAccountPool.find(account => account.available);
    if (!availableMasterAccount) {
      throw new Error("🚨 No available master account found in the pool");
    }

    return privateKeyToAccount(availableMasterAccount.privateKey);
  }
};

export const getTotalMasterAccountsInPool = (): number => {
  const network = process.env['NETWORK'];
  const isLocal = network?.includes('local');

  if (isLocal) {
    throw new Error("🚨 Local network not supported for master account from pool");
  } else {
    const masterAccountPool: MasterAccountPool = JSON.parse(fs.readFileSync('master-account-pool.json', 'utf8'));
    return masterAccountPool.length;
  }
}

export const getMasterAccountsFromPool = (): MasterAccountPool => {
  const network = process.env['NETWORK'];
  const isLocal = network?.includes('local');

  if (isLocal) {
    throw new Error("🚨 Local network not supported for master account from pool");
  } else {
    let masterAccountPool: MasterAccountPool = JSON.parse(fs.readFileSync('master-account-pool.json', 'utf8'));

    console.log("...Deleting empty entries from master account pool");
    // Delete any entries that are 
    // empty 'address'
    // empty 'balance'
    // empty 'privateKey'
    masterAccountPool = masterAccountPool.filter(account => account.address && account.balance && account.privateKey);

    // write the updated masterAccountPool to the file
    fs.writeFileSync('master-account-pool.json', JSON.stringify(masterAccountPool, null, 2));

    return masterAccountPool;
  }
}

export const checkAndTopupWalletsFromPool = async ({
  publicClient,
  masterAccount,
  networkModule,
  lessThan,
  thenFundWith,
}: {
  publicClient: any;
  masterAccount: PrivateKeyAccount;
  networkModule: any;
  lessThan: number;
  thenFundWith: number;
}): Promise<void> => {
  const network = process.env['NETWORK'];
  const isLocal = network?.includes('local');

  if (isLocal) {
    throw new Error("🚨 Local network not supported for master account from pool");
  }

  // check the balance of the available wallets
  const availableWallets = getMasterAccountsFromPool();
  console.log("🔑 Available wallets:", availableWallets.length);

  // Read the current pool
  let masterAccountPool: MasterAccountStatus[] = JSON.parse(fs.readFileSync('master-account-pool.json', 'utf8'));

  // Check all balances in parallel
  console.log("🔍 Checking balances for all wallets in parallel...");
  const balancePromises = availableWallets.map(wallet =>
    getBalance(publicClient, {
      address: wallet.address as `0x${string}`,
    }).then(balance => ({
      wallet,
      balance: formatEther(balance),
      needsFunding: Number(formatEther(balance)) < lessThan
    }))
  );

  const walletStatuses = await Promise.all(balancePromises);

  // Update all balances in the pool
  walletStatuses.forEach(({ wallet, balance }) => {
    console.log("🔑 Balance of wallet:", wallet.address, balance);
    const poolIndex = masterAccountPool.findIndex(poolWallet => poolWallet.address === wallet.address);
    if (poolIndex !== -1) {
      masterAccountPool[poolIndex].balance = balance;
    }
  });

  // Collect wallets that need funding
  const walletsToFund = walletStatuses.filter(status => status.needsFunding);
  console.log(`💰 ${walletsToFund.length} wallets need funding`);

  if (walletsToFund.length > 0) {
    // Create wallet client with nonce manager for the master account
    const walletClient = createWalletClient({
      account: masterAccount,
      transport: http(LitViemChainConfig.rpcUrls.default.http[0]),
      chain: LitViemChainConfig,
    });

    // Process in batches to avoid nonce conflicts
    const batches = [];
    for (let i = 0; i < walletsToFund.length; i += BATCH_SIZE) {
      batches.push(walletsToFund.slice(i, i + BATCH_SIZE));
    }

    console.log(`🚀 Funding ${walletsToFund.length} wallets in ${batches.length} batches of ${BATCH_SIZE}...`);

    const fundedAddresses = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} wallets)...`);

      // Get the current nonce before processing batch
      const startNonce = await publicClient.getTransactionCount({
        address: masterAccount.address,
        blockTag: 'pending'
      });

      // Send transactions with incrementing nonces
      const batchPromises = batch.map(async ({ wallet }, index: number) => {
        let nonce = startNonce + index;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          try {
            const hash = await walletClient.sendTransaction({
              to: wallet.address as `0x${string}`,
              value: parseEther(thenFundWith.toString()),
              nonce,
            } as any);

            console.log(`✅ Sent tx ${hash} for ${wallet.address} with nonce ${nonce}`);
            fundedAddresses.push(wallet.address);
            return { address: wallet.address, hash, funded: true };
          } catch (error: any) {
            if (error.message?.includes('nonce too low') && retries < maxRetries - 1) {
              retries++;
              // Get fresh nonce
              const freshNonce = await publicClient.getTransactionCount({
                address: masterAccount.address,
                blockTag: 'pending'
              });
              nonce = freshNonce + index;
              console.log(`🔄 Retrying ${wallet.address} with fresh nonce ${nonce} (attempt ${retries + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 500 * retries)); // Exponential backoff
            } else {
              console.error(`❌ Failed to fund ${wallet.address} with nonce ${nonce}:`, error.message);
              return { address: wallet.address, funded: false, error };
            }
          }
        }

        return { address: wallet.address, funded: false, error: new Error('Max retries exceeded') };
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches to ensure transactions are processed
      if (batchIndex < batches.length - 1) {
        console.log(`⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Update balances after all funding is complete
    console.log("📊 Updating balances for funded wallets...");
    const updatedBalancePromises = fundedAddresses.map(address =>
      getBalance(publicClient, {
        address: address as `0x${string}`,
      }).then(balance => ({
        address,
        balance: formatEther(balance)
      }))
    );

    const updatedBalances = await Promise.all(updatedBalancePromises);

    // Update the pool with new balances
    updatedBalances.forEach(({ address, balance }) => {
      const poolIndex = masterAccountPool.findIndex(poolWallet => poolWallet.address === address);
      if (poolIndex !== -1) {
        masterAccountPool[poolIndex].balance = balance;
        console.log("🔑 Updated balance after funding:", address, balance);
      }
    });
  }

  // Write updated pool back to file
  fs.writeFileSync('master-account-pool.json', JSON.stringify(masterAccountPool, null, 2));
};

export const generateAndFundWalletsFromPool = async ({
  publicClient,
  masterAccount,
  networkModule,
  walletsToGenerateAndFund,
  lessThan,
  thenFundWith,
}: {
  publicClient: any;
  masterAccount: PrivateKeyAccount;
  networkModule: any;
  walletsToGenerateAndFund: number;
  lessThan: number;
  thenFundWith: number;
}): Promise<void> => {
  const network = process.env['NETWORK'];
  const isLocal = network?.includes('local');

  if (isLocal) {
    throw new Error("🚨 Local network not supported for master account from pool");
  }

  // Read the current pool
  const masterAccountPool: MasterAccountStatus[] = JSON.parse(fs.readFileSync('master-account-pool.json', 'utf8'));

  // generate wallets
  const walletPrivateKeys = Array.from({ length: walletsToGenerateAndFund }, () => generatePrivateKey());
  const walletAccounts = walletPrivateKeys.map(pk => privateKeyToAccount(pk as `0x${string}`));

  console.log(`🔑 Generating and funding ${walletsToGenerateAndFund} new wallets...`);

  // Create wallet client with nonce manager for the master account
  const walletClient = createWalletClient({
    account: masterAccount,
    transport: http(LitViemChainConfig.rpcUrls.default.http[0]),
    chain: LitViemChainConfig,
  });

  // Process in batches to avoid nonce conflicts
  const batches = [];
  for (let i = 0; i < walletAccounts.length; i += BATCH_SIZE) {
    batches.push(walletAccounts.slice(i, i + BATCH_SIZE));
  }

  console.log(`🚀 Funding ${walletAccounts.length} new wallets in ${batches.length} batches of ${BATCH_SIZE}...`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} wallets)...`);

    // Get the current nonce before processing batch
    const startNonce = await publicClient.getTransactionCount({
      address: masterAccount.address,
      blockTag: 'pending'
    });

    // Send transactions with incrementing nonces
    const batchPromises = batch.map(async (walletAccount: PrivateKeyAccount, index: number) => {
      let nonce = startNonce + index;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          const hash = await walletClient.sendTransaction({
            to: walletAccount.address as `0x${string}`,
            value: parseEther(thenFundWith.toString()),
            nonce,
          } as any);

          console.log(`✅ Sent tx ${hash} for ${walletAccount.address} with nonce ${nonce}`);
          return { success: true, hash, address: walletAccount.address };
        } catch (error: any) {
          if (error.message?.includes('nonce too low') && retries < maxRetries - 1) {
            retries++;
            // Get fresh nonce
            const freshNonce = await publicClient.getTransactionCount({
              address: masterAccount.address,
              blockTag: 'pending'
            });
            nonce = freshNonce + index;
            console.log(`🔄 Retrying ${walletAccount.address} with fresh nonce ${nonce} (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500 * retries)); // Exponential backoff
          } else if (error.message?.includes('nonce too high') && retries < maxRetries - 1) {
            retries++;
            // Wait for pending transactions to be mined
            console.log(`⏳ Nonce too high for ${walletAccount.address}, waiting for pending txs...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Try with original nonce calculation
            nonce = startNonce + index;
          } else {
            console.error(`❌ Failed to fund ${walletAccount.address} with nonce ${nonce}:`, error.message);
            return { success: false, error, address: walletAccount.address };
          }
        }
      }

      return { success: false, error: new Error('Max retries exceeded'), address: walletAccount.address };
    });

    // Wait for batch to complete
    await Promise.all(batchPromises);

    // Small delay between batches to ensure transactions are processed
    if (batchIndex < batches.length - 1) {
      console.log(`⏳ Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Check balances for all funded wallets in parallel
  const balancePromises = walletAccounts.map(walletAccount =>
    getBalance(publicClient, {
      address: walletAccount.address,
    }).then(balance => ({
      address: walletAccount.address,
      balance: formatEther(balance)
    }))
  );

  const balanceResults = await Promise.all(balancePromises);

  // Add all new wallets to the pool
  walletPrivateKeys.forEach((privateKey, index) => {
    const walletAccount = walletAccounts[index];
    const balanceResult = balanceResults.find(br => br.address === walletAccount.address);

    const newMasterAccount: MasterAccountStatus = {
      privateKey: privateKey as `0x${string}`,
      address: walletAccount.address,
      balance: balanceResult?.balance || '0',
      available: true,
    };

    masterAccountPool.push(newMasterAccount);
    console.log(`🔑 Added wallet to pool: ${walletAccount.address} with balance: ${balanceResult?.balance}`);
  });

  // Write updated pool back to file
  fs.writeFileSync('master-account-pool.json', JSON.stringify(masterAccountPool, null, 2));
  console.log(`✅ Successfully generated, funded, and stored ${walletsToGenerateAndFund} wallets in master account pool`);
}