import {
  AuthSigSchema,
  NodeSetsFromUrlsSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';

/**
 * ExecuteJs Request Data Schema
 * This defines the structure of the request sent to the nodes for executeJs
 * Based on the actual working format - only includes fields sent to nodes
 */
export const ExecuteJsRequestDataSchema = z.object({
  /**
   * JS code to run on the nodes (base64 encoded)
   */
  code: z.string().optional(),

  /**
   * The IPFS ID of JS code to run on the nodes
   */
  ipfsId: z.string().optional(),

  /**
   * Parameters to expose to the Lit Action
   */
  jsParams: z.record(z.any()).optional(),

  /**
   * Authentication signature
   */
  authSig: AuthSigSchema,

  /**
   * Node set for the request - automatically transforms URLs to nodeSet format
   */
  nodeSet: NodeSetsFromUrlsSchema,
}); 