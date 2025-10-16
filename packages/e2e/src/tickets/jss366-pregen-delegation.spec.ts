import { createPkpSignTest } from '../helper/tests';
import { initFast } from '../init';
import {
  generateSessionKeyPair,
  validateDelegationAuthSig,
} from '@lit-protocol/auth';

describe('PKP Auth with Pre-generated Materials', () => {
  let ctx: Awaited<ReturnType<typeof initFast>>;

  beforeAll(async () => {
    ctx = await initFast();
  });

  test('Try to pregen', async () => {
    // Step 1: Generate a session key pair directly
    const sessionKeyPair = generateSessionKeyPair();
    console.log('Session Key Pair:', sessionKeyPair);

    // Step 2: Generate PKP delegation signature for the session key pair
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

    console.log('delegationAuthSig:', delegationAuthSig);

    // (Optional) Internally, we also run the `validateDelegationAuthSig` function to ensure the signature is valid before proceeding. However, we can also use this externally in case you want to validate a signature yourself.
    validateDelegationAuthSig({
      delegationAuthSig,
      sessionKeyUri: sessionKeyPair.publicKey,
    });

    // Step 3: Create auth context using the pre-generated materials
    const authContextWithPreGenerated =
      await ctx.authManager.createPkpAuthContextFromPreGenerated({
        pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
        sessionKeyPair,
        delegationAuthSig,
      });

    console.log('authContextWithPreGenerated:', authContextWithPreGenerated);

    const res = await ctx.litClient.chain.ethereum.pkpSign({
      authContext: authContextWithPreGenerated,
      pubKey: ctx.aliceViemAccountPkp.pubkey,
      toSign: 'Hello, world!',
    });

    console.log('res:', res);
  });
});
