// This test requires using "bun" to run.
// Installation: https://bun.sh/docs/installation
// Test command: yarn test:local --filter={testName} --network={network | 'localhost' is default}

import { getDevEnv } from './setup/env-setup';
import { getNetworkFlag, runTests } from './setup/mini-test-framework';
import { testUseEoaSessionSigsToExecuteJsSigning } from './tests/testUseEoaSessionSigsToExecuteJsSigning';
import { testUseEoaSessionSigsToPkpSign } from './tests/testUseEoaSessionSigsToPkpSign';
import { testUsePkpSessionSigsToExecuteJsSigning } from './tests/testUsePkpSessionSigsToExecuteJsSigning';
import { testUsePkpSessionSigsToPkpSign } from './tests/testUsePkpSessionSigsToPkpSign';
import { testUseValidLitActionCodeGeneratedSessionSigsToPkpSign } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToPkpSign';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning';
import { testUseEoaSessionSigsToExecuteJsSigningInParallel } from './tests/testUseEoaSessionSigsToExecuteJsSigningInParallel';
import { testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs } from './tests/testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs';
import { testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign } from './tests/testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign';
import { testUseCapacityDelegationAuthSigWithUnrestrictedAccessToExecuteJs } from './tests/testUseCapacityDelegationAuthSigWithUnrestrictedAccessToExecuteJs';
import { testUseCapacityDelegationAuthSigWithUnrestrictedAccessToPkpSign } from './tests/testUseCapacityDelegationAuthSigWithUnrestrictedAccessToPkpSign';

(async () => {
  const devEnv = await getDevEnv({
    env: getNetworkFlag(),
    debug: process.env.DEBUG === 'true',
  });

  const eoaSessionSigsTests = {
    testUseEoaSessionSigsToExecuteJsSigning,
    testUseEoaSessionSigsToExecuteJsSigningInParallel,
    testUseEoaSessionSigsToPkpSign,
  };

  const pkpSessionSigsTests = {
    testUsePkpSessionSigsToExecuteJsSigning,
    testUsePkpSessionSigsToPkpSign,
  };

  const litActionSessionSigsTests = {
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning,
    testUseValidLitActionCodeGeneratedSessionSigsToPkpSign,
  };

  const capacityDelegationTests = {
    testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs,
    testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign,
    testUseCapacityDelegationAuthSigWithUnrestrictedAccessToExecuteJs,
    testUseCapacityDelegationAuthSigWithUnrestrictedAccessToPkpSign,
  };

  await runTests({
    tests: {
      ...eoaSessionSigsTests,
      ...pkpSessionSigsTests,
      ...litActionSessionSigsTests,
      ...capacityDelegationTests,
    },
    devEnv,
  });
})();
