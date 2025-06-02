import { init } from '../../init';
import { assert } from '../assertions';

export const createPkpEncryptDecryptTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const { createAccBuilder } = await import(
      '@lit-protocol/access-control-conditions'
    );

    const authContext = getAuthContext();

    // Determine which address to use based on auth context type
    // For EOA auth, use the EOA address; for PKP/Custom auth, use the PKP address
    let addressToUse: string;
    if (authContext === ctx.aliceEoaAuthContext) {
      addressToUse = ctx.aliceViemAccount.address;
    } else {
      // PKP or Custom auth contexts
      addressToUse = ctx.aliceViemAccountPkp.ethAddress;
    }

    // Set up access control conditions requiring wallet ownership
    const builder = createAccBuilder();
    const accs = builder
      .requireWalletOwnership(addressToUse)
      .on('ethereum')
      .build();

    // Encrypt data with the access control conditions
    const dataToEncrypt = 'Hello from PKP encrypt-decrypt test!';
    const encryptedData = await ctx.litClient.encrypt({
      dataToEncrypt,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    assert.toBeDefined(encryptedData);
    assert.toBeDefined(encryptedData.ciphertext);
    assert.toBeDefined(encryptedData.dataToEncryptHash);

    // Decrypt the data using the appropriate auth context
    const decryptedData = await ctx.litClient.decrypt({
      data: encryptedData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: authContext,
    });

    assert.toBeDefined(decryptedData);
    assert.toBeDefined(decryptedData.convertedData);
    assert.toBe(decryptedData.convertedData, dataToEncrypt);
  };
};
