import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
} from '@lit-protocol/schemas';
import { LitActionResponseStrategy } from '@lit-protocol/types';
import { z } from 'zod';

/**
 * ExecuteJs Input Schema
 * Based on JsonExecutionSdkParams but following the naga-dev module pattern
 */
export const ExecuteJsInputSchema = z
  .object({
    /**
     * JS code to run on the nodes
     */
    code: z.string().optional(),

    /**
     * The IPFS ID of some JS code to run on the nodes
     */
    ipfsId: z.string().optional(),

    /**
     * An object that contains params to expose to the Lit Action.
     * These will be injected to the JS runtime before your code runs.
     */
    jsParams: z
      .union([
        z.any(),
        z
          .object({
            publicKey: z.string().optional(),
            sigName: z.string().optional(),
          })
          .catchall(z.any()),
      ])
      .optional(),

    /**
     * Authentication context - either PKP or EOA based
     */
    authContext: z.union([PKPAuthContextSchema, EoaAuthContextSchema]),

    /**
     * User's maximum price they're willing to pay for the request
     */
    userMaxPrice: z.bigint().optional(),

    /**
     * Only run the action on a single node; this will only work if all code in your action is non-interactive
     */
    useSingleNode: z.boolean().optional(),

    /**
     * Response strategy for processing Lit Action responses
     */
    responseStrategy: z.custom<LitActionResponseStrategy>().optional(),
  })
  .refine((data) => data.code || data.ipfsId, {
    message: "Either 'code' or 'ipfsId' must be provided",
    path: ['code'],
  });
