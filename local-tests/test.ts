import { TinnyEnvironment } from './setup/tinny-environment';
import { runInBand, runTestsParallel } from './setup/tinny-operations';

// import { testBundleSpeed } from './tests/test-bundle-speed';
// import { testExample } from './tests/test-example';

import { testUseEoaSessionSigsToExecuteJsSigningInParallel } from './tests/testUseEoaSessionSigsToExecuteJsSigningInParallel';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning';
import { testUseValidLitActionCodeGeneratedSessionSigsToPkpSign } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToPkpSign';
import { testUseValidLitActionIpfsCodeGeneratedSessionSigsToExecuteJsSigning } from './tests/testUseValidLitActionIpfsCodeGeneratedSessionSigsToExecuteJsSigning';

import { testUseEoaSessionSigsToEncryptDecryptFile } from './tests/testUseEoaSessionSigsToEncryptDecryptFile';
import { testUseEoaSessionSigsToEncryptDecryptString } from './tests/testUseEoaSessionSigsToEncryptDecryptString';
import { testUseEoaSessionSigsToEncryptDecryptUint8Array } from './tests/testUseEoaSessionSigsToEncryptDecryptUint8Array';
import { testUseEoaSessionSigsToExecuteJsClaimKeys } from './tests/testUseEoaSessionSigsToExecuteJsClaimKeys';
import { testUseEoaSessionSigsToExecuteJsClaimMultipleKeys } from './tests/testUseEoaSessionSigsToExecuteJsClaimMultipleKeys';
import { testUseEoaSessionSigsToExecuteJsConsoleLog } from './tests/testUseEoaSessionSigsToExecuteJsConsoleLog';
import { testUseEoaSessionSigsToExecuteJsJsonResponse } from './tests/testUseEoaSessionSigsToExecuteJsJsonResponse';
import { testUseEoaSessionSigsToExecuteJsSigning } from './tests/testUseEoaSessionSigsToExecuteJsSigning';
import { testUseEoaSessionSigsToPkpSign } from './tests/testUseEoaSessionSigsToPkpSign';
import { testUseEoaSessionSigsToRequestSingleResponse } from './tests/testUseEoaSessionSigsToRequestSingleResponse';

import { testUseInvalidLitActionCodeToGenerateSessionSigs } from './tests/testUseInvalidLitActionCodeToGenerateSessionSigs';
import { testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigningInParallel } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigningInParallel';

import { testUsePkpSessionSigsToEncryptDecryptFile } from './tests/testUsePkpSessionSigsToEncryptDecryptFile';
import { testUsePkpSessionSigsToEncryptDecryptString } from './tests/testUsePkpSessionSigsToEncryptDecryptString';
import { testUsePkpSessionSigsToExecuteJsClaimKeys } from './tests/testUsePkpSessionSigsToExecuteJsClaimKeys';
import { testUsePkpSessionSigsToExecuteJsClaimMultipleKeys } from './tests/testUsePkpSessionSigsToExecuteJsClaimMultipleKeys';
import { testUsePkpSessionSigsToExecuteJsConsoleLog } from './tests/testUsePkpSessionSigsToExecuteJsConsoleLog';
import { testUsePkpSessionSigsToExecuteJsJsonResponse } from './tests/testUsePkpSessionSigsToExecuteJsJsonResponse';
import { testUsePkpSessionSigsToExecuteJsSigning } from './tests/testUsePkpSessionSigsToExecuteJsSigning';
import { testUsePkpSessionSigsToExecuteJsSigningInParallel } from './tests/testUsePkpSessionSigsToExecuteJsSigningInParallel';
import { testUsePkpSessionSigsToPkpSign } from './tests/testUsePkpSessionSigsToPkpSign';

import { testUseInvalidLitActionIpfsCodeToGenerateSessionSigs } from './tests/testUseInvalidLitActionIpfsCodeToGenerateSessionSigs';
import { testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptFile } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptFile';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimKeys } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimKeys';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimMultipleKeys } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsClaimMultipleKeys';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog';
import { testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse } from './tests/testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse';
import { testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign } from './tests/testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign';
import { testPkpEthersWithEoaSessionSigsToEthSign } from './tests/testPkpEthersWithEoaSessionSigsToEthSign';
import { testPkpEthersWithEoaSessionSigsToEthSignTransaction } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTransaction';
import { testPkpEthersWithEoaSessionSigsToPersonalSign } from './tests/testPkpEthersWithEoaSessionSigsToPersonalSign';
import { testPkpEthersWithEoaSessionSigsToSendTx } from './tests/testPkpEthersWithEoaSessionSigsToSendTx';
import { testPkpEthersWithEoaSessionSigsToSignMessage } from './tests/testPkpEthersWithEoaSessionSigsToSignMessage';
import { testPkpEthersWithEoaSessionSigsToSignWithAuthContext } from './tests/testPkpEthersWithEoaSessionSigsToSignWithAuthContext';
import { testPkpEthersWithPkpSessionSigsToEthSign } from './tests/testPkpEthersWithPkpSessionSigsToEthSign';
import { testPkpEthersWithPkpSessionSigsToPersonalSign } from './tests/testPkpEthersWithPkpSessionSigsToPersonalSign';
import { testPkpEthersWithPkpSessionSigsToSendTx } from './tests/testPkpEthersWithPkpSessionSigsToSendTx';
import { testPkpEthersWithPkpSessionSigsToSignMessage } from './tests/testPkpEthersWithPkpSessionSigsToSignMessage';

import { testPkpEthersWithEoaSessionSigsToEthSignTypedData } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedData';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataUtil } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataUtil';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1 } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataV1';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataV3 } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataV3';
import { testPkpEthersWithEoaSessionSigsToEthSignTypedDataV4 } from './tests/testPkpEthersWithEoaSessionSigsToEthSignTypedDataV4';
import { testPkpEthersWithLitActionSessionSigsToEthSign } from './tests/testPkpEthersWithLitActionSessionSigsToEthSign';
import { testPkpEthersWithLitActionSessionSigsToEthSignTransaction } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTransaction';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedData } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedData';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataUtil } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataUtil';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV1 } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV1';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV3 } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV3';
import { testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV4 } from './tests/testPkpEthersWithLitActionSessionSigsToEthSignTypedDataV4';
import { testPkpEthersWithLitActionSessionSigsToPersonalSign } from './tests/testPkpEthersWithLitActionSessionSigsToPersonalSign';
import { testPkpEthersWithLitActionSessionSigsToSendTx } from './tests/testPkpEthersWithLitActionSessionSigsToSendTx';
import { testPkpEthersWithLitActionSessionSigsToSignMessage } from './tests/testPkpEthersWithLitActionSessionSigsToSignMessage';
import { testPkpEthersWithPkpSessionSigsToEthSignTransaction } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTransaction';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedData } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedData';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataUtil } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataUtil';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataV1 } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataV1';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataV3 } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataV3';
import { testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4 } from './tests/testPkpEthersWithPkpSessionSigsToEthSignTypedDataV4';

import { testUseCustomAuthSessionSigsToPkpSignExecuteJs } from './tests/testUseCustomAuthSessionSigsToPkpSignExecuteJs';

import { testExecuteJsBroadcastAndCollect } from './tests/testExecuteJsBroadcastAndCollect';
import { testExecuteJsDecryptAndCombine } from './tests/testExecuteJsDecryptAndCombine';
import { testExecuteJsSignAndCombineEcdsa } from './tests/testExecuteJsSignAndCombineEcdsa';
import { testRelayer } from './tests/testRelayer';

// import { testEthereumSignMessageGeneratedKey } from './tests/wrapped-keys/testEthereumSignMessageGeneratedKey';
// import { testEthereumBroadcastTransactionGeneratedKey } from './tests/wrapped-keys/testEthereumBroadcastTransactionGeneratedKey';
// import { testEthereumSignMessageWrappedKey } from './tests/wrapped-keys/testEthereumSignMessageWrappedKey';
// import { testFailEthereumSignTransactionWrappedKeyInvalidDecryption } from './tests/wrapped-keys/testFailEthereumSignTransactionWrappedKeyInvalidDecryption';
// import { testEthereumSignTransactionWrappedKey } from './tests/wrapped-keys/testEthereumSignTransactionWrappedKey';
// import { testFailEthereumSignTransactionWrappedKeyWithInvalidParam } from './tests/wrapped-keys/testFailEthereumSignTransactionWrappedKeyWithInvalidParam';
// import { testFailEthereumSignTransactionWrappedKeyWithMissingParam } from './tests/wrapped-keys/testFailEthereumSignTransactionWrappedKeyWithMissingParam';
// import { testEthereumBroadcastTransactionWrappedKey } from './tests/wrapped-keys/testEthereumBroadcastTransactionWrappedKey';
// import { testEthereumBroadcastWrappedKeyWithFetchGasParams } from './tests/wrapped-keys/testEthereumBroadcastWrappedKeyWithFetchGasParams';
// import { testImportWrappedKey } from './tests/wrapped-keys/testImportWrappedKey';
// import { testGenerateEthereumWrappedKey } from './tests/wrapped-keys/testGenerateEthereumWrappedKey';
// import { testGenerateSolanaWrappedKey } from './tests/wrapped-keys/testGenerateSolanaWrappedKey';
// import { testFailImportWrappedKeysWithSamePrivateKey } from './tests/wrapped-keys/testFailImportWrappedKeysWithSamePrivateKey';
// import { testFailImportWrappedKeysWithEoaSessionSig } from './tests/wrapped-keys/testFailImportWrappedKeysWithEoaSessionSig';
// import { testFailImportWrappedKeysWithMaxExpirySessionSig } from './tests/wrapped-keys/testFailImportWrappedKeysWithMaxExpirySessionSig';
// import { testFailImportWrappedKeysWithInvalidSessionSig } from './tests/wrapped-keys/testFailImportWrappedKeysWithInvalidSessionSig';
// import { testFailImportWrappedKeysWithExpiredSessionSig } from './tests/wrapped-keys/testFailImportWrappedKeysWithExpiredSessionSig';
// import { testExportWrappedKey } from './tests/wrapped-keys/testExportWrappedKey';
// import { testSignMessageWithSolanaEncryptedKey } from './tests/wrapped-keys/testSignMessageWithSolanaEncryptedKey';
// import { testSignTransactionWithSolanaEncryptedKey } from './tests/wrapped-keys/testSignTransactionWithSolanaEncryptedKey';
// import { testBatchGeneratePrivateKeys } from './tests/wrapped-keys/testBatchGeneratePrivateKeys';
// import { testFailBatchGeneratePrivateKeysAtomic } from './tests/wrapped-keys/testFailStoreEncryptedKeyBatchIsAtomic';

import { setLitActionsCodeToLocal } from './tests/wrapped-keys/util';

// Use the current LIT action code to test against
setLitActionsCodeToLocal();

(async () => {
  console.log('[𐬺🧪 Tinny𐬺] Running tests...');
  const devEnv = new TinnyEnvironment();

  await devEnv.init();

  const relayerTests = {
    testRelayer,
  };

  // --filter=WrappedKey
  const wrappedKeysTests = {
    // // -- valid cases
    // testBatchGeneratePrivateKeys,
    // testEthereumSignMessageGeneratedKey,
    // testEthereumBroadcastTransactionGeneratedKey,
    // testEthereumSignMessageWrappedKey,
    // testEthereumSignTransactionWrappedKey,
    // testEthereumBroadcastTransactionWrappedKey,
    // testEthereumBroadcastWrappedKeyWithFetchGasParams,
    //
    // // -- generate wrapped keys
    // testGenerateEthereumWrappedKey,
    // testGenerateSolanaWrappedKey,
    //
    // // -- import wrapped keys
    // testImportWrappedKey,
    //
    // // -- export wrapped keys
    // testExportWrappedKey,
    //
    // // -- solana wrapped keys
    // testSignMessageWithSolanaEncryptedKey,
    // testSignTransactionWithSolanaEncryptedKey,
    //
    // // -- invalid cases
    // testFailEthereumSignTransactionWrappedKeyWithMissingParam,
    // testFailEthereumSignTransactionWrappedKeyWithInvalidParam,
    // testFailEthereumSignTransactionWrappedKeyInvalidDecryption,
    // testFailBatchGeneratePrivateKeysAtomic,
    //
    // // -- import wrapped keys
    // testFailImportWrappedKeysWithSamePrivateKey,
    // testFailImportWrappedKeysWithEoaSessionSig,
    // testFailImportWrappedKeysWithMaxExpirySessionSig,
    // testFailImportWrappedKeysWithInvalidSessionSig,
    // testFailImportWrappedKeysWithExpiredSessionSig,
  };

  const eoaSessionSigsTests = {
    testUseEoaSessionSigsToExecuteJsSigning,
    testUseEoaSessionSigsToRequestSingleResponse,
    testUseEoaSessionSigsToPkpSign,
    testUseEoaSessionSigsToExecuteJsSigningInParallel,
    testUseEoaSessionSigsToExecuteJsClaimKeys,
    testUseEoaSessionSigsToExecuteJsClaimMultipleKeys,
    testUseEoaSessionSigsToExecuteJsJsonResponse,
    testUseEoaSessionSigsToExecuteJsConsoleLog,
    testUseEoaSessionSigsToEncryptDecryptString,
    testUseEoaSessionSigsToEncryptDecryptUint8Array,
    testUseEoaSessionSigsToEncryptDecryptFile,
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

  const eip1271AuthSigTests = {
    // testKeccakEip1271AuthSigToEncryptDecryptString,
    // testShaEip1271AuthSigToEncryptDecryptString,
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
      testExecuteJsDecryptAndCombine,
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
      ...eip1271AuthSigTests,

      ...pkpEthersTest.eoaSessionSigs,
      ...pkpEthersTest.pkpSessionSigs,
      ...pkpEthersTest.litActionSessionSigs,

      ...litActionCombiningTests.broadcastAndCombine,
      ...litActionCombiningTests.decryptAndCombine,
      ...litActionCombiningTests.ecdsaSignAndCombine,

      ...relayerTests,
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
