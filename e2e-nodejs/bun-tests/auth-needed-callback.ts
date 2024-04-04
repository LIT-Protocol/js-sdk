import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  LitResourceAbilityRequest,
} from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallback,
  AuthCallbackParams,
  AuthMethod,
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
  pkp,
  VALID_LIT_ACTION_CODE = true,
}: {
  litNodeClient: LitNodeClient,
  authMethod: AuthMethod,
  pkp: {
    tokenId: string,
    publicKey: string,
    ethAddress: string,
  },
  VALID_LIT_ACTION_CODE?: boolean,
}) => {
  const authNeededCallback = async (callbackBody: {
    chain: string,
    statement: string,
    resources: string[], // array of urn:recap:eyJxxx
    expiration: string,
    uri: string, // lit:session:xxx
    nonce: string, // 0x5f...
    resourceAbilityRequests: LitResourceAbilityRequest[],
  }) => {
    // -- validate
    if (!callbackBody.expiration) {
      throw new Error('expiration is required');
    }

    if (!callbackBody.resources) {
      throw new Error('resources is required');
    }

    if (!callbackBody.resourceAbilityRequests) {
      throw new Error('❌ resourceAbilityRequests is required');
    }

    if (callbackBody.chain !== 'ethereum') {
      throw new Error('❌ chain must be ethereum so that chainId is 1');
    };

    const response = await litNodeClient.signSessionKey({
      sessionKeyUri: callbackBody.uri,
      statement: callbackBody.statement,
      authMethods: [authMethod],
      pkpPublicKey: pkp.publicKey,
      expiration: callbackBody.expiration,
      resources: callbackBody.resources,
      chainId: 1,

      // TO BE CONFIRMED: We don't need sign this because the node would inject it for us
      // resourceAbilityRequests: callbackBody.resourceAbilityRequests,

      // -- Auth Unification parameters
      // base 64 encode this
      litActionCode: Buffer.from(
        VALID_LIT_ACTION_CODE
          ? VALID_SESSION_SIG_LIT_ACTION_CODE
          : INVALID_SESSION_SIG_LIT_ACTION_CODE
      ).toString('base64'),
      jsParams: {
        publicKey: pkp.publicKey,
        sigName: 'unified-auth-sig',
      },
    });

    console.log('authNeededCallback response:', response);

    return response.authSig;
  };

  return authNeededCallback;
};
