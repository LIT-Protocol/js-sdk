import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny';

/**
 * ## Scenario:
 * Testing the capability to claim keys using PKP session sigs. This test ensures that multiple keys can be claimed correctly.
 *
 * - Given: PKP sessionSigs are properly generated for the environment.
 * - When: These sessionSigs are used to execute JS code within Lit Action.
 * - And: The Lit Action JS code attempts to claim a key using the provided sessionSigs.
 * - Then: The claim operation should successfully return signatures, derived key IDs, and validate the existence and structure of claimed results.
 * *
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToExecuteJsClaimMultipleKeys
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToExecuteJsClaimMultipleKeys
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToExecuteJsClaimMultipleKeys
 */
export const testUsePkpSessionSigsToExecuteJsClaimMultipleKeys = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  devEnv.setExecuteJsVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    code: `(async () => {
      Lit.Actions.claimKey({keyId: "foo"});
      Lit.Actions.claimKey({keyId: "bar"});
    })();`,
  });

  // Expected output:
  // {
  //   claims: {
  //     bar: {
  //       signatures: [
  //         {
  //           r: "0x7ee7b329462acb08d1dd1d3fba17f8ac76263454e2582bc0d5f36c74f4aaac68",
  //           s: "0x1b20cd8ac8ab1efdcf500d7ff100229deee42ce44b6420619c609a694af33aad",
  //           v: 28,
  //         }, {
  //           r: "0x2bd6db983d5f5dd239b4fe27b087acf0547e49a69e6c62b8e1435d3890a5d4c5",
  //           s: "0x15a8a80b2a5bf16e9c155bfe9d5da1109847334b8a0a74a9ce277cdfc6b05fdd",
  //           v: 28,
  //         }, {
  //           r: "0x9294c656bdb6764fca46e431dc4b15c653e6347a41eb657d23145d93a1fa19d0",
  //           s: "0x7afe0be470e9393dda32c356a9a262f7794a59f8e75e551bdb7634beb3a0a114",
  //           v: 28,
  //         }
  //       ],
  //       derivedKeyId: "0961c21c8a46c4992003a7b7af9449c15f772a269633ae3242f6ed146708a819",
  //     },
  //     foo: {
  //       signatures: [
  //         {
  //           r: "0xc39c073d69c8878bf06c813af9d090b41e15319abc9677e20f07085c96451e98",
  //           s: "0x6ef6a3d4b365119f4a9613a89fd57af01c4a350a20222935581be306b4c8aba4",
  //           v: 27,
  //         }, {
  //           r: "0xa2473911de4b252349cadde340de121ce3195929cd1ebb4c717f3d9d65c67988",
  //           s: "0x597a45d27a3100fa0bb144644f6bdec62c8a827f35427814cea64f8d3d9a9fa8",
  //           v: 27,
  //         }, {
  //           r: "0x97c393fb1f733b946bfaafdbb13c46192f4cf5ad2b2a9fcf9ff0355a7a2dc5fa",
  //           s: "0x152737c1b0aba904182bb5ac70e3a99ba4301b631df55bd21b91d705eb5ef4d2",
  //           v: 27,
  //         }
  //       ],
  //       derivedKeyId: "7698c828a5e4ae6dd6f98ae72fcb5a96bc83f53fa6a09c614e28ceab8198d5ca",
  //     },
  //   },
  //   signatures: {},
  //   decryptions: [],
  //   response: undefined,
  //   logs: "",
  // }

  // assertions
  if (!res.claims.foo) {
    throw new Error(`Expected "foo" in res.claims`);
  }
  if (!res.claims.foo.derivedKeyId) {
    throw new Error(`Expected "derivedKeyId" in res.claims.foo`);
  }

  if (!res.claims.foo.signatures) {
    throw new Error(`Expected "signatures" in res.claims.foo`);
  }

  res.claims.foo.signatures.forEach((sig: any) => {
    if (!sig.r) {
      throw new Error(`Expected "r" in sig`);
    }
    if (!sig.s) {
      throw new Error(`Expected "s" in sig`);
    }
    if (!sig.v) {
      throw new Error(`Expected "v" in sig`);
    }
  });
};
