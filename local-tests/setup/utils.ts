import { LIT_PROCESS_FLAG } from '@lit-protocol/constants';
import { ENV } from './env-setup';
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
    network !== ENV.MANZANO
  ) {
    log(
      '[getNetworkFlag] Invalid network argument. Please use --network=localchain, --network=habanero, or --network=manzano'
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

export const runTests = async (tests) => {
  const filters = getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  for (const [testName, testFunction] of testsToRun) {
    log(`Running ${testName}...`);

    // @ts-ignore
    await testFunction();
  }
};
