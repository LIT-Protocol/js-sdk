import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import fs from 'fs';
import path from 'path';

export const testPkpSignXTimes = async (devEnv: TinnyEnvironment) => {
  const PARALLEL_RUNS = 20;
  const TOTAL_RUNS = 10000;
  const DELAY_BETWEEN_TESTS = 1500; // 1.5 seconds in milliseconds

  const alice = await devEnv.createRandomPerson();
  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const network = process.env.NETWORK || 'unknown';
  const logFilePath = path.join(
    process.cwd(),
    `./logs/${network}-pkp-sign-test-log-${timestamp}.log`
  );

  // Initialize the log file
  fs.writeFileSync(logFilePath, '');

  const log = (entry: any) => {
    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry,
    });
    fs.appendFileSync(logFilePath, logEntry + '\n');
    console.log(logEntry);
  };

  log({
    message: `Starting testPkpSignXTimes on network ${network} with ${TOTAL_RUNS} total runs, ${PARALLEL_RUNS} in parallel, ${DELAY_BETWEEN_TESTS}ms delay between tests`,
  });
  log({ message: `Logging to file: ${logFilePath}` });

  const runTest = async (index: number, alice: any, eoaSessionSigs: any) => {
    const startTime = Date.now();

    try {
      const runWithSessionSigs = await devEnv.litNodeClient.pkpSign({
        toSign: alice.loveLetter,
        pubKey: alice.pkp.publicKey,
        sessionSigs: eoaSessionSigs,
      });

      // -- assertions
      if (!runWithSessionSigs.r) {
        throw new Error(`Expected "r" in runWithSessionSigs`);
      }
      if (!runWithSessionSigs.s) {
        throw new Error(`Expected "s" in runWithSessionSigs`);
      }
      if (!runWithSessionSigs.dataSigned) {
        throw new Error(`Expected "dataSigned" in runWithSessionSigs`);
      }
      if (!runWithSessionSigs.publicKey) {
        throw new Error(`Expected "publicKey" in runWithSessionSigs`);
      }
      if (!runWithSessionSigs.signature.startsWith('0x')) {
        throw new Error(`Expected "signature" to start with 0x`);
      }
      if (isNaN(runWithSessionSigs.recid)) {
        throw new Error(`Expected "recid" to be parseable as a number`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        type: 'test_result',
        index: index + 1,
        totalRuns: TOTAL_RUNS,
        status: 'success',
        duration,
        ...runWithSessionSigs,
      };

      log(result);

      return result;
    } catch (error) {
      const errorResult = {
        type: 'test_result',
        index: index + 1,
        totalRuns: TOTAL_RUNS,
        status: 'error',
        error: error.message,
        stack: error.stack,
        fullError: JSON.stringify(error),
      };
      log(errorResult);
      return errorResult;
    }
  };

  const results: any[] = [];

  for (let i = 0; i < TOTAL_RUNS; i += PARALLEL_RUNS) {
    log({
      type: 'batch_start',
      batch: Math.floor(i / PARALLEL_RUNS) + 1,
      totalBatches: Math.ceil(TOTAL_RUNS / PARALLEL_RUNS),
      message: 'new batch started',
    });

    const batch = Array(Math.min(PARALLEL_RUNS, TOTAL_RUNS - i))
      .fill(null)
      .map((_, index) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(runTest(i + index, alice, eoaSessionSigs));
          }, index * DELAY_BETWEEN_TESTS);
        });
      });

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  const successfulRuns = results.filter((r) => r.status === 'success');
  const failedRuns = results.filter((r) => r.status === 'error');

  const summary = {
    type: 'test_summary',
    status: 'test_completed',
    network,
    totalRuns: TOTAL_RUNS,
    successfulRuns: successfulRuns.length,
    failedRuns: failedRuns.length,
    averageDuration:
      successfulRuns.length > 0
        ? successfulRuns.reduce((sum, r) => sum + r.duration, 0) /
          successfulRuns.length
        : 0,
  };

  log(summary);

  if (failedRuns.length > 0) {
    log({
      type: 'test_failure_summary',
      message: `${failedRuns.length} tests failed. Check the log file for details.`,
    });
  }

  return results;
};
