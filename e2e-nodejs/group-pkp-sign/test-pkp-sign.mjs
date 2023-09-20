import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { ethers } from 'ethers';

const DATA_TO_SIGN = [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]; // hello world

export async function main() {
  // ==================== Test Logic ====================

  const sig = await client.pkpSign({
    toSign: DATA_TO_SIGN,
    pubKey: LITCONFIG.PKP_PUBKEY,
    authMethod: [],
    authSig: LITCONFIG.CONTROLLER_AUTHSIG,
  });

  const recoveredPk = ethers.utils.recoverPublicKey(
    '0x' + sig.dataSigned,
    sig.signature
  );

  const recoveredAddr = ethers.utils.computeAddress(recoveredPk);

  // ==================== Post-Validation ====================
  if (sig.r === undefined || sig.r === '' || sig.r === null) {
    return fail('sig.r should not be empty');
  }

  if (sig.s === undefined || sig.s === '' || sig.s === null) {
    return fail('sig.s should not be empty');
  }
  if (
    sig.signature === undefined ||
    sig.signature === '' ||
    sig.signature === null
  ) {
    return fail('sig.signature should not be empty');
  }
  if (
    sig.publicKey === undefined ||
    sig.publicKey === '' ||
    sig.publicKey === null
  ) {
    return fail('sig.publicKey should not be empty');
  }
  if (
    sig.dataSigned === undefined ||
    sig.dataSigned === '' ||
    sig.dataSigned === null
  ) {
    return fail('sig.dataSigned should not be empty');
  }

  if (
    sig.recid === undefined ||
    sig.recid === '' ||
    sig.recid === null ||
    typeof sig.recid !== 'number'
  ) {
    return fail('sig.recid should not be empty');
  }

  if (recoveredAddr !== LITCONFIG.PKP_ETH_ADDRESS) {
    return fail(
      `recovered address ${recoveredAddr} should be ${LITCONFIG.PKP_ETH_ADDRESS}`
    );
  }

  // ==================== Success ====================
  return success('PKP sign endppint should sign message');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
