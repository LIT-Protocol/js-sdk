import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { ethers } from 'ethers';

const DATA_TO_SIGN = ethers.utils.arrayify(
  ethers.utils.keccak256([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
);

export async function main() {
  // ==================== Test Logic ====================

  const sig = await client.pkpSign({
    toSign: DATA_TO_SIGN,
    pubKey: LITCONFIG.PKP_PUBKEY,
    authMethod: [],
    authSig: LITCONFIG.CONTROLLER_AUTHSIG,
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

  if (recoveredAddr !== LITCONFIG.PKP_ETH_ADDRESS) {
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
