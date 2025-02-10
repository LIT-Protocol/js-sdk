import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { getEoaAuthContext } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignMessage
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignMessage
 * ✅ NETWORK=custom yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignMessage
 */
export const testPkpEthersWithEoaSessionSigsToSignMessage = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    authContext: getEoaAuthContext(devEnv, alice),
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
