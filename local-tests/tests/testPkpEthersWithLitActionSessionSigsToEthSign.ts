import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { getLitActionAuthContext } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToEthSign
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToEthSign
 * ✅ NETWORK=custom yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToEthSign
 */
export const testPkpEthersWithLitActionSessionSigsToEthSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  console.log('devEnv.network:', devEnv.network);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    authContext: getLitActionAuthContext(devEnv, alice),
  });

  await pkpEthersWallet.init();

  // -- test eth_sign
  try {
    // Message to sign
    const message = 'Hello world';
    const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

    // DATA, 20 Bytes - address
    // DATA, N Bytes - message to sign
    // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sign
    const signature = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_sign',
        params: [alice.pkp.ethAddress, hexMsg],
      },
    });
    const recoveredAddr = ethers.utils.verifyMessage(message, signature);

    if (signature.length !== 132) {
      throw new Error('❌ signature should be 132 characters long');
    }

    if (recoveredAddr !== alice.pkp.ethAddress) {
      throw new Error(
        `❌ test eth_sign recoveredAddr should be ${alice.pkp.ethAddress} but got ${recoveredAddr}`
      );
    }

    console.log('✅ recoveredAddr:', recoveredAddr);
  } catch (e) {
    throw new Error('❌ Error: ' + e.message);
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
