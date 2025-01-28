import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import {
  type GetPkpSessionSigs,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';
import {
  LIT_ABILITY,
  CENTRALISATION_BY_NETWORK,
} from '@lit-protocol/constants';
import { TinnyEnvironment } from '../tinny-environment';
import { TinnyPerson } from '../tinny-person';

export const getPkpAuthContext = (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[],
  expiration?: string
): Omit<GetPkpSessionSigs, 'product'> => {
  const centralisation =
    CENTRALISATION_BY_NETWORK[devEnv.litNodeClient.config.litNetwork];

  // Use default resourceAbilityRequests if not provided
  const _resourceAbilityRequests = resourceAbilityRequests || [
    {
      resource: new LitPKPResource('*'),
      ability: LIT_ABILITY.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LIT_ABILITY.LitActionExecution,
    },
  ];

  const authContext = {
    pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
    authMethods: [alice.authMethod],
    expiration,
    resourceAbilityRequests: _resourceAbilityRequests,

    ...(centralisation === 'decentralised' && {
      capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
    }),
  };

  log('[getPkpAuthContext]: ', authContext);

  return authContext;
};
