import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import {
  uint8arrayToString,
  uint8arrayFromString,
} from '@lit-protocol/uint8arrays';

import { createEnvVars } from '../helper/createEnvVars';
import { createTestAccount, CreateTestAccountResult } from '../helper/createTestAccount';
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
  let alice: CreateTestAccountResult;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    // Use TEST_ALICE_PRIVATE_KEY if available to reuse the same account across test runs
    const privateKey = process.env['TEST_ALICE_PRIVATE_KEY'] as
      | `0x${string}`
      | undefined;

    alice = await createTestAccount(testEnv, {
      label: 'Alice',
      privateKey, // Reuse account if env var is set
      fundAccount: true,
      fundLedger: false,
      hasEoaAuthContext: true,
      hasPKP: false,
      fundPKP: false,
      hasPKPAuthContext: false,
      fundPKPLedger: false,
    });
  });

  it('should encrypt and decrypt data with Lit Action ACC that receives identityToken parameter via litParam', async () => {
    const { account } = alice;
    const identityToken = 'valid-identity-token-12345';
    // base64url encode the param
    const encodedIdentityToken = uint8arrayToString(
      uint8arrayFromString(identityToken, 'utf8'),
      'base64urlpad'
    );

    const eoaAuthContext = await testEnv.authManager.createEoaAuthContext({
      config: {
        account: account,
      },
      authConfig: {
        statement: 'I authorize the Lit Protocol to execute this Lit Action.',
        domain: 'example.com',
        resources: [
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
          `litParam:identityToken:${encodedIdentityToken}`, // Pass identityToken as a litParam
        ],
        capabilityAuthSigs: [],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: testEnv.litClient,
    });

    const litActionIpfsCid = await uploadLitActionToIpfs(
      VALIDATION_LIT_ACTION_CODE,
      'username-validation-lit-action.js'
    );

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
      '[ENCRYPT] Encrypting data with Lit Action ACC:',
      JSON.stringify(accessControlConditions, null, 2)
    );

    /**
     * Encrypt data
     */
    const stringData = 'Secret message protected by Lit Action!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: stringData,
      unifiedAccessControlConditions: accessControlConditions,
    });

    console.log('[ENCRYPT] Data encrypted successfully');
    console.log('Ciphertext length:', encryptedData.ciphertext.length);
    console.log('Data hash:', encryptedData.dataToEncryptHash);

    expect(encryptedData.ciphertext).toBeDefined();
    expect(encryptedData.dataToEncryptHash).toBeDefined();

    /**
     * Decrypt data
     */
    console.log('[DECRYPT] Decrypting data with Lit Action ACC');

    const decryptedData = await testEnv.litClient.decrypt({
      data: encryptedData,
      unifiedAccessControlConditions: accessControlConditions,
      authContext: eoaAuthContext,
    });

    console.log('[DECRYPT] Data decrypted successfully');
    console.log('Decrypted data:', decryptedData.convertedData);

    expect(decryptedData.convertedData).toBe(stringData);
  });
});
