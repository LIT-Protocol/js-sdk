import { createAuthManager } from '@lit-protocol/auth';
import { storagePlugins } from '@lit-protocol/auth/storage-node';
import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev } from '@lit-protocol/networks';
import { privateKeyToAccount } from 'viem/accounts';
import {
  createAccBuilder,
  UnifiedAccessControlCondition,
} from '@lit-protocol/access-control-conditions';

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const liveMasterAccount = privateKeyToAccount(
  process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`
);

const rawAccs = [
  {
    conditionType: 'evmContract',
    contractAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    functionName: 'balanceOf',
    functionParams: [':userAddress'],
    functionAbi: {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    chain: 'baseSepolia',
    returnValueTest: {
      key: '',
      comparator: '>=',
      value: '0',
    },
  },
] as UnifiedAccessControlCondition;

describe('jss100 custom contract accs', () => {
  beforeAll(async () => {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const balance = await client.readContract({
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      abi: [
        {
          constant: true,
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [liveMasterAccount.address],
    });

    if (BigInt(balance) <= 0n) {
      throw new Error(
        `Test account ${liveMasterAccount.address} has no balance for token 0x036CbD53842c5426634e7929541eC2318f3dCF7e. Please get some before running the test.`
      );
    }
  });

  it('should be able to use the custom contract accs api - evmContract conditions', async () => {
    console.log(
      '🔧 [TEST] Testing evmContract conditions (rawAccs):',
      JSON.stringify(rawAccs, null, 2)
    );

    console.log(
      'Setting up permissions for address:',
      liveMasterAccount.address
    );

    console.log('🔧 [SESSION] Creating fresh litClient and clearing storage');

    const litClient = await createLitClient({ network: nagaDev });

    // Use unique storage path with timestamp to prevent session reuse
    const uniqueStoragePath = `.e2e/jss100-${Date.now()}`;
    console.log('🔧 [SESSION] Using unique storage path:', uniqueStoragePath);

    const authManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'jss100-custom-contract-accs',
        networkName: 'naga-dev',
        storagePath: uniqueStoragePath,
      }),
    });

    /**
     * ====================================
     * Create the auth context
     * ====================================
     */
    const aliceEoaAuthContext = await authManager.createEoaAuthContext({
      config: {
        account: liveMasterAccount,
      },
      authConfig: {
        statement: 'I authorize the Lit Protocol to execute this Lit Action.',
        domain: 'example.com',
        resources: [
          ['lit-action-execution', '*'],
          ['pkp-signing', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        capabilityAuthSigs: [],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: litClient,
    });

    // Handle both array and single condition formats correctly
    const unifiedAccs = createAccBuilder().unifiedAccs(rawAccs).build();

    console.log('unifiedAccs:', JSON.stringify(unifiedAccs, null, 2));

    const stringData = 'Hello world';
    const encryptedStringData = await litClient.encrypt({
      dataToEncrypt: stringData,
      unifiedAccessControlConditions: unifiedAccs,
    });

    console.log(encryptedStringData);

    // Use the same account to decrypt the data
    const decryptedStringData = await litClient.decrypt({
      data: encryptedStringData,
      unifiedAccessControlConditions: unifiedAccs,
      authContext: aliceEoaAuthContext,
    });

    console.log('decryptedStringData:', decryptedStringData);

    expect(decryptedStringData.convertedData).toBe(stringData);
  });
});
