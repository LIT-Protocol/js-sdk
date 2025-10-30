import {
  Account,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from 'viem';

// Global nonce manager to track nonces per account address
// Tracks the next nonce to use per account to prevent concurrent collisions
const globalNonceManager = new Map<string, number>();

async function getNextNonce(
  publicClient: any,
  accountAddress: string
): Promise<number> {
  // Always fetch the latest nonce from the network to be safe
  const networkNonce = await publicClient.getTransactionCount({
    address: accountAddress,
    blockTag: 'pending',
  });

  const cachedNextNonce = globalNonceManager.get(accountAddress);

  // If we have a cached value, ensure we never go backwards relative to the network
  const nextNonce =
    cachedNextNonce !== undefined
      ? Math.max(cachedNextNonce, networkNonce)
      : networkNonce;

  // Store the following nonce for the next caller
  globalNonceManager.set(accountAddress, nextNonce + 1);

  console.log(
    `- Using nonce ${nextNonce} for ${accountAddress} (network: ${networkNonce}, cached: ${
      cachedNextNonce ?? 'unset'
    })`
  );
  return nextNonce;
}

async function sendTransactionWithRetry(
  walletClient: any,
  transactionRequest: any,
  publicClient: any,
  maxRetries: number = 3
): Promise<any> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await walletClient.sendTransaction(transactionRequest);
    } catch (error: any) {
      lastError = error;

      if (error.message?.includes('nonce too low') && attempt < maxRetries) {
        console.log(
          `⚠️ Nonce too low on attempt ${attempt}, retrying with fresh nonce...`
        );

        // Reset the nonce manager for this account and get a fresh nonce
        globalNonceManager.delete(transactionRequest.account.address);
        transactionRequest.nonce = await getNextNonce(
          publicClient,
          transactionRequest.account.address
        );

        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export const fundAccount = async (
  recipientAccount: Account | `0x${string}`,
  sponsorAccount: Account,
  networkModule: any,
  options?: {
    ifLessThan?: string;
    thenFund?: string;
    label?: string;
  }
) => {
  console.log(
    `--- Funding ${
      options.label === undefined ? '' : options.label
    } account ---`
  );
  let recipientAddress: `0x${string}`;

  if (recipientAccount.hasOwnProperty('address')) {
    recipientAccount = recipientAccount as Account;
    recipientAddress = recipientAccount.address;
  } else {
    recipientAccount = recipientAccount as `0x${string}`;
    recipientAddress = recipientAccount;
  }

  const defaultRpcUrl = networkModule.getChainConfig().rpcUrls.default.http[0];
  const isLocalNetwork = defaultRpcUrl.includes('127.0.0.1');
  const customRpcUrl = isLocalNetwork
    ? process.env['LOCAL_RPC_URL']
    : process.env['LIT_YELLOWSTONE_PRIVATE_RPC_URL'];

  if (customRpcUrl) {
    console.log(`- Using custom E2E RPC URL:`, `***${customRpcUrl.slice(-6)}`);
  } else if (isLocalNetwork) {
    console.log(`- Using local Anvil RPC URL:`, defaultRpcUrl);
  } else {
    console.log(`- Using default network RPC URL:`, defaultRpcUrl);
  }

  // check account balance
  const publicClient = createPublicClient({
    chain: networkModule.getChainConfig(),
    transport: http(customRpcUrl || defaultRpcUrl),
  });

  const balance = await publicClient.getBalance({
    address: recipientAddress,
  });

  // If balance is less than 1 ETH, fund the account with 0.001 ETH
  if (balance <= parseEther(options?.ifLessThan || '0.001')) {
    console.log(`- Funding ${recipientAddress} with ${options?.thenFund} ETH`);

    const walletClient = createWalletClient({
      account: sponsorAccount,
      transport: http(customRpcUrl || defaultRpcUrl),
    });

    // Get the next managed nonce for this sponsor account
    const nonce = await getNextNonce(publicClient, sponsorAccount.address);

    const transactionRequest = {
      to: recipientAddress,
      value: parseEther(options?.thenFund || '1'),
      chain: networkModule.getChainConfig(),
      nonce,
      account: sponsorAccount, // Add account for retry logic
    };

    await sendTransactionWithRetry(
      walletClient,
      transactionRequest,
      publicClient
    );

    console.log(
      `- Topped up account ${recipientAddress} with`,
      options?.thenFund,
      'ETH\n'
    );
  } else {
    console.log(`- Account ${recipientAddress} has enough balance\n`);
  }
};
