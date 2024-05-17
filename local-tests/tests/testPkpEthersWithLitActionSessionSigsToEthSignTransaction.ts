import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToEthSignTransaction
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToEthSignTransaction
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToEthSignTransaction
 */
export const testPkpEthersWithLitActionSessionSigsToEthSignTransaction = async (
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

    // eth_sendTransaction parameters
    // Transaction - Object
    // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sendTransaction
    // A serialized form of the whole transaction
    const rawSignedTx = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_signTransaction',
        params: [tx],
      },
    });

    const parsedTransaction = ethers.utils.parseTransaction(rawSignedTx);

    const signature = ethers.utils.joinSignature({
      r: parsedTransaction.r,
      s: parsedTransaction.s,
      v: parsedTransaction.v,
    });

    const rawTx = {
      nonce: parsedTransaction.nonce,
      gasPrice: parsedTransaction.gasPrice,
      gasLimit: parsedTransaction.gasLimit,
      to: parsedTransaction.to,
      value: parsedTransaction.value,
      data: parsedTransaction.data,
      chainId: parsedTransaction.chainId, // Include chainId if the transaction is EIP-155
    };

    const txHash = ethers.utils.keccak256(
      ethers.utils.serializeTransaction(rawTx)
    );

    const { v, r, s } = parsedTransaction;

    const recoveredAddress = ethers.utils.recoverAddress(txHash, { r, s, v });

    // ==================== Post-Validation ====================
    if (!parsedTransaction) {
      throw new Error('❌ parsedTransaction should not be null');
    }

    if (signature.length !== 132) {
      throw new Error(
        `❌ signature should be 132 characters long, got ${signature.length}`
      );
    }

    if (recoveredAddress.toLowerCase() !== alice.pkp.ethAddress.toLowerCase()) {
      throw new Error(
        `❌ recoveredAddres should be ${alice.pkp.ethAddress}, got ${recoveredAddress}`
      );
    }
  } catch (e) {
    if (e.message.includes('insufficient FPE funds')) {
      console.log(
        `🧪 PKPEthersWallet should be able to send tx (insufficient FPE funds ❗️)`
      );
    } else {
      throw new Error(`❌ Error: ${e.toString()}`);
    }
  }
};
