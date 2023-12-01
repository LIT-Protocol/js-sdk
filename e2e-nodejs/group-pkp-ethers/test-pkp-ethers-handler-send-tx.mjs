import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Setup ====================
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network,
  });

  await pkpEthersWallet.init();

  // ==================== Test Logic ====================

  // Transaction to sign and send
  const from = LITCONFIG.PKP_ETH_ADDRESS;
  const to = LITCONFIG.PKP_ETH_ADDRESS;
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
  let txRes;

  try {
    txRes = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'eth_sendTransaction',
        params: [tx],
      },
    });
  } catch (e) {
    if (e.toString().includes('insufficient FPE funds')) {
      return success(
        `PKPEthersWallet should be able to send tx (insufficient FPE funds ❗️)`
      );
    }
    return fail(
      `PKPEthersWallet should be able to send tx unexpected error: ${e.toString()}`
    );
  }

  // ==================== Post-Validation ====================
  if (!txRes) {
    return fail('txRes should not be null');
  }

  // ==================== Success ====================
  return success('PKPEthersWallet should be able to send tx');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
