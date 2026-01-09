import { runMoneyBack } from './money-back';

const CRON_EXPR = process.env['CRON'];

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const parseCronMinutes = (cronExpr: string): number => {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `[money-back-cron] CRON must use 5 fields, received "${cronExpr}"`
    );
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const nonMinute = [hour, dayOfMonth, month, dayOfWeek];
  if (nonMinute.some((field) => field !== '*')) {
    throw new Error(
      `[money-back-cron] CRON supports only minute intervals like "*/10 * * * *" or "* * * * *", received "${cronExpr}"`
    );
  }

  if (minute === '*') {
    return 1;
  }
  if (minute.startsWith('*/')) {
    const value = Number.parseInt(minute.slice(2), 10);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(
        `[money-back-cron] CRON minute interval must be a positive integer, received "${cronExpr}"`
      );
    }
    return value;
  }

  throw new Error(
    `[money-back-cron] CRON minute field must be "*" or "*/N", received "${cronExpr}"`
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

const runCronLoop = async () => {
  if (!CRON_EXPR) {
    throw new Error(
      '[money-back-cron] CRON environment variable is required'
    );
  }

  let iteration = 0;
  while (true) {
    iteration += 1;
    console.log(
      `[money-back-cron] Run ${iteration} starting at ${new Date().toISOString()}`
    );

    await runMoneyBack(process.argv.slice(2));

    const { delayMs, nextRun } = getNextCronDelay(CRON_EXPR, new Date());
    console.log(`[money-back-cron] Next run at ${nextRun.toISOString()}`);
    await sleep(delayMs);
  }
};

runCronLoop().catch((error) => {
  console.error('money-back-cron failed:', error);
  process.exit(1);
});
