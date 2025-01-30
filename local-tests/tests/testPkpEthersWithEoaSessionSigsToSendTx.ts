import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { getEoaAuthContext } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSendTx
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSendTx
 * ✅ NETWORK=custom yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSendTx
 */
export const testPkpEthersWithEoaSessionSigsToSendTx = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    authContext: { getSessionSigsProps: getEoaAuthContext(devEnv, alice) },
  });

  await devEnv.getFunds(alice.pkp.ethAddress);

  await pkpEthersWallet.init();

  // -- eth_sendTransaction parameters
  try {
    // Transaction to sign and send
    const from = alice.pkp.ethAddress;
    const to = alice.pkp.ethAddress;
    const gasLimit = ethers.BigNumber.from('21000');
    const value = ethers.BigNumber.from('0');
    const data = '0x';

    // pkp-ethers signer will automatically add missing fields (nonce, chainId, gasPrice, gasLimit)
    const tx = {
      from: from,
      to: to,
      gasLimit,
      value,
      data,
    };

    const txRes = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_sendTransaction',
        params: [tx],
      },
    });

    console.log('✅ txRes:', txRes);
  } catch (e) {
    if (e.message.includes('insufficient FPE funds')) {
      console.log(
        `🧪 PKPEthersWallet should be able to send tx (insufficient FPE funds ❗️)`
      );
    } else {
      throw new Error(`❌ Error: ${e.toString()}`);
    }
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
