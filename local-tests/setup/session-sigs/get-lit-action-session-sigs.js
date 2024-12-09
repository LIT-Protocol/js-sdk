import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { CENTRALISATION_BY_NETWORK, GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK, LIT_ABILITY, } from '@lit-protocol/constants';
const VALID_SESSION_SIG_LIT_ACTION_CODE = `
// Works with an AuthSig AuthMethod
if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
  LitActions.setResponse({ response: "true" });
} else {
  LitActions.setResponse({ response: "false" });
}
`;
const INVALID_SESSION_SIG_LIT_ACTION_CODE = `
(async () => {
  let utf8Encode = new TextEncoder();
  const toSign = utf8Encode.encode('This message is exactly 32 bytes');
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
})();
`;
/**
 * https://cloudflare-ipfs.com/ipfs/QmRf5K7PVi5TWXiJdw7YYtcgpgRY6ufXGr9yYnxBLvLjDp
 */
export const VALID_IPFS_ID = 'QmRf5K7PVi5TWXiJdw7YYtcgpgRY6ufXGr9yYnxBLvLjDp';
/**
 * https://cloudflare-ipfs.com/ipfs/QmeUByesskboEkLLcE9Hd3bWFZT5Xt53RSauMNTJSVhfqm
 */
export const INVALID_IPFS_ID = 'QmeUByesskboEkLLcE9Hd3bWFZT5Xt53RSauMNTJSVhfqm';
export const getLitActionSessionSigs = async (devEnv, alice, resourceAbilityRequests) => {
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
    const litActionSessionSigs = await devEnv.litNodeClient.getLitActionSessionSigs({
        pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
        authMethods: [alice.authMethod],
        resourceAbilityRequests: _resourceAbilityRequests,
        litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString('base64'),
        jsParams: {
            publicKey: alice.authMethodOwnedPkp.publicKey,
            sigName: 'unified-auth-sig',
        },
        ...(centralisation === 'decentralised' && {
            capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
        }),
    });
    return litActionSessionSigs;
};
export const getLitActionSessionSigsUsingIpfsId = async (devEnv, alice, resourceAbilityRequests) => {
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
    const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
        pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
        authMethods: [alice.authMethod],
        resourceAbilityRequests: _resourceAbilityRequests,
        litActionIpfsId: VALID_IPFS_ID,
        jsParams: {
            publicKey: alice.authMethodOwnedPkp.publicKey,
            sigName: 'unified-auth-sig',
        },
        ...(centralisation === 'decentralised' && {
            capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
        }),
    });
    return litActionSessionSigs;
};
export const getInvalidLitActionSessionSigs = async (devEnv, alice) => {
    const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
        pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
        authMethods: [alice.authMethod],
        resourceAbilityRequests: [
            {
                resource: new LitPKPResource('*'),
                ability: LIT_ABILITY.PKPSigning,
            },
        ],
        litActionCode: Buffer.from(INVALID_SESSION_SIG_LIT_ACTION_CODE).toString('base64'),
        jsParams: {
            publicKey: alice.authMethodOwnedPkp.publicKey,
            sigName: 'unified-auth-sig',
        },
        ipfsOptions: {
            overwriteCode: GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[devEnv.litNodeClient.config.litNetwork],
        },
    });
    return litActionSessionSigs;
};
export const getInvalidLitActionIpfsSessionSigs = async (devEnv, alice) => {
    const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
        pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
        authMethods: [alice.authMethod],
        resourceAbilityRequests: [
            {
                resource: new LitPKPResource('*'),
                ability: LIT_ABILITY.PKPSigning,
            },
        ],
        litActionIpfsId: INVALID_IPFS_ID,
        jsParams: {
            publicKey: alice.authMethodOwnedPkp.publicKey,
            sigName: 'unified-auth-sig',
        },
        ipfsOptions: {
            overwriteCode: GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[devEnv.litNodeClient.config.litNetwork],
        },
    });
    return litActionSessionSigs;
};
//# sourceMappingURL=get-lit-action-session-sigs.js.map