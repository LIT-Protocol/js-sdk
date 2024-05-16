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
    authMethodType: 11111,
    accessToken: 'xxx',
  };

  // console.log('customAuthMethod:', customAuthMethod);

  // const customAuthMethodOwnedPkp =
  //   await devEnv.contractsClient.mintWithCustomAuth({
  //     customAuthId: 'custom-app-user-id', // ipfs hash for the auth method
  //     authMethod: customAuthMethod,
  //     scopes: [AuthMethodScope.SignAnything],
  //   });addPermittedAction

  // console.log('customAuthMethodOwnedPkp:', customAuthMethodOwnedPkp);

  // Grant an action permission to use a PKP
  const addPermittedActionRes = await alice.contractsClient.addPermittedAction({
    pkpTokenId: alice.pkp.tokenId,
    ipfsId: 'QmRKW16pkeVA74pHqtyvM1iKnHqFLNDbueEnfD5AgHmXeL',
  });

  console.log('addPermittedActionRes:', addPermittedActionRes);

  const addPermittedAuthMethodRes =
    await alice.contractsClient.addPermittedAuthMethod({
      pkpTokenId: alice.pkp.tokenId,
      authId: 'custom-app-user-id',
      authMethodType: customAuthMethod.authMethodType,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

  console.log('addPermittedAuthMethodRes:', addPermittedAuthMethodRes);

  process.exit();

  // getPermittedAuthMethods (could be added before or after)

  // const litActionSessionSigs2 = await devEnv.litNodeClient.getPkpSessionSigs({
  //   pkpPublicKey: customAuthMethodOwnedPkp.pkp.publicKey,
  //   authMethods: [customAuthMethod],
  //   resourceAbilityRequests: [
  //     {
  //       resource: new LitPKPResource('*'),
  //       ability: LitAbility.PKPSigning,
  //     },
  //     {
  //       resource: new LitActionResource('*'),
  //       ability: LitAbility.LitActionExecution,
  //     },
  //   ],
  //   litActionCode: Buffer.from(
  //     `
  //   // Works with an AuthSig AuthMethod
  //   if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
  //     LitActions.setResponse({ response: "true" });
  //   } else {
  //     LitActions.setResponse({ response: "false" });
  //   }
  //   `
  //   ).toString('base64'),
  //   jsParams: {
  //     publicKey: customAuthMethodOwnedPkp.pkp.publicKey,
  //     sigName: 'custom-auth-sig',
  //   },
  // });

  // console.log('litActionSessionSigs2:', litActionSessionSigs2);

  process.exit();
};
