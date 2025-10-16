import {
  createAuthManager,
  generateSessionKeyPair,
  storagePlugins,
  validateDelegationAuthSig,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { ResolvedNetwork } from '../../helper/network';
import { AuthData } from '@lit-protocol/schemas';
import { AuthManagerInstance, LitClientInstance } from '../../types';

type PregenDelegationParams = {
  authManager: AuthManagerInstance;
  authData: AuthData;
  pkpPublicKey: string;
  clientLitClient: LitClientInstance;
  fallbackLitClient?: LitClientInstance;
  resolvedNetwork: ResolvedNetwork;
};

export const createPregenDelegationServerReuseTest = (
  params: PregenDelegationParams
) => {
  return async () => {
    const {
      authManager,
      authData,
      pkpPublicKey,
      clientLitClient,
      fallbackLitClient,
      resolvedNetwork,
    } = params;

    const sessionKeyPair = generateSessionKeyPair();
    const delegationAuthSig = await authManager.generatePkpDelegationAuthSig({
      pkpPublicKey,
      authData,
      sessionKeyPair,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: clientLitClient,
    });

    const envelope = JSON.stringify({
      pkpPublicKey,
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

    let litClient: LitClientInstance;

    try {
      litClient = await createLitClient({
        network: resolvedNetwork.networkModule,
      });
    } catch {
      litClient = fallbackLitClient ?? clientLitClient;
    }

    const serverAuthManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'e2e-server-reuse',
        networkName: resolvedNetwork.name,
        storagePath: './.e2e/server-reuse-storage',
      }),
    });

    const authContext =
      await serverAuthManager.createPkpAuthContextFromPreGenerated({
        pkpPublicKey: parsedEnvelope.pkpPublicKey,
        sessionKeyPair: decodedPayload.sessionKeyPair,
        delegationAuthSig: decodedPayload.delegationAuthSig,
      });

    const result = await litClient.chain.ethereum.pkpSign({
      authContext,
      pubKey: parsedEnvelope.pkpPublicKey,
      toSign: 'hello from server reuse',
    });

    expect(result).toBeTruthy();
  };
};
