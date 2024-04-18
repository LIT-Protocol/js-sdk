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
import { testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToPkpSign } from './tests/testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToPkpSign';
import { testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs } from './tests/testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs';
import { testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToPkpSign } from './tests/testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToPkpSign';
import { testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToExecuteJs } from './tests/testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToExecuteJs';
import { testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs } from './tests/testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs';
import { testUseEoaSessionSigsToExecuteJsClaimKeys } from './tests/testUseEoaSessionSigsToExecuteJsClaimKeys';
import { testUseEoaSessionSigsToExecuteJsClaimMultipleKeys } from './tests/testUseEoaSessionSigsToExecuteJsClaimMultipleKeys';
import { testUseEoaSessionSigsToExecuteJsJsonResponse } from './tests/testUseEoaSessionSigsToExecuteJsJsonResponse';
import { testUseEoaSessionSigsToExecuteJsConsoleLog } from './tests/testUseEoaSessionSigsToExecuteJsConsoleLog';
import { testUseEoaSessionSigsToEncryptDecryptString } from './tests/testUseEoaSessionSigsToEncryptDecryptString';

(async () => {
  const devEnv = await getDevEnv({
    env: getNetworkFlag(),
    debug: process.env.DEBUG === 'true' || true,
  });

  const eoaSessionSigsTests = {
    testUseEoaSessionSigsToExecuteJsSigning,
    testUseEoaSessionSigsToPkpSign,
    testUseEoaSessionSigsToExecuteJsSigningInParallel,
    testUseEoaSessionSigsToExecuteJsClaimKeys,
    testUseEoaSessionSigsToExecuteJsClaimMultipleKeys,
    testUseEoaSessionSigsToExecuteJsJsonResponse,
    testUseEoaSessionSigsToExecuteJsConsoleLog,
    testUseEoaSessionSigsToEncryptDecryptString,
    // testUseEoaSessionSigsToEncryptDecryptFile
    // testUseEoaSessionSigsToEncryptDecryptZip
  };

  const pkpSessionSigsTests = {
    testUsePkpSessionSigsToExecuteJsSigning,
    testUsePkpSessionSigsToPkpSign,
    // testUsePkpSessionSigsToExecuteJsSigningInParallel,
    // testUsePkpSessionSigsToExecuteJsClaimKeys,
    // testUsePkpSessionSigsToExecuteJsClaimMultipleKeys,
    // testUsePkpSessionSigsToExecuteJsJsonResponse,
    // testUsePkpSessionSigsToExecuteJsConsoleLog,
    // testUsePkpSessionSigsToEncryptDecryptString
    // testUsePkpSessionSigsToEncryptDecryptFile
    // testUsePkpSessionSigsToEncryptDecryptZip
  };

  const litActionSessionSigsTests = {
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning,
    testUseValidLitActionCodeGeneratedSessionSigsToPkpSign,
    // testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigningInParallel,
    // testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimKeys,
    // testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimMultipleKeys,
    // testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse,
    // testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog,
    // testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString
    // testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptFile
    // testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptZip
  };

  const capacityDelegationTests = {
    testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs,
    testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign,
    testDelegatingCapacityCreditsNFTToAnotherPkpToExecuteJs,
    testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToExecuteJs,
    testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToPkpSign,
    testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs,
    testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToPkpSign,
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
