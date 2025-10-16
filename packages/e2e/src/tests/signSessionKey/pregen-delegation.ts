import {
  createAuthManager,
  generateSessionKeyPair,
  storagePlugins,
  validateDelegationAuthSig,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { resolveNetworkImportName } from '../../helper/network';
import { initFast } from '../../init';

type PregenContext = Awaited<ReturnType<typeof initFast>>;

export const createPregenDelegationServerReuseTest = (ctx: PregenContext) => {
  return async () => {
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

    const envelope = JSON.stringify({
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      payload: Buffer.from(
        JSON.stringify({ sessionKeyPair, delegationAuthSig }),
        'utf8'
      ).toString('base64url'),
    });

    const parsedEnvelope = JSON.parse(envelope) as {
      pkpPublicKey: string;
      payload: string;
    };

    const decodedPayload = JSON.parse(
      Buffer.from(parsedEnvelope.payload, 'base64url').toString('utf8')
    ) as {
      sessionKeyPair: typeof sessionKeyPair;
      delegationAuthSig: typeof delegationAuthSig;
    };

    validateDelegationAuthSig({
      delegationAuthSig: decodedPayload.delegationAuthSig,
      sessionKeyUri: decodedPayload.sessionKeyPair.publicKey,
    });

    const serverAuthManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'e2e-server-reuse',
        networkName: process.env['NETWORK'] ?? 'naga-dev',
        storagePath: './.e2e/server-reuse-storage',
      }),
    });

    const authContext =
      await serverAuthManager.createPkpAuthContextFromPreGenerated({
        pkpPublicKey: parsedEnvelope.pkpPublicKey,
        sessionKeyPair: decodedPayload.sessionKeyPair,
        delegationAuthSig: decodedPayload.delegationAuthSig,
      });

    let litClient;
    try {
      const networksModule = await import('@lit-protocol/networks');
      const importName = resolveNetworkImportName(process.env['NETWORK']);
      const networkModule = networksModule[importName];
      litClient = await createLitClient({ network: networkModule });
      await litClient.connect();
    } catch {
      litClient = ctx.litClient;
    }

    const result = await litClient.chain.ethereum.pkpSign({
      authContext,
      pubKey: parsedEnvelope.pkpPublicKey,
      toSign: 'hello from server reuse',
    });

    expect(result).toBeTruthy();
  };
};
