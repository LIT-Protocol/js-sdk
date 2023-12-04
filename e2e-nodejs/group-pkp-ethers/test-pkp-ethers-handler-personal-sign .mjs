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
  const message = 'Free the web';
  const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

  // personal_sign parameters
  // DATA, N Bytes - message to sign.
  // DATA, 20 Bytes - address
  // Reference: https://metamask.github.io/api-playground/api-documentation/#personal_sign
  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'personal_sign',
      params: [hexMsg, globalThis.LitCI.PKP_INFO.ethAddress],
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
  return success('PKPEthersWallet should be able to personal_sign');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
