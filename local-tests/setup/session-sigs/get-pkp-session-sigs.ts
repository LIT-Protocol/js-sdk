import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { DevEnv } from '../env-setup';
import { LitAbility } from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';

export const getPkpSessionSigs = async (devEnv: DevEnv) => {
  const pkpSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
    authMethods: [devEnv.hotWalletAuthMethod],
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
  });

  log('[getPkpSessionSigs]: ', pkpSessionSigs);

  return pkpSessionSigs;
};
