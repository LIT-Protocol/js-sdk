import {
  createAccBuilder,
  humanizeUnifiedAccessControlConditions,
  validateAccessControlConditions
} from '@lit-protocol/access-control-conditions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { init } from './init';

export const encryptDecryptFlow = async () => {
  const { litClient } = await init();

  // Alice's account
  const AliceAccount = privateKeyToAccount(generatePrivateKey());
  console.log('🙋‍♀️ AliceAccount:', AliceAccount.address);

  // Bob's account
  const BobsAccount = privateKeyToAccount(generatePrivateKey());
  console.log('🙋‍♂️ BobsAccount:', BobsAccount.address);

  // ========================================
  //                ENCRYPTION
  // ========================================

  // 1. Set up access control conditions
  const builder = createAccBuilder();

  const accs2 = builder
    .requireWalletOwnership(BobsAccount.address)
    .on('ethereum')
    .and()
    .requireEthBalance('0', '=')
    .on('yellowstone')
    .and()
    .requireLitAction(
      'Qme2pfQUV9cuxWmzHrhMKuvTVvKVx87iLiz4AnQnEwS3B6',
      'go',
      ['123456'], // <-- parameters
      'true' // <-- expected value
    )
    .build();

  console.log('🔑 Accs2:', accs2);

  const humanised = await humanizeUnifiedAccessControlConditions({
    unifiedAccessControlConditions: accs2,
  });
  console.log('🔑 Humanised:', humanised);

  const validated = await validateAccessControlConditions({
    unifiedAccessControlConditions: accs2,
  });
  console.log('🔑 Validated:', validated);

  // -- prepare data to encrypt
  const _dataToEncrypt = {
    message: 'Hello, my love!',
    sender: AliceAccount.address,
    recipient: BobsAccount.address,
  };

  console.log('🔑 Data to encrypt:', _dataToEncrypt);

  // -- encrypt data
  const encryptedData = await litClient.encrypt({
    dataToEncrypt: _dataToEncrypt,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
  });

  console.log('🔑 Encrypted data:', encryptedData);

  // ========================================
  //                DECRYPTION
  // ========================================
  const { litClient: bobsLitClient, authManager: bobsAuthManager } =
    await init();

  const bobAuthContext = await bobsAuthManager.createEoaAuthContext({
    config: {
      account: BobsAccount,
    },
    authConfig: {
      domain: 'localhost',
      statement: 'Decrypt test data',
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      resources: [
        ['access-control-condition-decryption', '*'],
        ['lit-action-execution', '*'],
        // ['lit-payment-delegation', '*'],
      ],
    },
    litClient: bobsLitClient,
  });

  // 3. Bob decrypts the data
  const decryptedResponse = await bobsLitClient.decrypt({
    ciphertext: encryptedData.ciphertext,
    dataToEncryptHash: encryptedData.dataToEncryptHash,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔑 Decrypted data:', decryptedResponse);
};

encryptDecryptFlow();
