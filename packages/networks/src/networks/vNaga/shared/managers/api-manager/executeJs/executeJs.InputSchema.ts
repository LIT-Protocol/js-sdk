import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
  AuthSigSchema,
} from '@lit-protocol/schemas';
import { LitActionResponseStrategy } from '@lit-protocol/types';
import { z } from 'zod';

const SessionSigsSchema = z.record(z.string(), AuthSigSchema);

const ExecuteJsSharedFieldsSchema = z.object({
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
});

const ExecuteJsInputWithAuthContextSchema = ExecuteJsSharedFieldsSchema.extend({
  /**
   * Authentication context - either PKP or EOA based
   */
  authContext: z.union([PKPAuthContextSchema, EoaAuthContextSchema]),

  /**
   * Session signatures must not be supplied when an auth context is provided.
   */
  sessionSigs: z.never().optional(),
});

const ExecuteJsInputWithSessionSigsSchema =
  ExecuteJsSharedFieldsSchema.extend({
    /**
     * Pre-generated session signatures; when provided, authContext must be omitted.
     */
    sessionSigs: SessionSigsSchema,

    /**
     * authContext is intentionally unsupported in this branch.
     */
    authContext: z.undefined().optional(),
  });

export const ExecuteJsInputSchema = z
  .union([
    ExecuteJsInputWithAuthContextSchema,
    ExecuteJsInputWithSessionSigsSchema,
  ])
  .refine((data) => data.code || data.ipfsId, {
    message: "Either 'code' or 'ipfsId' must be provided",
    path: ['code'],
  });

export type ExecuteJsInput =
  | z.infer<typeof ExecuteJsInputWithAuthContextSchema>
  | z.infer<typeof ExecuteJsInputWithSessionSigsSchema>;
