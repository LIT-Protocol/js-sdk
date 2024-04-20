// import { LitContracts } from '@lit-protocol/contracts-sdk';
// import { log } from '@lit-protocol/misc';
// import {
//   ClaimRequest,
//   ClaimResult,
//   ClientClaimProcessor,
// } from '@lit-protocol/types';
import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny';
import { log } from '@lit-protocol/misc';

/**
 * ## Scenario:
 * Testing the capability to claim keys using EOA (Externally Owned Account) session sigs. This test ensures that keys can be claimed correctly.
 *
 * - Given: EOA sessionSigs are properly generated for the environment.
 * - When: These sessionSigs are used to execute JS code within Lit Action.
 * - And: The Lit Action JS code attempts to claim a key using the provided sessionSigs.
 * - Then: The claim operation should successfully return signatures, derived key IDs, and validate the existence and structure of claimed results.
 *
 * - Note: The key claiming process involves multiple nodes within the Lit network verifying the sessionSigs and collaboratively signing the claim, which results in the generation of a new key pair if successful.
 *
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseEoaSessionSigsToExecuteJsClaimKeys
 * ✅ NETWORK=manzano yarn test:local --filter=testUseEoaSessionSigsToExecuteJsClaimKeys
 * ✅ NETWORK=localchain yarn test:local --filter=testUseEoaSessionSigsToExecuteJsClaimKeys
 */
export const testUseEoaSessionSigsToExecuteJsClaimKeys = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  devEnv.setExecuteJsVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
    code: `(async () => {
      Lit.Actions.claimKey({keyId: "foo"});
    })();`,
  });

  console.log('res:', res);

  // Expected output:
  // {
  //   claims: {
  //     foo: {
  //       signatures: [
  //         {
  //           r: "0x31e5dcf6eed3619aa6ff68d0c8f7a4bcf082acc2f12c3d5bcae9b8bbaf883c07",
  //           s: "0x405f671d1c659022105775b18afe805e01eaa1d0799c6b92887baef77dc023f5",
  //           v: 27,
  //         }, {
  //           r: "0xf2e9fe653d9155bd93feb7fe122c07a81769076fe44567c3ea93bb828f87146e",
  //           s: "0x01adf2b2780511f70b0b037360ff4b0c2b8d04657a689af780180bed9e6ea3c5",
  //           v: 27,
  //         }, {
  //           r: "0xfe1dcacd79f53b42b24dae75521f01315f34bbc492233e26083995c82218a3ff",
  //           s: "0x0b708b11704d986b50bce9f648bb5d40e8b9ad87f3a337a213999c7751dc1c0c",
  //           v: 27,
  //         }
  //       ],
  //       derivedKeyId: "22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0",
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

  // const claimRequest: ClaimRequest<ClientClaimProcessor> = {
  //   authMethod: devEnv.bobsWalletAuthMethod,
  //   signer: devEnv.hotWallet,
  //   mintCallback: async (claimRes: ClaimResult<ClientClaimProcessor>) => {
  //     console.log('claimRes:', claimRes);

  //     const litContracts = await devEnv.getContractsClient(claimRes.signer);
  //     const pkpInfo = await litContracts.pkpNftContractUtils.write.claimAndMint(
  //       `0x${claimRes.derivedKeyId}`,
  //       claimRes.signatures
  //     );

  //     return pkpInfo.tokenId;
  //   },
  // };

  // const claimRes = await devEnv.litNodeClient.claimKeyId(claimRequest);

  // console.log('claimRes:', claimRes);

  // Expected output:
  // {
  //   signatures: [
  //     {
  //       r: "0xf73ec73f2dd7858d9b463598420169cf153f8cd409c82af606b3832ff82f8774",
  //       s: "0x0de6ab4437749fdf1e6239a8d13af516ac9a0744fc0725f9897a880151799fde",
  //       v: 28,
  //     }, {
  //       r: "0x65ec2ac206c4d18aaf12d6d1f17826543c1f329657214cea66c509fcdec8d633",
  //       s: "0x710e2efb2c61f9ae504721d7bea0b8d1d3c519167e48e4d67c77bf61dfeca735",
  //       v: 28,
  //     }, {
  //       r: "0xe51bd0670463cb5b5e9994870362b3eaa747cb5732e5c666ccf25495fe9aaa54",
  //       s: "0x1b49aed6d46833c9b9ee0fa13a4009c533309dafdfd51dd30165f2556b6cdcf1",
  //       v: 27,
  //     }, {
  //       r: "0x4278d3f7f2eb38801da5940858be54527e42ee11b25d7b239cb491139c00765d",
  //       s: "0x13dac60eaa90a548a4c99f1e09ac24e07cb1ef7447e55d3c82cf2ea6d69ec190",
  //       v: 27,
  //     }, {
  //       r: "0xb18158eccd4b099d0cfae4c2f987843cbaf039ce50164410fe4f529e6dc2bb6a",
  //       s: "0x284d9d5326deeb3d10e2c1d81ed1a7d6fca584c46ad9606a4dad9f12d81874ab",
  //       v: 27,
  //     }, {
  //       r: "0x28ad76574d39d646948642d05f599a982a1dd0776e2e36138315f5fb2c03666e",
  //       s: "0x2a125a028df39b9230f5d866383fcda0107cc7ee2f42fa1f323d41b34f67273a",
  //       v: 27,
  //     }, {
  //       r: "0xb7ab5120aeffeaee6e8d6ab1456d6823a15fae7e5a70b88d2556dc85450486cf",
  //       s: "0x6e1e9ac479066d95d62a6cd86f0cb3db92e07367acf43873fb5a7b8ad558a09d",
  //       v: 28,
  //     }
  //   ],
  //   claimedKeyId: "4825e3caf11a273792ad0405524820410cd15d6323ae4621537f0a89c1322a74",
  //   pubkey: "049528b98ac4829b5eaf8f8e6addaa9c12e94e83c4d17baf8f86554c111f2ac6d774f483fca03ad06b268059f7c8bcf64c7fb93689e153dc2fed79dada7b289195",
  //   mintTx: "0x0000000000000000000000000000000000000000000000000000000000000000",
  // }

  // assertions
  // if (!claimRes.claimedKeyId) {
  //   throw new Error(`Expected "claimedKeyId" in claimRes`);
  // }
  // if (!claimRes.pubkey) {
  //   throw new Error(`Expected "pubkey" in claimRes`);
  // }
  // if (!claimRes.mintTx) {
  //   throw new Error(`Expected "mintTx" in claimRes`);
  // }

  // claimRes.signatures.forEach((sig: any) => {
  //   if (!sig.r) {
  //     throw new Error(`Expected "r" in sig`);
  //   }
  //   if (!sig.s) {
  //     throw new Error(`Expected "s" in sig`);
  //   }
  //   if (!sig.v) {
  //     throw new Error(`Expected "v" in sig`);
  //   }
  // });

  log('✅ testUseEoaSessionSigsToExecuteJsClaimKeys');
};
