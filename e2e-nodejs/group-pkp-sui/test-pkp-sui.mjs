import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPSuiWallet } from '@lit-protocol/pkp-sui';

import { JsonRpcProvider, devnetConnection } from '@mysten/sui.js';

// NOTE: You can check your tx using https://suiexplorer.com/?network=devnet
export async function main() {
  // ==================== Setup ====================
  const provider = new JsonRpcProvider(devnetConnection);

  const suiWallet = new PKPSuiWallet(
    {
      controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
      pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    },
    provider
  );

  await suiWallet.init();

  // ==================== Test Logic ====================
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

  const newBalance = await provider.getBalance({
    owner: pkpSuiAddress,
  });

  // ==================== Post-Validation ====================
  if (!suiWallet.litNodeClientReady) {
    return fail('litNodeClient should be ready');
  }

  if (pkpSuiAddress !== LITCONFIG.PKP_SUI_ADDRESS) {
    return fail(`Expected ${pkpSuiAddress} to be ${LITCONFIG.PKP_SUI_ADDRESS}`);
  }

  if (newBalance.totalBalance <= 0) {
    return fail(`balance should have totalBalance > 0`);
  }

  // ==================== Success ====================
  return success(
    `PKPSuiWallet should get address and balance ${newBalance.totalBalance} `
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
