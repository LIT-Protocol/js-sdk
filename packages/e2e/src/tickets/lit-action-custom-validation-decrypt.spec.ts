import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import type { UnifiedAccessControlCondition } from '@lit-protocol/access-control-conditions-schemas';
import { getIpfsId } from '@lit-protocol/lit-client/ipfs';

import { createEnvVars } from '../helper/createEnvVars';
import { createTestAccount, CreateTestAccountResult } from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';

/**
 * Scenario:
 * 1. Create a Lit Action that validates an identity token against a hardcoded username
 * 2. Compute the IPFS CID of the Lit Action code
 * 3. Create access control conditions that check if the currently executing action's IPFS CID
 *    matches the validation action's CID (using :currentActionIpfsId magic parameter)
 * 4. Encrypt data with these conditions
 * 5. Execute the Lit Action with a valid identity token to decrypt the data
 */

/**
 * Helper function to create Lit Action code for validating and decrypting
 * @param expectedUsername - The username to validate against
 * @returns The Lit Action code as a string
 */
const createValidationLitAction = (expectedUsername: string): string => {
  return `
    (async () => {
      const EXPECTED_USERNAME = "${expectedUsername}";
      const { identityToken, accessControlConditions, ciphertext, dataToEncryptHash } = jsParams;

      console.log('Validating identity token for username:', EXPECTED_USERNAME);

      // Mock API call to validate identity token
      // const response = await fetch(\`https://auth.lit.dev/api/v1/users/me\`, {
      //   headers: { Authorization: \`Bearer \${identityToken}\` }
      // });
      // const userData = await response.json();
      // const associatedAccounts = userData.linked_accounts.map(acc => acc.username);

      // Mock response for this test
      const mockApiResponse = {
        linked_accounts: [
          { username: 'bobUsername', type: 'twitter' },
          { username: 'bob@email.com', type: 'email' },
        ]
      };

      const associatedAccounts = mockApiResponse.linked_accounts.map(acc => acc.username);

      // Check if the expected username is included in the associated accounts
      if (!associatedAccounts.includes(EXPECTED_USERNAME)) {
        throw new Error(\`Identity token does not include username: \${EXPECTED_USERNAME}\`);
      }

      const decryptedData = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        authSig: null,
        chain: 'ethereum',
      });

      // Return the decrypted data
      Lit.Actions.setResponse({ response: decryptedData });
    })();
  `;
};

describe('Lit Action Self-Validation with Decryption', () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let bob: CreateTestAccountResult;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    // Create Bob's account
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

  it('should encrypt data with Lit Action CID validation and decrypt with valid identity token', async () => {
    const expectedUsername = 'bobUsername';

    console.log('[STEP 1] Creating Lit Action with hardcoded username');

    const VALIDATION_LIT_ACTION_CODE = createValidationLitAction(expectedUsername);

    console.log('[STEP 2] Computing IPFS CID of Lit Action code');

    /**
     * ====================================
     * Create Access Control Conditions
     * ====================================
     * The ACC checks that the currently executing Lit Action's IPFS CID
     * matches the validation action's CID.
     *
     * :currentActionIpfsId is a magic parameter that the Lit nodes substitute
     * with the IPFS CID of the currently executing Lit Action.
     */
    console.log('[STEP 3] Creating access control conditions');

    const rawCondition: UnifiedAccessControlCondition = {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':currentActionIpfsId'],
      returnValueTest: {
        comparator: '=',
        value: await getIpfsId(VALIDATION_LIT_ACTION_CODE),
      },
    };

    const accessControlConditions = createAccBuilder()
      .unifiedAccs(rawCondition)
      .build();

    console.log(
      'Access Control Conditions:',
      JSON.stringify(accessControlConditions, null, 2)
    );

    /**
     * ====================================
     * Encrypt data
     * ====================================
     */
    console.log('[STEP 4] Encrypting data');

    const secretMessage = 'This message can only be decrypted by the specific Lit Action with hardcoded username validation!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: secretMessage,
      unifiedAccessControlConditions: accessControlConditions,
    });

    expect(encryptedData.ciphertext).toBeDefined();
    expect(encryptedData.dataToEncryptHash).toBeDefined();

    console.log('[STEP 5] Executing Lit Action to validate and decrypt');

    // Mock identity token (in real scenario, this would come from auth)
    const mockIdentityToken = 'mock-identity-token-for-bob';

    const executeResult = await testEnv.litClient.executeJs({
      code: VALIDATION_LIT_ACTION_CODE,
      authContext: bob.eoaAuthContext!,
      jsParams: {
        identityToken: mockIdentityToken,
        accessControlConditions,
        ciphertext: encryptedData.ciphertext,
        dataToEncryptHash: encryptedData.dataToEncryptHash,
      },
    });

    console.log('✅ Lit Action executed successfully');
    console.log('Response:', executeResult.response);

    // The response should be the decrypted message
    expect(executeResult.response).toBe(secretMessage);
  });

  it('should fail to decrypt with a different Lit Action (different IPFS CID)', async () => {
    const expectedUsername = 'bobUsername';

    console.log('[STEP 1] Creating validation Lit Action and encrypting data');

    // Create the validation Lit Action and compute its CID
    const VALIDATION_LIT_ACTION_CODE = createValidationLitAction(expectedUsername);

    const rawCondition: UnifiedAccessControlCondition = {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':currentActionIpfsId'],
      returnValueTest: {
        comparator: '=',
        value: await getIpfsId(VALIDATION_LIT_ACTION_CODE),
      },
    };

    const accessControlConditions = createAccBuilder()
      .unifiedAccs(rawCondition)
      .build();
    const secretMessage = 'This should only be decryptable by the validation action!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: secretMessage,
      unifiedAccessControlConditions: accessControlConditions,
    });

    console.log('[STEP 2] Attempting to decrypt with different Lit Action');

    // Try to decrypt with a different Lit Action (different IPFS CID)
    const DIFFERENT_LIT_ACTION_CODE = `
      (async () => {
        const { accessControlConditions, ciphertext, dataToEncryptHash } = jsParams;

        const decryptedData = await Lit.Actions.decryptAndCombine({
          accessControlConditions,
          ciphertext,
          dataToEncryptHash,
          authSig: null,
          chain: 'ethereum',
        });

        Lit.Actions.setResponse({ response: decryptedData });
      })();
    `;

    try {
      await testEnv.litClient.executeJs({
        code: DIFFERENT_LIT_ACTION_CODE,
        authContext: bob.eoaAuthContext!,
        jsParams: {
          accessControlConditions,
          ciphertext: encryptedData.ciphertext,
          dataToEncryptHash: encryptedData.dataToEncryptHash,
        },
      });

      throw new Error('Expected decryption to fail with different Lit Action');
    } catch (error: any) {
      console.log('✅ Decryption failed as expected with different Lit Action');
      console.log('Error:', error.message);
      expect(error.message).toContain(
        'Access control conditions check failed.  Check that you are allowed to decrypt this item.'
      );
    }
  });

  it('should fail to decrypt with invalid identity token', async () => {
    const expectedUsername = 'aliceUsername'; // Different username

    console.log('[STEP 1] Creating Lit Action with different username');

    const VALIDATION_LIT_ACTION_CODE = createValidationLitAction(expectedUsername);
    const litActionIpfsCid = await getIpfsId(VALIDATION_LIT_ACTION_CODE);

    const rawCondition: UnifiedAccessControlCondition = {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':currentActionIpfsId'],
      returnValueTest: {
        comparator: '=',
        value: litActionIpfsCid,
      },
    };

    const accessControlConditions = createAccBuilder()
      .unifiedAccs(rawCondition)
      .build();

    const secretMessage = 'This should fail to decrypt!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: secretMessage,
      unifiedAccessControlConditions: accessControlConditions,
    });

    console.log('[STEP 2] Executing Lit Action with invalid identity token');

    try {
      await testEnv.litClient.executeJs({
        code: VALIDATION_LIT_ACTION_CODE,
        authContext: bob.eoaAuthContext!,
        jsParams: {
          privyIdentityToken: 'mock-invalid-token',
          accessControlConditions,
          ciphertext: encryptedData.ciphertext,
          dataToEncryptHash: encryptedData.dataToEncryptHash,
        },
      });

      throw new Error('Expected Lit Action to fail validation');
    } catch (error: any) {
      console.log('✅ Lit Action failed as expected');
      console.log('Error:', error.message);
      expect(error.message).toContain(
        'Identity token does not include username: aliceUsername'
      );
    }
  });
});
