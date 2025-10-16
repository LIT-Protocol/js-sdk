import { initFast } from '../init';
import {
  createAuthManager,
  generateSessionKeyPair,
  storagePlugins,
  validateDelegationAuthSig,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev } from '@lit-protocol/networks';

describe('PKP Auth with Pre-generated Materials', () => {
  let ctx: Awaited<ReturnType<typeof initFast>>;

  beforeAll(async () => {
    ctx = await initFast();
  });

  test('Try to pregen', async () => {
    // CLIENT SIDE: generate session materials and delegation
    const sessionKeyPair = generateSessionKeyPair();

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

    const serializedPayload = JSON.stringify({
      sessionKeyPair,
      delegationAuthSig,
    });

    console.log('Serialized Payload:', serializedPayload);

    // SERVER SIDE: receive over the wire
    const {
      sessionKeyPair: receivedSessionKeyPair,
      delegationAuthSig: receivedDelegationAuthSig,
    } = JSON.parse(serializedPayload) as {
      sessionKeyPair: typeof sessionKeyPair;
      delegationAuthSig: typeof delegationAuthSig;
    };

    validateDelegationAuthSig({
      delegationAuthSig: receivedDelegationAuthSig,
      sessionKeyUri: receivedSessionKeyPair.publicKey,
    });

    const serverAuthManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'e2e-pre-generated',
        networkName: 'naga-dev',
        storagePath: './.e2e/pre-generated-storage',
      }),
    });

    const authContextWithPreGenerated =
      await serverAuthManager.createPkpAuthContextFromPreGenerated({
        pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
        sessionKeyPair: receivedSessionKeyPair,
        delegationAuthSig: receivedDelegationAuthSig,
      });

    const litClient = await createLitClient({ network: nagaDev });
    const res = await litClient.chain.ethereum.pkpSign({
      authContext: authContextWithPreGenerated,
      pubKey: ctx.aliceViemAccountPkp.pubkey,
      toSign: 'Hello, world!',
    });

    expect(res).toBeTruthy();

    console.log(
      'ctx.aliceViemAccountPkp.pubkey:',
      ctx.aliceViemAccountPkp.pubkey
    );
  });
});
