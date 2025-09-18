import { privateKeyToAccount } from 'viem/accounts';
import { formatEther } from 'viem';
import { createLitClient } from '@lit-protocol/lit-client';
import { printAligned } from '@lit-protocol/e2e';

export const getMasterAccount = async () => {
  const privateKey = process.env['LIVE_MASTER_ACCOUNT'];

  if (!privateKey) {
    throw new Error('❌ LIVE_MASTER_ACCOUNT environment variable is required');
  }

  return privateKeyToAccount(privateKey as `0x${string}`);
};

export const getAccountDetails = async ({
  account,
  publicClient,
  litClient,
  accountLabel = 'Account',
}: {
  account: any;
  publicClient: any;
  litClient: Awaited<ReturnType<typeof createLitClient>>;
  accountLabel?: string;
}) => {
  console.log(`\n========== ${accountLabel} Details ==========`);

  // Get all the data first
  const ethBalance = formatEther(
    await publicClient.getBalance({
      address: account.address,
    })
  );

  const paymentManager = await litClient.getPaymentManager({
    account: account,
  });

  const paymentBalance = await paymentManager.getBalance({
    userAddress: account.address,
  });

  // Determine status
  let statusLabel = '';
  let statusValue = '';

  if (Number(paymentBalance.availableBalance) < 0) {
    statusLabel = '🚨 Status:';
    statusValue = `Negative balance (debt): ${paymentBalance.availableBalance}`;
  }

  // Print all information with consistent alignment
  printAligned([
    { label: '🔑 Address:', value: account.address },
    { label: '💰 ETH Balance:', value: `${ethBalance} ETH` },
    { label: '💳 Ledger Total Balance:', value: paymentBalance.totalBalance },
    {
      label: '💳 Ledger Available Balance:',
      value: paymentBalance.availableBalance,
    },
    { label: statusLabel, value: statusValue },
  ]);

  return {
    ethBalance,
    ledgerBalance: paymentBalance.availableBalance,
    paymentManager,
  };
};
