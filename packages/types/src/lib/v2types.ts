import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';

/**
 * Interface for a single request item to be sent to a Lit Protocol node.
 * This structure should match the objects within the '_request' array in createLitClient.ts.
 */
export interface RequestItem<T> {
  fullPath: string; // The full URL endpoint of the node
  data: T; // The payload for the request
  requestId: string; // Identifier for this specific request/batch
  epoch: number; // The current epoch number
  version: string; // The version of the Lit Protocol client/network
}

// Definition for a single endpoint
export type EndpointDefinition = {
  path: string;
  version: (typeof LIT_ENDPOINT_VERSION)[keyof typeof LIT_ENDPOINT_VERSION];
};

// Collection of known endpoints
export type EndPoint = {
  HANDSHAKE: EndpointDefinition;
  SIGN_SESSION_KEY: EndpointDefinition;
  EXECUTE_JS: EndpointDefinition;
  PKP_SIGN: EndpointDefinition;
  PKP_CLAIM: EndpointDefinition;
  ENCRYPTION_SIGN: EndpointDefinition;
};

export type CallbackParams = {
  bootstrapUrls: string[];
  currentEpoch: number;
  version: string;
  requiredAttestation: boolean;
  minimumThreshold: number;
  abortTimeout: number;
  endpoints: EndPoint;
};
