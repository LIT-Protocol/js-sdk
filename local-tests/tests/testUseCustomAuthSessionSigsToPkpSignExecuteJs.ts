import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import {
  AUTH_METHOD_SCOPE,
  CENTRALISATION_BY_NETWORK,
  LIT_ABILITY,
} from '@lit-protocol/constants';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { stringToIpfsHash } from 'local-tests/setup/tinny-utils';

/**
 * Test Commands:
 * NETWORK=datil-dev yarn test:local --filter=testUseCustomAuthSessionSigsToPkpSignExecuteJs
 * NETWORK=custom yarn test:local --filter=testUseCustomAuthSessionSigsToPkpSignExecuteJs
 */
export const testUseCustomAuthSessionSigsToPkpSignExecuteJs = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  /**
   * This is a custom auth method. It can be anything you want. Even the shape of the object can be anything,
   * because you will be handling the logic in the Lit action code yourself.
   */
  const customAuthMethod = {
    authMethodType: 89989,
    authMethodId: 'app-id-xxx:user-id-yyy',
    accessToken: 'xxx',
  };

  /**
   * Alice assigns the custom auth method to her PKP.
   */
  const addPermittedAuthMethodReceipt =
    await alice.contractsClient.addPermittedAuthMethod({
      pkpTokenId: alice.pkp.tokenId,
      authMethodType: customAuthMethod.authMethodType,
      authMethodId: customAuthMethod.authMethodId,
      authMethodScopes: [AUTH_METHOD_SCOPE.SignAnything],
    });

  console.log(
    '✅ addPermittedAuthMethodReceipt:',
    addPermittedAuthMethodReceipt
  );

  /**
   * Please note that the code below is first converted to a CID and stored in the smart contract.
   * Therefore, the Lit action code executed in the `getPkpSessionSigs` function must match the CID stored in the smart contract.
   *
   * You can use https://explorer.litprotocol.com/create-action to create a Lit action and get the CID.
   */
  const litActionCodeString = `(async () => {
    const a = 1;
    const b = 2;

    if (a + b === 3 && customAuthMethod.authMethodType === 89989) {
      LitActions.setResponse({response:"true"});
    } else {
      LitActions.setResponse({response:"false"});
    }

    console.log("Lit.Auth:", Lit.Auth);
  })()`;

  const IPFSID = await stringToIpfsHash(litActionCodeString);

  console.log('✅ IPFSID:', IPFSID.toString());

  // Grant an action permission to use a PKP
  const addPermittedActionReceipt =
    await alice.contractsClient.addPermittedAction({
      ipfsId: IPFSID,
      pkpTokenId: alice.pkp.tokenId,
      authMethodScopes: [AUTH_METHOD_SCOPE.SignAnything],
    });

  console.log('✅ addPermittedActionReceipt:', addPermittedActionReceipt);

  const centralisation =
    CENTRALISATION_BY_NETWORK[devEnv.litNodeClient.config.litNetwork];

  const litActionAuthContext = devEnv.litNodeClient.getPkpAuthContext({
    pkpPublicKey: alice.pkp.publicKey,
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LIT_ABILITY.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LIT_ABILITY.LitActionExecution,
      },
    ],
    // litActionIpfsId: IPFSID,
    litActionCode: Buffer.from(litActionCodeString).toString('base64'),
    jsParams: {
      publicKey: `0x${alice.pkp.publicKey}`,
      customAuthMethod: customAuthMethod,
      sigName: 'custom-auth-sig',
    },

    ...(centralisation === 'decentralised' && {
      capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
    }),
  });

  // -- pkp sign test
  try {
    const res = await devEnv.litNodeClient.pkpSign({
      toSign: alice.loveLetter,
      pubKey: alice.pkp.publicKey,
      authContext: litActionAuthContext,
    });

    console.log('✅ pkpSign res:', res);
  } catch (e) {
    throw new Error(e);
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
  // -- execute js
  try {
    const res = await devEnv.litNodeClient.executeJs({
      authContext: litActionAuthContext,
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: alice.pkp.publicKey,
      },
    });
    console.log('✅ executeJs res:', res);
  } catch (e) {
    throw new Error(e);
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
