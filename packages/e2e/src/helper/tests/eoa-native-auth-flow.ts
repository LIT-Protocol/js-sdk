import { init } from '../../init';
import { assert } from '../assertions';

export const createEoaNativeAuthFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  return async () => {
    // Test 1: Get the authenticator
    const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
    assert.toBeDefined(ViemAccountAuthenticator);

    // Test 2: Authenticate the account and get auth data
    const authDataViemAccount = await ViemAccountAuthenticator.authenticate(
      ctx.aliceViemAccount
    );

    assert.toBeDefined(authDataViemAccount);
    assert.toBeDefined(authDataViemAccount.accessToken);
    assert.toBeDefined(authDataViemAccount.authMethodType);
    assert.toBeDefined(authDataViemAccount.authMethodId);

    // Test 3: Parse and validate the auth signature
    const authSig = JSON.parse(authDataViemAccount.accessToken);
    assert.toBeDefined(authSig);
    assert.toBeDefined(authSig.sig);
    assert.toBeDefined(authSig.derivedVia);
    assert.toBeDefined(authSig.signedMessage);
    assert.toBeDefined(authSig.address);

    // Test 4: Get auth data again (testing consistency)
    const authData = await ViemAccountAuthenticator.authenticate(
      ctx.aliceViemAccount
    );
    assert.toBeDefined(authData);
    assert.toBe(authData.authMethodType, authDataViemAccount.authMethodType);
    assert.toBe(authData.authMethodId, authDataViemAccount.authMethodId);

    // Test 5: Mint a PKP using EOA
    const mintedPkpWithEoa = await ctx.litClient.mintWithEoa({
      account: ctx.aliceViemAccount,
    });

    assert.toBeDefined(mintedPkpWithEoa);
    assert.toBeDefined(mintedPkpWithEoa.data);
    assert.toBeDefined(mintedPkpWithEoa.txHash);

    // Validate the PKP data structure
    const pkpData = mintedPkpWithEoa.data;
    assert.toBeDefined(pkpData.tokenId);
    assert.toBeDefined(pkpData.pubkey);
    assert.toBeDefined(pkpData.ethAddress);

    // Validate that the PKP address is a valid Ethereum address
    assert.toMatch(pkpData.ethAddress, /^0x[a-fA-F0-9]{40}$/);

    // Validate that the public key is defined and has expected format
    assert.toBe(typeof pkpData.pubkey, 'string');
    assert.toBeGreaterThan(pkpData.pubkey.length, 0);
    assert.toMatch(pkpData.pubkey, /^0x04[a-fA-F0-9]{128}$/); // Uncompressed public key format

    // Validate that the token ID is a valid BigInt
    assert.toBe(typeof pkpData.tokenId, 'bigint');
    assert.toBeGreaterThan(Number(pkpData.tokenId), 0);

    // Validate that the transaction hash is properly formatted
    assert.toMatch(mintedPkpWithEoa.txHash, /^0x[a-fA-F0-9]{64}$/);
  };
};
