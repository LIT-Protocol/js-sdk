import { createLitStatusClient } from '@lit-protocol/lit-status-sdk';
import { DatilHealthManager } from './DatilHealthManager';

// Fix for Node.js crypto in ESM
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

// Configuration
const NETWORK = process.env.NETWORK!;
const PRODUCT = 'js-sdk/datil';

async function runHealthCheck() {
  if (!NETWORK) {
    throw new Error('❌ NETWORK is not set');
  }

  const statusClient = createLitStatusClient({
    url: process.env.LIT_STATUS_BACKEND_URL,
    apiKey: process.env.LIT_STATUS_WRITE_KEY,
  });

  const txs = await statusClient.getOrRegisterFunctions({
    network: NETWORK,
    product: PRODUCT,
    functions: [
      'handshake',
      'pkpSign',
      'signSessionKey',
      'executeJs',
      'decrypt',
    ] as const,
  });

  const healthManager = new DatilHealthManager();
  await healthManager.init();

  // (test) /web/handshake
  console.log('🔄 Running handshake test');
  await statusClient.executeAndLog(
    txs.handshake.id,
    healthManager.handshakeTest
  );

  // after handshake, we can create a person to test
  await healthManager.initPerson();

  // (test) /web/pkp/sign
  console.log('🔄 Running pkpSign test');
  await statusClient.executeAndLog(txs.pkpSign.id, healthManager.pkpSignTest);

  // (test) /web/sign_session_key
  console.log('🔄 Running signSessionKey test');
  await statusClient.executeAndLog(
    txs.signSessionKey.id,
    healthManager.signSessionKeyTest
  );

  // (test) /web/execute
  console.log('🔄 Running executeJs test');
  await statusClient.executeAndLog(
    txs.executeJs.id,
    healthManager.executeJsTest
  );

  // (test) /web/encryption/sign
  console.log('🔄 Running decryptTest test');
  await statusClient.executeAndLog(txs.decrypt.id, healthManager.decryptTest);
}

(async () => {
  try {
    await runHealthCheck();
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
})();
