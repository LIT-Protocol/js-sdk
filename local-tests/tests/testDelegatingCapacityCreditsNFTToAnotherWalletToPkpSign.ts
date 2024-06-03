import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * ## Scenario:
 * Delegating capacity credits NFT to Bob (delegatee) for him to execute JS code to sign with his PKP
 * - Given: The capacity credits NFT is minted by the dApp owner
 * - When: The dApp owner creates a capacity delegation authSig
 * - And: The dApp owner delegates the capacity credits NFT to Bob
 * - Then: The delegated (Bob's) wallet can execute JS code to sign with his PKP using the capacity from the capacity credits NFT
 *
 *
 * ## Test Commands:
 * - ❌ Not supported in Cayenne, but session sigs would still work
 * - ✅ NETWORK=manzano yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign
 * - ✅ NETWORK=localchain yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign
 */
export const testDelegatingCapacityCreditsNFTToAnotherWalletToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const bob = await devEnv.createRandomPerson();

  const appOwnersCapacityDelegationAuthSig =
    await alice.createCapacityDelegationAuthSig([bob.wallet.address]);

  // 4. Bob receives the capacity delegation authSig use it to generate session sigs
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

  // 5. Bob can now execute JS code using the capacity credits NFT
  const res = await devEnv.litNodeClient.pkpSign({
    sessionSigs: bobsSessionSigs,
    toSign: alice.loveLetter,
    pubKey: bob.pkp.publicKey,
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
