import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';
import * as tinnyTests from './tests';
import { getEoaSessionSigs } from './setup/session-sigs/get-eoa-session-sigs';
import { getLitActionSessionSigs } from './setup/session-sigs/get-lit-action-session-sigs';
import { getPkpSessionSigs } from './setup/session-sigs/get-pkp-session-sigs';
import { AccessControlConditions } from './setup/accs/accs';

export {
  TinnyEnvironment,
  runInBand,
  runTestsParallel,
  tinnyTests,
  getEoaSessionSigs,
  getLitActionSessionSigs,
  getPkpSessionSigs,
  AccessControlConditions
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
