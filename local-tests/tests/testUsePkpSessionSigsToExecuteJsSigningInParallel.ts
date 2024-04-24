import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigningInParallel
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigningInParallel
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigningInParallel
 */
export const testUsePkpSessionSigsToExecuteJsSigningInParallel = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  
  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  const fn = async (index: number) => {
    log(`Index: ${index}`);

    return await devEnv.litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: alice.authMethodOwnedPkp.publicKey,
      },
    });
  };

  const res = await Promise.all([fn(1), fn(2), fn(3)]);
  log('res:', res);

  // -- Expected output:
  // [
  //   {
  //     claims: {},
  //     signatures: {
  //       sig: {
  //         r: "d5bc8b53b9f69604c2dfb2d1d3e6c8b7e01a225346055ee798f5f67fe542a05a",
  //         s: "0153071ac4c7f9b08330361575b109dec07d1c335edeecd85db47398795a00d0",
  //         recid: 0,
  //         signature: "0xd5bc8b53b9f69604c2dfb2d1d3e6c8b7e01a225346055ee798f5f67fe542a05a0153071ac4c7f9b08330361575b109dec07d1c335edeecd85db47398795a00d01b",
  //         publicKey: "0489782A60B39C758DD8405965DC83DE5F1DB9572861EBAB6064090223C3B7F60DD71C6E673D81550E127BE18497BEA8C349E3B91C8170AD572AD0572009797EA5",
  //         dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  //       },
  //     },
  //     decryptions: [],
  //     response: undefined,
  //     logs: "",
  //   }, {
  //     claims: {},
  //     signatures: {
  //       sig: {
  //         r: "d2ad9086e810a5fd9b49dc4c2a0e7e2cf417dd79f8e75cc5f7b7b21d1b7ae9bc",
  //         s: "5e28b3321e73bab4177f6a69fec924f9daec294cf89a9a4d9c1a8fad18810bbd",
  //         recid: 1,
  //         signature: "0xd2ad9086e810a5fd9b49dc4c2a0e7e2cf417dd79f8e75cc5f7b7b21d1b7ae9bc5e28b3321e73bab4177f6a69fec924f9daec294cf89a9a4d9c1a8fad18810bbd1c",
  //         publicKey: "0489782A60B39C758DD8405965DC83DE5F1DB9572861EBAB6064090223C3B7F60DD71C6E673D81550E127BE18497BEA8C349E3B91C8170AD572AD0572009797EA5",
  //         dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  //       },
  //     },
  //     decryptions: [],
  //     response: undefined,
  //     logs: "",
  //   }, {
  //     claims: {},
  //     signatures: {
  //       sig: {
  //         r: "50f87167ba2c8a92e78c95f34e2683a23c372fcc6d104ef9f4d9050d5e1621f3",
  //         s: "443f5895668e8df6b5d6097a3e9f363923dc2cb83a4734b79359c8213f220fa9",
  //         recid: 0,
  //         signature: "0x50f87167ba2c8a92e78c95f34e2683a23c372fcc6d104ef9f4d9050d5e1621f3443f5895668e8df6b5d6097a3e9f363923dc2cb83a4734b79359c8213f220fa91b",
  //         publicKey: "0489782A60B39C758DD8405965DC83DE5F1DB9572861EBAB6064090223C3B7F60DD71C6E673D81550E127BE18497BEA8C349E3B91C8170AD572AD0572009797EA5",
  //         dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  //       },
  //     },
  //     decryptions: [],
  //     response: undefined,
  //     logs: "",
  //   }
  // ]

  // -- assertions
  res.forEach((r) => {
    if (!r.signatures.sig.r) {
      throw new Error(`Expected "r" in res.signatures.sig`);
    }
    if (!r.signatures.sig.s) {
      throw new Error(`Expected "s" in res.signatures.sig`);
    }

    if (!r.signatures.sig.dataSigned) {
      throw new Error(`Expected "dataSigned" in res.signatures.sig`);
    }

    if (!r.signatures.sig.publicKey) {
      throw new Error(`Expected "publicKey" in res.signatures.sig`);
    }

    // -- signatures.sig.signature must start with 0x
    if (!r.signatures.sig.signature.startsWith('0x')) {
      throw new Error(`Expected "signature" to start with 0x`);
    }

    // -- signatures.sig.recid must be parseable as a number
    if (isNaN(r.signatures.sig.recid)) {
      throw new Error(`Expected "recid" to be parseable as a number`);
    }
  });

  log('✅ testUsePkpSessionSigsToExecuteJsSigningInParallel');
};
