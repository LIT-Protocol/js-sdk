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

  // ==================== Test Logic ====================
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
      chain,
      dataToEncrypt: message,
    },
    client
  );
  const decryptedMessage = await LitJsSdk.decryptToString(
    {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
      chain,
    },
    client
  );

  // ==================== Post-Validation ====================
  if (message !== decryptedMessage) {
    return fail(
      `decryptedMessage should be ${message} but received ${decryptedMessage}`
    );
  }

  // ==================== Success ====================
  return success('Message was encrypted and then decrypted successfully');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
