// This test requires using "bun" to run.
// Installation: https://bun.sh/docs/installation
// Test command: yarn test:integrate --filter={testName} --network={network | 'localhost' is default}

import {
  LitActionResource,
  LitPKPResource,
  createSiweMessage,
  craftAuthSig,
  AuthCallbackFields,
  WithRecapFields,
  CreateSiweType,
} from '@lit-protocol/auth-helpers';
import { devEnv } from './setup/env-setup';
import * as ethers from 'ethers';
import { getNetworkFlag, showTests, runTests } from './setup/utils';
import { getSessionSigReport } from 'packages/auth-helpers/src/lib/humanized-siwe-signed-message';
import { AuthCallbackParams, LitAbility } from '@lit-protocol/types';

const devEnvPromise = devEnv({
  env: getNetworkFlag(),
  debug: true,
});

const tests = {
  /**
   * Test Commands:
   * ✅ yarn test:integrate --filter=testUseAuthSigToExecuteJsConsoleLog --network=habanero --version=v0
   * ✅ yarn test:integrate --filter=testUseAuthSigToExecuteJsConsoleLog --network=localchain --version=v0
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
   * ✅ yarn test:integrate --filter=testUseAuthSigToExecuteJsSigning --network=habanero --version=v0
   * ✅ yarn test:integrate --filter=testUseAuthSigToExecuteJsSigning --network=localchain --version=v0
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
   * ✅ yarn test:integrate --filter=testGetSessionSigs --network=habanero --version=v0
   * ✅ yarn test:integrate --filter=testGetSessionSigs --network=localchain --version=v1
   */
  testGetSessionSigs: async () => {
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resources,
      }: AuthCallbackParams) => {
        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resources) {
          throw new Error('resources is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const toSign = await createSiweMessage<AuthCallbackFields>({
          uri: uri,
          expiration: expiration,
          resources: resources,
          walletAddress: hotWallet.address,
          nonce: lastestBlockhash,
          type: CreateSiweType.DEFAULT,
        });

        const authSig = await craftAuthSig({
          signer: hotWallet,
          toSign,
        });

        return authSig;
      },
      // NOT SURE ABOUT THIS
      capacityDelegationAuthSig: capacityDelegationAuthSig,
    });

    console.log('sessionSigs:', sessionSigs);
    console.log(
      getSessionSigReport(sessionSigs[litNodeClient.config.bootstrapUrls[0]])
    );

    return sessionSigs;
  },

  /**
   * Test Commands:
   * ✅ yarn test:integrate --filter=testUseSessionSigsToExecuteJsConsoleLog --network=habanero --version=v0
   * ❌ yarn test:integrate --filter=testUseSessionSigsToExecuteJsConsoleLog --network=localchain --version=v1
   */
  testUseSessionSigsToExecuteJsConsoleLog: async () => {
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resources,
      }: AuthCallbackParams) => {
        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resources) {
          throw new Error('resources is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const toSign = await createSiweMessage<AuthCallbackFields>({
          uri: uri,
          expiration: expiration,
          resources: resources,
          walletAddress: hotWallet.address,
          nonce: lastestBlockhash,
          type: CreateSiweType.DEFAULT,
        });

        const authSig = await craftAuthSig({
          signer: hotWallet,
          toSign,
        });

        return authSig;
      },
      // Create a new test with this field
      // capacityDelegationAuthSig: capacityDelegationAuthSig,
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
   * ✅ yarn test:integrate --filter=testUseSessionSigsToPkpSign --network=habanero --version=v0
   * ❌ yarn test:integrate --filter=testUseSessionSigsToPkpSign --network=localchain --version=v1
   */
  testUseSessionSigsToPkpSign: async () => {
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resources,
        resourceAbilityRequests,
      }: AuthCallbackParams) => {
        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resources) {
          throw new Error('resources is required');
        }

        console.log(`
  --------------------------------------
  ❓ resources from auth needed callabck.
  They are expected to be empty, because they will be injected by the Lit nodes.
  raw: ${JSON.stringify(resources)}
  base64: ${resources[0].split(':')[2]}
  decoded: ${atob(resources[0].split(':')[2])}
  --------------------------------------`);

        if (!resourceAbilityRequests) {
          throw new Error('resourceAbilityRequests is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const siweMessage = await createSiweMessage<WithRecapFields>({
          uri: uri,
          expiration: expiration,
          resources: resources,
          walletAddress: hotWallet.address,
          nonce: lastestBlockhash,
          litNodeClient: litNodeClient,
          resourceAbilityRequests,
          type: CreateSiweType.WITH_RECAP,
        });

        const authSig = await craftAuthSig({
          signer: hotWallet,
          toSign: siweMessage,
        });

        return authSig;
      },
      // capacityDelegationAuthSig,
    });

    console.log('sessionSigs:', sessionSigs);

    const TO_SIGN = ethers.utils.arrayify(
      ethers.utils.keccak256([1, 2, 3, 4, 5])
    );

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
      console.log(getSessionSigReport(sessionSig));
      console.log('This is the session sig you were using:');
      console.log(sessionSig);
      throw new Error(error.message);
    }
  },

  /**
   * Test Commands:
   * ✅ yarn test:integrate --filter=testUsePkpSessionSigsToPkpSign --network=habanero --version=v0
   * ✅ yarn test:integrate --filter=testUsePkpSessionSigsToPkpSign --network=localchain --version=v1
   */
  testUsePkpSessionSigsToPkpSign: async () => {
    const pkpSessionSigs = await litNodeClient.getSessionSigs({
      pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
      authNeededCallback: async (params) => {
        // -- validate
        if (!params.expiration) {
          throw new Error('expiration is required');
        }

        if (!params.resources) {
          throw new Error('resources is required');
        }

        if (!params.resourceAbilityRequests) {
          throw new Error('resourceAbilityRequests is required');
        }

        console.log('params:', params);

        const response = await litNodeClient.signSessionKey({
          statement: 'Some custom statement.',
          authMethods: [hotWalletAuthMethod],
          pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
          expiration: params.expiration,
          resources: params.resources,
          chainId: 1,

          // -- required fields
          resourceAbilityRequests: params.resourceAbilityRequests,
        });

        return response.authSig;
      },
      // capacityDelegationAuthSig, // unnecessary
    });

    console.log('pkpSessionSigs:', pkpSessionSigs);

    try {
      const res = await litNodeClient.pkpSign({
        toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
        pubKey: hotWalletAuthMethodOwnedPkp.publicKey,
        sessionSigs: pkpSessionSigs,
      });

      console.log('✅ res:', res);
    } catch (e) {
      console.log(e);
    }

    process.exit();
  },

  /**
   * Test Commands:
   * ✅ yarn test:integrate --filter=testUseValidLitActionCodeGeneratedSessionSigsToPkpSign --network=localchain --version=v1
   * ❌ yarn test:integrate --filter=testUseValidLitActionCodeGeneratedSessionSigsToPkpSign --network=habanero --version=v0
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

    const pkpSessionSigs = await litNodeClient.getSessionSigs({
      pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      chain: 'ethereum',
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ],
      authNeededCallback: async (params) => {
        // -- validate
        if (!params.expiration) {
          throw new Error('expiration is required');
        }

        if (!params.resources) {
          throw new Error('resources is required');
        }

        if (!params.resourceAbilityRequests) {
          throw new Error('resourceAbilityRequests is required');
        }

        console.log('params:', params);

        const response = await litNodeClient.signSessionKey({
          statement: 'Some custom statement.',
          authMethods: [hotWalletAuthMethod],
          pkpPublicKey: hotWalletAuthMethodOwnedPkp.publicKey,
          expiration: params.expiration,
          resources: params.resources,
          chainId: 1,

          // -- required fields
          resourceAbilityRequests: params.resourceAbilityRequests,
          litActionCode: Buffer.from(
            VALID_SESSION_SIG_LIT_ACTION_CODE
          ).toString('base64'),
          jsParams: {
            publicKey: hotWalletAuthMethodOwnedPkp.publicKey,
            sigName: 'unified-auth-sig',
          },
        });

        return response.authSig;
      },
      // capacityDelegationAuthSig,
    });

    console.log('pkpSessionSigs:', pkpSessionSigs);

    try {
      const res = await litNodeClient.pkpSign({
        toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
        pubKey: hotWalletAuthMethodOwnedPkp.publicKey,
        sessionSigs: pkpSessionSigs,
      });

      console.log('✅ res:', res);
    } catch (e) {
      console.log(e);
    }

    process.exit();
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
  capacityDelegationAuthSigWithPkp,
} = await devEnvPromise;

await runTests(tests);

process.exit();
