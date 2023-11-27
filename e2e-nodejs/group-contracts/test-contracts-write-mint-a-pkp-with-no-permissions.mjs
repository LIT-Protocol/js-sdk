import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';

export async function main() {
  // ========== Controller Setup ===========
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  const controllerWallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    provider
  );

  // ==================== LitContracts Setup ====================
  const contractClient = new LitContracts({
    signer: controllerWallet,
  });

  await contractClient.connect();

  // ==================== Test Logic ====================
  const mintCost = await contractClient.pkpNftContract.read.mintCost();

  // -- minting a PKP using a PKP
  const mintTx = await contractClient.pkpNftContract.write.mintNext(2, {
    value: mintCost,
  });

  const mintTxReceipt = await mintTx.wait();

  // ==================== Post-Validation ====================
  if (mintCost === undefined || mintCost === null) {
    return fail('mintCost should not be empty');
  }

  // ==================== Success ====================
  return success(`ContractsSDK mints a PKP ${mintTxReceipt.transactionHash}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
