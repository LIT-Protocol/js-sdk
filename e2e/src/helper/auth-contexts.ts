import { init } from '../init';

import { hexToBigInt, keccak256, toBytes } from 'viem';

/**
 * Creates a PKP authentication context
 */
export const createPkpAuthContext = async (
  ctx: Awaited<ReturnType<typeof init>>
) => {
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

  return pkpAuthContext;
};

/**
 * Creates a custom authentication context
 */
export const createCustomAuthContext = async (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  // Set up custom auth method type and validation IPFS CID (from custom-auth-flow example)
  const uniqueDappName = 'e2e-test-dapp';
  const uniqueAuthMethodType = hexToBigInt(keccak256(toBytes(uniqueDappName)));
  const uniqueUserId = `${uniqueDappName}-alice`;
  const authMethodId = keccak256(toBytes(uniqueUserId));
  const validationIpfsCid = 'QmYLeVmwJPVs7Uebk85YdVPivMyrvoeKR6X37kyVRZUXW4';

  const customAuthContext = await ctx.authManager.createCustomAuthContext({
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
    customAuthParams: {
      litActionIpfsId: validationIpfsCid,
      jsParams: {
        pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
        username: 'alice',
        password: 'lit',
        authMethodId: authMethodId,
      },
    },
  });

  return customAuthContext;
};
