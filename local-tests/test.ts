import { LIT_ENDPOINT_VERSION, LIT_TESTNET } from './setup/tinny-config';
import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';
import { testBundleSpeed } from './tests/test-bundle-speed';
import { testExample } from './tests/test-example';

(async () => {
  console.log('[𐬺🧪 Tinny𐬺] Running tests...');
  const devEnv = new TinnyEnvironment();
  await devEnv.init();

  if (LIT_TESTNET.LOCALCHAIN) {
    // set global executeJs endpoint version for all tests.
    devEnv.setGlobalExecuteJsVersion(
      LIT_TESTNET.LOCALCHAIN,
      LIT_ENDPOINT_VERSION.V1
    );

    // set global pkpSign endpoint version for all tests.
    devEnv.setGlobalPkpSignVersion(
      LIT_TESTNET.LOCALCHAIN,
      LIT_ENDPOINT_VERSION.V1
    );
  }

  const testConfig = {
    tests: {
      testExample,
      testBundleSpeed,
    },
    devEnv,
  };

  if (devEnv.processEnvs.RUN_IN_BAND) {
    await runInBand(testConfig);
  } else {
    await runTestsParallel(testConfig);
  }
})();
