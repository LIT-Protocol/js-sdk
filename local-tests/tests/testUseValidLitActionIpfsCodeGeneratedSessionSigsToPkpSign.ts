import { ethers } from 'ethers';

import { log } from '@lit-protocol/misc';
import { getLitActionSessionSigsUsingIpfsId } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign
 * ❌ NETWORK=custom yarn test:local --filter=testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign
 *
 **/
export const testUseValidLitActionIpfsCodeGeneratedSessionSigsToPkpSign =
  async (devEnv: TinnyEnvironment) => {
    const alice = await devEnv.createRandomPerson();
    let litActionSessionSigs;

    try {
      litActionSessionSigs = await getLitActionSessionSigsUsingIpfsId(
        devEnv,
        alice
      );
    } catch (e: any) {
      console.log('❌ This error is NOT expected:', e);
      throw new Error(e);
    }

    const res = await devEnv.litNodeClient.pkpSign({
      toSign: alice.loveLetter,
      pubKey: alice.authMethodOwnedPkp.publicKey,
      sessionSigs: litActionSessionSigs,
    });
    devEnv.releasePrivateKeyFromUser(alice);
    console.log('✅ res:', res);

    // -- Expected output:
    // {
    //   r: "ab2cef959db920d56f001c3b05637ee49af4c4441f2867ea067c413594a4c87b",
    //   s: "4bf11e17b4bb618aa6ed75cbf0406e6babfd953c5b201da697077c5fbf5b542e",
    //   recid: 1,
    //   signature: "0xab2cef959db920d56f001c3b05637ee49af4c4441f2867ea067c413594a4c87b4bf11e17b4bb618aa6ed75cbf0406e6babfd953c5b201da697077c5fbf5b542e1c",
    //   publicKey: "04400AD53C2F8BA11EBC69F05D1076D5BEE4EAE668CD66BABADE2E0770F756FDEEFC2C1D20F9A698EA3FEC6E9C944FF9FAFC2DC339B8E9392AFB9CC8AE75C5E5EC",
    //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    // }

    // -- assertions
    // r, s, dataSigned, and public key should be present
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

    // signature must start with 0x
    if (!res.signature.startsWith('0x')) {
      throw new Error(`Expected "signature" to start with 0x`);
    }

    // recid must be parseable as a number
    if (isNaN(res.recid)) {
      throw new Error(`Expected "recid" to be parseable as a number`);
    }

    const signature = ethers.utils.joinSignature({
      r: '0x' + res.r,
      s: '0x' + res.s,
      recoveryParam: res.recid,
    });
    const recoveredPubKey = ethers.utils.recoverPublicKey(
      alice.loveLetter,
      signature
    );
    if (recoveredPubKey !== `0x${res.publicKey.toLowerCase()}`) {
      throw new Error(`Expected recovered public key to match res.publicKey`);
    }
    if (
      recoveredPubKey !==
      `0x${alice.authMethodOwnedPkp.publicKey.toLowerCase()}`
    ) {
      throw new Error(
        `Expected recovered public key to match alice.authMethodOwnedPkp.publicKey`
      );
    }

    log('✅ res:', res);
  };
