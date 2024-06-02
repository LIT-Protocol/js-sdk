import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LitAbility, LitResourceAbilityRequest } from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';
import { LitNetwork } from '@lit-protocol/constants';
import { TinnyEnvironment } from '../tinny-environment';
import { TinnyPerson } from '../tinny-person';

export const getPkpSessionSigs = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[]
) => {
  if (devEnv.litNodeClient.config.litNetwork === LitNetwork.Manzano) {
    console.warn(
      'Manzano network detected. Adding capacityDelegationAuthSig to pkpSessionSigs'
    );
  }

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
    pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
    authMethods: [alice.authMethod],
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 mins
    resourceAbilityRequests: _resourceAbilityRequests,

    // -- only add this for manzano network
    ...(devEnv.litNodeClient.config.litNetwork === LitNetwork.Manzano
      ? { capacityDelegationAuthSig: devEnv.superCapacityDelegationAuthSig }
      : {}),
  });

  log('[getPkpSessionSigs]: ', pkpSessionSigs);

  return pkpSessionSigs;
};
