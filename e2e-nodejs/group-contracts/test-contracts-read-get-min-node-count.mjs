import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';

export async function main() {
  // ==================== Setup ====================
  const cayenneMinNodeCount = await LitContracts.getMinNodeCount('cayenne');
  const internalMinNodeCount = await LitContracts.getMinNodeCount(
    'internalDev'
  );

  // ==================== Post-Validation ====================

  // both results should be parsable as a number and more than 0
  if (isNaN(cayenneMinNodeCount) || cayenneMinNodeCount <= 0) {
    return fail('cayenneMinNodeCount should be a number and more than 0');
  }

  if (isNaN(internalMinNodeCount) || internalMinNodeCount <= 0) {
    return fail('internalMinNodeCount should be a number and more than 0');
  }

  // ==================== Success ====================
  return success(
    `ContractsSDK should get minNodeCount: cayenne: ${cayenneMinNodeCount}, internalDev: ${internalMinNodeCount}`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
