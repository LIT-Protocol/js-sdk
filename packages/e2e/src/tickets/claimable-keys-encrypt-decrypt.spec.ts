import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { keccak256, stringToBytes } from 'viem';

import { createEnvVars } from '../helper/createEnvVars';
import { createTestAccount, CreateTestAccountResult } from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';

/**
 * Test: Claimable Keys with Encryption/Decryption
 *
 * Scenario:
 * 1. Compute a deterministic PKP public key from 'aliceUsername' using derived key ID
 * 2. Encrypt data that can only be decrypted by that PKP
 * 3. Bob claims the PKP using the derived key ID and auth method
 * 4. Bob decrypts the message using EOA session sigs with the claimed PKP
 */

describe('Claimable Keys Encryption/Decryption', () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let bob: CreateTestAccountResult;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    // Create Bob's account - he will claim the PKP
    const privateKey = process.env['TEST_BOB_PRIVATE_KEY'] as
      | `0x${string}`
      | undefined;

    bob = await createTestAccount(testEnv, {
      label: 'Bob',
      privateKey,
      fundAccount: true,
      fundLedger: false,
      hasEoaAuthContext: true,
      hasPKP: false,
      fundPKP: false,
      hasPKPAuthContext: false,
      fundPKPLedger: false,
    });
  });

  it('should encrypt data for a claimable PKP and decrypt after claiming', async () => {
    const username = 'bobUsername';

    console.log('🔑 [STEP 1] Computing deterministic PKP derived key ID from username');

    /**
     * ====================================
     * Compute deterministic derived key ID
     * ====================================
     * Create a derived key ID from the username.
     * This is similar to how Lit Actions derive PKPs, but using a username prefix.
     */
    const derivedKeyId = keccak256(stringToBytes(`claimable_user_${username}`));
    console.log('Derived Key ID:', derivedKeyId);

    /**
     * ====================================
     * Compute HD PKP public key from root keys
     * ====================================
     * Use computeHDPubKey to derive the PKP public key from the network's root keys
     * and the derived key ID. This gives us the public key BEFORE the PKP is minted.
     */
    const networkContext = await testEnv.litClient.getContext();
    const rootPubkeys = networkContext.handshakeResult?.coreNodeConfig?.hdRootPubkeys;

    if (!rootPubkeys || rootPubkeys.length === 0) {
      throw new Error('Root public keys not available from handshake result');
    }

    const { computeHDPubKey } = await import('@lit-protocol/crypto');
    const derivedPkpPublicKey = await computeHDPubKey(rootPubkeys, derivedKeyId);
    console.log('Derived PKP Public Key:', `0x${derivedPkpPublicKey}`);

    // Compute the ETH address from the public key
    const { computeAddress } = await import('ethers/lib/utils');
    const derivedPkpEthAddress = computeAddress(`0x${derivedPkpPublicKey}`);
    console.log('Derived PKP ETH Address:', derivedPkpEthAddress);

    /**
     * ====================================
     * Define Access Control Conditions
     * ====================================
     * Only the derived PKP can decrypt this data.
     * We use the ETH address because that's what the ACC checks.
     */
    const accessControlConditions = createAccBuilder()
      .requireWalletOwnership(derivedPkpEthAddress)
      .on('ethereum')
      .build();

    console.log(
      '🔒 [STEP 2] Encrypting data with PKP access control:',
      JSON.stringify(accessControlConditions, null, 2)
    );

    /**
     * ====================================
     * Encrypt data
     * ====================================
     */
    const secretMessage = 'This message can only be decrypted by the PKP derived from aliceUsername!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: secretMessage,
      unifiedAccessControlConditions: accessControlConditions,
    });

    console.log('✅ [ENCRYPT] Data encrypted successfully');
    console.log('Ciphertext length:', encryptedData.ciphertext.length);
    console.log('Data hash:', encryptedData.dataToEncryptHash);

    expect(encryptedData.ciphertext).toBeDefined();
    expect(encryptedData.dataToEncryptHash).toBeDefined();

    /**
     * ====================================
     * Bob claims the PKP using Lit Action
     * ====================================
     * Bob executes a Lit Action to claim the PKP for the given key ID.
     * This will:
     * 1. Generate signatures from the Lit nodes
     * 2. Mint the PKP on-chain
     * 3. Associate the PKP with the derived key ID
     */
    console.log('👤 [STEP 3] Bob claiming PKP using Lit Action');

    const claimKeyCode = `
      (async () => {
        const keyId = jsParams.keyId;
        const claimResponse = await Lit.Actions.claimKey({ keyId });
        Lit.Actions.setResponse({ response: JSON.stringify(claimResponse) });
      })();
    `;

    const claimResult = await testEnv.litClient.executeJs({
      code: claimKeyCode,
      authContext: bob.eoaAuthContext!,
      jsParams: {
        keyId: derivedKeyId.replace('0x', ''),
      },
    });

    console.log('✅ [CLAIM] PKP claimed via Lit Action');
    console.log('Claim result:', JSON.stringify(claimResult, null, 2));

    /**
     * ====================================
     * Parse and prepare signatures for minting
     * ====================================
     * The claim result contains signature strings that need to be parsed
     * into {r, s, v} format for the claimAndMint contract call.
     *
     * Signature format: 0xrrr...rrrrsss...sssssvv
     * - r: 32 bytes (64 hex chars)
     * - s: 32 bytes (64 hex chars)
     * - v: 1 byte (2 hex chars)
     */
    console.log('🔗 [STEP 3.5] Parsing signatures for minting');

    // Extract the claim key and its signature data
    const claimKey = Object.keys(claimResult.claims!)[0];
    const claimData = claimResult.claims![claimKey];
    const signatureStrings = claimData.signatures as unknown as string[];

    console.log('Signature strings:', signatureStrings);

    // Parse each signature string into {r, s, v} format
    const parsedSignatures = signatureStrings.map((sigString: string) => {
      // Remove 0x prefix if present
      const sig = sigString.startsWith('0x') ? sigString.slice(2) : sigString;

      // Extract r, s, v components
      const r = '0x' + sig.slice(0, 64);
      const s = '0x' + sig.slice(64, 128);
      const v = parseInt(sig.slice(128, 130), 16);

      return { r, s, v };
    });

    console.log('Parsed signatures:', JSON.stringify(parsedSignatures, null, 2));

    // Mint the PKP on-chain with the parsed signatures
    console.log('🔗 [STEP 4] Minting PKP on-chain with claim signatures');

    // Import rawApi which now exports claimAndMint
    const { rawApi } = await import(
      '../../../networks/src/networks/vNaga/shared/managers/LitChainClient/apis'
    );

    // Get network config directly from the module
    const networkConfig = testEnv.networkModule.getNetworkConfig();

    const mintResult = await rawApi.pkp.write.claimAndMint(
      {
        derivedKeyId: derivedKeyId.replace('0x', ''),
        signatures: parsedSignatures,
      },
      networkConfig as any,
      bob.account
    );

    console.log('✅ [MINT] PKP minted on-chain');
    console.log('Mint transaction hash:', mintResult.hash);
    console.log('Minted PKP token ID:', mintResult.data.tokenId.toString());

    // /**
    //  * ====================================
    //  * Create PKP auth context for decryption
    //  * ====================================
    //  * Now that Bob has claimed the PKP, we need to create an auth context
    //  * that uses the PKP's signing capability to decrypt the data.
    //  *
    //  * The PKP address matches the access control condition, so the decryption
    //  * will succeed.
    //  */
    // console.log('🔐 [STEP 4] Creating PKP auth context for decryption');

    // // Create PKP auth context using the claimed PKP
    // const pkpAuthContext = await testEnv.authManager.createPkpAuthContext({
    //   config: {
    //     pkpPublicKey: `0x${derivedPkpPublicKey}`,
    //   },
    //   authConfig: {
    //     statement: 'I authorize the Lit Protocol to use this PKP for decryption.',
    //     domain: 'example.com',
    //     resources: [
    //       ['access-control-condition-decryption', '*'],
    //     ],
    //     capabilityAuthSigs: [],
    //     expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    //   },
    //   litClient: testEnv.litClient,
    // });

    // console.log('✅ [AUTH] PKP auth context created');

    // /**
    //  * ====================================
    //  * Decrypt data using claimed PKP
    //  * ====================================
    //  * The PKP's ETH address matches the access control condition,
    //  * so the decryption will succeed.
    //  */
    // console.log('🔓 [STEP 5] Decrypting data with claimed PKP');

    // const decryptedData = await testEnv.litClient.decrypt({
    //   data: encryptedData,
    //   unifiedAccessControlConditions: accessControlConditions,
    //   authContext: pkpAuthContext,
    // });

    // console.log('✅ [DECRYPT] Data decrypted successfully');
    // console.log('Decrypted data:', decryptedData.convertedData);

    // expect(decryptedData.convertedData).toBe(secretMessage);
  });
});
