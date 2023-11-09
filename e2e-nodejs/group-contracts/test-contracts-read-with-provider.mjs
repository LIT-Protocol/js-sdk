import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';

export async function main() {
  // ========== PKP WALLET SETUP ===========
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  // ==================== LitContracts Setup ====================
  const contractClient = new LitContracts({
    provider,
  });

  await contractClient.connect();

  // ==================== Test Logic ====================
  const mintCost = await contractClient.pkpNftContract.read.mintCost();

  // ==================== Post-Validation ====================
  if (mintCost === undefined || mintCost === null) {
    return fail('mintCost should not be empty');
  }

  // ==================== Success ====================
  return success('ContractsSDK should read mintCost with provider');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
