import { DevEnv } from 'local-tests/setup/env-setup';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/eoa-session-sigs';

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
 * - 🚫 Not supported in Cayenne, but session sigs would still work
 * - ✅ yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnrestrictedAccessToExecuteJs --network=manzano --version=v0
 * - ✅ yarn test:local --filter=testUseCapacityDelegationAuthSigWithUnrestrictedAccessToExecuteJs --network=localchain --version=v1
 */

export const testUseCapacityDelegationAuthSigWithUnrestrictedAccessToExecuteJs =
  async (devEnv: DevEnv) => {
    // 1. Getting the capacity credits NFT minted in the dev environment
    const ccNft = devEnv.capacityTokenId;

    // 2. Hey, I'm Bob
    const bobsWallet = devEnv.bobsWallet;

    // 3. As a dApp owner, I want to create a unrestricted capacity delegation authSig that could be used by any user
    const { capacityDelegationAuthSig: appOwnersCapacityDelegationAuthSig } =
      await devEnv.litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: devEnv.hotWallet,
        capacityTokenId: ccNft,

        // No delegatee addresses provided. It means that the capability will not restrict access based on delegatee list, but it may still enforce other restrictions such as usage limits and specific NFT IDs.
        // delegateeAddresses: [bobsWallet.address],
      });

    // 4. Bob gets the capacity delegation authSig from somewhere and uses it to get session sigs
    const bobsSessionSigs = await getEoaSessionSigsWithCapacityDelegations(
      devEnv,
      bobsWallet,
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

    // 5. Bob can now execute JS code using the capacity credits NFT
    const res = await devEnv.litNodeClient.pkpSign({
      sessionSigs: bobsSessionSigs,
      toSign: devEnv.toSignBytes32,
      pubKey: devEnv.bobsOwnedPkp.publicKey,
    });

    // -- Expected output:
    // {
    //   r: "25e04b2abdf220b1374b19228bc292bab71a3224a635726a46d4cbe3a62bb636",
    //   s: "1e5d96ffa6ec7cca961ec7bfa90e524a08b1c4fc9a833b69d8727eff1453064c",
    //   recid: 0,
    //   signature: "0x25e04b2abdf220b1374b19228bc292bab71a3224a635726a46d4cbe3a62bb6361e5d96ffa6ec7cca961ec7bfa90e524a08b1c4fc9a833b69d8727eff1453064c1b",
    //   publicKey: "041FF0DC7B69D2B3C3E452AF9E0D30C7FDA6729A1B394059BDC8C4530D7F584FFCAEEEC19B1F22EFB054A22E5EF13AA0B5804994469570929066F5474D490B8A1F",
    //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    // }

    // -- assertions
    if (!res.r) {
      throw new Error(`Expected "r" in res`);
    }
    if (!res.s) {
      throw new Error(`Expected "s" in res`);
    }

    if (!res.dataSigned) {
      throw new Error(`Expected "dataSigned" in res`);
    }

    if (!res.publicKey) {
      throw new Error(`Expected "publicKey" in res`);
    }

    // -- signature must start with 0x
    if (!res.signature.startsWith('0x')) {
      throw new Error(`Expected "signature" to start with 0x`);
    }

    // -- recid must be parseable as a number
    if (isNaN(res.recid)) {
      throw new Error(`Expected "recid" to be parseable as a number`);
    }

    console.log('✅ res:', res);
  };
