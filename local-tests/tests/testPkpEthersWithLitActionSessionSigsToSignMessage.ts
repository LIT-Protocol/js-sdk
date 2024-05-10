import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToSignMessage
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToSignMessage
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToSignMessage
 */
export const testPkpEthersWithLitActionSessionSigsToSignMessage = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    controllerSessionSigs: litActionSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- test signMessage
  try {
    const signature = await pkpEthersWallet.signMessage(alice.loveLetter);
    console.log('✅ signature:', signature);
  } catch (e) {
    throw new Error('❌ Error: ' + e.message);
  }
};
