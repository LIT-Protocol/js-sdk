import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
import {
  CENTRALISATION_BY_NETWORK,
  GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK,
  LIT_ABILITY,
} from '@lit-protocol/constants';
import { TinnyPerson } from '../tinny-person';
import { TinnyEnvironment } from '../tinny-environment';

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

export const getLitActionAuthContext = (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[]
) => {
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

  return devEnv.litNodeClient.getPkpAuthContext({
    pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
    authMethods: [alice.authMethod],
    resourceAbilityRequests: _resourceAbilityRequests,
    litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString(
      'base64'
    ),
    jsParams: {
      publicKey: alice.authMethodOwnedPkp.publicKey,
      sigName: 'unified-auth-sig',
    },

    ...(centralisation === 'decentralised' && {
      capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
    }),
  });
};

export const getLitActionAuthContextUsingIpfsId = (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[]
) => {
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

  return devEnv.litNodeClient.getPkpAuthContext({
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
};

export const getInvalidLitActionAuthContext = (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson
) => {
  return devEnv.litNodeClient.getPkpAuthContext({
    pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
    authMethods: [alice.authMethod],
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LIT_ABILITY.PKPSigning,
      },
    ],
    litActionCode: Buffer.from(INVALID_SESSION_SIG_LIT_ACTION_CODE).toString(
      'base64'
    ),
    jsParams: {
      publicKey: alice.authMethodOwnedPkp.publicKey,
      sigName: 'unified-auth-sig',
    },
    ipfsOptions: {
      overwriteCode:
        GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[
          devEnv.litNodeClient.config.litNetwork
        ],
    },
  });
};

export const getInvalidLitActionIpfsAuthContext = (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson
) => {
  return devEnv.litNodeClient.getPkpAuthContext({
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
      overwriteCode:
        GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[
          devEnv.litNodeClient.config.litNetwork
        ],
    },
  });
};
