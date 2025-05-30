import { init } from '../../init';

export const createEoaNativeAuthFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  return async () => {
    // Test 1: Get the authenticator
    const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
    expect(ViemAccountAuthenticator).toBeDefined();

    // Test 2: Authenticate the account and get auth data
    const authDataViemAccount = await ViemAccountAuthenticator.authenticate(
      ctx.aliceViemAccount
    );

    expect(authDataViemAccount).toBeDefined();
    expect(authDataViemAccount.accessToken).toBeDefined();
    expect(authDataViemAccount.authMethodType).toBeDefined();
    expect(authDataViemAccount.authMethodId).toBeDefined();

    // Test 3: Parse and validate the auth signature
    const authSig = JSON.parse(authDataViemAccount.accessToken);
    expect(authSig).toBeDefined();
    expect(authSig.sig).toBeDefined();
    expect(authSig.derivedVia).toBeDefined();
    expect(authSig.signedMessage).toBeDefined();
    expect(authSig.address).toBeDefined();

    // Test 4: Get auth data again (testing consistency)
    const authData = await ViemAccountAuthenticator.authenticate(
      ctx.aliceViemAccount
    );
    expect(authData).toBeDefined();
    expect(authData.authMethodType).toBe(authDataViemAccount.authMethodType);
    expect(authData.authMethodId).toBe(authDataViemAccount.authMethodId);

    // Test 5: Mint a PKP using EOA
    const mintedPkpWithEoa = await ctx.litClient.mintWithEoa({
      account: ctx.aliceViemAccount,
    });

    expect(mintedPkpWithEoa).toBeDefined();
    expect(mintedPkpWithEoa.data).toBeDefined();
    expect(mintedPkpWithEoa.txHash).toBeDefined();

    // Validate the PKP data structure
    const pkpData = mintedPkpWithEoa.data;
    expect(pkpData.tokenId).toBeDefined();
    expect(pkpData.pubkey).toBeDefined();
    expect(pkpData.ethAddress).toBeDefined();

    // Validate that the PKP address is a valid Ethereum address
    expect(pkpData.ethAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);

    // Validate that the public key is defined and has expected format
    expect(typeof pkpData.pubkey).toBe('string');
    expect(pkpData.pubkey.length).toBeGreaterThan(0);
    expect(pkpData.pubkey).toMatch(/^0x04[a-fA-F0-9]{128}$/); // Uncompressed public key format

    // Validate that the token ID is a valid BigInt
    expect(typeof pkpData.tokenId).toBe('bigint');
    expect(pkpData.tokenId).toBeGreaterThan(0n);

    // Validate that the transaction hash is properly formatted
    expect(mintedPkpWithEoa.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  };
};
