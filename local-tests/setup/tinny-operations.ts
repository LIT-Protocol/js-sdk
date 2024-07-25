import { TinnyEnvironment } from './tinny-environment';
import { withTimeout } from './tinny-utils';

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
  const filterArg = process.argv.find((arg) => arg.startsWith('--filter='));
  return filterArg ? filterArg.replace('--filter=', '').split(',') : [];
};

/**
 * Retrieves the exclude flags from the command line arguments.
 * @returns An array of strings representing the exclude flags.
 */
export const getExcludeFlags = (): string[] => {
  const filterArg = process.argv.find((arg) => arg.startsWith('--exclude='));
  return filterArg ? filterArg.replace('--exclude=', '').split(',') : [];
};

/**
 * Runs the tests in the provided `tests` object in a synchronous manner.
 * Each test is executed in a loop with a maximum number of attempts specified by `devEnv.processEnvs.MAX_ATTEMPTS`.
 * Skipped, failed, and passed tests are tracked and logged.
 * At the end, a test report is printed with the number of passed, failed, and skipped tests.
 * If any test fails, the process exits with an error code. Otherwise, it exits successfully.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.tests - The tests to run.
 * @param {TinnyEnvironment} options.devEnv - The development environment.
 * @returns {Promise<void>} - A promise that resolves when all tests have been executed.
 */
export const runInBand = async ({
  tests,
  devEnv,
}: {
  tests: any;
  devEnv: TinnyEnvironment;
}): Promise<number> => {
  const filters = getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  // Initialize arrays to keep track of skipped, failed, and passed tests
  let skippedTests: string[] = [];
  let failedTests: string[] = [];
  let passedTests: string[] = [];

  // Iterate over each test and run it in series
  for (const [testName, testFunction] of testsToRun) {
    const maxAttempts = devEnv.processEnvs.MAX_ATTEMPTS;
    let attempts = 0;
    let testPassed = false;

    while (attempts < maxAttempts && !testPassed) {
      const startTime = performance.now();

      try {
        console.log(`Attempt ${attempts + 1} for ${testName}...`);

        // @ts-ignore
        await testFunction(devEnv);
        testPassed = true;

        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);
        console.log(`${testName} - Passed (${timeTaken} ms)`);
        passedTests.push(`${testName} (Passed in ${timeTaken} ms)`);
      } catch (error) {
        if (error.message === 'LIT_IGNORE_TEST') {
          skippedTests.push(`${testName} (Skipped)`);
          break;
        }
        attempts++;
        if (attempts >= maxAttempts) {
          const endTime = performance.now();
          const timeTaken = (endTime - startTime).toFixed(2);
          console.error(
            `${testName} - Failed after ${maxAttempts} attempts (${timeTaken} ms)`
          );
          console.error(`Error: ${error}`);
          failedTests.push(
            `${testName} (Failed in ${timeTaken} ms) - Error: ${error}`
          );
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, devEnv.processEnvs.RUN_IN_BAND_INTERVAL)
      );
    }
  }

  passedTests.forEach((test) => console.log(`- ${test}`));
  failedTests.forEach((test) => console.log(`- ${test}`));
  skippedTests.forEach((test) => console.log(`- ${test}`));

  console.log();
  // Print results
  console.log(
    `Test Report: ${passedTests.length} test(s) passed, ${failedTests.length} failed, ${skippedTests.length} skipped.`
  );

  if (failedTests.length > 0) {
    return 1; // Exit with error code if any test failed
  } else {
    return 0; // Exit successfully if all tests passed
  }
};

/**
 * Runs tests in parallel with a limit of 5 concurrent tests and reports the results.
 * @param {Object} options - The options for running the tests.
 * @param {any} options.tests - The tests to run.
 * @param {TinnyEnvironment} options.devEnv - The development environment.
 * @returns {Promise<number>} - A promise that resolves to 0 if all tests passed, 1 otherwise.
 */
export const runTestsParallel = async ({
  tests,
  devEnv,
  chunkSize,
}: {
  tests: any;
  devEnv: TinnyEnvironment;
  chunkSize?: number;
}): Promise<number> => {
  const CHUNK_SIZE = chunkSize || parseInt(process.env.CHUNK_SIZE) || 5;
  const filters = getFiltersFlag();
  const excludeFilters = getExcludeFlags();

  // Filter the tests based on include and exclude filters
  const testsToRun = Object.entries(tests).filter(
    ([testName]) =>
      (filters.length === 0 ||
        filters.some((filter) => testName.includes(filter))) &&
      (excludeFilters.length === 0 ||
        !excludeFilters.some((exclude) => testName.includes(exclude)))
  );

  if (!testsToRun || testsToRun.length <= 0) {
    throw new Error(
      '❌ No tests to run. You might have provided an invalid filter or no tests are available.'
    );
  }

  const runTest = async (
    [testName, testFunction]: [string, any],
    testIndex: number
  ): Promise<string> => {
    const maxAttempts = devEnv.processEnvs.MAX_ATTEMPTS;
    const testTimeout = devEnv.processEnvs.TEST_TIMEOUT;

    let attempts = 0;
    let testPassed = false;

    while (attempts < maxAttempts && !testPassed) {
      const startTime = performance.now();
      try {
        console.log(
          `\x1b[90m[runTestsParallel] Attempt ${attempts + 1} for ${
            testIndex + 1
          }. ${testName}...\x1b[0m`
        );

        await withTimeout(testFunction(devEnv), testTimeout);
        testPassed = true;

        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);
        console.log(
          `\x1b[32m✔\x1b[90m ${
            testIndex + 1
          }. ${testName} - Passed (${timeTaken} ms)\x1b[0m`
        );
        return `${testName} (Passed in ${timeTaken} ms)`;
      } catch (error) {
        if (error.message === 'LIT_IGNORE_TEST') {
          return `${testName} (Skipped)`;
        }
        attempts++;

        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);

        if (error.message === 'Timed out') {
          console.error(
            `\x1b[31m✖\x1b[90m ${
              testIndex + 1
            }. ${testName} - Timed out after ${testTimeout}ms (${timeTaken} ms)\x1b[0m`
          );
          return `${testName} (Timed out in ${timeTaken} ms)`;
        }

        if (attempts >= maxAttempts) {
          console.error(
            `\x1b[31m✖\x1b[90m ${
              testIndex + 1
            }. ${testName} - Failed after ${maxAttempts} attempts (${timeTaken} ms)\x1b[0m`
          );
          console.error(`\x1b[31m❌Error:\x1b[90m ${error}\x1b[0m`);
          return `${testName} (Failed in ${timeTaken} ms) - Error: ${error}`;
        }
      }
    }
  };

  const results: string[] = [];

  for (let i = 0; i < testsToRun.length; i += CHUNK_SIZE) {
    const chunk = testsToRun.slice(i, i + CHUNK_SIZE);
    const chunkResults = await Promise.all(
      chunk.map((test, index) => runTest(test, i + index))
    );

    // wait for 3 seconds before running the next chunk
    await new Promise((resolve) => setTimeout(resolve, 3000));

    results.push(...chunkResults);
  }

  const skippedTests = results.filter((result) => result.includes('Skipped'));
  const failedTests = results.filter(
    (result) => result.includes('Failed') || result.includes('Timed out')
  );
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
      `\x1b[32mTest Report: ${passedTests.length} test(s) passed.\x1b[0m`
    );
    passedTests.forEach((passedTest) =>
      console.log(`\x1b[32m- ${passedTest}\x1b[0m`)
    );
  }

  if (failedTests.length > 0) {
    console.log(
      `\x1b[31mTest Report: ${failedTests.length} test(s) failed.\x1b[0m`
    );
    return 1; // Exit with error code if any test failed
  } else {
    console.log('\x1b[32mTest Report: All tests passed.\x1b[0m');
    return 0; // Exit successfully if all tests passed
  }
};
