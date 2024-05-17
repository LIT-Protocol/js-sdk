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

  const txToAddPermittedAuthMethod =
    await alice.contractsClient.addPermittedAuthMethod({
      pkpTokenId: alice.pkp.tokenId,
      authId: 'app-id-xxx:user-id-yyy',
      authMethodType: customAuthMethod.authMethodType,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

  console.log('txToAddPermittedAuthMethod:', txToAddPermittedAuthMethod);

  const permittedAuthMethods =
    await alice.contractsClient.pkpPermissionsContract.read.getPermittedAuthMethods(
      alice.pkp.tokenId
    );

  console.log('permittedAuthMethods:', permittedAuthMethods);

  for (const authMethod of permittedAuthMethods) {
    console.log('Added AuthMethod Type:', authMethod[0].toString());
  }

  const IPFSID = 'QmRXsQ59QnqXoUubnzFACQhXydoSgAnxNikG1sFQPEJGeG';

  // Grant an action permission to use a PKP
  const txToAddPermittedAction = await alice.contractsClient.addPermittedAction(
    {
      pkpTokenId: alice.pkp.tokenId,
      ipfsId: IPFSID,
      authMethodScopes: [AuthMethodScope.SignAnything],
    }
  );
  console.log('txToAddPermittedAction:', txToAddPermittedAction);

  const permittedActions =
    await alice.contractsClient.pkpPermissionsContract.read.getPermittedActions(
      alice.pkp.tokenId
    );

  console.log('permittedActions:', permittedActions);
  // process.exit();

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
    // litActionCode: Buffer.from(
    //   `(async () => {
    //     const a = 1;
    //     const b = 2;

    //     if (a + b === 3 && customAuthMethod.authMethodType === 89989) {
    //       LitActions.setResponse({response:"true"});
    //     } else {
    //       LitActions.setResponse({response:"false"});
    //     }

    //     console.log("16 Lit.Auth:", Lit.Auth);
    //   })()`
    // ).toString('base64'),
    jsParams: {
      publicKey: `0x${alice.pkp.publicKey}`,
      customAuthMethod: customAuthMethod,
      sigName: 'custom-auth-sig',
    },
  });

  console.log('litActionSessionSigs:', litActionSessionSigs);

  process.exit();
};
