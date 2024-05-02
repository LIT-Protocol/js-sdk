import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient } from '@lit-protocol/types';

/**
 * ## Scenario:
 * Testing unrestricted access to execute JS code using a capacity delegation authSig without specific delegatee restrictions
 * - Given: A capacity delegation authSig is created by the dApp owner
 * - When: The authSig does not specifically restrict delegatees
 * - And: Any user attempts to execute JS code using the capacity from the capacity credits NFT
 * - Then: The user should be able to execute the JS code using the capacity without restrictions due to the absence of delegatee limits
 *
 *
 * ## Test Commands:
 * - ❌ Not supported in Cayenne, but session sigs would still work
 * - ✅ NETWORK=manzano yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToExecuteJs
 * - ✅ NETWORK=localchain yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToExecuteJs
 */

export const testStuff =
  async (devEnv: TinnyEnvironment) => {
    devEnv.setUnavailable(LIT_TESTNET.CAYENNE);

    const alice = await devEnv.createRandomPerson();
    const bob = await devEnv.createRandomPerson();

    // No delegatee addresses provided. It means that the capability will not restrict access based on delegatee list, but it may still enforce other restrictions such as usage limits and specific NFT IDs.
    const appOwnersCapacityDelegationAuthSig =
      await alice.createCapacityDelegationAuthSig();

    // 4. Bob gets the capacity delegation authSig from somewhere and uses it to get session sigs
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
  
  
    const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
      userAddress: bob.wallet.address,
    });
    const encryptRes = await LitJsSdk.encryptString(
      {
        accessControlConditions: accs,
        chain: 'ethereum',
        sessionSigs: bobsSessionSigs,
        dataToEncrypt: 'Hello world',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );
    const res = await devEnv.litNodeClient.executeJs({
      sessionSigs: bobsSessionSigs,
      code: `(async () => {
          console.log(cipherText, hash)
          const sigShare = await LitActions.signAndCombineEcdsa({
            toSign: dataToSign,
            publicKey,
            sigName: "sig",
          });
          Lit.Actions.setResponse({
            response: sig,
            hash: hash,
            cipher: ciphertext
          });
        })();`,
      jsParams: {
        cipherText:'foo',
        hash: 'bar',
        dataToSign: alice.loveLetter,
        publicKey: alice.authMethodOwnedPkp.publicKey,
      },
    });

    console.log(
      '✅ testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs'
    );
  };
