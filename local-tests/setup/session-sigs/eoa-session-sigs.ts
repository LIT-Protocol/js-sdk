import {
  LitActionResource,
  LitPKPResource,
  craftAuthSig,
  createSiweMessageWithRecaps,
} from '@lit-protocol/auth-helpers';
import { DevEnv } from '../env-setup';
import { AuthCallbackParams, LitAbility } from '@lit-protocol/types';

export const getEoaSessionSigs = async (devEnv: DevEnv) => {
  const sessionSigs = await devEnv.litNodeClient.getSessionSigs({
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }: AuthCallbackParams) => {
      if (!expiration) {
        throw new Error('expiration is required');
      }

      if (!resourceAbilityRequests) {
        throw new Error('resourceAbilityRequests is required');
      }

      if (!uri) {
        throw new Error('uri is required');
      }

      const toSign = await createSiweMessageWithRecaps({
        uri: uri,
        expiration: expiration,
        resources: resourceAbilityRequests,
        walletAddress: devEnv.hotWallet.address,
        nonce: devEnv.lastestBlockhash,
        litNodeClient: devEnv.litNodeClient,
      });

      const authSig = await craftAuthSig({
        signer: devEnv.hotWallet,
        toSign,
      });

      return authSig;
    },
  });

  console.log('[getEoaSessionSigs]: ', getEoaSessionSigs);

  return sessionSigs;
};
