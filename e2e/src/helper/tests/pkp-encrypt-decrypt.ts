import { init } from '../../init';

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

    expect(encryptedData).toBeDefined();
    expect(encryptedData.ciphertext).toBeDefined();
    expect(encryptedData.dataToEncryptHash).toBeDefined();

    // Decrypt the data using the appropriate auth context
    const decryptedData = await ctx.litClient.decrypt({
      data: encryptedData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: authContext,
    });

    expect(decryptedData).toBeDefined();
    expect(decryptedData.convertedData).toBeDefined();
    expect(decryptedData.convertedData).toBe(dataToEncrypt);
  };
};
