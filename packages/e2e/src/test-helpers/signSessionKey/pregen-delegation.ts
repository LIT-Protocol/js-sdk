import {
  createAuthManager,
  generateSessionKeyPair,
  validateDelegationAuthSig,
} from '@lit-protocol/auth';
import { storagePlugins } from '@lit-protocol/auth/storage-node';
import { createLitClient } from '@lit-protocol/lit-client';
import { ResolvedNetwork } from '../../helper/network';
import { AuthData } from '@lit-protocol/schemas';
import { AuthManagerInstance, LitClientInstance } from '../../types';

type PregenDelegationParams = {
  authManager: AuthManagerInstance;
  authData: AuthData;
  pkpPublicKey: string;
  clientLitClient: LitClientInstance;
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
      resolvedNetwork,
    } = params;

    // 1. Generate session key pair and delegation auth sig
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

    // 2. Create envelope to send over the wire
    const envelope = JSON.stringify({
      pkpPublicKey,
      payload: Buffer.from(
        JSON.stringify({ sessionKeyPair, delegationAuthSig }),
        'utf8'
      ).toString('base64url'),
    });

    // 3. On server side, parse envelope and validate delegation auth sig
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

    const litClient = await createLitClient({
      network: resolvedNetwork.networkModule,
    });

    const serverAuthManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'e2e-server-reuse',
        networkName: resolvedNetwork.name,
        storagePath: './.e2e/server-reuse-storage',
      }),
    });

    // 4. Recreate auth context on server side
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

    console.log('result:', result);

    expect(result).toBeTruthy();
  };
};
