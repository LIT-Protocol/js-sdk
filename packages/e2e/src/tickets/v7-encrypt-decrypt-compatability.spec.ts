import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev } from '@lit-protocol/networks';
import { privateKeyToAccount } from 'viem/accounts';

describe('v7 encrypt decrypt compatability', () => {
  it('should be able to use the v7 api', async () => {
    const liveMasterAccount = privateKeyToAccount(
      process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`
    );

    const litClient = await createLitClient({ network: nagaDev });

    const authManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'v7-compatability',
        networkName: 'naga-dev',
        storagePath: './lit-auth-local',
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

    const { createAccBuilder } = await import(
      '@lit-protocol/access-control-conditions'
    );

    const unifiedAccs = createAccBuilder()
      .unifiedAccs({
        conditionType: 'evmBasic',
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: liveMasterAccount.address,
        },
      })
      .build();

    const accs = createAccBuilder()
      .evmBasic({
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: liveMasterAccount.address,
        },
      })
      .build();

    const stringData = 'Hello from encrypt-decrypt flow test!';
    const encryptedStringData = await litClient.encrypt({
      dataToEncrypt: stringData,
      unifiedAccessControlConditions: unifiedAccs,
      chain: 'ethereum',
    });

    console.log(encryptedStringData);

    const decryptedStringResponse = await litClient.decrypt({
      data: encryptedStringData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: aliceEoaAuthContext,
    });
    console.log(decryptedStringResponse);
  });
});
