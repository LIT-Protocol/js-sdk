import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';

async function getFundsFromPKPController(ethAddress) {
  // ========== Controller Setup ===========
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  const controllerWallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    provider
  );

  // get the fund
  console.log(
    'Controller Balance:',
    (await controllerWallet.getBalance()).toString()
  );

  // send some funds to the pkp
  const amount = '0.000001';

  const tx = await controllerWallet.sendTransaction({
    to: ethAddress,
    value: ethers.utils.parseEther(amount),
  });

  await tx.wait();

  const newBalance = (await controllerWallet.getBalance()).toString();

  console.log('New Controller Balance:', newBalance);

  if (newBalance <= 0) {
    console.log('Controller Balance is still 0');
    process.exit();
  }
  console.log(`Sent ${amount} ETH to ${LITCONFIG.PKP_ETH_ADDRESS}`);
}

export async function main() {
  // We no longer allow

  // ========== PKP WALLET SETUP ===========
  const pkpWallet = new PKPEthersWallet({
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    rpc: LITCONFIG.CHRONICLE_RPC,
  });

  await pkpWallet.init();

  const pkpBalance = parseFloat(await pkpWallet.getBalance());

  if (pkpBalance <= 0) {
    console.log(
      `PKP Balance is ${pkpBalance}. Getting funds from controller...`
    );
    const pkpAddress = await pkpWallet.getAddress();
    console.log('pkpAddress:', pkpAddress);
    await getFundsFromPKPController(pkpAddress);
    console.log('New PKP Balance:', (await pkpWallet.getBalance()).toString());
  }

  if (pkpWallet._isSigner !== true) {
    return fail('pkpWallet should be signer');
  }

  // ==================== LitContracts Setup ====================
  const contractClient = new LitContracts({
    signer: pkpWallet,
  });

  await contractClient.connect();

  // ==================== Test Logic ====================
  const mintCost = await contractClient.pkpNftContract.read.mintCost();

  // -- minting a PKP using a PKP
  const mintTx =
    await contractClient.pkpNftContract.write.populateTransaction.mintNext(2, {
      value: mintCost,
    });

  const signedMintTx = await pkpWallet.signTransaction(mintTx);

  const sentTx = await pkpWallet.sendTransaction(signedMintTx);

  // ==================== Post-Validation ====================
  if (mintCost === undefined || mintCost === null) {
    return fail('mintCost should not be empty');
  }

  // ==================== Success ====================
  return success(`ContractsSDK mint a PKP using PKP Ethers wallet
hash: ${sentTx.hash}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
