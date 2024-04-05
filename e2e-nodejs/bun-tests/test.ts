// Test command: bun run ./e2e-nodejs/bun-tests/test-session-sigs.ts
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  AuthSigCallbackType,
  getAuthSigCallback,
} from '@lit-protocol/auth-helpers';
import { ENV, devEnv } from './setup/env-setup';
import * as ethers from 'ethers';
import { SiweMessage } from 'siwe';
import { SessionSigs } from '@lit-protocol/types';

const {
  litNodeClient,
  litContractsClient,
  hotWallet,
  hotWalletAuthSig,
  hotWalletAuthMethod,
  hotWalletOwnedPkp,
  hotWalletAuthMethodOwnedPkp,
  lastestBlockhash,
  capacityTokenId,
  capacityDelegationAuthSig,
} = await devEnv({
  env: ENV.HABANERO,
  debug: true,
});

const tests = {
  testExecuteJsToConsoleLogWithHotWalletAuthSig: async () => {
    const res = await litNodeClient.executeJs({
      authSig: hotWalletAuthSig,
      code: `(async() => {
        console.log("Testing!");
      })()`,
      jsParams: {},
    });

    console.log('res:', res);
  },
  testExecuteJsToSignWithHotWalletAuthSig: async () => {
    const TO_SIGN = ethers.utils.arrayify(
      ethers.utils.keccak256([1, 2, 3, 4, 5])
    );

    const runWithAuthSig = await litNodeClient.executeJs({
      authSig: hotWalletAuthSig,
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: TO_SIGN,
        publicKey: hotWalletOwnedPkp.publicKey,
      },
    });

    console.log('runWithAuthSig:', runWithAuthSig);
  },
  testGetHotWalletSessionSigs: async () => {
    const resourceAbilityRequests = [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ];

    const hotWalletAuthNeededCallback = await getAuthSigCallback({
      type: AuthSigCallbackType.HOT_WALLET,
      litNodeClient,
      signer: hotWallet,
    });

    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
      resourceAbilityRequests,
      authNeededCallback: hotWalletAuthNeededCallback as any,
    });

    console.log('sessionSigs:', sessionSigs);

    return sessionSigs;
  },
  testUseHotWalletSessionSigsToExecuteJs: async () => {
    const sessionSigs = await tests.testGetHotWalletSessionSigs();

    const runWithSessionSigs = await litNodeClient.executeJs({
      sessionSigs,
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: ethers.utils.arrayify(
          ethers.utils.keccak256([1, 2, 3, 4, 5])
        ),
        publicKey: hotWalletOwnedPkp.publicKey,
      },
    });

    console.log('runWithSessionSigs:', runWithSessionSigs);
  },
};

// Function to parse command line arguments for filters
const getFilters = (): string[] => {
  const filterArg = process.argv.find((arg) => arg.startsWith('--filter='));
  return filterArg ? filterArg.replace('--filter=', '').split(',') : [];
};

// Function to run tests based on filters
const runTests = async () => {
  const filters = getFilters();
  const testsToRun = Object.entries(tests).filter(
    ([testName]) => filters.length === 0 || filters.includes(testName)
  );

  for (const [testName, testFunction] of testsToRun) {
    console.log(`Running ${testName}...`);
    await testFunction();
  }
};

await runTests();

// process.exit();

// const authNeededCallback = async (params) => {

//   console.log("params:", params);

//   // write the params to local file
//   const fs = require('fs');
//   fs.writeFileSync('./e2e-nodejs/bun-tests/logs/auth-needed-callback-params.json', JSON.stringify(params, null, 2));

//   const response = await litNodeClient.signSessionKey({
//     // sessionKey: params.sessionKeyPair,
//     sessionKeyUri: params.sessionKeyUri,
//     statement: params.statement,
//     authMethods: [hotWalletAuthMethod],
//     pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
//     expiration: params.expiration,
//     resources: params.resources,
//     chainId: 1,
//     resourceAbilityRequests: resourceAbilityRequests,
//   });
//   return response.authSig;
// };

// const sessionSigs = await litNodeClient.getSessionSigs({
//   pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
//   chain: 'ethereum',
//   resourceAbilityRequests,
//   authNeededCallback: authNeededCallback,
//   capacityDelegationAuthSig,
// });

// console.log('sessionSigs:', sessionSigs);

// // -- execute js
// const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

// const res = await litNodeClient.executeJs({
//   sessionSigs,
//   code: `(async() => {
//     console.log("Testing!");
//   })()`,
//   jsParams: {},
// });

// console.log('res:', res);

process.exit();
