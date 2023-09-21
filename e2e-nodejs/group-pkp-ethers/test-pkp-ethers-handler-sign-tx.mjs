import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';

export async function main() {
  // ==================== Setup ====================
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.CHRONICLE_RPC,
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
  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_signTransaction',
      params: [tx],
    },
  });

  // ==================== Post-Validation ====================
  if (signature.length !== 132) {
    return fail('signature should be 132 characters long');
  }

  // ==================== Success ====================
  return success('PKPEthersWallet should be able to sign tx');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
