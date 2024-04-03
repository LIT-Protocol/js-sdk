import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import {
  AuthCallback,
  AuthCallbackParams,
  SessionKeyPair,
} from '@lit-protocol/types';

export const VALID_SESSION_SIG_LIT_ACTION_CODE = `
// Works with an AuthSig AuthMethod
if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
  LitActions.setResponse({ response: "true" });
} else {
  LitActions.setResponse({ response: "false" });
}
`;

export const INVALID_SESSION_SIG_LIT_ACTION_CODE = `
(async () => {
  let utf8Encode = new TextEncoder();
  const toSign = utf8Encode.encode('This message is exactly 32 bytes');
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
})();
`;

export const getAuthNeededCallback = ({
  litNodeClient,
  authMethod,
  pkpPublickey,
  VALID_LIT_ACTION_CODE = true,
}) => {
  const authNeededCallback = async ({
    expiration,
    resources,
    resourceAbilityRequests,
    statement,
  }) => {
    // -- validate
    if (!expiration) {
      throw new Error('expiration is required');
    }

    if (!resources) {
      throw new Error('resources is required');
    }

    console.log('resourceAbilityRequests:', resourceAbilityRequests);
    if (!resourceAbilityRequests) {
      throw new Error('❌ resourceAbilityRequests is required');
    }

    const response = await litNodeClient.signSessionKey({
      // sessionKey: params.sessionKeyPair,
      statement: statement,
      authMethods: [authMethod],
      pkpPublicKey: pkpPublickey,
      expiration: expiration,
      resources: resources,
      chainId: 1,
      resourceAbilityRequests,

      // -- Auth Unification parameters
      // base 64 encode this
      litActionCode: Buffer.from(
        VALID_LIT_ACTION_CODE
          ? VALID_SESSION_SIG_LIT_ACTION_CODE
          : INVALID_SESSION_SIG_LIT_ACTION_CODE
      ).toString('base64'),
      jsParams: {
        publicKey: pkpPublickey,
        sigName: 'unified-auth-sig',
      },
    });

    console.log("authNeededCallback response:", response);

    return response.authSig;
  };

  return authNeededCallback;
};
