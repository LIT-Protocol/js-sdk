import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

export async function main() {
  // ==================== Test Logic ====================
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
  });
  await litNodeClient.connect();
  let nonce = litNodeClient.getLatestBlockhash();

  if (!nonce) {
    return fail('Block hash is undefined from the network handshake');
  }

  // ==================== Success ====================

  return success(
    'Can create an authSig with the latest blockhash as its nonce'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
