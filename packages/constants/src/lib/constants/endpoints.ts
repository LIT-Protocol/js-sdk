export enum LIT_ENDPOINT_VERSION {
  V0 = '/',
  V1 = '/v1',
}

export const LIT_ENDPOINT = {
  HANDSHAKE: {
    path: '/web/handshake',
    version: LIT_ENDPOINT_VERSION.V0,
  },
  SIGN_SESSION_KEY: {
    path: '/web/sign_session_key',
    version: LIT_ENDPOINT_VERSION.V1,
  },
  EXECUTE_JS: {
    path: '/web/execute',
    version: LIT_ENDPOINT_VERSION.V1,
  },
  PKP_SIGN: {
    path: '/web/pkp/sign',
    version: LIT_ENDPOINT_VERSION.V1,
  },
  PKP_CLAIM: {
    path: '/web/pkp/claim',
    version: LIT_ENDPOINT_VERSION.V0,
  },
  SIGN_ACCS: {
    path: '/web/signing/access_control_condition',
    version: LIT_ENDPOINT_VERSION.V0,
  },
  ENCRYPTION_SIGN: {
    path: '/web/encryption/sign',
    version: LIT_ENDPOINT_VERSION.V0,
  },
  SIGN_ECDSA: {
    path: '/web/signing/signConditionEcdsa',
    version: LIT_ENDPOINT_VERSION.V0,
  },
};
