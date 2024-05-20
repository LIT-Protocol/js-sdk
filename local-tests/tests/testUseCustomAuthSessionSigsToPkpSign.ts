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

  const customAuthMethod = {
    authMethodType: 89989,
    accessToken: 'xxx',
  };

  console.log('customAuthMethod:', customAuthMethod);

  const customAuthMethodOwnedPkp =
    await alice.contractsClient.mintWithCustomAuth({
      customAuthId: 'custom-app-user-id', // ipfs hash for the auth method
      authMethod: customAuthMethod,
      scopes: [AuthMethodScope.SignAnything],
    });

  console.log('customAuthMethodOwnedPkp:', customAuthMethodOwnedPkp);

  const addPermittedAuthMethodTx =
    await alice.contractsClient.addPermittedAuthMethod({
      pkpTokenId: alice.pkp.tokenId,
      authId: 'app-id-xxx:user-id-yyy',
      authMethodType: customAuthMethod.authMethodType,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

  await addPermittedAuthMethodTx.wait();

  console.log('addPermittedAuthMethodTx:', addPermittedAuthMethodTx);

  // `LitActions.setResponse({ response: "true" });`
  const IPFSID = 'QmSAhLWr3U3SshJyXn9PXwSDnoXGBfRQb9Juw6PpN4eLff';

  // Grant an action permission to use a PKP
  const addPermittedActionTx =
    await alice.contractsClient.pkpPermissionsContractUtils.write.addPermittedAction(
      alice.pkp.tokenId,
      IPFSID
    );
  const receipt = await addPermittedActionTx.wait();

  console.log('addPermittedActionTx:', addPermittedActionTx);
  console.log('receipt:', receipt);

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
    litActionCode: Buffer.from(
      `const go = async () => {LitActions.setResponse({response:"true"});};go();`
    ).toString('base64'),
    jsParams: {
      publicKey: `0x${alice.pkp.publicKey}`,
      customAuthMethod: customAuthMethod,
      sigName: '3custom-auth-sig',
    },
  });

  console.log('litActionSessionSigs:', litActionSessionSigs);

  try {
    const res = await devEnv.litNodeClient.pkpSign({
      toSign: alice.loveLetter,
      pubKey: alice.pkp.publicKey,
      sessionSigs: litActionSessionSigs,
    });

    console.log('res:', res);
  } catch (e) {
    throw new Error(e);
  }

  process.exit();
};
