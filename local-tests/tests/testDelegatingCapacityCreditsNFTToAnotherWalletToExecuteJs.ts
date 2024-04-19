import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { DevEnv, LIT_TESTNET, processEnvs } from 'local-tests/setup/env-setup';
import { getEoaSessionSigsWithCapacityDelegations } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';

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
 * - ✅ NETWORK=manzano yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs 
 * - ✅ NETWORK=localchain yarn test:local --filter=testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs 
 */
export const testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs =
  async (devEnv: DevEnv) => {
    devEnv.setExecuteJsVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

    // 1. Getting the capacity credits NFT minted in the dev environment
    const ccNft = devEnv.capacityTokenId;

    // 2. Hey, I'm Bob
    const bobsWallet = devEnv.bobsWallet;

    // 3. As a dApp owner, I want to delegate the capacity credits NFT to Bob
    const { capacityDelegationAuthSig: appOwnersCapacityDelegationAuthSig } =
      await devEnv.litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: devEnv.hotWallet,
        capacityTokenId: ccNft,
        delegateeAddresses: [bobsWallet.address],
      });

    // 4. Bob receives the capacity delegation authSig use it to generate session sigs
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
    const res = await devEnv.litNodeClient.executeJs({
      sessionSigs: bobsSessionSigs,
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: devEnv.toSignBytes32,
        publicKey: devEnv.bobsWalletOwnedPkp.publicKey,
      },
    });

    // Expected output:
    // {
    //   claims: {},
    //   signatures: {
    //     sig: {
    //       r: "0f4b8b20369a8a021aae7c2083076715820e32d2b18826ea7ccea525a9adadc2",
    //       s: "43aa338fa2c90e13c88d9b432d7ee6c8e3df006b8ef94ad5b4ab32d64b507f17",
    //       recid: 1,
    //       signature: "0x0f4b8b20369a8a021aae7c2083076715820e32d2b18826ea7ccea525a9adadc243aa338fa2c90e13c88d9b432d7ee6c8e3df006b8ef94ad5b4ab32d64b507f171c",
    //       publicKey: "0406A76D2A6E3E729A537640C8C41592BBC2675799CCBBF310CD410691C028C529C5A8DE8016933CEC0B06EC7AA0FFAFBA2791158A11D382C558376DF392F436AD",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //   },
    //   decryptions: [],
    //   response: undefined,
    //   logs: "",
    // }

    // -- assertions
    if (!res.signatures.sig.r) {
      throw new Error(`Expected "r" in res.signatures.sig`);
    }
    if (!res.signatures.sig.s) {
      throw new Error(`Expected "s" in res.signatures.sig`);
    }

    if (!res.signatures.sig.dataSigned) {
      throw new Error(`Expected "dataSigned" in res.signatures.sig`);
    }

    if (!res.signatures.sig.publicKey) {
      throw new Error(`Expected "publicKey" in res.signatures.sig`);
    }

    // -- signatures.sig.signature must start with 0x
    if (!res.signatures.sig.signature.startsWith('0x')) {
      throw new Error(`Expected "signature" to start with 0x`);
    }

    // -- signatures.sig.recid must be parseable as a number
    if (isNaN(res.signatures.sig.recid)) {
      throw new Error(`Expected "recid" to be parseable as a number`);
    }

    console.log(
      '✅ testDelegatingCapacityCreditsNFTToAnotherWalletToExecuteJs'
    );
  };
