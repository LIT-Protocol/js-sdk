import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

export async function main() {
  // ========== PKP WALLET SETUP ===========
  const pkpWallet = new PKPEthersWallet({
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    rpc: LITCONFIG.CHRONICLE_RPC,
  });

  await pkpWallet.init();

  if (pkpWallet._isSigner !== true) {
    return fail('pkpWallet should be signer');
  }

  // ==================== LitContracts Setup ====================
  const contractClient = new LitContracts({
    signer: pkpWallet,
  });

  await contractClient.connect();

  // ==================== Test Logic ====================
  const mintCost = await contractClient.pkpNftContract.read.mintCost();

  // ==================== Post-Validation ====================
  if (mintCost === undefined || mintCost === null) {
    return fail('mintCost should not be empty');
  }

  // ==================== Success ====================
  return success('ContractsSDK should read mintCost with PKP');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
