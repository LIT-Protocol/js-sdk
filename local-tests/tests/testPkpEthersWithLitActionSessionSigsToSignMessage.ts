import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { getLitActionAuthContext } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToSignMessage
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToSignMessage
 * ✅ NETWORK=custom yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToSignMessage
 */
export const testPkpEthersWithLitActionSessionSigsToSignMessage = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    authContext: getLitActionAuthContext(devEnv, alice),
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
