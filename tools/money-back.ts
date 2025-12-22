import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createPublicClient, createWalletClient, formatEther, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createLitClient } from '@lit-protocol/lit-client';
import {
  readGeneratedAccounts,
  type GeneratedAccountRecord,
} from '../packages/e2e/src/helper/generated-accounts';
import { resolveNetwork } from '../packages/e2e/src/helper/network';

type PendingWithdrawal = {
  address: `0x${string}`;
  label?: string;
  amountEth: string;
  requestedAt: string;
  timeRemainingSeconds?: number;
  lastCheckedAt: string;
};

type WithdrawalState = {
  version: 1;
  updatedAt: string;
  network: string;
  destination: `0x${string}`;
  pending: PendingWithdrawal[];
};

type CliFlags = {
  withdraw: boolean;
  yes: boolean;
  help: boolean;
};

const ACCOUNTS_FILE = path.resolve(
  process.cwd(),
  '.e2e',
  'generated-accounts.jsonl'
);
const STATE_FILE = path.resolve(
  process.cwd(),
  '.e2e',
  'withdrawal-state.json'
);

function parseFlags(argv: string[]): CliFlags {
  return {
    withdraw: argv.includes('--withdraw'),
    yes: argv.includes('--yes'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function formatWei(wei: bigint): string {
  return `${wei.toString()} wei (${formatEther(wei)} ETH)`;
}

function toIsoFromSeconds(seconds: string): string {
  const parsed = Number(seconds);
  if (Number.isFinite(parsed) && parsed > 0) {
    return new Date(parsed * 1000).toISOString();
  }
  return new Date().toISOString();
}

function dedupeAccounts(
  records: GeneratedAccountRecord[]
): GeneratedAccountRecord[] {
  const seen = new Set<string>();
  const unique: GeneratedAccountRecord[] = [];

  for (const record of records) {
    const key = record.address.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(record);
  }

  return unique;
}

function readWithdrawalState(filePath: string): WithdrawalState | null {
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as WithdrawalState;
  } catch (error) {
    console.warn(`Failed to parse withdrawal state at ${filePath}:`, error);
    return null;
  }
}

function writeWithdrawalState(
  filePath: string,
  state: WithdrawalState
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function confirmDestination(
  destination: `0x${string}`,
  autoYes: boolean
): Promise<void> {
  if (autoYes) {
    console.log('Bypassing confirmation via --yes.');
    return;
  }

  if (!process.stdin.isTTY) {
    throw new Error('Refusing to proceed without --yes in non-interactive mode.');
  }

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    `Confirm destination address (${destination}) by typing "yes": `
  );
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    throw new Error('Aborted by user.');
  }
}

async function sweepNativeBalance(params: {
  publicClient: ReturnType<typeof createPublicClient>;
  chainConfig: ReturnType<
    Awaited<ReturnType<typeof resolveNetwork>>['networkModule']['getChainConfig']
  >;
  account: ReturnType<typeof privateKeyToAccount>;
  destination: `0x${string}`;
  rpcUrl: string;
}): Promise<void> {
  const { publicClient, chainConfig, account, destination, rpcUrl } = params;

  const balance = await publicClient.getBalance({ address: account.address });
  if (balance === 0n) {
    console.log('Native balance is zero; skipping sweep.');
    return;
  }

  const gas = 21_000n;
  let gasPrice: bigint | undefined;
  let maxFeePerGas: bigint | undefined;
  let maxPriorityFeePerGas: bigint | undefined;
  let feePerGas: bigint | undefined;

  try {
    const feeEstimate = await publicClient.estimateFeesPerGas();
    if ('gasPrice' in feeEstimate && feeEstimate.gasPrice) {
      gasPrice = feeEstimate.gasPrice;
      feePerGas = gasPrice;
    } else if ('maxFeePerGas' in feeEstimate && feeEstimate.maxFeePerGas) {
      maxFeePerGas = feeEstimate.maxFeePerGas;
      maxPriorityFeePerGas = (feeEstimate as { maxPriorityFeePerGas?: bigint })
        .maxPriorityFeePerGas;
      feePerGas = maxFeePerGas;
    }
  } catch {
    gasPrice = await publicClient.getGasPrice();
    feePerGas = gasPrice;
  }

  if (!feePerGas) {
    console.warn('Unable to estimate gas fee; skipping native sweep.');
    return;
  }

  const maxTxFee = gas * feePerGas;
  if (balance <= maxTxFee) {
    console.log(
      `Balance ${formatWei(balance)} is not enough to cover gas ${formatWei(
        maxTxFee
      )}; skipping sweep.`
    );
    return;
  }

  const value = balance - maxTxFee;

  const walletClient = createWalletClient({
    account,
    chain: chainConfig,
    transport: http(rpcUrl),
  });

  const hash = await walletClient.sendTransaction({
    to: destination,
    value,
    gas,
    ...(gasPrice ? { gasPrice } : {}),
    ...(maxFeePerGas ? { maxFeePerGas } : {}),
    ...(maxPriorityFeePerGas ? { maxPriorityFeePerGas } : {}),
  });

  await publicClient.waitForTransactionReceipt({ hash });

  console.log(
    `Swept ${formatWei(value)} from ${account.address} -> ${destination} (${hash}).`
  );
}

async function main(): Promise<void> {
  if (!process.env['LOG_LEVEL']) {
    process.env['LOG_LEVEL'] = 'silent';
  }

  const flags = parseFlags(process.argv.slice(2));

  if (flags.help) {
    console.log(`Usage: tsx tools/money-back.ts [--withdraw] [--yes]

Environment:
  NETWORK (required)
  LIVE_MASTER_ACCOUNT (required)
  LIT_MAINNET_RPC_URL (required)
`);
    return;
  }

  const networkInput = process.env['NETWORK'];
  if (!networkInput) {
    throw new Error('NETWORK is required.');
  }

  const masterPrivateKey = process.env['LIVE_MASTER_ACCOUNT'] as
    | `0x${string}`
    | undefined;
  if (!masterPrivateKey) {
    throw new Error('LIVE_MASTER_ACCOUNT is required.');
  }

  const mainnetRpcUrl = process.env['LIT_MAINNET_RPC_URL'];
  if (!mainnetRpcUrl) {
    throw new Error('LIT_MAINNET_RPC_URL is required.');
  }

  const destination = privateKeyToAccount(masterPrivateKey).address;

  const accounts = readGeneratedAccounts({ filePath: ACCOUNTS_FILE });
  if (accounts.length === 0) {
    console.log(`No generated accounts found at ${ACCOUNTS_FILE}.`);
    return;
  }

  const uniqueAccounts = dedupeAccounts(accounts);

  console.log(`Loaded ${uniqueAccounts.length} accounts from ${ACCOUNTS_FILE}.`);
  console.log(`Network: ${networkInput}`);
  console.log(`Destination: ${destination}`);

  if (flags.withdraw) {
    const previousState = readWithdrawalState(STATE_FILE);
    if (previousState?.pending?.length) {
      console.log(
        `Loaded ${previousState.pending.length} pending withdrawals from ${STATE_FILE}.`
      );
    }
    await confirmDestination(destination, flags.yes);
  }

  const rpcOverrideEnvVar =
    networkInput === 'naga' || networkInput === 'naga-proto'
      ? 'LIT_MAINNET_RPC_URL'
      : 'LIT_YELLOWSTONE_PRIVATE_RPC_URL';
  const rpcOverride = process.env[rpcOverrideEnvVar];

  const resolvedNetwork = await resolveNetwork({
    network: networkInput,
    rpcUrlOverride: rpcOverride,
  });

  if (rpcOverride) {
    console.log(`Using RPC override (${rpcOverrideEnvVar}).`);
  }

  const chainConfig = resolvedNetwork.networkModule.getChainConfig();
  const publicClient = createPublicClient({
    chain: chainConfig,
    transport: http(mainnetRpcUrl),
  });

  const litClient = await createLitClient({
    network: resolvedNetwork.networkModule,
  });

  const pendingEntries: PendingWithdrawal[] = [];

  for (const record of uniqueAccounts) {
    const account = privateKeyToAccount(record.privateKey);
    const accountId = `${account.address}${record.label ? ` (${record.label})` : ''}`;

    console.log('\n---');
    console.log(`Account: ${accountId}`);
    if (record.network) {
      console.log(`Recorded network: ${record.network}`);
    }

    const nativeBalance = await publicClient.getBalance({
      address: account.address,
    });
    console.log(`Native balance: ${formatWei(nativeBalance)}`);

    const isDestination =
      account.address.toLowerCase() === destination.toLowerCase();
    if (isDestination) {
      console.log('Account is the destination; skipping withdrawals and sweep.');
      continue;
    }

    let paymentManager:
      | Awaited<ReturnType<typeof litClient.getPaymentManager>>
      | null = null;
    try {
      paymentManager = await litClient.getPaymentManager({ account });
    } catch (error) {
      console.warn('Failed to create PaymentManager:', error);
      continue;
    }
    if (!paymentManager) {
      console.warn('PaymentManager unavailable; skipping.');
      continue;
    }

    let ledgerBalance:
      | Awaited<ReturnType<typeof paymentManager.getBalance>>
      | null = null;
    try {
      ledgerBalance = await paymentManager.getBalance({
        userAddress: account.address,
      });
      console.log(
        `Ledger balance: total=${ledgerBalance.totalBalance} ETH available=${ledgerBalance.availableBalance} ETH`
      );
    } catch (error) {
      console.warn('Failed to fetch ledger balance:', error);
    }

    let withdrawStatus:
      | Awaited<ReturnType<typeof paymentManager.canExecuteWithdraw>>
      | null = null;
    try {
      withdrawStatus = await paymentManager.canExecuteWithdraw({
        userAddress: account.address,
      });
      if (withdrawStatus.withdrawRequest.isPending) {
        const remaining =
          withdrawStatus.timeRemaining !== undefined
            ? `${withdrawStatus.timeRemaining}s remaining`
            : 'eligible';
        console.log(
          `Pending withdrawal: ${withdrawStatus.withdrawRequest.amount} ETH (${remaining})`
        );
      } else {
        console.log('No pending withdrawal request.');
      }
    } catch (error) {
      console.warn('Failed to fetch withdraw request:', error);
    }

    if (!flags.withdraw) {
      continue;
    }

    if (!ledgerBalance || !withdrawStatus) {
      console.log('Skipping withdrawal actions due to missing ledger data.');
      continue;
    }

    const hadPendingBefore = withdrawStatus.withdrawRequest.isPending;
    let updatedWithdrawStatus = withdrawStatus;
    let statusReliable = true;
    let requestedWithdrawal = false;
    let executedWithdrawal = false;

    const refreshWithdrawStatus = async () => {
      try {
        updatedWithdrawStatus = await paymentManager.canExecuteWithdraw({
          userAddress: account.address,
        });
      } catch (error) {
        statusReliable = false;
        console.warn('Failed to refresh withdrawal status:', error);
      }
    };

    if (updatedWithdrawStatus.withdrawRequest.isPending) {
      if (updatedWithdrawStatus.canExecute) {
        try {
          console.log(
            `Executing withdrawal for ${updatedWithdrawStatus.withdrawRequest.amount} ETH...`
          );
          await paymentManager.withdraw({
            amountInEth: updatedWithdrawStatus.withdrawRequest.amount,
          });
          executedWithdrawal = true;
        } catch (error) {
          console.warn('Withdrawal execution failed:', error);
        }
        await refreshWithdrawStatus();
      } else {
        console.log('Withdrawal pending; waiting for delay to elapse.');
      }
    } else if (ledgerBalance.raw.availableBalance > 0n) {
      try {
        console.log(
          `Requesting withdrawal for ${ledgerBalance.availableBalance} ETH...`
        );
        await paymentManager.requestWithdraw({
          amountInEth: ledgerBalance.availableBalance,
        });
        requestedWithdrawal = true;
      } catch (error) {
        console.warn('Withdrawal request failed:', error);
      }

      await refreshWithdrawStatus();

      if (
        updatedWithdrawStatus.withdrawRequest.isPending &&
        updatedWithdrawStatus.canExecute
      ) {
        try {
          console.log(
            `Executing withdrawal for ${updatedWithdrawStatus.withdrawRequest.amount} ETH...`
          );
          await paymentManager.withdraw({
            amountInEth: updatedWithdrawStatus.withdrawRequest.amount,
          });
          executedWithdrawal = true;
        } catch (error) {
          console.warn('Withdrawal execution failed:', error);
        }

        await refreshWithdrawStatus();
      }
    } else {
      console.log('Ledger available balance is zero; no withdrawal requested.');
    }

    const pending = statusReliable
      ? updatedWithdrawStatus.withdrawRequest.isPending
      : !executedWithdrawal && (hadPendingBefore || requestedWithdrawal);

    if (pending) {
      const pendingRequest = statusReliable
        ? updatedWithdrawStatus.withdrawRequest
        : requestedWithdrawal
        ? {
            amount: ledgerBalance.availableBalance,
            timestamp: `${Math.floor(Date.now() / 1000)}`,
          }
        : withdrawStatus.withdrawRequest;
      const timeRemainingSeconds =
        statusReliable && updatedWithdrawStatus.timeRemaining !== undefined
          ? updatedWithdrawStatus.timeRemaining
          : undefined;
      const pendingEntry: PendingWithdrawal = {
        address: account.address,
        label: record.label,
        amountEth: pendingRequest.amount,
        requestedAt: toIsoFromSeconds(pendingRequest.timestamp),
        timeRemainingSeconds,
        lastCheckedAt: new Date().toISOString(),
      };
      pendingEntries.push(pendingEntry);
      console.log(
        'Skipping native sweep while a withdrawal is pending to preserve gas for a later run.'
      );
      continue;
    }

    try {
      console.log('Sweeping native balance to destination...');
      await sweepNativeBalance({
        publicClient,
        chainConfig,
        account,
        destination,
        rpcUrl: mainnetRpcUrl,
      });
    } catch (error) {
      console.warn('Native sweep failed:', error);
    }
  }

  if (flags.withdraw) {
    const state: WithdrawalState = {
      version: 1,
      updatedAt: new Date().toISOString(),
      network: networkInput,
      destination,
      pending: pendingEntries,
    };
    writeWithdrawalState(STATE_FILE, state);
    console.log(
      `Saved withdrawal state (${pendingEntries.length} pending) to ${STATE_FILE}.`
    );
  }
}

main().catch((error) => {
  console.error('money-back failed:', error);
  process.exit(1);
});
