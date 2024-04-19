import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { DevEnv } from '../tinny-setup';
import { LitAbility, LitResourceAbilityRequest } from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';
import { LitNetwork } from '@lit-protocol/constants';

export const getPkpSessionSigs = async (
  devEnv: DevEnv,
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
    pkpPublicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
    authMethods: [devEnv.hotWalletAuthMethod],
    resourceAbilityRequests: _resourceAbilityRequests,

    // -- only add this for manzano network
    ...(devEnv.litNodeClient.config.litNetwork === LitNetwork.Manzano
      ? { capacityDelegationAuthSig: devEnv.capacityDelegationAuthSigWithPkp }
      : {}),
  });

  log('[getPkpSessionSigs]: ', pkpSessionSigs);

  return pkpSessionSigs;
};
