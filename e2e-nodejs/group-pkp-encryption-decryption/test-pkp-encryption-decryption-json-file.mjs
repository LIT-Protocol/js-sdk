import path from 'path';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Setup ====================
  const chain = 'ethereum';
  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '0',
      },
    },
  ];
  const message = 'Hello world';
  const blob = new Blob([message], { type: 'text/plain' });
  const blobArray = new Uint8Array(await blob.arrayBuffer());

  // ==================== Test Logic ====================
  const encryptedJsonStr = await LitJsSdk.encryptToJson({
    accessControlConditions,
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    chain,
    file: blob,
    litNodeClient: client,
  });

  const decryptedFile = await LitJsSdk.decryptFromJson({
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    parsedJsonData: JSON.parse(encryptedJsonStr),
    litNodeClient: client,
  });

  // ==================== Post-Validation ====================
  if (blobArray.length !== decryptedFile.length) {
    return fail(
      `decrypted file should match the original file but received ${decryptedFile}`
    );
  }
  for (let i = 0; i < blobArray.length; i++) {
    if (blobArray[i] !== decryptedFile[i]) {
      return fail(`decrypted file should match the original file`);
    }
  }

  // ==================== Success ====================
  return success('File was encrypted and then decrypted successfully');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
