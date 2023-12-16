import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';

export async function main() {
  // ==================== Setup ====================
  const cayenneValidators = await LitContracts.getValidators('cayenne');
  const internalDevValidators = await LitContracts.getValidators('internalDev');

  // ==================== Post-Validation ====================
  for (const validator of cayenneValidators) {
    if (
      !validator.includes(':') ||
      (!validator.includes('http://') && !validator.includes('https://'))
    ) {
      return fail('validator should contain ":" and "http://" or "https://"');
    }
  }

  for (const validator of internalDevValidators) {
    if (
      !validator.includes(':') ||
      (!validator.includes('http://') && !validator.includes('https://'))
    ) {
      return fail('validator should contain ":" and "http://" or "https://"');
    }
  }

  // ==================== Success ====================
  return success('ContractsSDK should get validators');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
