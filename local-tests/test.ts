import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';
import { tinnyTests } from './tests';
import { setLitActionsCodeToLocal } from './tests/wrapped-keys/util';

// Use the current LIT action code to test against
setLitActionsCodeToLocal();

(async () => {
  console.log('[𐬺🧪 Tinny𐬺] Running tests...');
  const devEnv = new TinnyEnvironment();

  await devEnv.init();

  const testConfig = {
    tests: tinnyTests,
    devEnv,
  };

  let res;

  if (devEnv.processEnvs.RUN_IN_BAND) {
    res = await runInBand(testConfig);
  } else {
    res = await runTestsParallel(testConfig);
  }
  await devEnv.stopTestnet();
  process.exit(res);

})();
