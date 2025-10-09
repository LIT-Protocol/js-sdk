/**
 * Naga Health Manager
 * 
 * This module implements health checks for Naga network endpoints.
 * It tests the core functionality of the Lit Protocol network by executing
 * a series of endpoint tests using a single test account.
 * 
 * Tested Endpoints:
 * 1. Handshake - Verifies basic node connectivity
 * 2. PKP Sign - Tests PKP signing functionality
 * 3. Sign Session Key - Tests session key signing (via PKP auth context creation)
 * 4. Execute JS - Tests Lit Actions execution
 * 5. Decrypt - Tests encryption and decryption flow
 * 
 * Usage:
 *   const manager = new NagaHealthManager(ctx);
 *   await manager.handshakeTest();
 *   await manager.pkpSignTest();
 *   // ... other tests
 */

import { initHealthCheck } from './health-init';
import { createAccBuilder } from '@lit-protocol/access-control-conditions';

type HealthCheckContext = Awaited<ReturnType<typeof initHealthCheck>>;

export class NagaHealthManager {
  private ctx: HealthCheckContext;

  constructor(ctx: HealthCheckContext) {
    this.ctx = ctx;
  }

  /**
   * Test 1: Handshake Test
   * 
   * Verifies basic connectivity to Lit nodes by checking if the client
   * is properly initialized and connected.
   * 
   * This is the most basic health check - if this fails, the network is down.
   */
  handshakeTest = async (): Promise<void> => {
    try {
      // Fetch current context which includes the latest handshake result
      const ctx = await this.ctx.litClient.getContext();

      if (!ctx?.handshakeResult) {
        throw new Error('Handshake result missing from client context');
      }

      const { serverKeys, connectedNodes, threshold } = ctx.handshakeResult;

      const numServers = serverKeys ? Object.keys(serverKeys).length : 0;
      const numConnected = connectedNodes ? connectedNodes.size : 0;

      if (numServers === 0) {
        throw new Error('No server keys received during handshake');
      }

      if (typeof threshold === 'number' && numConnected < threshold) {
        throw new Error(
          `Connected nodes (${numConnected}) below threshold (${threshold})`
        );
      }

      console.log('✅ Handshake test passed');
    } catch (e) {
      console.error('❌ Handshake test failed:', e);
      throw e;
    }
  };

  /**
   * Test 2: PKP Sign Test
   * 
   * Tests the PKP signing endpoint by signing a simple message.
   * This verifies that:
   * - The PKP is accessible
   * - The auth context is valid
   * - The signing endpoint is operational
   */
  pkpSignTest = async (): Promise<void> => {
    try {
      const testMessage = 'Hello from Naga health check!';
      
      const result = await this.ctx.litClient.chain.ethereum.pkpSign({
        authContext: this.ctx.aliceEoaAuthContext,
        pubKey: this.ctx.aliceViemAccountPkp.pubkey,
        toSign: testMessage,
      });

      if (!result.signature) {
        throw new Error('No signature returned from pkpSign');
      }

      console.log('✅ PKP Sign test passed');
    } catch (e) {
      console.error('❌ PKP Sign test failed:', e);
      throw e;
    }
  };

  /**
   * Test 3: Sign Session Key Test
   * 
   * Tests the session key signing endpoint by creating a PKP auth context.
   * This involves the signSessionKey endpoint which is critical for
   * establishing authenticated sessions with PKPs.
   */
  signSessionKeyTest = async (): Promise<void> => {
    try {
      // Creating a PKP auth context involves calling the signSessionKey endpoint
      const pkpAuthContext = await this.ctx.authManager.createPkpAuthContext({
        authData: this.ctx.aliceViemAccountAuthData,
        pkpPublicKey: this.ctx.aliceViemAccountPkp.pubkey,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutes
        },
        litClient: this.ctx.litClient,
      });

      if (!pkpAuthContext) {
        throw new Error('Failed to create PKP auth context');
      }

      console.log('✅ Sign Session Key test passed');
    } catch (e) {
      console.error('❌ Sign Session Key test failed:', e);
      throw e;
    }
  };

  /**
   * Test 4: Execute JS Test
   * 
   * Tests Lit Actions execution by running a simple JavaScript code
   * that performs an ECDSA signature.
   * 
   * This verifies:
   * - Lit Actions runtime is operational
   * - Code execution environment is working
   * - Signing within actions works
   */
  executeJsTest = async (): Promise<void> => {
    try {
      const litActionCode = `
(async () => {
  const { sigName, toSign, publicKey } = jsParams;
  const { keccak256, arrayify } = ethers.utils;
  
  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);
  
  const sigShare = await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });  
})();`;

      const result = await this.ctx.litClient.executeJs({
        code: litActionCode,
        authContext: this.ctx.aliceEoaAuthContext,
        jsParams: {
          sigName: 'health-check-sig',
          toSign: 'Health check message',
          publicKey: this.ctx.aliceViemAccountPkp.pubkey,
        },
      });

      if (!result || !result.signatures) {
        throw new Error('No signatures returned from executeJs');
      }

      console.log('✅ Execute JS test passed');
    } catch (e) {
      console.error('❌ Execute JS test failed:', e);
      throw e;
    }
  };

  /**
   * Test 5: Decrypt Test
   * 
   * Tests the encryption and decryption flow:
   * 1. Encrypts data with access control conditions
   * 2. Decrypts the data using the same account
   * 
   * This verifies:
   * - Encryption endpoint works
   * - Access control condition evaluation works
   * - Decryption endpoint works
   * - End-to-end encryption flow is operational
   */
  decryptTest = async (): Promise<void> => {
    try {
      const testData = 'Secret health check data';
      
      // Create access control conditions for Alice's wallet
      const builder = createAccBuilder();
      const accs = builder
        .requireWalletOwnership(this.ctx.aliceViemAccount.address)
        .on('ethereum')
        .build();

      // Encrypt the data
      const encryptedData = await this.ctx.litClient.encrypt({
        dataToEncrypt: testData,
        unifiedAccessControlConditions: accs,
        chain: 'ethereum',
      });

      if (!encryptedData.ciphertext || !encryptedData.dataToEncryptHash) {
        throw new Error('Encryption failed - missing ciphertext or hash');
      }

      // Decrypt the data
      const decryptedData = await this.ctx.litClient.decrypt({
        data: encryptedData,
        unifiedAccessControlConditions: accs,
        chain: 'ethereum',
        authContext: this.ctx.aliceEoaAuthContext,
      });

      if (!decryptedData.convertedData) {
        throw new Error('Decryption failed - no converted data');
      }

      // Verify the decrypted data matches
      if (decryptedData.convertedData !== testData) {
        throw new Error(
          `Decryption mismatch: expected "${testData}", got "${decryptedData.convertedData}"`
        );
      }

      console.log('✅ Decrypt test passed');
    } catch (e) {
      console.error('❌ Decrypt test failed:', e);
      throw e;
    }
  };
}

