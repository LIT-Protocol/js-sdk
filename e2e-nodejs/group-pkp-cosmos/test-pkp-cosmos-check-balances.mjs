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

// Note: You can check your TX using https://www.mintscan.io/
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

  const [pkpAccount] = await cosmosWallet.getAccounts();

  // ==================== Test Logic ====================

  const stargateClient = await SigningStargateClient.connectWithSigner(
    LITCONFIG.COSMOS_RPC,
    cosmosWallet
  );

  const balances = await stargateClient.getAllBalances(pkpAccount.address);

  // ==================== Post-Validation ====================
  if (cosmosWallet.litNodeClientReady !== true) {
    return fail('litNodeClient should be ready');
  }

  if (
    balances.length <= 0 ||
    balances[0].denom !== 'uatom' ||
    balances[0].amount <= 0
  ) {
    return fail(
      `Cosmos account should have balance. You might need to top up this account: ${pkpAccount.address}`
    );
  }

  // ==================== Success ====================
  return success(
    'PKPCosmosWallet should be able to get balances using Stargate'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
