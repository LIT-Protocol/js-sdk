import { log } from '@lit-protocol/misc';
import {
  ClaimRequest,
  ClaimResult,
  ClientClaimProcessor,
} from '@lit-protocol/types';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  EthWalletProvider,
  LitAuthClient,
} from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testRelayer
 * ✅ NETWORK=manzano yarn test:local --filter=testRelayer
 * ✅ NETWORK=localchain yarn test:local --filter=testRelayer
 * ✅ NETWORK=datil-dev yarn test:local --filter=testRelayer
 */
export const testRelayer = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: 'test-api-key',
    },
    litNodeClient: devEnv.litNodeClient,
  });

  // -- test fetch pkps
  const ethWalletProvider = litAuthClient.initProvider<EthWalletProvider>(
    ProviderType.EthWallet
  );

  const pkps = await ethWalletProvider.fetchPKPsThroughRelayer(
    alice.authMethod
  );

  if (pkps.length <= 0) {
    throw new Error('No PKPs found');
  } else {
    console.log('✅ [testRelayer] /fetch-pkps-by-auth-method works');
  }

  // -- test claims
  const claimRequest: ClaimRequest<ClientClaimProcessor> = {
    authMethod: alice.authMethod,
    signer: alice.wallet,
  };

  const claimRes = await devEnv.litNodeClient.claimKeyId(claimRequest);

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
  if (!claimRes.claimedKeyId) {
    throw new Error(`Expected "claimedKeyId" in claimRes`);
  }
  if (!claimRes.pubkey) {
    throw new Error(`Expected "pubkey" in claimRes`);
  }
  if (!claimRes.mintTx) {
    throw new Error(`Expected "mintTx" in claimRes`);
  }

  claimRes.signatures.forEach((sig: any) => {
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

  log('✅ testRelayer');
};
