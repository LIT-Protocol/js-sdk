import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';

import {
  SigningStargateClient,
  // StdFee,
  calculateFee,
  GasPrice,
  coins,
} from '@cosmjs/stargate';

// Note: You can check your TX using https://www.mintscan.io/
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

  const [pkpAccount] = await cosmosWallet.getAccounts();

  // ==================== Test Logic ====================
  const amount = coins(LITCONFIG.AMOUNT, LITCONFIG.DENOM);
  const defaultGasPrice = GasPrice.fromString(
    `${LITCONFIG.DEFAULT_GAS}${LITCONFIG.DENOM}`
  );
  const defaultSendFee = calculateFee(80_000, defaultGasPrice);

  const stargateClient = await SigningStargateClient.connectWithSigner(
    LITCONFIG.COSMOS_RPC,
    cosmosWallet
  );

  // ==================== Post-Validation ====================
  if (cosmosWallet.litNodeClientReady !== true) {
    return fail('litNodeClient should be ready');
  }

  if (
    process.env.REAL_TX === 'true' ??
    LITCONFIG.test.sendRealTxThatCostsMoney
  ) {
    let tx;

    try {
      tx = await stargateClient.sendTokens(
        pkpAccount.address,
        pkpAccount.address,
        amount,
        defaultSendFee,
        'Transaction'
      );
    } catch (e) {
      const _error = JSON.parse(JSON.stringify(e));

      if (_error.log.includes('insufficient funds')) {
        return success(
          `PKPCosmosWallet in theory should be able to send tx [❗️${e.log}]`
        );
      } else {
        return success(`PKPCosmosWallet should be able to send tx`);
      }
    }
  }

  // ==================== Success ====================
  return success('PKPCosmosWallet should be able to send tx (❗️DRY-RUN)');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
