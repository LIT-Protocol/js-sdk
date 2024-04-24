export enum LIT_ENDPOINT_VERSION {
  V0 = '/',
  V1 = '/v1',
}

export const LIT_ENDPOINT = {
  HANDSHAKE: {
    path: '/web/handshake',
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'HANDSHAKE',
  },
  SIGN_SESSION_KEY: {
    path: '/web/sign_session_key',
    // version: LIT_ENDPOINT_VERSION.V1,

    // FIXME: Change this to V1 once the new version is deployed to all public networks
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'SIGN_SESSION_KEY',
  },
  EXECUTE_JS: {
    path: '/web/execute',
    // FIXME: Change this to V1 once the new version is deployed to all public networks
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'EXECUTE_JS',
  },
  PKP_SIGN: {
    path: '/web/pkp/sign',
    // version: LIT_ENDPOINT_VERSION.V1,
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'PKP_SIGN',
  },
  PKP_CLAIM: {
    path: '/web/pkp/claim',
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'PKP_CLAIM',
  },
  SIGN_ACCS: {
    path: '/web/signing/access_control_condition',
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'SIGN_ACCS',
  },
  ENCRYPTION_SIGN: {
    path: '/web/encryption/sign',
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'ENCRYPTION_SIGN',
  },
  SIGN_ECDSA: {
    path: '/web/signing/signConditionEcdsa',
    version: LIT_ENDPOINT_VERSION.V0,
    envName: 'SIGN_ECDSA',
  },
};
