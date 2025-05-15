export * from './lib/types';
export * from './lib/interfaces';
export * from './lib/ILitNodeClient';
export * from './lib/models';
export * from './lib/node-interfaces/node-interfaces';
export * from './lib/interfaces/session-sigs';
export * from './lib/EndpointResponses';

/**
 * Interface for a single request item to be sent to a Lit Protocol node.
 * This structure should match the objects within the '_request' array in getLitClient.ts.
 */
export interface RequestItem<T> {
  fullPath: string; // The full URL endpoint of the node
  data: T; // The payload for the request
  requestId: string; // Identifier for this specific request/batch
  epoch: number; // The current epoch number
  version: string; // The version of the Lit Protocol client/network
}
