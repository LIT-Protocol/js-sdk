import { LIT_PROCESS_FLAG } from '@lit-protocol/constants';
import { DevEnv, ENV } from './env-setup';
import { log } from '@lit-protocol/misc';

export const getNetworkFlag = (): ENV => {
  const networkArg = process.argv.find((arg) =>
    arg.startsWith(LIT_PROCESS_FLAG.NETWORK)
  );

  const network: string = networkArg
    ? networkArg.replace(LIT_PROCESS_FLAG.NETWORK, '')
    : 'localchain';

  if (
    network !== ENV.LOCALCHAIN &&
    network !== ENV.HABANERO &&
    network !== ENV.MANZANO &&
    network !== ENV.CAYENNE
  ) {
    log(
      '[getNetworkFlag] Invalid network argument. Please use --network=localchain, --network=habanero, --network=manzano, or --network=cayenne'
    );
    process.exit();
  }

  return network;
};

// Function to parse command line arguments for filters
export const getFiltersFlag = (): string[] => {
  const filterArg = process.argv.find((arg) =>
    arg.startsWith(LIT_PROCESS_FLAG.FILTER)
  );
  return filterArg
    ? filterArg.replace(LIT_PROCESS_FLAG.FILTER, '').split(',')
    : [];
};

// get --show flag
export const showTests = (tests): void => {
  const testsArg = process.argv.find((arg) =>
    arg.startsWith(LIT_PROCESS_FLAG.SHOW)
  );

  const showTests = testsArg === undefined ? false : true;

  if (showTests) {
    log('[showTests] Available tests:');
    log(`[showTests] Run with --filter=testName to run a specific test`);
    log('[showTests] ----------------');
    Object.entries(tests).forEach(([testName, testFunction], i) => {
      log(`${i + 1}. ${testName}`);
    });
    log('\n');
    process.exit();
  }
};
export const runTests = async ({
  tests,
  devEnv,
}: {
  tests: any;
  devEnv: DevEnv;
}) => {
  const filters = getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  const shouldWait = testsToRun.length > 1;
  let index = 1; // Start index from 1

  for (const [testName, testFunction] of testsToRun) {
    const startTime = performance.now(); // Start time of the test

    try {
      console.log(`\x1b[90m[runTests] Running ${index}. ${testName}...\x1b[0m`);
      await (testFunction as any)(devEnv);

      const endTime = performance.now(); // End time of the test
      const timeTaken = (endTime - startTime).toFixed(2);

      // Log success with a tick and gray color
      console.log(
        `\x1b[32m✔\x1b[90m ${index}. ${testName} - Passed (${timeTaken} ms)\x1b[0m`
      );
    } catch (error) {
      const endTime = performance.now(); // End time of the test
      const timeTaken = (endTime - startTime).toFixed(2);

      // Log failure with a cross and gray color
      console.error(
        `\x1b[31m✖\x1b[90m ${index}. ${testName} - Failed (${timeTaken} ms)\x1b[0m`
      );
      console.error(`\x1b[31mError:\x1b[90m ${error.message}\x1b[0m`);
    }

    index++; // Increment test index

    // Wait for 1 second between tests if there are more than 1 test to run
    if (shouldWait) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
