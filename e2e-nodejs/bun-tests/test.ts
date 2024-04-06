// Test command: bun run ./e2e-nodejs/bun-tests/test.ts
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  AuthSigCallbackType,
  getAuthSigCallback,
} from '@lit-protocol/auth-helpers';
import { devEnv } from './setup/env-setup';
import * as ethers from 'ethers';
import { getNetworkFlag, showTests, runTests } from './setup/utils';
import { getSessionSigReport } from './signed-message-reader';

const devEnvPromise = devEnv({
  env: getNetworkFlag(),
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
    console.log(getSessionSigReport(sessionSigs[litNodeClient.config.bootstrapUrls[0]]));

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

showTests(tests);

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
} = await devEnvPromise;

await runTests(tests);

process.exit();
