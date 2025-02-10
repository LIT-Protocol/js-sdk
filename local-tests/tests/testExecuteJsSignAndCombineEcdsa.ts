import { getEoaAuthContextWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { getLitActionAuthContext } from '../setup/session-sigs/get-lit-action-session-sigs';

/**
 * ## Scenario:
 * Testing unrestricted access to execute js code using a capacity delegation authSig without specific delegatee restrictions
 * - Given: A capacity delegation authSig is created by the dApp owner
 * - When: The authSig does not specifically restrict delegatees
 * - And: Any user attempts to execute js code using the capacity from the capacity credits NFT
 * - Then: The user should be able to sign with his/her PKP using the capacity without restrictions due to the absence of delegatee limits
 *
 *
 * ## Test Commands:
 * - ✅ NETWORK=datil-test yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs
 * - ✅ NETWORK=custom yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs
 */
export const testExecuteJsSignAndCombineEcdsa = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const bob = await devEnv.createRandomPerson();

  const appOwnersCapacityDelegationAuthSig = (
    await devEnv.litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: alice.wallet,
    })
  ).capacityDelegationAuthSig;

  const res = await devEnv.litNodeClient.executeJs({
    authContext: getEoaAuthContextWithCapacityDelegations(
      devEnv,
      bob.wallet,
      appOwnersCapacityDelegationAuthSig
    ),
    code: `(async () => {
        const sigShare = await LitActions.signAndCombineEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
        Lit.Actions.setResponse({
            response: sigShare
        });
      })();`,
    jsParams: {
      dataToSign: alice.loveLetter,
      publicKey: bob.pkp.publicKey,
    },
  });

  devEnv.releasePrivateKeyFromUser(alice);
  devEnv.releasePrivateKeyFromUser(bob);

  /**
        Response format
       {
            "success": true,
            "signedData": {},
            "decryptedData": {},
            "claimData": {},
            "response": "{\"r\":\"026eede14267ca76064a7e22dbe6f9e44d786c7b5917b7d023f45ee4e84ce1ea47\",\"s\":\"22a6048bcb88d724d45bdb6161fefd151483f41d592d167e5c33f42e9fe6dac6\",\"v\":0}",
            "logs": ""
        }
     */

  if (!res.response) {
    throw new Error('Response not found, expecting signature in response');
  }

  const sig = JSON.parse(res.response as string);
  console.log('signature returned as a response', sig);

  if (!sig.r) {
    throw new Error('invalid signature returned from lit action');
  }

  if (!sig.s) {
    throw new Error('invalid signature returned from lit action');
  }

  if (sig.v === undefined) {
    throw new Error('invalid signature returned from lit action');
  }
  console.log('✅ testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs');
};
