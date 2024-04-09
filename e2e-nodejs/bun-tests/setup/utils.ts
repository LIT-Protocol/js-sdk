import { ENV } from './env-setup';

export const getNetworkFlag = (): ENV => {
  const networkArg = process.argv.find((arg) => arg.startsWith('--network='));

  const network: string = networkArg
    ? networkArg.replace('--network=', '')
    : 'localchain';

  if (
    network !== ENV.LOCALCHAIN &&
    network !== ENV.HABANERO &&
    network !== ENV.MANZANO
  ) {
    console.log(
      'Invalid network argument. Please use --network=localchain, --network=habanero, or --network=manzano'
    );
    process.exit();
  }

  return network;
};

// Function to parse command line arguments for filters
export const getFiltersFlag = (): string[] => {
  const filterArg = process.argv.find((arg) => arg.startsWith('--filter='));
  return filterArg ? filterArg.replace('--filter=', '').split(',') : [];
};

// get --show flag
export const showTests = (tests): void => {
  const testsArg = process.argv.find((arg) => arg.startsWith('--show'));

  const showTests = testsArg === undefined ? false : true;

  if (showTests) {
    console.log('Available tests:');
    console.log(`Run with --filter=testName to run a specific test`);
    console.log('----------------');
    Object.entries(tests).forEach(([testName, testFunction], i) => {
      console.log(`${i + 1}. ${testName}`);
    });
    console.log('\n');
    process.exit();
  }
};

export const runTests = async (tests) => {
  const filters = getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  for (const [testName, testFunction] of testsToRun) {
    console.log(`Running ${testName}...`);

    // @ts-ignore
    await testFunction();
  }
};
