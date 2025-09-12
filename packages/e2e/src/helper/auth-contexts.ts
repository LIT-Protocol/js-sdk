import { init } from '../init';

/**
 * Creates a PKP authentication context
 */
export const createPkpAuthContext: (
  ctx: Awaited<ReturnType<typeof init>>
) => Promise<any> = async (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  console.log('🔁 Creating PKP Auth Context');
  try {
    const pkpAuthContext = await ctx.authManager.createPkpAuthContext({
      authData: ctx.aliceViemAccountAuthData,
      pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
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
) => Promise<any> = async (
  ctx: Awaited<ReturnType<typeof init>>
) => {
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
