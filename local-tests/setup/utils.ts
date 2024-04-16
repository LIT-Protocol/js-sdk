import { LIT_PROCESS_ENV } from '@lit-protocol/constants';
import { ENV } from './env-setup';
import { log } from '@lit-protocol/misc';

export namespace LitE2eManager {
  const PROCESS_ENV = {
    NETWORK: process.env[LIT_PROCESS_ENV.NETWORK],
    FILTERS: process.env[LIT_PROCESS_ENV.FILTERS],
    DEBUG: process.env[LIT_PROCESS_ENV.DEBUG],
  };

  /**
   * Get the network flag from the command line arguments
   *
   * @example
   * NETWORK=habanero yarn test:local
   */
  export const getNetworkEnv = (): ENV => {
    const networkArg = PROCESS_ENV.NETWORK;

    const network: string = networkArg || ENV.LOCALCHAIN;

    if (
      network !== ENV.LOCALCHAIN &&
      network !== ENV.HABANERO &&
      network !== ENV.MANZANO &&
      network !== ENV.CAYENNE
    ) {
      log(
        '[getNetworkEnv] Invalid network argument. Please use NETWORK=localchain, NETWORK=habanero, NETWORK=manzano, or NETWORK=cayenne'
      );
      process.exit();
    }

    return network;
  };

  /**
   * Get the filters from the environment variables
   *
   * @example
   * FILTERS=testName1,testName2 yarn test:local
   */
  export const getFiltersEnv = (): string[] => {
    const filterArg = PROCESS_ENV.FILTERS;
    return filterArg ? filterArg.split(',') : [];
  };

  /**
   * Get the version flag from the command line arguments
   *
   * @example
   * yarn test:local --debug=true
   */
  export const getDebugEnv = (): boolean => {
    const debugEnv = PROCESS_ENV.DEBUG;
    return debugEnv === 'true'; // Explicitly check for the string 'true'
  };

  /**
   * List available tests using an environment variable
   *
   * @example
   * LIST=true yarn test:local
   */
  export const list = (tests): void => {
    const list = process.env.LIST === 'true';

    if (list) {
      log('[list] Available tests:');
      log(`[list] Run with environment FILTER= to run a specific test`);
      log('[list] ----------------');
      Object.entries(tests).forEach(([testName, testFunction], i) => {
        log(`${i + 1}. ${testName}`);
      });
      log('\n');
      process.exit();
    }
  };
}

/**
 * Run tests based on the command line arguments
 *
 * @example
 * yarn test:local --network=localchain --filter=testName1,testName2
 */
export const runTests = async (tests) => {
  const filters = LitE2eManager.getFiltersEnv();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  for (const [testName, testFunction] of testsToRun) {
    log(`Running ${testName}...`);

    // @ts-ignore
    await testFunction();
  }
};
