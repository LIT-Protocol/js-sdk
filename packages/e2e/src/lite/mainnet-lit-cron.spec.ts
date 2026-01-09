import {
  LITE_FUNCTIONS,
  runLiteMainnetOnce,
  type LiteFunctionName,
  type LiteUptimeRunner,
} from './mainnet-lite.runner';

const RUN_LITE_MAINNET_E2E = process.env['RUN_LITE_MAINNET_E2E'] === '1';
const IS_MAINNET = process.env['NETWORK'] === 'naga';
const UPTIME_BOT = process.env['UPTIME_BOT'] === 'true';
const CRON_EXPR = process.env['CRON'];
const LITE_STATUS_PRODUCT = 'js-sdk/naga-lite-mainnet';
const describeIfUptime =
  RUN_LITE_MAINNET_E2E && IS_MAINNET && UPTIME_BOT ? describe : describe.skip;

type LiteStatusFunctions = Record<LiteFunctionName, { id: string }>;

type LitStatusSdk = typeof import('@lit-protocol/lit-status-sdk');

const importLitStatusSdk = async (): Promise<LitStatusSdk> => {
  // Use runtime import to avoid Babel's CJS transform for ESM-only packages.
  const importer = new Function('specifier', 'return import(specifier);') as (
    specifier: string
  ) => Promise<LitStatusSdk>;
  return importer('@lit-protocol/lit-status-sdk');
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const parseCronMinutes = (cronExpr: string): number => {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `[lite-mainnet-uptime] CRON must use 5 fields, received "${cronExpr}"`
    );
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const nonMinute = [hour, dayOfMonth, month, dayOfWeek];
  if (nonMinute.some((field) => field !== '*')) {
    throw new Error(
      `[lite-mainnet-uptime] CRON supports only minute intervals like "*/10 * * * *" or "* * * * *", received "${cronExpr}"`
    );
  }

  if (minute === '*') {
    return 1;
  }
  if (minute.startsWith('*/')) {
    const value = Number.parseInt(minute.slice(2), 10);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(
        `[lite-mainnet-uptime] CRON minute interval must be a positive integer, received "${cronExpr}"`
      );
    }
    return value;
  }

  throw new Error(
    `[lite-mainnet-uptime] CRON minute field must be "*" or "*/N", received "${cronExpr}"`
  );
};

const getNextCronDelay = (cronExpr: string, now = new Date()) => {
  const intervalMinutes = parseCronMinutes(cronExpr);
  const next = new Date(now);
  next.setSeconds(0, 0);

  const currentMinute = next.getMinutes();
  const remainder = currentMinute % intervalMinutes;
  const minutesToAdd =
    remainder === 0 ? intervalMinutes : intervalMinutes - remainder;
  next.setMinutes(currentMinute + minutesToAdd);

  return {
    delayMs: Math.max(0, next.getTime() - now.getTime()),
    nextRun: next,
  };
};

const initStatusClient = async () => {
  const statusUrl = process.env['LIT_STATUS_BACKEND_URL'];
  const statusKey = process.env['LIT_STATUS_WRITE_KEY'];
  if (!statusUrl) {
    throw new Error(
      '[lite-mainnet-uptime] LIT_STATUS_BACKEND_URL environment variable is not set'
    );
  }
  if (!statusKey) {
    throw new Error(
      '[lite-mainnet-uptime] LIT_STATUS_WRITE_KEY environment variable is not set'
    );
  }

  const { createLitStatusClient } = await importLitStatusSdk();
  const client = createLitStatusClient({
    url: statusUrl,
    apiKey: statusKey,
  });

  const networkName = process.env['NETWORK'] ?? 'naga';
  const functions = (await client.getOrRegisterFunctions({
    network: networkName,
    product: LITE_STATUS_PRODUCT,
    functions: [...LITE_FUNCTIONS],
  })) as LiteStatusFunctions;

  return { client, functions };
};

const runUptimeLoop = async () => {
  if (!CRON_EXPR) {
    throw new Error(
      '[lite-mainnet-uptime] CRON environment variable is required when UPTIME_BOT=true'
    );
  }

  const { client, functions } = await initStatusClient();
  const runWithStatus: LiteUptimeRunner = async (name, fn) => {
    await client.executeAndLog(functions[name].id, fn);
  };

  let iteration = 0;
  while (true) {
    iteration += 1;
    console.log(
      `[lite-mainnet-uptime] Run ${iteration} starting at ${new Date().toISOString()}`
    );

    await runLiteMainnetOnce(runWithStatus);

    const { delayMs, nextRun } = getNextCronDelay(CRON_EXPR, new Date());
    console.log(`[lite-mainnet-uptime] Next run at ${nextRun.toISOString()}`);
    await sleep(delayMs);
  }
};

describeIfUptime('lite mainnet e2e uptime bot', () => {
  beforeAll(() => {
    jest.setTimeout(0);
  });

  it('runs lite mainnet on cron schedule', async () => {
    await runUptimeLoop();
  });
});
