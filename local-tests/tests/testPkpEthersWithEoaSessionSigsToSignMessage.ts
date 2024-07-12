import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignMessage
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignMessage
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignMessage
 */
export const testPkpEthersWithEoaSessionSigsToSignMessage = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    controllerSessionSigs: eoaSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- test signMessage
  try {
    const signature = await pkpEthersWallet.signMessage(alice.loveLetter);
    console.log('✅ signature:', signature);
  } catch (e) {
    throw new Error('❌ Error: ' + e.message);
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
