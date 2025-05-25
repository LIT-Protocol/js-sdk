/**
 * Encrypt-Decrypt Flow Example
 *
 * This example demonstrates:
 * 1. Setting up access control conditions
 * 2. Encrypting data with those conditions
 * 3. Creating proper auth context for decryption
 * 4. Decrypting the data and verifying the result
 */

import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev } from '@lit-protocol/networks';
import type { EvmBasicAcc } from '@lit-protocol/access-control-conditions-schemas';
import { privateKeyToAccount } from 'viem/accounts';
import {
  ViemAccountAuthenticator,
  createAuthManager,
  storagePlugins,
} from '@lit-protocol/auth';

// Configuration constants
const TEST_MESSAGE = 'Hello, this is a secret message for encryption testing!';
const TEST_CHAIN = 'ethereum' as const;
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/**
 * Creates test access control conditions for Ethereum
 * Allows access if the user owns at least 0.00001 ETH
 */
function createTestAccessControlConditions(): EvmBasicAcc[] {
  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'yellowstone',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '1',
      },
    },
  ];
}

/**
 * Demonstrates the complete encrypt-decrypt functionality
 */
export async function encryptDecryptFlow(): Promise<void> {
  try {
    console.log('🚀 Starting complete encrypt-decrypt flow test...');

    // ========== SETUP PHASE ==========
    console.log('\n📡 Setting up LitClient and auth context...');

    // Create account from private key
    const myAccount = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    console.log(`   Account address: ${myAccount.address}`);

    // Initialize Lit client
    const litClient = await createLitClient({
      network: nagaDev,
    });
    console.log('✅ Lit client initialized successfully');

    // Create auth manager for session management
    const authManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'encrypt-decrypt-test',
        networkName: 'naga-dev',
        storagePath: './lit-auth-storage',
      }),
    });

    // Prepare test data
    const dataToEncrypt = new TextEncoder().encode(TEST_MESSAGE);
    const accessControlConditions = createTestAccessControlConditions();

    console.log('🔐 Test data prepared:');
    console.log(`   Message: "${TEST_MESSAGE}"`);
    console.log(`   Data size: ${dataToEncrypt.length} bytes`);
    console.log(`   Access conditions: Requires >= 0.00001 ETH`);

    // ========== ENCRYPTION PHASE ==========
    console.log('\n🔒 Starting encryption phase...');

    const encryptParams = {
      dataToEncrypt,
      accessControlConditions,
      chain: TEST_CHAIN,
    };

    const encryptResult = await litClient.encrypt(encryptParams);

    console.log('✅ Encryption completed successfully!');
    console.log(
      `   Ciphertext length: ${encryptResult.ciphertext.length} bytes`
    );
    console.log(`   Data hash: ${encryptResult.dataToEncryptHash}`);

    // ========== AUTH CONTEXT CREATION ==========
    console.log('\n🔑 Creating auth context for decryption...');

    // Create EOA auth context using the account
    const authData = await ViemAccountAuthenticator.authenticate(myAccount);
    console.log('✅ Auth data created');

    // const mintedPkpWithEoaAuth = await litClient.mintWithAuth({
    //   account: myAccount,
    //   authData: authData,
    //   scopes: ['sign-anything'],
    // });

    // Create EOA auth context for decryption
    const authContext = await authManager.createEoaAuthContext({
      authConfig: {
        domain: 'localhost',
        statement: 'Decrypt test data',
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
        resources: [
          {
            resource: '*',
            ability: 'access-control-condition-decryption',
          },
        ],
      },
      config: {
        account: myAccount,
      },
      litClient,
    });
    console.log('✅ EOA auth context created for decryption');

    // ========== DECRYPTION PHASE ==========
    console.log('\n🔓 Starting decryption phase...');

    const decryptParams = {
      ciphertext: encryptResult.ciphertext,
      dataToEncryptHash: encryptResult.dataToEncryptHash,
      accessControlConditions,
      authContext,
      chain: TEST_CHAIN,
    };

    const decryptResult = await litClient.decrypt(decryptParams);

    console.log('✅ Decryption completed successfully!');

    // ========== VERIFICATION PHASE ==========
    console.log('\n🔍 Verifying decrypted data...');

    const decryptedMessage = new TextDecoder().decode(
      decryptResult.decryptedData
    );
    console.log(`   Original message: "${TEST_MESSAGE}"`);
    console.log(`   Decrypted message: "${decryptedMessage}"`);

    if (decryptedMessage === TEST_MESSAGE) {
      console.log('✅ Verification successful! Messages match perfectly.');
    } else {
      console.log('❌ Verification failed! Messages do not match.');
      throw new Error('Decrypted message does not match original');
    }

    // ========== CLEANUP ==========
    console.log('\n🧹 Cleaning up...');
    await litClient.disconnect();
    console.log('✅ Cleanup completed');

    console.log(
      '\n🎯 Complete encrypt-decrypt flow test completed successfully!'
    );
    console.log('   ✓ Data encrypted with access control conditions');
    console.log('   ✓ Auth context created for secure decryption');
    console.log('   ✓ Data decrypted successfully');
    console.log('   ✓ Original and decrypted data verified to match');
  } catch (error) {
    console.error('❌ Encrypt-decrypt flow test failed:', error);

    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack trace: ${error.stack}`);
      }
    }

    throw error;
  }
  process.exit();
}
