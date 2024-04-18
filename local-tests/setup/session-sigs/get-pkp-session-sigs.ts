import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { DevEnv } from '../env-setup';
import { LitAbility, LitResourceAbilityRequest } from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';

export const getPkpSessionSigs = async (
  devEnv: DevEnv,
  resourceAbilityRequests?: LitResourceAbilityRequest[]
) => {
  // Use default resourceAbilityRequests if not provided
  const _resourceAbilityRequests = resourceAbilityRequests || [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ];

  const pkpSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
    authMethods: [devEnv.hotWalletAuthMethod],
    resourceAbilityRequests: _resourceAbilityRequests,
  });

  log('[getPkpSessionSigs]: ', pkpSessionSigs);

  return pkpSessionSigs;
};
