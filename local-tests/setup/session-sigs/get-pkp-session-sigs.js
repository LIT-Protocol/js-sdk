import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { log } from '@lit-protocol/misc';
import { LIT_ABILITY, CENTRALISATION_BY_NETWORK, } from '@lit-protocol/constants';
export const getPkpSessionSigs = async (devEnv, alice, resourceAbilityRequests, expiration) => {
    const centralisation = CENTRALISATION_BY_NETWORK[devEnv.litNodeClient.config.litNetwork];
    if (centralisation === 'decentralised') {
        console.warn('Decentralised network detected. Adding superCapacityDelegationAuthSig to eoaSessionSigs');
    }
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
    const pkpSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
        pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
        authMethods: [alice.authMethod],
        expiration,
        resourceAbilityRequests: _resourceAbilityRequests,
        ...(centralisation === 'decentralised' && {
            capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
        }),
    });
    log('[getPkpSessionSigs]: ', pkpSessionSigs);
    return pkpSessionSigs;
};
//# sourceMappingURL=get-pkp-session-sigs.js.map