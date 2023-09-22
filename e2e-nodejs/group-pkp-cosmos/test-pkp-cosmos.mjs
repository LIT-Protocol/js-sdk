import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';

export async function main() {
  // ==================== Setup ====================
  const cosmosWallet = new PKPCosmosWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.COSMOS_RPC,
    // debug: true,
    addressPrefix: 'cosmos',
  });

  await cosmosWallet.init();

  // ==================== Test Logic ====================
  const [pkpAccount] = await cosmosWallet.getAccounts();

  // ==================== Post-Validation ====================
  if (cosmosWallet.litNodeClientReady !== true) {
    return fail('litNodeClient should be ready');
  }

  if (pkpAccount.address !== LITCONFIG.PKP_COSMOS_ADDRESS) {
    return fail(`Expecting PKP address to be ${LITCONFIG.PKP_COSMOS_ADDRESS}`);
  }

  // ==================== Success ====================
  return success('PKPCosmosWallet should be able to getAccounts');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
