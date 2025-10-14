import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { init } from '../init';

/**
 * Creates a PKP authentication context with pre-generated session materials
 * This simulates a server-side use case where session key pair and delegation
 * signature are generated once and reused for multiple requests
 */
export const createPkpAuthContextWithPreGeneratedMaterials = async (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  console.log('🔁 Creating PKP Auth Context with Pre-generated Materials');
  try {
    // Step 1: Generate a session key pair directly
    console.log('   📝 Step 1: Generating session key pair...');
    const sessionKeyPair = generateSessionKeyPair();

    // Step 2: Generate PKP delegation signature for the session key pair
    console.log('   📝 Step 2: Generating PKP delegation signature...');
    const delegationAuthSig =
      await ctx.authManager.generatePkpDelegationAuthSig({
        pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
        authData: ctx.aliceViemAccountAuthData,
        sessionKeyPair,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        },
        litClient: ctx.litClient,
      });

    console.log('   📝 Session materials generated:', {
      hasSessionKeyPair: !!sessionKeyPair,
      hasDelegationAuthSig: !!delegationAuthSig,
      sessionKeyPublicKey: sessionKeyPair?.publicKey?.substring(0, 20) + '...',
    });

    // Step 3: Create auth context using the pre-generated materials
    // Using the dedicated function for pre-generated materials with a clean, minimal signature
    console.log(
      '   📝 Step 3: Creating auth context with pre-generated materials...'
    );
    const authContextWithPreGenerated =
      await ctx.authManager.createPkpAuthContextFromPreGenerated({
        pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
        sessionKeyPair,
        delegationAuthSig,
        // Optional: can provide authData if needed, otherwise minimal default is used
        authData: ctx.aliceViemAccountAuthData,
      });

    console.log('✅ PKP Auth Context with Pre-generated Materials created');
    return authContextWithPreGenerated;
  } catch (e) {
    console.error(
      '❌ Error creating PKP Auth Context with Pre-generated Materials',
      e
    );
    throw e;
  }
};

/**
 * Creates a PKP authentication context
 */
export const createPkpAuthContext: (
  ctx: Awaited<ReturnType<typeof init>>
) => Promise<any> = async (ctx: Awaited<ReturnType<typeof init>>) => {
  console.log('🔁 Creating PKP Auth Context');
  try {
    const pkpAuthContext = await ctx.authManager.createPkpAuthContext({
      authData: ctx.aliceViemAccountAuthData,
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: ctx.litClient,
    });

    console.log('✅ PKP Auth Context created');
    return pkpAuthContext;
  } catch (e) {
    console.error('❌ Error creating PKP Auth Context', e);
    throw e;
  }
};

/**
 * Creates a custom authentication context
 */
export const createCustomAuthContext: (
  ctx: Awaited<ReturnType<typeof init>>
) => Promise<any> = async (ctx: Awaited<ReturnType<typeof init>>) => {
  console.log('🔁 Creating Custom Auth Context');

  try {
    // Set up custom auth method type and validation IPFS CID (from custom-auth-flow example)

    const customAuthContext = await ctx.authManager.createCustomAuthContext({
      pkpPublicKey: ctx.eveViemAccountPkp.pubkey,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: ctx.litClient,
      customAuthParams: {
        litActionIpfsId: ctx.eveValidationIpfsCid,
        jsParams: {
          pkpPublicKey: ctx.eveViemAccountPkp.pubkey,
          username: 'eve',
          password: 'lit',
          authMethodId: ctx.eveCustomAuthData.authMethodId,
        },
      },
    });

    console.log('✅ Custom Auth Context created', customAuthContext);
    return customAuthContext;
  } catch (e) {
    console.error('❌ Error creating Custom Auth Context', e);
    throw e;
  }
};

/**
 * Creates an EOA authentication context with pre-generated session materials
 * This demonstrates how to pre-generate EOA session materials for server-side use
 */
export const createEoaAuthContextWithPreGeneratedMaterials = async (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  console.log('🔁 Creating EOA Auth Context with Pre-generated Materials');
  try {
    // Step 1: Generate a session key pair directly
    console.log('   📝 Step 1: Generating session key pair...');
    const sessionKeyPair = generateSessionKeyPair();

    // Step 2: Generate EOA delegation signature for the session key pair
    console.log('   📝 Step 2: Generating EOA delegation signature...');
    const delegationAuthSig =
      await ctx.authManager.generateEoaDelegationAuthSig({
        account: ctx.aliceViemAccount,
        sessionKeyPair,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        },
        litClient: ctx.litClient,
      });

    console.log('   📝 EOA session materials generated:', {
      hasSessionKeyPair: !!sessionKeyPair,
      hasDelegationAuthSig: !!delegationAuthSig,
      sessionKeyPublicKey: sessionKeyPair?.publicKey?.substring(0, 20) + '...',
    });

    // Step 3: Create EOA auth context using the pre-generated materials
    console.log(
      '   📝 Step 3: Creating EOA auth context with pre-generated materials...'
    );
    const authContextWithPreGenerated =
      await ctx.authManager.createEoaAuthContext({
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        },
        config: {
          account: ctx.aliceViemAccount,
        },
        litClient: ctx.litClient,
        // Note: EOA auth contexts don't currently support pre-generated materials
        // This demonstrates the pattern for when it's implemented
      });

    console.log('✅ EOA Auth Context with Pre-generated Materials created');
    return authContextWithPreGenerated;
  } catch (e) {
    console.error(
      '❌ Error creating EOA Auth Context with Pre-generated Materials',
      e
    );
    throw e;
  }
};
