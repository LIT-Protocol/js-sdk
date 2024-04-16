import { ENV } from './env-setup';
import { log } from '@lit-protocol/misc';

export namespace LitE2eManager {

  export enum FLAG {
    VERSION = '--version=',
    FILTER = '--filter=',
    LIST = '--list',
    NETWORK = '--network=',
  }

  /**
   * Get the network flag from the command line arguments
   * 
   * @example
   * yarn test:local --network=localchain
   */
  export const getNetworkFlag = (): ENV => {
    const networkArg = process.argv.find((arg) =>
      arg.startsWith(FLAG.NETWORK)
    );

    const network: string = networkArg
      ? networkArg.replace(FLAG.NETWORK, '')
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

  /**
   * Get the filters flag from the command line arguments
   * 
   * @example
   * yarn test:local --filter=testName1,testName2
   */
  export const getFiltersFlag = (): string[] => {
    const filterArg = process.argv.find((arg) =>
      arg.startsWith(FLAG.FILTER)
    );
    return filterArg
      ? filterArg.replace(FLAG.FILTER, '').split(',')
      : [];
  };

  /**
   * Get the version flag from the command line arguments
   * 
   * @example
   * yarn test:local --list
   */
  export const list = (tests): void => {
    const arg = process.argv.find((arg) =>
      arg.startsWith(FLAG.LIST)
    );

    const list = arg === undefined ? false : true;

    if (list) {
      log('[list] Available tests:');
      log(`[list] Run with --filter=testName to run a specific test`);
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
  const filters = LitE2eManager.getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  for (const [testName, testFunction] of testsToRun) {
    log(`Running ${testName}...`);

    // @ts-ignore
    await testFunction();
  }
};
