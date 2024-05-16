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
    await devEnv.contractsClient.mintWithCustomAuth({
      customAuthId: 'custom-app-user-id', // ipfs hash for the auth method
      authMethod: customAuthMethod,
      scopes: [AuthMethodScope.SignAnything],
    });

  console.log('customAuthMethodOwnedPkp:', customAuthMethodOwnedPkp);

  const addPermittedAuthMethodRes =
    await alice.contractsClient.addPermittedAuthMethod({
      pkpTokenId: alice.pkp.tokenId,
      authId: 'app-id-xxx:user-id-yyy',
      authMethodType: customAuthMethod.authMethodType,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

  console.log('addPermittedAuthMethodRes:', addPermittedAuthMethodRes);

  // `LitActions.setResponse({ response: "true" });`
  const IPFSID = 'QmRKW16pkeVA74pHqtyvM1iKnHqFLNDbueEnfD5AgHmXeL';

  // Grant an action permission to use a PKP
  const addPermittedActionRes = await alice.contractsClient.addPermittedAction({
    pkpTokenId: alice.pkp.tokenId,
    ipfsId: IPFSID,
    authMethodScopes: [AuthMethodScope.SignAnything],
  });

  console.log('addPermittedActionRes:', addPermittedActionRes);

  const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: alice.pkp.publicKey,
    // authMethods: [alice.authMethod], // <-- ????
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
    litActionCode: Buffer.from(
      `LitActions.setResponse({ response: "true" });`
    ).toString('base64'),
    jsParams: {
      publicKey: `0x${alice.pkp.publicKey}`,
      accessToken: customAuthMethod.accessToken,
      sigName: 'custom-auth-sig',
    },
  });

  console.log('litActionSessionSigs:', litActionSessionSigs);

  process.exit();
};
