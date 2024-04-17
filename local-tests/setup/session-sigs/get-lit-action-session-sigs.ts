import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { DevEnv } from '../env-setup';
import { LitAbility } from '@lit-protocol/types';

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

export const getLitActionSessionSigs = async (devEnv: DevEnv) => {
  const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
    authMethods: [devEnv.hotWalletAuthMethod],
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
    ],
    litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString(
      'base64'
    ),
    jsParams: {
      publicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
      sigName: 'unified-auth-sig',
    },
  });

  return litActionSessionSigs;
};

export const getLitActionSessionSigsForExecuteJs = async (devEnv: DevEnv) => {
  const litActionSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
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
    litActionCode: Buffer.from(VALID_SESSION_SIG_LIT_ACTION_CODE).toString(
      'base64'
    ),
    jsParams: {
      publicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
      sigName: 'unified-auth-sig',
    },
  });

  return litActionSessionSigs;
};
