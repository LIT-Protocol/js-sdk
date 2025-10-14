export const LIT_ENDPOINT_VERSION = {
  V0: '/',
  V1: '/v1',
  V2: '/v2',
} as const;

// Define the type for an individual endpoint
export type EndpointDefinition = {
  path: string;
  version: (typeof LIT_ENDPOINT_VERSION)[keyof typeof LIT_ENDPOINT_VERSION];
};

// Define the type for the collection of Naga endpoints
export type NagaEndpointsType = {
  HANDSHAKE: EndpointDefinition;
  SIGN_SESSION_KEY: EndpointDefinition;
  EXECUTE_JS: EndpointDefinition;
  PKP_SIGN: EndpointDefinition;
  PKP_CLAIM: EndpointDefinition;
  ENCRYPTION_SIGN: EndpointDefinition;
};

export const NAGA_ENDPOINT: NagaEndpointsType = {
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
