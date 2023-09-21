import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { PKPClient } from '@lit-protocol/pkp-client';

export async function main() {
  // ==================== Setup ====================
  const pkpClient = new PKPClient({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpcs: {
      eth: LITCONFIG.CHRONICLE_RPC,
      cosmos: LITCONFIG.COSMOS_RPC,
    },
    cosmosAddressPrefix: 'cosmos',
  });

  await pkpClient.connect();

  // ==================== Test Logic ====================
  const PAYLOAD = {
    to: PKP_ETH_ADDRESS,
    value: 0,
    data: '0x',
  };

  const signature = await pkpClient.getEthWallet().signTransaction(PAYLOAD);

  // ==================== Post-Validation ====================

  if (signature.length !== 132) {
    return fail('signature should be defined');
  }

  // ==================== Success ====================
  return success('(Without RPC) PKPClient should sign tx using eth wallet');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
