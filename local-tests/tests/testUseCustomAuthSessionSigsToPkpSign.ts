import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { AuthMethodScope } from '@lit-protocol/constants';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ❌ NETWORK=cayenne yarn test:local --filter=testUseCustomAuthSessionSigsToPkpSign
 * ❌ NOT AVAILABLE IN HABANERO
 * ❌ NETWORK=localchain yarn test:local --filter=testUseCustomAuthSessionSigsToPkpSign
 */
export const testUseCustomAuthSessionSigsToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  /**
   * This is a custom auth method. It can be anything you want.
   */
  const customAuthMethod = {
    authMethodType: 89989,
    accessToken: 'xxx',
  };

  console.log('✅ customAuthMethod:', customAuthMethod);

  const customAuthMethodOwnedPkp =
    await alice.contractsClient.mintWithCustomAuth({
      customAuthId: 'custom-app-user-id', // ipfs hash for the auth method
      authMethod: customAuthMethod,
      scopes: [AuthMethodScope.SignAnything],
    });
  console.log('✅ customAuthMethodOwnedPkp:', customAuthMethodOwnedPkp);

  const addPermittedAuthMethodReceipt =
    await alice.contractsClient.addPermittedAuthMethod({
      pkpTokenId: alice.pkp.tokenId,
      authId: 'app-id-xxx:user-id-yyy',
      authMethodType: customAuthMethod.authMethodType,
      authMethodScopes: [AuthMethodScope.SignAnything],
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

    console.log("16 Lit.Auth:", Lit.Auth);
  })()`;

  const IPFSID = 'QmeG3spjJmqzFo4dpWte5Prv1xdUbPT3sYqo3n3ABQXgMF';

  console.log('✅ IPFSID:', IPFSID.toString());

  // Grant an action permission to use a PKP
  const addPermittedActionReceipt =
    await alice.contractsClient.addPermittedAction({
      ipfsId: IPFSID,
      pkpTokenId: alice.pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

  console.log('✅ addPermittedActionReceipt:', addPermittedActionReceipt);

  const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: alice.pkp.publicKey,
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
    // litActionIpfsId: IPFSID,
    litActionCode: Buffer.from(litActionCodeString).toString('base64'),
    jsParams: {
      publicKey: `0x${alice.pkp.publicKey}`,
      customAuthMethod: customAuthMethod,
      sigName: 'custom-auth-sig',
    },
  });

  console.log('litActionSessionSigs:', litActionSessionSigs);

  // -- pkp sign test
  try {
    const res = await devEnv.litNodeClient.pkpSign({
      toSign: alice.loveLetter,
      pubKey: alice.pkp.publicKey,
      sessionSigs: litActionSessionSigs,
    });

    console.log('✅ res:', res);
  } catch (e) {
    throw new Error(e);
  }

  process.exit();
};
