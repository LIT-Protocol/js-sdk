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
  // Message to sign
  const message = 'Hello world';
  const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

  // eth_sign parameters
  // DATA, 20 Bytes - address
  // DATA, N Bytes - message to sign
  // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sign
  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_sign',
      params: [globalThis.LitCI.PKP_INFO.ethAddress, hexMsg],
    },
  });

  const recoveredAddr = ethers.utils.verifyMessage(message, signature);

  // ==================== Post-Validation ====================
  if (signature.length !== 132) {
    return fail('signature should be 132 characters long');
  }

  if (recoveredAddr !== globalThis.LitCI.PKP_INFO.ethAddress) {
    return fail(
      `recoveredAddr should be ${LITCONFIG.PKP_ETH_ADDRESS} but got ${recoveredAddr}`
    );
  }

  // ==================== Success ====================
  return success('PKPEthersWallet should be able to eth_sign');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
