import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';
// import { testBundleSpeed } from './tests/test-bundle-speed';
// import { testExample } from './tests/test-example';
import { testUseEoaSessionSigsToExecuteJsSigning } from './tests/testUseEoaSessionSigsToExecuteJsSigning';
import { testUseEoaSessionSigsToPkpSign } from './tests/testUseEoaSessionSigsToPkpSign';
import { testUsePkpSessionSigsToExecuteJsSigning } from './tests/testUsePkpSessionSigsToExecuteJsSigning';
import { testUsePkpSessionSigsToPkpSign } from './tests/testUsePkpSessionSigsToPkpSign';
import { testUseValidLitActionCodeGeneratedSessionSigsToPkpSign } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToPkpSign';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning';
import { testUseValidLitActionIpfsCodeGeneratedSessionSigsToExecuteJsSigning } from './tests/testUseValidLitActionIpfsCodeGeneratedSessionSigsToExecuteJsSigning';
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
import { testUsePkpSessionSigsToEncryptDecryptString } from './tests/testUsePkpSessionSigsToEncryptDecryptString';
import { testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString';
import { testUseInvalidLitActionCodeToGenerateSessionSigs } from './tests/testUseInvalidLitActionCodeToGenerateSessionSigs';
import { testUseEoaSessionSigsToEncryptDecryptFile } from './tests/testUseEoaSessionSigsToEncryptDecryptFile';
import { testUseEoaSessionSigsToEncryptDecryptZip } from './tests/testUseEoaSessionSigsToEncryptDecryptZip';
import { testUsePkpSessionSigsToExecuteJsSigningInParallel } from './tests/testUsePkpSessionSigsToExecuteJsSigningInParallel';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigningInParallel } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigningInParallel';
import { testUsePkpSessionSigsToExecuteJsClaimKeys } from './tests/testUsePkpSessionSigsToExecuteJsClaimKeys';
import { testUsePkpSessionSigsToExecuteJsClaimMultipleKeys } from './tests/testUsePkpSessionSigsToExecuteJsClaimMultipleKeys';
import { testUsePkpSessionSigsToExecuteJsJsonResponse } from './tests/testUsePkpSessionSigsToExecuteJsJsonResponse';
import { testUsePkpSessionSigsToExecuteJsConsoleLog } from './tests/testUsePkpSessionSigsToExecuteJsConsoleLog';
import { testUsePkpSessionSigsToEncryptDecryptFile } from './tests/testUsePkpSessionSigsToEncryptDecryptFile';
import { testUsePkpSessionSigsToEncryptDecryptZip } from './tests/testUsePkpSessionSigsToEncryptDecryptZip';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimKeys } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimKeys';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimMultipleKeys } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimMultipleKeys';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog';
import { testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptFile } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptFile';
import { testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptZip } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptZip';
import { testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign } from './tests/testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign';
import { testUseInvalidLitActionIpfsCodeToGenerateSessionSigs } from './tests/testUseInvalidLitActionIpfsCodeToGenerateSessionSigs';
import { testSolAuthSigToEncryptDecryptString } from './tests/testSolAuthSigToEncryptDecryptString';
import { testEthAuthSigToEncryptDecryptString } from './tests/testEthAuthSigToEncryptDecryptString';
import { testCosmosAuthSigToEncryptDecryptString } from './tests/testCosmosAuthSigToEncryptDecryptString';
import { testPkpEthersWithEoaSessionSigsToSignMessage } from './tests/testPkpEthersWithEoaSessionSigsToSignMessage';
import { testPkpEthersWithEoaSessionSigsToSignWithAuthContext } from './tests/testPkpEthersWithEoaSessionSigsToSignWithAuthContext';
import { testPkpEthersWithEoaSessionSigsToEthSign } from './tests/testPkpEthersWithEoaSessionSigsToEthSign';
import { testPkpEthersWithEoaSessionSigsToPersonalSign } from './tests/testPkpEthersWithEoaSessionSigsToPersonalSign';
import { testPkpEthersWithEoaSessionSigsToSendTx } from './tests/testPkpEthersWithEoaSessionSigsToSendTx';
import { testPkpEthersWithPkpSessionSigsToSignMessage } from './tests/testPkpEthersWithPkpSessionSigsToSignMessage';
import { testPkpEthersWithPkpSessionSigsToEthSign } from './tests/testPkpEthersWithPkpSessionSigsToEthSign';
import { testPkpEthersWithPkpSessionSigsToPersonalSign } from './tests/testPkpEthersWithPkpSessionSigsToPersonalSign';
import { testPkpEthersWithPkpSessionSigsToSendTx } from './tests/testPkpEthersWithPkpSessionSigsToSendTx';
import { testPkpEthersWithEoaSessionSigsToEthSignTransaction } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTransaction';

import { testPkpEthersWithPkpSessionSigsToEthSignTransaction } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTransaction';
import { testPkpEthersWithLitActionSessionSigsToEthSignTransaction } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTransaction';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1 } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataV1 } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataV1';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV1 } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV1';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataV3 } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataV3';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataV4 } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataV4';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedData } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedData';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataUtil } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataUtil';
import { testPkpEthersWithLitActionSessionSigsToSignMessage } from './tests/testPkpEthersWithLitActionSessionSigsToSignMessage';
import { testPkpEthersWithLitActionSessionSigsToEthSign } from './tests/testPkpEthersWithLitActionSessionSigsToEthSign';
import { testPkpEthersWithLitActionSessionSigsToPersonalSign } from './tests/testPkpEthersWithLitActionSessionSigsToPersonalSign';
import { testPkpEthersWithLitActionSessionSigsToSendTx } from './tests/testPkpEthersWithLitActionSessionSigsToSendTx';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataV3 } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataV3';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV3 } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV3';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4 } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV4 } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV4';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedData } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedData';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedData } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedData';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataUtil } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataUtil';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataUtil } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataUtil';
import { testUseCustomAuthSessionSigsToPkpSignExecuteJs } from './tests/testUseCustomAuthSessionSigsToPkpSignExecuteJs';
import { testExecuteJsSignAndCombineEcdsa } from './tests/testExecuteJsSignAndCombineEcdsa';
import { testExecutJsDecryptAndCombine } from './tests/testExecuteJsDecryptAndCombine';
import { testExecuteJsBroadcastAndCollect } from './tests/testExecuteJsBroadcastAndCollect';

import { testWrappedKeySigningTimeout } from './tests/testWrappedKeySigningTimeout';
import { testEthereumSignWrappedKey } from './tests/testEthereumSignWrappedKey';
import { testFailEthereumSignWrappedKeyWithInvalidParam } from './tests/testFailEthereumSignWrappedKeyWithInvalidParam';
import { testFailEthereumSignWrappedKeyWithMissingParam } from './tests/testFailEthereumSignWrappedKeyWithMissingParam';
import { testEthereumBroadcastWrappedKey } from './tests/testEthereumBroadcastWrappedKey';
import { testFailEthereumBroadcastWrappedKeysInsufficientFunds } from './tests/testFailEthereumBroadcastWrappedKeysInsufficientFunds';
import { testImportWrappedKey } from './tests/testImportWrappedKey';
import { testFailImportWrappedKeysWithSamePkp } from './tests/testFailImportWrappedKeysWithSamePkp';
import { testFailImportWrappedKeysWithSamePrivateKey } from './tests/testFailImportWrappedKeysWithSamePrivateKey';
import { testFailImportWrappedKeysWithEoaSessionSig } from './tests/testFailImportWrappedKeysWithEoaSessionSig';
import { testFailImportWrappedKeysWithMaxExpirySessionSig } from './tests/testFailImportWrappedKeysWithMaxExpirySessionSig';
import { testFailImportWrappedKeysWithInvalidSessionSig } from './tests/testFailImportWrappedKeysWithInvalidSessionSig';
import { testFailImportWrappedKeysWithExpiredSessionSig } from './tests/testFailImportWrappedKeysWithExpiredSessionSig';
import { testExportWrappedKey } from './tests/testExportWrappedKey';

(async () => {
  console.log('[𐬺🧪 Tinny𐬺] Running tests...');
  const devEnv = new TinnyEnvironment();

  await devEnv.init();

  const wrappedKeysTests = {
    testEthereumSignWrappedKey,
    testFailEthereumSignWrappedKeyWithInvalidParam,
    testFailEthereumSignWrappedKeyWithMissingParam,
    testEthereumBroadcastWrappedKey,
    testFailEthereumBroadcastWrappedKeysInsufficientFunds,
    testImportWrappedKey,
    testFailImportWrappedKeysWithSamePkp,
    testFailImportWrappedKeysWithSamePrivateKey,
    testFailImportWrappedKeysWithEoaSessionSig,
    testFailImportWrappedKeysWithMaxExpirySessionSig,
    testFailImportWrappedKeysWithInvalidSessionSig,
    testFailImportWrappedKeysWithExpiredSessionSig,
    testExportWrappedKey,
    testWrappedKeySigningTimeout,
  };

  const eoaSessionSigsTests = {
    testUseEoaSessionSigsToExecuteJsSigning,
    testUseEoaSessionSigsToPkpSign,
    testUseEoaSessionSigsToExecuteJsSigningInParallel,
    testUseEoaSessionSigsToExecuteJsClaimKeys,
    testUseEoaSessionSigsToExecuteJsClaimMultipleKeys,
    testUseEoaSessionSigsToExecuteJsJsonResponse,
    testUseEoaSessionSigsToExecuteJsConsoleLog,
    testUseEoaSessionSigsToEncryptDecryptString,
    testUseEoaSessionSigsToEncryptDecryptFile,
    testUseEoaSessionSigsToEncryptDecryptZip,
  };

  const pkpSessionSigsTests = {
    testUsePkpSessionSigsToExecuteJsSigning,
    testUsePkpSessionSigsToPkpSign,
    testUsePkpSessionSigsToExecuteJsSigningInParallel,
    testUsePkpSessionSigsToExecuteJsClaimKeys,
    testUsePkpSessionSigsToExecuteJsClaimMultipleKeys,
    testUsePkpSessionSigsToExecuteJsJsonResponse,
    testUsePkpSessionSigsToExecuteJsConsoleLog,
    testUsePkpSessionSigsToEncryptDecryptString,
    testUsePkpSessionSigsToEncryptDecryptFile,
    testUsePkpSessionSigsToEncryptDecryptZip,
  };

  const litActionSessionSigsTests = {
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning,
    testUseValidLitActionCodeGeneratedSessionSigsToPkpSign,
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigningInParallel,
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimKeys,
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimMultipleKeys,
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse,
    testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog,
    testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString,
    testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptFile,
    testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptZip,

    // -- invalid cases
    testUseInvalidLitActionIpfsCodeToGenerateSessionSigs,

    // -- custom auth methods
    testUseCustomAuthSessionSigsToPkpSignExecuteJs,
  };

  const litActionIpfsIdSessionSigsTests = {
    testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign,
    testUseValidLitActionIpfsCodeGeneratedSessionSigsToExecuteJsSigning,

    // -- invalid cases
    testUseInvalidLitActionCodeToGenerateSessionSigs,
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

  const bareAuthSigTests = {
    // -- eth auth sig
    testEthAuthSigToEncryptDecryptString,

    // -- solana auth sig
    testSolAuthSigToEncryptDecryptString,

    // -- cosmos auth sig
    testCosmosAuthSigToEncryptDecryptString,
  };

  const pkpEthersTest = {
    eoaSessionSigs: {
      testPkpEthersWithEoaSessionSigsToSignWithAuthContext,
      testPkpEthersWithEoaSessionSigsToSignMessage,
      testPkpEthersWithEoaSessionSigsToEthSign,
      testPkpEthersWithEoaSessionSigsToPersonalSign,
      testPkpEthersWithEoaSessionSigsToSendTx,
      testPkpEthersWithEoaSessionSigsToEthSignTransaction,
      testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1,
      testPkpEthersWithEoaSessionSigsToEthSignTypedDataV3,
      testPkpEthersWithEoaSessionSigsToEthSignTypedDataV4,
      testPkpEthersWithEoaSessionSigsToEthSignTypedData,
      testPkpEthersWithEoaSessionSigsToEthSignTypedDataUtil,
    },
    pkpSessionSigs: {
      testPkpEthersWithPkpSessionSigsToSignMessage,
      testPkpEthersWithPkpSessionSigsToEthSign,
      testPkpEthersWithPkpSessionSigsToPersonalSign,
      testPkpEthersWithPkpSessionSigsToSendTx,
      testPkpEthersWithPkpSessionSigsToEthSignTransaction,
      testPkpEthersWithPkpSessionSigsToEthSignTypedDataV1,
      testPkpEthersWithPkpSessionSigsToEthSignTypedDataV3,
      testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4,
      testPkpEthersWithPkpSessionSigsToEthSignTypedData,
      testPkpEthersWithPkpSessionSigsToEthSignTypedDataUtil,
    },
    litActionSessionSigs: {
      testPkpEthersWithLitActionSessionSigsToSignMessage,
      testPkpEthersWithLitActionSessionSigsToEthSign,
      testPkpEthersWithLitActionSessionSigsToPersonalSign,
      testPkpEthersWithLitActionSessionSigsToSendTx,
      testPkpEthersWithLitActionSessionSigsToEthSignTransaction,
      testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV1,
      testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV3,
      testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV4,
      testPkpEthersWithLitActionSessionSigsToEthSignTypedData,
      testPkpEthersWithLitActionSessionSigsToEthSignTypedDataUtil,
    },
  };

  const litActionCombiningTests = {
    ecdsaSignAndCombine: {
      testExecuteJsSignAndCombineEcdsa,
    },
    decryptAndCombine: {
      testExecutJsDecryptAndCombine,
    },
    broadcastAndCombine: {
      testExecuteJsBroadcastAndCollect,
    },
  };

  const testConfig = {
    tests: {
      // testExample,
      // testBundleSpeed,
      ...eoaSessionSigsTests,
      ...pkpSessionSigsTests,
      ...litActionSessionSigsTests,
      ...litActionIpfsIdSessionSigsTests,
      ...capacityDelegationTests,
      ...bareAuthSigTests,

      ...pkpEthersTest.eoaSessionSigs,
      ...pkpEthersTest.pkpSessionSigs,
      ...pkpEthersTest.litActionSessionSigs,

      ...litActionCombiningTests.broadcastAndCombine,
      ...litActionCombiningTests.decryptAndCombine,
      ...litActionCombiningTests.ecdsaSignAndCombine,

      ...wrappedKeysTests,
    },
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
