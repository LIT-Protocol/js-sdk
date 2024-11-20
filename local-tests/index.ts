import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';
import * as tinnyTests from './tests';

export {
  TinnyEnvironment,
  runInBand,
  runTestsParallel,
  tinnyTests
}

// Usage
// const devEnv = new TinnyEnvironment();

// await devEnv.init();

// const testConfig = {
//   tests: {
//     testEthAuthSigToEncryptDecryptString,
//   },
//   devEnv,
// }

// const res = await runTestsParallel(testConfig);
// console.log("res:", res);