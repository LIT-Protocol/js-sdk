import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * ## Scenario:
 * Testing unrestricted access to pkp sign code using a capacity delegation authSig without specific delegatee restrictions
 * - Given: A capacity delegation authSig is created by the dApp owner
 * - When: The authSig does not specifically restrict delegatees
 * - And: Any user attempts to pkp sign code using the capacity from the capacity credits NFT
 * - Then: The user should be able to execute the JS code using the capacity without restrictions due to the absence of delegatee limits
 *
 *
 * ## Test Commands:
 * - ❌ Not supported in Cayenne, but session sigs would still work
 * - ✅ NETWORK=manzano yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToPkpSign
 * - ✅ NETWORK=localchain yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToPkpSign
 */

export const testUseCapacityDelegationAuthSigWithUnspecifiedDelegateesToPkpSign =
  async (devEnv: TinnyEnvironment) => {
    const alice = await devEnv.createRandomPerson();
    const bob = await devEnv.createRandomPerson();

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

    // 5. Bob can now pkp sign using the capacity credits NFT
    const runWithSessionSigs = await devEnv.litNodeClient.pkpSign({
      toSign: alice.loveLetter,
      pubKey: bob.pkp.publicKey,
      sessionSigs: bobsSessionSigs,
    });

    devEnv.releasePrivateKeyFromUser(alice);
    devEnv.releasePrivateKeyFromUser(bob);

    // -- Expected output:
    // {
    //   r: "36bd0039b4e4d1dae488a63437318790df86b8023ac4ffa842c8983245b7f629",
    //   s: "29135af930c40ee0901a9ea3ca5621d06a6b932aee2f2256cf2a99a65cb36d05",
    //   recid: 1,
    //   signature: "0x36bd0039b4e4d1dae488a63437318790df86b8023ac4ffa842c8983245b7f62929135af930c40ee0901a9ea3ca5621d06a6b932aee2f2256cf2a99a65cb36d051c",
    //   publicKey: "04837486BD4DCF221D463D976E6A392E12BC2DFEFB124E189AB0A8EA406DFB1C73F4DCD268CC2B8F854C202256BD08E22D688121061EA9CFB1317142DBD2EAB4C4",
    //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    // }

    // -- assertions
    // r, s, dataSigned, and public key should be present
    if (!runWithSessionSigs.r) {
      throw new Error(`Expected "r" in runWithSessionSigs`);
    }
    if (!runWithSessionSigs.s) {
      throw new Error(`Expected "s" in runWithSessionSigs`);
    }
    if (!runWithSessionSigs.dataSigned) {
      throw new Error(`Expected "dataSigned" in runWithSessionSigs`);
    }
    if (!runWithSessionSigs.publicKey) {
      throw new Error(`Expected "publicKey" in runWithSessionSigs`);
    }

    // signature must start with 0x
    if (!runWithSessionSigs.signature.startsWith('0x')) {
      throw new Error(`Expected "signature" to start with 0x`);
    }

    // recid must be parseable as a number
    if (isNaN(runWithSessionSigs.recid)) {
      throw new Error(`Expected "recid" to be parseable as a number`);
    }
  };
