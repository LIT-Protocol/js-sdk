import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPSuiWallet } from '@lit-protocol/pkp-sui';

import {
  JsonRpcProvider,
  devnetConnection,
  TransactionBlock,
} from '@mysten/sui.js';

// NOTE: You can check your tx using https://suiexplorer.com/?network=devnet
export async function main() {
  // ==================== Setup ====================
  const provider = new JsonRpcProvider(devnetConnection);

  const suiWallet = new PKPSuiWallet(
    {
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
    },
    provider
  );

  await suiWallet.init();

  const pkpSuiAddress = await suiWallet.getAddress();
  const balance = await provider.getBalance({
    owner: pkpSuiAddress,
  });

  if (balance.totalBalance <= 0) {
    try {
      const response = await fetch('https://faucet.devnet.sui.io/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FixedAmountRequest: { recipient: pkpSuiAddress }, // Replace with your SUI address
        }),
      });

      if (!response.ok) throw Error(response.statusText);

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // ==================== Test Logic ====================
  const tx = new TransactionBlock();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000)]);
  tx.transferObjects([coin], tx.pure(pkpSuiAddress));

  // *************************************************
  // *                    REAL TX                    *
  // *************************************************
  if (
    process.env.REAL_TX === 'true' ??
    LITCONFIG.test.sendRealTxThatCostsMoney
  ) {
    const transferTx = await suiWallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });

    console.log('transferTx', transferTx);

    // ==================== Post-Validation ====================
    if (!transferTx.digest) {
      return fail('transferTx should have digest');
    }

    // ==================== Success ====================

    return success(
      `PKPSuiWallet should be able to send tx https://suiexplorer.com/txblock/${transferTx.digest}?network=devnet`
    );
  }

  // *************************************************
  // *                    MOCK TX                    *
  // *************************************************
  else {
    const transferTx = await suiWallet.dryRunTransactionBlock({
      transactionBlock: tx,
    });

    // ==================== Post-Validation ====================
    if (!suiWallet.litNodeClientReady) {
      return fail('litNodeClient should be ready');
    }

    if (!transferTx.effects.status.status === 'success') {
      return fail('transferTx should be success');
    }

    return success(`PKPSuiWallet should be able to send tx(❗️DRY-RUN)`);
  }
}

await testThis({ name: path.basename(import.meta.url), fn: main });
