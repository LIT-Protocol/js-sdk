import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';

import {
  SigningStargateClient,
  // StdFee,
  // calculateFee,
  // GasPrice,
  // coins,
} from '@cosmjs/stargate';

const TX_HASH =
  '6E7CA7AC2A30FAA852DB67E85284E7EE670E581CBFD06DE104AF00C2A1796A1B';

// Note: You can check your TX using https://www.mintscan.io/
export async function main() {
  // ==================== Setup ====================
  const cosmosWallet = new PKPCosmosWallet({
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: LITCONFIG.COSMOS_RPC,
    debug: true,
    addressPrefix: 'cosmos',
  });

  await cosmosWallet.init();

  // ==================== Test Logic ====================
  const stargateClient = await SigningStargateClient.connectWithSigner(
    LITCONFIG.COSMOS_RPC,
    cosmosWallet
  );

  console.log('stargateClient:', stargateClient);

  let tx;

  try {
    tx = await stargateClient.getTx(TX_HASH);
  } catch (e) {
    console.log('error:', e);
    process.exit();
  }

  // ==================== Post-Validation ====================

  if (!tx) {
    return fail('tx should exist');
  }

  if (cosmosWallet.litNodeClientReady !== true) {
    return fail('litNodeClient should be ready');
  }

  if (tx.hash !== TX_HASH) {
    return fail('tx hash should be', TX_HASH);
  }

  // ==================== Success ====================
  return success(
    'PKPCosmosWallet should be able to get balances using Stargate'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
