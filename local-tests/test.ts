// This test requires using "bun" to run.
// Installation: https://bun.sh/docs/installation
// Test command: yarn test:local --filter={testName} --network={network | 'localhost' is default}

import {
  LitActionResource,
  LitPKPResource,
  craftAuthSig,
  createSiweMessageWithRecaps,
} from '@lit-protocol/auth-helpers';
import { devEnv } from './setup/env-setup';
import * as ethers from 'ethers';
import { getNetworkFlag, showTests, runTests } from './setup/utils';
import { AuthCallbackParams, LitAbility } from '@lit-protocol/types';

const devEnvPromise = devEnv({
  env: getNetworkFlag(),
  debug: true,
});

const tests = {
  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUseAuthSigToExecuteJsConsoleLog --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUseAuthSigToExecuteJsConsoleLog --network=localchain --version=v0
   */
  testUseAuthSigToExecuteJsConsoleLog: async () => {
    const res = await litNodeClient.executeJs({
      authSig: hotWalletAuthSig,
      code: `(async() => {
        console.log("Testing!");
      })()`,
      jsParams: {},
    });

    if (res && res.success) {
      console.log('✅ res:', res);
    }
  },

  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUseAuthSigToExecuteJsSigning --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUseAuthSigToExecuteJsSigning --network=localchain --version=v0
   */
  testUseAuthSigToExecuteJsSigning: async () => {
    const TO_SIGN = ethers.utils.arrayify(
      ethers.utils.keccak256([1, 2, 3, 4, 5])
    );

    try {
      const res = await litNodeClient.executeJs({
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

      if (res.signatures.sig.signature) {
        console.log('✅ res:', res);
      } else {
        console.log('❌ Error res:', res);
      }
    } catch (e) {
      console.log('Error:', e);
    }
  },

  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog --network=localchain --version=v1
   */
  testUseEoaSessionSigsToExecuteJsConsoleLog: async () => {
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
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
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }: AuthCallbackParams) => {
        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resourceAbilityRequests) {
          throw new Error('resourceAbilityRequests is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const toSign = await createSiweMessageWithRecaps({
          uri: uri,
          expiration: expiration,
          resources: resourceAbilityRequests,
          walletAddress: hotWallet.address,
          nonce: lastestBlockhash,
          litNodeClient: litNodeClient,
        });

        const authSig = await craftAuthSig({
          signer: hotWallet,
          toSign,
        });

        return authSig;
      },
    });

    const res = await litNodeClient.executeJs({
      sessionSigs: sessionSigs,
      code: `(async() => {
        console.log("Testing!");
      })()`,
      jsParams: {},
    });

    console.log('res:', res);
  },

  /**
   * Test Commands:
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToPkpSign --network=habanero --version=v0
   * ✅ yarn test:local --filter=testUseEoaSessionSigsToPkpSign --network=localchain --version=v1
   */
  testUseEoaSessionSigsToPkpSign: async () => {
    const sessionSigs = await litNodeClient.getSessionSigs({
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
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }: AuthCallbackParams) => {
        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resourceAbilityRequests) {
          throw new Error('resourceAbilityRequests is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const siweMessage = await createSiweMessageWithRecaps({
          uri: uri,
          expiration: expiration,
          resources: resourceAbilityRequests,
          walletAddress: hotWallet.address,
          nonce: lastestBlockhash,
          litNodeClient,
        });

        const authSig = await craftAuthSig({
          signer: hotWallet,
          toSign: siweMessage,
        });

        return authSig;
      },
    });

    const TO_SIGN = ethers.utils.arrayify(
      ethers.utils.keccak256([1, 2, 3, 4, 5])
    );

    console.log('sessionSigs:', sessionSigs);

    let error: any = undefined;

    try {
      const runWithSessionSigs = await litNodeClient.pkpSign({
        toSign: TO_SIGN,
        pubKey: hotWalletOwnedPkp.publicKey,
        sessionSigs,
      });

      console.log('✅ runWithSessionSigs:', runWithSessionSigs);
    } catch (e) {
      error = e;
    }

    if (error) {
      // check your session sig
      const sessionSig = sessionSigs[litNodeClient.config.bootstrapUrls[0]];
      console.log('This is the session sig you were using:');
      console.log(sessionSig);
      throw new Error(error.message);
    }
  },

  /**
   * Test Commands:
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
        }
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
        dataToSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
        publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      },
    })

    console.log('✅ res:', res);
  },

  /**
   * Test Commands:
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
      toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
      pubKey: hotWalletAuthMethodOwnedPkp.publicKey,
      sessionSigs: pkpSessionSigs,
    });

    console.log('✅ res:', res);
  },

  /**
   * Test Commands:
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
      litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString('base64'),
      jsParams: {
        publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
        sigName: 'unified-auth-sig',
      },
    });

    const res = await litNodeClient.pkpSign({
      toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
      pubKey: hotWalletAuthMethodOwnedPkp.publicKey,
      sessionSigs: pkpSessionSigs,
    });

    console.log('✅ res:', res);
  },

  /**
   * Test Commands:
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
        }
      ],
      litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString('base64'),
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

  }
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
  capacityDelegationAuthSigWithPkp,
} = await devEnvPromise;

await runTests(tests);
// overwrite();
process.exit();
