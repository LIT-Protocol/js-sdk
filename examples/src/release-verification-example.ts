/**
 * Release Verification Example
 *
 * This example demonstrates how to use the new release verification feature
 * in the Lit Protocol SDK. This feature ensures that Lit nodes are running
 * verified releases that are registered on-chain.
 *
 * The release verification process:
 * 1. Extracts the release ID from the node attestation
 * 2. Verifies the release ID format and subnet ID
 * 3. Queries the on-chain release register contract through the network module
 * 4. Verifies the release is active and matches the expected environment
 *
 * Architecture:
 * - orchestrateHandshake() receives the network module and release config
 * - Network module (naga-dev.module.ts) provides the release verification function
 * - Crypto package performs only cryptographic verification and calls the provided function
 *
 * Usage: bun run examples/src/release-verification-example.ts
 */

import { createLitClient } from '@lit-protocol/lit-client';
import { ReleaseVerificationConfig } from '@lit-protocol/crypto';

async function main() {
  console.log('🔐 Starting Release Verification Example...\n');

  try {
    // Define release verification configuration
    // This would typically come from your application's config
    const releaseVerificationConfig: ReleaseVerificationConfig = {
      // RPC URL for the blockchain where the release register contract is deployed
      rpcUrl: 'https://chain-rpc.litprotocol.com/http',

      // Address of the release register contract
      // This address would be provided by the Lit Protocol team
      releaseRegisterContractAddress:
        '0x1234567890123456789012345678901234567890',

      // Subnet ID that nodes should be running on
      subnetId: 'test', // or 'prod' for production

      // Environment: 0 = test, 1 = prod
      environment: 0,
    };

    console.log('🔧 Release verification config:', releaseVerificationConfig);

    // Import the network configuration
    const { nagaDev } = await import('@lit-protocol/networks');

    // Initialize Lit client with release verification enabled
    console.log('📱 Initializing Lit client...');
    const litClient = await createLitClient({
      network: nagaDev,

      // Note: Release verification is now handled at the network module level
      // The naga-dev module provides the verifyReleaseId function
      // This gets called during handshake when attestation is enabled
    });

    console.log('✅ Lit client initialized successfully!');

    // The release verification happens automatically during the handshake process
    // when attestation checking is enabled and release verification config is provided
    // The flow is:
    // 1. orchestrateHandshake receives releaseVerificationConfig and networkModule
    // 2. checkSevSnpAttestation calls networkModule.getVerifyReleaseId()
    // 3. Network module handles contract interaction and verification

    console.log(
      '🔍 Release verification is integrated into the network module'
    );
    console.log(
      '💡 Contract verification is handled by the chain-aware network layer'
    );

    console.log('✅ Example completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
      });
    }

    process.exit(1);
  }
}

// Additional example: Manual release verification using network module
async function manualReleaseVerificationExample() {
  console.log('\n🔬 Manual Release Verification Example...\n');

  // Example of manually calling the release verification function from the network module
  const { nagaDev } = await import('@lit-protocol/networks');

  // Get the release verification function from the network module
  const verifyReleaseId = nagaDev.getVerifyReleaseId();

  // Mock attestation data (in reality this comes from nodes)
  const mockAttestation = {
    noonce: 'base64-encoded-challenge',
    data: {
      RELEASE_ID: Buffer.from(
        'test-subnet-release-id-64-chars-long-unique-identifier-123',
        'utf8'
      ).toString('base64'),
      EXTERNAL_ADDR: Buffer.from('192.168.1.1:7470', 'utf8').toString('base64'),
    },
    signatures: ['base64-signature'],
    report: 'base64-report',
  };

  const releaseConfig: ReleaseVerificationConfig = {
    rpcUrl: 'https://chain-rpc.litprotocol.com/http',
    releaseRegisterContractAddress:
      '0x1234567890123456789012345678901234567890',
    subnetId: 'test',
    environment: 0,
  };

  try {
    // This would verify the release ID against the on-chain contract
    await verifyReleaseId(mockAttestation as any, releaseConfig);

    console.log('✅ Manual release verification passed!');
  } catch (error) {
    console.log(
      '❌ Manual release verification failed (expected with mock data):',
      (error as Error).message
    );
  }
}

// Run the examples
main()
  .then(() => manualReleaseVerificationExample())
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
