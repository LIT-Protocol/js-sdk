import { LIT_PROCESS_FLAG } from '@lit-protocol/constants';
import { DevEnv, processEnvs } from './env-setup';
import { log } from '@lit-protocol/misc';

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
  silent = true, // Default silent to true if not provided
}: {
  tests: any;
  devEnv: DevEnv;
  silent?: boolean; // Optional silent flag
}) => {
  // const originalConsoleLog = console.log;
  // const originalConsoleWarn = console.warn;

  const filters = getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  const shouldWait = testsToRun.length > 1;
  let index = 1; // Start index from 1
  let failedTests = []; // Array to keep track of failed tests
  let passedTests = []; // Array to keep track of passed tests and their times

  for (const [testName, testFunction] of testsToRun) {
    const startTime = performance.now(); // Start time of the test

    if (silent) {
      // Temporarily override console functions to suppress logs
      // console.log = () => {};
      // console.warn = () => {};
    }

    try {
      console.log(`\x1b[90m[runTests] Running ${index}. ${testName}...\x1b[0m`);
      await (testFunction as any)(devEnv);

      const endTime = performance.now(); // End time of the test
      const timeTaken = (endTime - startTime).toFixed(2);

      // Log success with a tick and gray color
      console.log(
        `\x1b[32m✔\x1b[90m ${index}. ${testName} - Passed (${timeTaken} ms)\x1b[0m`
      );

      // Store passed test with its time taken
      passedTests.push(`${testName} (Passed in ${timeTaken} ms)`);
    } catch (error) {
      if (error.message !== 'Unavailable') {
        const endTime = performance.now(); // End time of the test
        const timeTaken = (endTime - startTime).toFixed(2);

        // Log failure with a cross and gray color
        console.error(
          `\x1b[31m✖\x1b[90m ${index}. ${testName} - Failed (${timeTaken} ms)\x1b[0m`
        );
        console.error(`\x1b[31mError:\x1b[90m ${error.message}\x1b[0m`);

        // Add failed test to the list
        failedTests.push(`${testName} (Failed in ${timeTaken} ms)`);
      } else {
        console.log(`\x1b[90m✖ ${index}. ${testName} - Skipped\x1b[0m`);
      }
    } finally {
      // Restore the original console functions after each test
      // console.log = originalConsoleLog;
      // console.warn = originalConsoleWarn;
    }

    index++; // Increment test index

    // delay between tests if there are more than 1 test to run
    if (shouldWait) {
      await new Promise((resolve) =>
        setTimeout(resolve, processEnvs.DELAY_BETWEEN_TESTS)
      );
    }
  }

  // Report on failed tests at the end of all tests
  if (failedTests.length > 0) {
    console.log(`\x1b[31mTest Report: Some tests failed.\x1b[0m`);
    failedTests.forEach((failedTest) => {
      console.log(`\x1b[31m- ${failedTest}\x1b[0m`);
    });
    passedTests.forEach((passedTest) => {
      console.log(`\x1b[32m- ${passedTest}\x1b[0m`);
    });
    process.exit(1);
  } else {
    console.log(
      `\x1b[32mTest Report: ${testsToRun.length} test(s) passed successfully.\x1b[0m`
    );
    passedTests.forEach((passedTest) => {
      console.log(`\x1b[32m- ${passedTest}\x1b[0m`);
    });
    process.exit(0);
  }
};
