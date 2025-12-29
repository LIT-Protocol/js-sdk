import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import {
  uint8arrayToString,
  uint8arrayFromString,
} from '@lit-protocol/uint8arrays';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';

import { createEnvVars } from '../helper/createEnvVars';
import { createTestAccount } from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';
import { uploadLitActionToIpfs } from '../helper/uploadLitActionToIpfs';

/**
 * Lit Action that accepts an identityToken via litParam and validates it.
 * The identityToken is passed dynamically through SIWE resource parameters.
 * The username 'aliceUsername' is hardcoded and checked against the mocked API response.
 */
const VALIDATION_LIT_ACTION_CODE = `
(async (expectedUsername, identityToken) => {
  console.log('expectedUsername:', expectedUsername);
  console.log('identityToken from litParam:', identityToken);

  // Mock fetching an API using the identityToken to get associated usernames
  // In a real scenario, this would be: const response = await fetch(\`https://api.example.com/users?token=\${identityToken}\`);
  const mockApiResponse = {
    usernames: ['aliceUsername', 'bobUsername', 'charlieUsername']
  };

  // Check if the expected username is included in the API response
  const isValid = mockApiResponse.usernames.includes(expectedUsername);

  Lit.Actions.setResponse({ response: JSON.stringify(isValid) });
})();
`;

describe('Lit Action Access Control Condition Encryption', () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);
  });

  it('should encrypt and decrypt data with Lit Action ACC that receives identityToken parameter via litParam', async () => {
    console.log('🔧 [TEST] Creating test account with EOA auth context');

    const alice = await createTestAccount(testEnv, {
      label: 'Alice',
      fundAccount: true,
      fundLedger: true,
      hasEoaAuthContext: true,
      hasPKP: false,
      fundPKP: false,
      fundPKPLedger: false,
    });

    const { account } = alice;

    /**
     * ====================================
     * Create AuthSig with SIWE resource parameter
     * ====================================
     * We'll pass the identityToken as a litParam in the SIWE resource.
     * The parameter needs to be base64url encoded.
     */
    const identityToken = 'valid-identity-token-12345';
    // base64url encode the param
    const encodedIdentityToken = uint8arrayToString(
      uint8arrayFromString(identityToken, 'utf8'),
      'base64urlpad'
    );

    console.log('🔧 [AUTH] Creating auth context with litParam resource');
    console.log('Identity Token:', identityToken);
    console.log('Encoded Identity Token:', encodedIdentityToken);

    // WORKAROUND: The SDK's type system doesn't support litParam strings in resources
    // We need to bypass validation and manually construct the auth context with litParam

    // Step 1: Create a standard auth context first to get the proper SIWE message with ReCap
    const { generateSessionKeyPair } = await import('@lit-protocol/auth');
    const { createSiweMessage } = await import('@lit-protocol/auth-helpers');
    const { LitAccessControlConditionResource, LitActionResource } = await import('@lit-protocol/auth-helpers');
    const { LIT_ABILITY } = await import('@lit-protocol/constants');

    // Generate session key pair
    const sessionKeyPair = generateSessionKeyPair();
    const nonce = (await testEnv.litClient.getContext()).latestBlockhash;
    const sessionKeyUri = `lit:session:${sessionKeyPair.publicKey}`;

    // Create resource objects for ReCap
    const resources = [
      {
        resource: new LitActionResource('*'),
        ability: LIT_ABILITY.LitActionExecution,
      },
      {
        resource: new LitAccessControlConditionResource('*'),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      },
    ];

    // Create SIWE message with ReCap using the SDK helper
    const siweMessageWithRecap = await createSiweMessage({
      walletAddress: account.address,
      nonce,
      uri: sessionKeyUri,
      statement: 'I authorize the Lit Protocol to execute this Lit Action.',
      domain: 'example.com',
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      resources,
    });

    console.log('📝 [DEBUG] SIWE message with ReCap:');
    console.log(siweMessageWithRecap);
    console.log('📝 [DEBUG] Message length:', siweMessageWithRecap.length);
    console.log('📝 [DEBUG] First 50 chars:', JSON.stringify(siweMessageWithRecap.substring(0, 50)));

    // Step 2: Parse the SIWE message and manually add litParam to resources
    // We need to parse the text message, extract resources, add litParam, and reconstruct
    const lines = siweMessageWithRecap.split('\n');
    console.log('📝 [DEBUG] Number of lines:', lines.length);
    console.log('📝 [DEBUG] First line:', JSON.stringify(lines[0]));

    const resourcesIndex = lines.findIndex(line => line.startsWith('Resources:'));
    console.log('📝 [DEBUG] Resources index:', resourcesIndex);

    if (resourcesIndex !== -1) {
      // Insert the litParam resource after the "Resources:" line
      lines.splice(resourcesIndex + 1, 0, `- litParam:identityToken:${encodedIdentityToken}`);
    } else {
      // If no Resources section exists, add it before the last line (usually empty)
      const insertIndex = lines.length - 1;
      lines.splice(insertIndex, 0, 'Resources:', `- litParam:identityToken:${encodedIdentityToken}`);
    }

    const siweMessageWithLitParam = lines.join('\n');

    console.log('📝 [AUTH] SIWE message with litParam:');
    console.log(siweMessageWithLitParam);
    console.log('📝 [DEBUG] Modified message length:', siweMessageWithLitParam.length);
    console.log('📝 [DEBUG] Modified first 50 chars:', JSON.stringify(siweMessageWithLitParam.substring(0, 50)));

    // Step 3: Sign the modified SIWE message
    const authSig = await ViemAccountAuthenticator.createAuthSig(
      account,
      siweMessageWithLitParam
    );

    console.log('✅ [AUTH] Created authSig with litParam resource');
    console.log('📝 [DEBUG] AuthSig structure:', JSON.stringify(authSig, null, 2));
    console.log('📝 [DEBUG] AuthSig signedMessage:\n', authSig.signedMessage);

    // Step 4: Create auth context with the session key and custom authSig
    const eoaAuthContext = {
      sessionKeyPair,
      authNeededCallback: async () => authSig,
      authData: {
        authMethodType: 1, // EthWallet
        authMethodId: account.address.toLowerCase(),
      },
      authConfig: {
        resources,
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        capabilityAuthSigs: [],
        statement: 'I authorize the Lit Protocol to execute this Lit Action.',
        domain: 'example.com',
      },
    } as any; // Type cast to bypass strict validation

    /**
     * ====================================
     * Upload Lit Action to IPFS
     * ====================================
     * Upload the Lit Action code to IPFS and get the CID.
     * This requires PINATA_JWT to be set in the environment.
     */
    console.log('📤 [IPFS] Uploading Lit Action to IPFS...');
    const litActionIpfsCid = await uploadLitActionToIpfs(
      VALIDATION_LIT_ACTION_CODE,
      'username-validation-lit-action.js'
    );

    /**
     * ====================================
     * Define Lit Action Access Control Conditions
     * ====================================
     * Using requireLitAction with :litParam:identityToken in the parameters.
     * The Lit nodes will substitute :litParam:identityToken with the value from the SIWE resource.
     * The Lit Action will:
     * 1. Receive the identityToken
     * 2. Mock an API call to get associated usernames
     * 3. Check if 'aliceUsername' (hardcoded) is in the returned list
     * 4. Return true if found
     */
    const accessControlConditions = createAccBuilder()
      .requireLitAction(
        litActionIpfsCid, // IPFS CID of the uploaded Lit Action
        'go', // Method name
        ['aliceUsername', ':litParam:identityToken'], // This will be substituted with the identityToken from SIWE resource
        'true', // Expected value to compare against
        '=' // Comparator
      )
      .build();

    console.log(
      '🔧 [ENCRYPT] Encrypting data with Lit Action ACC:',
      JSON.stringify(accessControlConditions, null, 2)
    );

    /**
     * ====================================
     * Encrypt data
     * ====================================
     */
    const stringData = 'Secret message protected by Lit Action!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: stringData,
      unifiedAccessControlConditions: accessControlConditions,
    });

    console.log('✅ [ENCRYPT] Data encrypted successfully');
    console.log('Ciphertext length:', encryptedData.ciphertext.length);
    console.log('Data hash:', encryptedData.dataToEncryptHash);

    expect(encryptedData.ciphertext).toBeDefined();
    expect(encryptedData.dataToEncryptHash).toBeDefined();

    /**
     * ====================================
     * Decrypt data
     * ====================================
     */
    console.log('🔧 [DECRYPT] Decrypting data with Lit Action ACC');

    const decryptedData = await testEnv.litClient.decrypt({
      data: encryptedData,
      unifiedAccessControlConditions: accessControlConditions,
      authContext: eoaAuthContext,
    });

    console.log('✅ [DECRYPT] Data decrypted successfully');
    console.log('Decrypted data:', decryptedData.convertedData);

    expect(decryptedData.convertedData).toBe(stringData);
  });
});
