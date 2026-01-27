import { createLitClient } from '@lit-protocol/lit-client';
import fs from 'node:fs';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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
  cron?: string;
};

type AccountReadResult = {
  record: GeneratedAccountRecord;
  account: ReturnType<typeof privateKeyToAccount>;
  nativeBalance: bigint | null;
  ledgerBalance: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof createLitClient>>['getPaymentManager']
    >['getBalance']
  > | null;
  withdrawStatus: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof createLitClient>>['getPaymentManager']
    >['canExecuteWithdraw']
  > | null;
  paymentManager: Awaited<
    ReturnType<Awaited<ReturnType<typeof createLitClient>>['getPaymentManager']>
  > | null;
  readWarnings: string[];
};

const ACCOUNTS_FILE = path.resolve(
  process.cwd(),
  '.e2e',
  'generated-accounts.jsonl'
);
const STATE_FILE = path.resolve(process.cwd(), '.e2e', 'withdrawal-state.json');

function parseFlags(argv: string[]): CliFlags {
  const flags: CliFlags = {
    withdraw: false,
    yes: false,
    help: false,
    cron: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--withdraw') {
      flags.withdraw = true;
    } else if (arg === '--yes') {
      flags.yes = true;
    } else if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--cron') {
      const value = argv[i + 1];
      flags.cron = value ?? '';
      i += 1;
    } else if (arg.startsWith('--cron=')) {
      flags.cron = arg.slice('--cron='.length);
    }
  }

  return flags;
}

function formatWei(wei: bigint): string {
  return `${formatEther(wei)} LITKEY`;
}

function toIsoFromSeconds(seconds: string): string {
  const parsed = Number(seconds);
  if (Number.isFinite(parsed) && parsed > 0) {
    return new Date(parsed * 1000).toISOString();
  }
  return new Date().toISOString();
}

function parseAmountToWei(amount: string | bigint): bigint {
  if (typeof amount === 'bigint') return amount;
  const trimmed = amount.trim();
  if (!trimmed) return 0n;
  try {
    return parseEther(trimmed);
  } catch {
    return 0n;
  }
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

function writeWithdrawalState(filePath: string, state: WithdrawalState): void {
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
    throw new Error(
      'Refusing to proceed without --yes in non-interactive mode.'
    );
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sweepNativeBalance(params: {
  publicClient: ReturnType<typeof createPublicClient>;
  chainConfig: ReturnType<
    Awaited<
      ReturnType<typeof resolveNetwork>
    >['networkModule']['getChainConfig']
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

  let hash: `0x${string}`;
  if (gasPrice) {
    hash = await walletClient.sendTransaction({
      account,
      to: destination,
      value,
      gas,
      gasPrice,
      type: 'legacy',
    });
  } else if (maxFeePerGas) {
    const priorityFee = maxPriorityFeePerGas ?? maxFeePerGas;
    const cappedPriorityFee =
      priorityFee > maxFeePerGas ? maxFeePerGas : priorityFee;
    hash = await walletClient.sendTransaction({
      account,
      to: destination,
      value,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas: cappedPriorityFee,
      type: 'eip1559',
    });
  } else {
    throw new Error('Unable to determine fee model for native sweep.');
  }

  await publicClient.waitForTransactionReceipt({ hash });

  console.log(
    `Swept ${formatWei(value)} from ${
      account.address
    } -> ${destination} (${hash}).`
  );
}

export async function runMoneyBack(
  argv: string[] = process.argv.slice(2)
): Promise<void> {
  if (!process.env['LOG_LEVEL']) {
    process.env['LOG_LEVEL'] = 'silent';
  }

  const flags = parseFlags(argv);

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

  console.log(
    `Loaded ${uniqueAccounts.length} accounts from ${ACCOUNTS_FILE}.`
  );
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

  const readResults: AccountReadResult[] = await Promise.all(
    uniqueAccounts.map(async (record) => {
      const account = privateKeyToAccount(record.privateKey);
      const readWarnings: string[] = [];

      let nativeBalance: bigint | null = null;
      try {
        nativeBalance = await publicClient.getBalance({
          address: account.address,
        });
      } catch (error) {
        readWarnings.push(`Failed to fetch native balance: ${error}`);
      }

      let paymentManager: Awaited<
        ReturnType<typeof litClient.getPaymentManager>
      > | null = null;
      try {
        paymentManager = await litClient.getPaymentManager({ account });
      } catch (error) {
        readWarnings.push(`Failed to create PaymentManager: ${error}`);
      }

      let ledgerBalance: Awaited<
        ReturnType<NonNullable<typeof paymentManager>['getBalance']>
      > | null = null;
      let withdrawStatus: Awaited<
        ReturnType<NonNullable<typeof paymentManager>['canExecuteWithdraw']>
      > | null = null;
      if (paymentManager) {
        try {
          ledgerBalance = await paymentManager.getBalance({
            userAddress: account.address,
          });
        } catch (error) {
          readWarnings.push(`Failed to fetch ledger balance: ${error}`);
        }

        try {
          withdrawStatus = await paymentManager.canExecuteWithdraw({
            userAddress: account.address,
          });
        } catch (error) {
          readWarnings.push(`Failed to fetch withdraw request: ${error}`);
        }
      } else {
        readWarnings.push('PaymentManager unavailable; skipping.');
      }

      return {
        record,
        account,
        nativeBalance,
        ledgerBalance,
        withdrawStatus,
        paymentManager,
        readWarnings,
      };
    })
  );

  const pendingResults = await Promise.all(
    readResults.map(async (result) => {
      const { record, account, nativeBalance, ledgerBalance, withdrawStatus } =
        result;
      const accountId = `${account.address}${
        record.label ? ` (${record.label})` : ''
      }`;
      const ledgerTotalWei = ledgerBalance
        ? parseAmountToWei(ledgerBalance.totalBalance)
        : 0n;
      const pendingAmountWei =
        withdrawStatus?.withdrawRequest?.amount !== undefined
          ? parseAmountToWei(withdrawStatus.withdrawRequest.amount)
          : 0n;
      const hasPositiveBalance =
        (nativeBalance ?? 0n) > 0n || ledgerTotalWei > 0n || pendingAmountWei > 0n;

      if (!hasPositiveBalance) {
        return null;
      }

      console.log('\n---');
      console.log(`Account: ${accountId}`);
      if (record.network) {
        console.log(`Recorded network: ${record.network}`);
      }

      for (const warning of result.readWarnings) {
        console.warn(warning);
      }

      if (nativeBalance !== null) {
        console.log(`Native balance: ${formatWei(nativeBalance)}`);
      }

      const isDestination =
        account.address.toLowerCase() === destination.toLowerCase();
      if (isDestination) {
        console.log(
          'Account is the destination; skipping withdrawals and sweep.'
        );
        return null;
      }

      if (ledgerBalance) {
        console.log(
        `Ledger balance: total=${ledgerBalance.totalBalance} LITKEY available=${ledgerBalance.availableBalance} LITKEY`
        );
      }

      if (withdrawStatus) {
        if (withdrawStatus.withdrawRequest.isPending) {
          const remaining =
            withdrawStatus.timeRemaining !== undefined
              ? `${withdrawStatus.timeRemaining}s remaining`
              : 'eligible';
          console.log(
          `Pending withdrawal: ${withdrawStatus.withdrawRequest.amount} LITKEY (${remaining})`
          );
        } else {
          console.log('No pending withdrawal request.');
        }
      }

      if (!flags.withdraw) {
        return null;
      }

      if (!ledgerBalance || !withdrawStatus || !result.paymentManager) {
        console.log('Skipping withdrawal actions due to missing ledger data.');
        return null;
      }

      const hadPendingBefore = withdrawStatus.withdrawRequest.isPending;
      let updatedWithdrawStatus = withdrawStatus;
      let statusReliable = true;
      let requestedWithdrawal = false;
      let executedWithdrawal = false;

      const refreshWithdrawStatus = async () => {
        try {
          updatedWithdrawStatus =
            await result.paymentManager!.canExecuteWithdraw({
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
            `Executing withdrawal for ${updatedWithdrawStatus.withdrawRequest.amount} LITKEY...`
            );
            await result.paymentManager!.withdraw({
              amountInLitkey: updatedWithdrawStatus.withdrawRequest.amount,
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
          `Requesting withdrawal for ${ledgerBalance.availableBalance} LITKEY...`
          );
          await result.paymentManager!.requestWithdraw({
            amountInLitkey: ledgerBalance.availableBalance,
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
              `Executing withdrawal for ${updatedWithdrawStatus.withdrawRequest.amount} LITKEY...`
            );
            await result.paymentManager!.withdraw({
              amountInLitkey: updatedWithdrawStatus.withdrawRequest.amount,
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
        console.log(
          'Skipping native sweep while a withdrawal is pending to preserve gas for a later run.'
        );
        return pendingEntry;
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

      return null;
    })
  );

  pendingEntries.push(...pendingResults.filter(Boolean));

  const nativeTotalWei = readResults.reduce((total, result) => {
    if (result.nativeBalance === null) return total;
    return total + result.nativeBalance;
  }, 0n);
  const ledgerTotals = readResults.reduce(
    (total, result) => {
      if (!result.ledgerBalance) return total;
      total.totalWei += parseAmountToWei(result.ledgerBalance.totalBalance);
      total.availableWei += parseAmountToWei(
        result.ledgerBalance.availableBalance
      );
      return total;
    },
    { totalWei: 0n, availableWei: 0n }
  );
  const stats = readResults.reduce(
    (total, result) => {
      total.accountCount += 1;
      const hasNative = (result.nativeBalance ?? 0n) > 0n;
      const ledgerTotalWei = result.ledgerBalance
        ? parseAmountToWei(result.ledgerBalance.totalBalance)
        : 0n;
      const hasLedger = ledgerTotalWei > 0n;
      if (hasNative) total.nativeNonZeroCount += 1;
      if (hasLedger) total.ledgerNonZeroCount += 1;
      if (hasNative || hasLedger) total.anyNonZeroCount += 1;
      if (hasLedger && !hasNative) total.ledgerNoGasCount += 1;
      return total;
    },
    {
      accountCount: 0,
      nativeNonZeroCount: 0,
      ledgerNonZeroCount: 0,
      anyNonZeroCount: 0,
      ledgerNoGasCount: 0,
    }
  );
  console.log('\n=== Totals ===');
  console.log(`Accounts: ${stats.accountCount}`);
  console.log(
    `Accounts with balance > 0: ${stats.anyNonZeroCount} (native ${stats.nativeNonZeroCount}, ledger ${stats.ledgerNonZeroCount})`
  );
  console.log(
    `Ledger balance but no native gas: ${stats.ledgerNoGasCount}`
  );
  console.log(`Native total: ${formatEther(nativeTotalWei)} LITKEY`);
  console.log(
    `Ledger total: ${formatEther(
      ledgerTotals.totalWei
    )} LITKEY (available ${formatEther(ledgerTotals.availableWei)} LITKEY)`
  );

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
    const pendingTotalWei = pendingEntries.reduce(
      (total, entry) => total + parseAmountToWei(entry.amountEth),
      0n
    );
    console.log(
      `Pending summary: ${
        pendingEntries.length
      } request(s), total ${formatEther(
        pendingTotalWei
      )} LITKEY remaining to withdraw.`
    );
  }
}

const entrypoint = process.argv[1];
const isMain = entrypoint && import.meta.url === pathToFileURL(entrypoint).href;

if (isMain) {
  runMoneyBack().catch((error) => {
    console.error('money-back failed:', error);
    process.exit(1);
  });
}
