import { LIT_PROCESS_FLAG } from '@lit-protocol/constants';
import { DevEnv, processEnvs } from './tinny-setup';

/**
 * Retrieves filter flags from the command line arguments to determine which tests to run.
 * It parses the process arguments to find flags that specify filters, typically used to limit test execution to specific tests.
 *
 * @returns {string[]} An array of filter strings extracted from the command line arguments.
 *
 * @example
 * // Assume the command line is: node script.js --filter=test1,test2
 */
export const getFiltersFlag = (): string[] => {
  const filterArg = process.argv.find((arg) =>
    arg.startsWith(LIT_PROCESS_FLAG.FILTER)
  );
  return filterArg
    ? filterArg.replace(LIT_PROCESS_FLAG.FILTER, '').split(',')
    : [];
};

/**
 * This function orchestrates the execution of a series of tests provided in an object, filtering and running them based on specified criteria.
 * It takes a configuration object containing the `tests` to be run and the `devEnv` (development environment settings).
 *
 * @param {Object} options - The options for test execution.
 * @param {Object} options.tests - An object containing test functions indexed by their names.
 * @param {DevEnv} options.devEnv - The development environment settings to be used during the tests.
 *
 * ## Example:
 * ```ts
 * runTests({
 *   tests: {
 *     testFoo: async () => { ... },
 *     testBar: async () => { ... },
 *   },
 *   devEnv: { ... }
 * });
 * ```
 */

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
  let index = 1;
  let failedTests = []; // Array to keep track of failed tests with error details
  let passedTests = []; // Array to keep track of passed tests and their times
  let skippedTests = []; // Array to keep track of skipped tests

  for (const [testName, testFunction] of testsToRun) {
    const startTime = performance.now(); // Start time of the test

    try {
      console.log(`\x1b[90m[runTests] Running ${index}. ${testName}...\x1b[0m`);
      await (testFunction as any)(devEnv);

      const endTime = performance.now(); // End time of the test
      const timeTaken = (endTime - startTime).toFixed(2);

      console.log(
        `\x1b[32m✔\x1b[90m ${index}. ${testName} - Passed (${timeTaken} ms)\x1b[0m`
      );
      passedTests.push(`${testName} (Passed in ${timeTaken} ms)`);
    } catch (error) {
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);
      const errorMessage =
        error instanceof Error ? error.stack : error.toString();

      if (errorMessage === 'LIT_IGNORE_TEST') {
        console.log(
          `\x1b[90m✔\x1b[90m ${index}. ${testName} - Skipped (${timeTaken} ms)\x1b[0m`
        );
        skippedTests.push(`${testName} (Skipped)`);
      } else {
        console.error(
          `\x1b[31m✖\x1b[90m ${index}. ${testName} - Failed (${timeTaken} ms)\x1b[0m`
        );
        console.error(`\x1b[31mError:\x1b[90m ${errorMessage}\x1b[0m`);

        failedTests.push(
          `${testName} (Failed in ${timeTaken} ms) - Error: ${errorMessage}`
        );
      }
    }

    index++;

    if (shouldWait) {
      await new Promise((resolve) =>
        setTimeout(resolve, processEnvs.DELAY_BETWEEN_TESTS)
      );
    }
  }

  if (skippedTests.length > 0) {
    console.log(`\x1b[90mTest Report: Some tests were skipped.\x1b[0m`);
    skippedTests.forEach((skippedTest) =>
      console.log(`\x1b[90m- ${skippedTest}\x1b[0m`)
    );
  }

  if (failedTests.length > 0) {
    console.log(`\x1b[31mTest Report: Some tests failed.\x1b[0m`);
    failedTests.forEach((failedTest) =>
      console.log(`\x1b[31m- ${failedTest}\x1b[0m`)
    );
    passedTests.forEach((passedTest) =>
      console.log(`\x1b[32m- ${passedTest}\x1b[0m`)
    );
    process.exit(1);
  } else {
    console.log(
      `\x1b[32mTest Report: ${testsToRun.length} test(s) passed successfully.\x1b[0m`
    );
    passedTests.forEach((passedTest) =>
      console.log(`\x1b[32m- ${passedTest}\x1b[0m`)
    );
    process.exit(0);
  }
};

export const runTestsParallel = async ({
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

  const testPromises = testsToRun.map(
    async ([testName, testFunction], index) => {
      const maxAttempts = processEnvs.MAX_ATTEMPTS;
      let attempts = 0;
      let testPassed = false;

      while (attempts < maxAttempts && !testPassed) {
        const startTime = performance.now();
        try {
          console.log(
            `\x1b[90m[runTestsParallel] Attempt ${attempts + 1} for ${
              index + 1
            }. ${testName}...\x1b[0m`
          );

          // @ts-ignore
          await testFunction(devEnv);
          testPassed = true;

          const endTime = performance.now();
          const timeTaken = (endTime - startTime).toFixed(2);
          console.log(
            `\x1b[32m✔\x1b[90m ${
              index + 1
            }. ${testName} - Passed (${timeTaken} ms)\x1b[0m`
          );
          return `${testName} (Passed in ${timeTaken} ms)`;
        } catch (error) {
          if (error.message === 'LIT_IGNORE_TEST') {
            return `${testName} (Skipped)`;
          }
          attempts++;
          if (attempts >= maxAttempts) {
            const endTime = performance.now();
            const timeTaken = (endTime - startTime).toFixed(2);
            console.error(
              `\x1b[31m✖\x1b[90m ${
                index + 1
              }. ${testName} - Failed after ${maxAttempts} attempts (${timeTaken} ms)\x1b[0m`
            );
            console.error(`\x1b[31mError:\x1b[90m ${error}\x1b[0m`);
            return `${testName} (Failed in ${timeTaken} ms) - Error: ${error}`;
          }
        }
      }
    }
  );

  const results = await Promise.all(testPromises);

  const skippedTests = results.filter((result) => result.includes('Skipped'));
  const failedTests = results.filter((result) => result.includes('Failed'));
  const passedTests = results.filter((result) => result.includes('Passed'));

  if (skippedTests.length > 0) {
    console.log(`\x1b[90mTest Report: Some tests were skipped.\x1b[0m`);
    skippedTests.forEach((skippedTest) =>
      console.log(`\x1b[90m- ${skippedTest}\x1b[0m`)
    );
  }

  if (failedTests.length > 0) {
    console.log(`\x1b[31mTest Report: Some tests failed.\x1b[0m`);
    failedTests.forEach((failedTest) =>
      console.log(`\x1b[31m- ${failedTest}\x1b[0m`)
    );
  }

  if (passedTests.length > 0) {
    console.log(
      `\x1b[32mTest Report: ${passedTests.length} test(s) passed successfully.\x1b[0m`
    );
    passedTests.forEach((passedTest) =>
      console.log(`\x1b[32m- ${passedTest}\x1b[0m`)
    );
  }

  if (failedTests.length > 0) {
    process.exit(1); // Exit with error code if any test failed
  } else {
    process.exit(0); // Exit successfully if all tests passed
  }
};
