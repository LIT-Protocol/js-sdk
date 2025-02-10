import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';
import * as tinnyTests from './tests';
import { getEoaAuthContext } from './setup/session-sigs/get-eoa-session-sigs';
import { getLitActionAuthContext } from './setup/session-sigs/get-lit-action-session-sigs';
import { getPkpAuthContext } from './setup/session-sigs/get-pkp-session-sigs';
import { AccessControlConditions } from './setup/accs/accs';

export {
  TinnyEnvironment,
  runInBand,
  runTestsParallel,
  tinnyTests,
  getEoaAuthContext,
  getLitActionAuthContext,
  getPkpAuthContext,
  AccessControlConditions,
};

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
