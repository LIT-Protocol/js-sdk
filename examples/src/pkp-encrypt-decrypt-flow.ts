import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { init } from './init';

export const encryptDecryptFlow = async () => {
  const {
    litClient,
    authManager,
    viemAccountAuthData,
    viemAccountPkp,
    viemAuthContext,
  } = await init();

  // Alice's account
  const AliceAccount = privateKeyToAccount(generatePrivateKey());
  console.log('🙋‍♀️ AliceAccount:', AliceAccount.address);

  // PKP's account
  const BobsPKPAccount = litClient.getPkpViemAccount({
    pkpPublicKey: viemAccountPkp.publicKey,
    authContext: viemAuthContext,
    chainConfig: litClient.getChainConfig().viemConfig,
  });

  console.log('🙋‍♂️ BobsPKPAccount:', BobsPKPAccount);

  // ========================================
  //                ENCRYPTION
  // ========================================
  // 1. Set up access control conditions
  const builder = createAccBuilder();

  const accs2 = builder
    .requireWalletOwnership(viemAccountPkp.ethAddress)
    .on('ethereum')
    .build();

  console.log('🔑 Accs2:', accs2);

  const encryptedStringData = await litClient.encrypt({
    dataToEncrypt: 'Hello, world!',
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
  });

  console.log('🔑 Encrypted string data:', encryptedStringData);

  // ========================================
  //                DECRYPTION
  // ========================================
  const bobsPkpAuthContext = await authManager.createPkpAuthContext({
    authData: viemAccountAuthData,
    pkpPublicKey: viemAccountPkp.publicKey,
    authConfig: {
      resources: [['access-control-condition-decryption', '*']],
    },
    litClient: litClient,
  });

  console.log('🔑 BobsPkpAuthContext:', bobsPkpAuthContext);

  const decryptedStringData = await litClient.decrypt({
    data: encryptedStringData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobsPkpAuthContext,
  });

  console.log('🔓 Decrypted string data:', decryptedStringData);

  process.exit();
};

encryptDecryptFlow();
