import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_NETWORK } from 'local-tests/setup/tinny-config';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

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
 * - ❌ Not supported in Cayenne, but session sigs would still work
 * - ✅ NETWORK=manzano yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs
 * - ✅ NETWORK=localchain yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedCapacityTokenIdToExecuteJs
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

  // 3. Bob gets the capacity delegation authSig from somewhere and uses it to get session sigs
  const bobsSessionSigs = await getEoaSessionSigsWithCapacityDelegations(
    devEnv,
    bob.wallet,
    appOwnersCapacityDelegationAuthSig
  );

  // -- printing out the recaps from the session sigs
  const bobsSingleSessionSig =
    bobsSessionSigs[devEnv.litNodeClient.config.bootstrapUrls[0]];

  console.log('bobsSingleSessionSig:', bobsSingleSessionSig);

  const regex = /urn:recap:[\w+\/=]+/g;

  const recaps = bobsSingleSessionSig.signedMessage.match(regex) || [];

  recaps.forEach((r) => {
    const encodedRecap = r.split(':')[2];
    const decodedRecap = Buffer.from(encodedRecap, 'base64').toString();
    console.log(decodedRecap);
  });

  // 4. Bob can now execute JS code using the capacity credits NFT
  // 5. Bob can now execute JS code using the capacity credits NFT
  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: bobsSessionSigs,
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

  if (!sig.v) {
    throw new Error('invalid signature returned from lit action');
  }
  console.log('✅ testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs');
};
