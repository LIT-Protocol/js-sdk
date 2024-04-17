// This test requires using "bun" to run.
// Installation: https://bun.sh/docs/installation
// Test command: yarn test:local --filter={testName} --network={network | 'localhost' is default}

import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { getDevEnv } from './setup/env-setup';
import * as ethers from 'ethers';
import { getNetworkFlag, showTests, runTests } from './setup/utils';
import { LitAbility } from '@lit-protocol/types';
import { getEoaSessionSigs } from './setup/session-sigs/eoa-session-sigs';

const devEnvPromise = getDevEnv({
  env: getNetworkFlag(),
  debug: true,
});

const tests = {
  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog --network=cayenne --version=v0
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog --network=localchain --version=v1
   */
  testUseEoaSessionSigsToExecuteJsConsoleLog: async () => {
    const eoaSessionSigs = await getEoaSessionSigs(devEnv);

    const res = await litNodeClient.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async() => {
        console.log("Testing!");
      })()`,
      jsParams: {},
    });

    console.log('res:', res);

    assert.equal(1, 1);
  },

  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToPkpSign --network=cayenne --version=v0
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToPkpSign --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToPkpSign --network=localchain --version=v1
   */
  testUseEoaSessionSigsToPkpSign: async () => {
    const eoaSessionSigs = await getEoaSessionSigs(devEnv);

    let error: any = undefined;

    try {
      const runWithSessionSigs = await litNodeClient.pkpSign({
        toSign: devEnv.toSignBytes32,
        pubKey: hotWalletOwnedPkp.publicKey,
        sessionSigs: eoaSessionSigs,
      });

      console.log('✅ runWithSessionSigs:', runWithSessionSigs);
    } catch (e) {
      error = e;
    }

    if (error) {
      // check your session sig
      const sessionSig = eoaSessionSigs[litNodeClient.config.bootstrapUrls[0]];
      console.log('This is the session sig you were using:');
      console.log(sessionSig);
      throw new Error(error.message);
    }
  },

  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigning --network=cayenne --version=v0
   * ✅ yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigning --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigning --network=localchain --version=v1
   */
  testUsePkpSessionSigsToExecuteJsSigning: async () => {
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      authMethods: [hotWalletAuthMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
    });

    console.log('pkpSessionSigs:', pkpSessionSigs);

    const res = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
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
        publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      },
    });

    console.log('✅ res:', res);
  },

  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUsePkpSessionSigsToPkpSign --network=cayenne --version=v0
   * ✅ yarn test:local --filter=testUsePkpSessionSigsToPkpSign --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUsePkpSessionSigsToPkpSign --network=localchain --version=v1
   */
  testUsePkpSessionSigsToPkpSign: async () => {
    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      authMethods: [hotWalletAuthMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
    });

    console.log('pkpSessionSigs:', pkpSessionSigs);

    const res = await litNodeClient.pkpSign({
      toSign: devEnv.toSignBytes32,
      pubKey: hotWalletAuthMethodOwnedPkp.publicKey,
      sessionSigs: pkpSessionSigs,
    });

    console.log('✅ res:', res);
  },

  /**
   * Test Commands:
   * ❌ NOT AVAILABLE IN CAYENNE
   * ❌ NOT AVAILABLE IN HABANERO
   * ✅ yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToPkpSign --network=localchain --version=v1
   *
   * Habanero Error: There was an error getting the signing shares from the nodes
   */
  testUseValidLitActionCodeGeneratedSessionSigsToPkpSign: async () => {
    const VALID_SESSION_SIG_LIT_ACTION_CODE = `
      // Works with an AuthSig AuthMethod
      if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
        LitActions.setResponse({ response: "true" });
      } else {
        LitActions.setResponse({ response: "false" });
      }
    `;

    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      authMethods: [hotWalletAuthMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
      litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString(
        'base64'
      ),
      jsParams: {
        publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
        sigName: 'unified-auth-sig',
      },
    });

    const res = await litNodeClient.pkpSign({
      toSign: devEnv.toSignBytes32,
      pubKey: hotWalletAuthMethodOwnedPkp.publicKey,
      sessionSigs: pkpSessionSigs,
    });

    console.log('✅ res:', res);
  },

  /**
   * Test Commands:
   * ❌ NOT AVAILABLE IN CAYENNE
   * ❌ NOT AVAILABLE IN HABANERO
   * ✅ yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning --network=localchain --version=v1
   */
  testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning: async () => {
    const VALID_SESSION_SIG_LIT_ACTION_CODE = `
        // Works with an AuthSig AuthMethod
        if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
          LitActions.setResponse({ response: "true" });
        } else {
          LitActions.setResponse({ response: "false" });
        }
      `;

    const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
      pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      authMethods: [hotWalletAuthMethod],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString(
        'base64'
      ),
      jsParams: {
        publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
        sigName: 'unified-auth-sig',
      },
    });

    const res = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
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
        publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      },
    });

    console.log('✅ res:', res);
  },
};

showTests(tests);

const devEnv = await devEnvPromise;

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
  capacityDelegationAuthSigWithPkp,
} = devEnv;

await runTests(tests);
// overwrite();
process.exit();
