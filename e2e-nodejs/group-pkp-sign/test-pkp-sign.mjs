import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { ethers } from 'ethers';

const DATA_TO_SIGN = new Uint8Array(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
);

export async function main() {
  // ==================== Test Logic ====================

  const sig = await client.pkpSign({
    toSign: DATA_TO_SIGN,
    authMethod: [],
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network,
  });

  const recoveredPk = ethers.utils.recoverPublicKey(
    DATA_TO_SIGN,
    sig.signature
  );

  const recoveredAddr = ethers.utils.computeAddress(recoveredPk);

  // ==================== Post-Validation ====================

  ['r', 's', 'signature', 'publicKey', 'dataSigned', 'recid'].forEach((key) => {
    if (!sig[key]) {
      return fail(`sig.${key} is undefined, empty, or null`);
    }
  });

  if (recoveredAddr !== globalThis.LitCI.PKP_INFO.ethAddress) {
    return fail(
      `recovered address ${recoveredAddr} should be ${LITCONFIG.PKP_ETH_ADDRESS}`
    );
  }

  // ==================== Success ====================
  return success(
    `PKP sign endpoint should sign message. recoveredAddr: ${recoveredAddr}`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
