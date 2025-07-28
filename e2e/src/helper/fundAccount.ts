import {
  Account,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  WalletClient,
  PublicClient,
} from 'viem';

export const fundAccount = async (
  recipientAccount: Account,
  sponsorAccount: Account,
  networkModule: any,
  options?: {
    ifLessThan?: string;
    thenFundWith?: string;
  }
) => {
  // check account balance
  const publicClient = createPublicClient({
    chain: networkModule.getChainConfig(),
    transport: http(networkModule.getChainConfig().rpcUrls.default.http[0]),
  });

  const balance = await publicClient.getBalance({
    address: recipientAccount.address,
  });

  // If balance is less than threshold, fund the account
  if (balance <= parseEther(options?.ifLessThan || '0.001')) {
    console.log('💰 Funding account with', options?.thenFundWith, 'ETH');

    const walletClient = createWalletClient({
      account: sponsorAccount,
      transport: http(networkModule.getChainConfig().rpcUrls.default.http[0]),
      chain: networkModule.getChainConfig(),
    });

    await walletClient.sendTransaction({
      account: sponsorAccount,
      to: recipientAccount.address,
      value: parseEther(options?.thenFundWith || '1'),
    } as any);

    console.log('✅ Topped up account with', options?.thenFundWith, 'ETH');
  } else {
    console.log('✅ Account has enough balance');
  }
};

// New function that accepts a wallet client for batch operations
export const fundAccountWithClient = async (
  recipientAddress: string,
  walletClient: WalletClient,
  publicClient: PublicClient,
  options?: {
    ifLessThan?: string;
    thenFundWith?: string;
  }
) => {
  const balance = await publicClient.getBalance({
    address: recipientAddress as `0x${string}`,
  });

  // If balance is less than threshold, fund the account
  if (balance <= parseEther(options?.ifLessThan || '0.001')) {
    console.log('💰 Funding account:', recipientAddress, 'with', options?.thenFundWith, 'ETH');

    const hash = await walletClient.sendTransaction({
      to: recipientAddress as `0x${string}`,
      value: parseEther(options?.thenFundWith || '1'),
    } as any);

    return { address: recipientAddress, hash, funded: true };
  } else {
    console.log('✅ Account has enough balance:', recipientAddress);
    return { address: recipientAddress, funded: false };
  }
};
