export const LIT_ENDPOINT_VERSION = {
  V0: '/',
  V1: '/v1',
  V2: '/v2',
} as const;

// @deprecated - this will be provided by each network module
export const LIT_ENDPOINT = {
  // internal
  HANDSHAKE: {
    path: '/web/handshake',
    version: LIT_ENDPOINT_VERSION.V0,
  },
  SIGN_SESSION_KEY: {
    path: '/web/sign_session_key',
    version: LIT_ENDPOINT_VERSION.V2,
  },

  // public
  EXECUTE_JS: {
    path: '/web/execute',
    version: LIT_ENDPOINT_VERSION.V2,
  },
  PKP_SIGN: {
    path: '/web/pkp/sign',
    version: LIT_ENDPOINT_VERSION.V2,
  },
  PKP_CLAIM: {
    path: '/web/pkp/claim',
    version: LIT_ENDPOINT_VERSION.V0,
  },
  ENCRYPTION_SIGN: {
    path: '/web/encryption/sign',
    version: LIT_ENDPOINT_VERSION.V2,
  },
} as const;
