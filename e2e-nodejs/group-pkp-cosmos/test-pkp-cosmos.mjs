import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';

export async function main() {
  // ==================== Setup ====================
  const cosmosWallet = new PKPCosmosWallet({
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
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

  if (!pkpAccount.address.includes('cosmos')) {
    return fail(`expecting account address to include "cosmos"`);
  }
  if (pkpAccount.algo != 'secp256k1') {
    return fail('algo does not match: ', 'secp256k1');
  }

  if (pkpAccount.pubkey.length !== 33) {
    return fail('pubkey buffer expected length is incorrect recieved: ', pkpAccount.pubkey.length, "expected", 33);
  }
  // ==================== Success ====================
  return success('PKPCosmosWallet should be able to getAccounts');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
