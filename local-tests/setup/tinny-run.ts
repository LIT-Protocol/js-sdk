import { LIT_PROCESS_FLAG } from '@lit-protocol/constants';
import { TinnyEnvironment } from './tinny';

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

// Define the function to run tests in series
export const runInBand = async ({
  tests,
  devEnv,
}: {
  tests: any;
  devEnv: TinnyEnvironment;
}) => {
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
    process.exit(1); // Exit with error code if any test failed
  } else {
    process.exit(0); // Exit successfully if all tests passed
  }
};

export const runTestsParallel = async ({
  tests,
  devEnv,
}: {
  tests: any;
  devEnv: TinnyEnvironment;
}) => {
  const filters = getFiltersFlag();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  const testPromises = testsToRun.map(
    async ([testName, testFunction], testIndex) => {
      const maxAttempts = devEnv.processEnvs.MAX_ATTEMPTS;
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

          // @ts-ignore
          await testFunction(devEnv);
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

          // wait for at least 5 seconds
          if (attempts >= maxAttempts) {
            const endTime = performance.now();
            const timeTaken = (endTime - startTime).toFixed(2);
            console.error(
              `\x1b[31m✖\x1b[90m ${
                testIndex + 1
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
