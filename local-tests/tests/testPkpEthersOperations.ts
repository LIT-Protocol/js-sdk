// import { AuthCallbackParams, AuthSig, LitAbility } from '@lit-protocol/types';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
// import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
// import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersOperations
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersOperations
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersOperations
 */
export const testPkpEthersOperations = async (devEnv: TinnyEnvironment) => {
  console.log('Hello!');
  return;
  // const alice = await devEnv.createRandomPerson();

  // const pkpEthersWallet = new PKPEthersWallet({
  //   pkpPubKey: alice.pkp.publicKey,
  //   authContext: {
  //     authMethods: [alice.authMethod],
  //     client: devEnv.litNodeClient,
  //     getSessionSigsProps: {
  //       resourceAbilityRequests: [
  //         {
  //           resource: new LitPKPResource('*'),
  //           ability: LitAbility.PKPSigning,
  //         },
  //         {
  //           resource: new LitActionResource('*'),
  //           ability: LitAbility.LitActionExecution,
  //         },
  //       ],
  //       authNeededCallback: async function (
  //         props: AuthCallbackParams
  //       ): Promise<AuthSig> {
  //         const response = await this.signSessionKey({
  //           sessionKey: props.sessionKey,
  //           statement: props.statement || 'Some custom statement.',
  //           authMethods: [alice.authMethod],
  //           pkpPublicKey: alice.authMethodOwnedPkp,
  //           expiration: props.expiration,
  //           resources: props.resources,
  //           chainId: 1,

  //           // -- required fields
  //           resourceAbilityRequests: props.resourceAbilityRequests,

  //           // -- optional fields
  //           ...(props.litActionCode && { litActionCode: props.litActionCode }),
  //           ...(props.litActionIpfsId && {
  //             litActionIpfsId: props.litActionIpfsId,
  //           }),
  //           ...(props.jsParams && { jsParams: props.jsParams }),
  //         });

  //         return response.authSig;
  //       },
  //     },
  //   },
  // });

  // await pkpEthersWallet.init();

  // const signature = await pkpEthersWallet.signMessage(alice.loveLetter);
  // console.log('signature:', signature);
};
