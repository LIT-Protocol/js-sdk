import { z } from 'zod';

import {
  DecryptRequestSchema,
  DecryptResponseSchema,
  EncryptResponseSchema,
} from './encryption';
import {
  ILitResourceSchema,
  ISessionCapabilityObjectSchema,
  LitNodeClientConfigSchema,
} from './models';
import {
  EncryptSdkParamsSchema,
  ExecuteJsResponseSchema,
  FormattedMultipleAccsSchema,
  GetSignedTokenRequestSchema,
  HandshakeWithNodeSchema,
  JsonExecutionSdkParamsSchema,
  JsonHandshakeResponseSchema,
  MultipleAccessControlConditionsSchema,
  NodeBlsSigningShareSchema,
  NodeCommandResponseSchema,
  NodeCommandServerKeysResponseSchema,
  RejectedNodePromisesSchema,
  SendNodeCommandSchema,
  SuccessNodePromisesSchema,
  SupportedJsonRequestsSchema,
} from './schemas';

export const ILitNodeClientSchema = z.object({
  config: LitNodeClientConfigSchema,
  connectedNodes: z.set(z.string()),
  serverKeys: z.record(z.string(), JsonHandshakeResponseSchema),
  ready: z.boolean(),
  subnetPubKey: z.string().nullable(),
  networkPubKey: z.string().nullable(),
  networkPubKeySet: z.string().nullable(),
  latestBlockhash: z.string().nullable(),

  // ========== Constructor ==========
  // ** IMPORTANT !! You have to create your constructor when implementing this class **
  // constructor: z.function().args(LitNodeClientConfigSchema),

  // ========== Scoped Class Helpers ==========

  /**
   *
   * Set bootstrapUrls to match the network litNetwork unless it's set to custom
   *
   * @returns { void }
   *
   */
  setCustomBootstrapUrls: z.function().returns(z.void()),
  /**
   *
   * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
   *
   */
  getJWTParams: z.function().returns(
    z.object({
      iat: z.number(),
      exp: z.number(),
    })
  ),
  /**
   *
   * Combine Shares from signature shares
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT: z
    .function()
    .args(z.array(NodeBlsSigningShareSchema), z.string().optional())
    .returns(z.promise(z.string())),
  /**
   *
   * Get different formats of access control conditions, eg. evm, sol, unified etc.
   *
   * @param { SupportedJsonRequests } params
   *
   * @returns { FormattedMultipleAccs }
   *
   */
  getFormattedAccessControlConditions: z
    .function()
    .args(SupportedJsonRequestsSchema)
    .returns(FormattedMultipleAccsSchema),
  /**
   *
   * Get hash of access control conditions
   *
   * @param { MultipleAccessControlConditions } params
   *
   * @returns { Promise<ArrayBuffer | undefined> }
   *
   */
  getHashedAccessControlConditions: z
    .function()
    .args(MultipleAccessControlConditionsSchema)
    .returns(z.promise(z.union([z.instanceof(ArrayBuffer), z.undefined()]))),

  // ========== Promise Handlers ==========

  /**
   * Get and gather node promises
   *
   * @param { function } callback
   *
   * @returns { Array<Promise<NodeCommandResponse>> }
   *
   */
  getNodePromises: z
    .function()
    .args(
      z
        .function()
        .args(z.string().url())
        .returns(z.promise(NodeCommandResponseSchema))
    )
    .returns(z.array(z.promise(NodeCommandResponseSchema))),
  /**
   * Get one node promise
   *
   * @param { function } callback
   *
   * @returns { Array<Promise<NodeCommandResponse>> }
   *
   */
  getRandomNodePromise: z
    .function()
    .args(
      z
        .function()
        .args(z.string().url())
        .returns(z.promise(NodeCommandResponseSchema))
    )
    .returns(z.array(z.promise(NodeCommandResponseSchema)).length(1)),
  /**
   * Handle node promises
   *
   * @param { Array<Promise<T>> } nodePromises
   *
   * @param {string} requestId request Id used for logging
   * @param {number} minNodeCount The minimum number of nodes we need a successful response from to continue
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromisesSchema> }
   *
   */
  handleNodePromises: z
    .function()
    .args(z.array(z.promise(z.any())), z.string(), z.number())
    .returns(
      z.promise(
        z.discriminatedUnion('success', [
          SuccessNodePromisesSchema,
          RejectedNodePromisesSchema,
        ])
      )
    ),
  /**
   *
   * Throw node error
   *
   * @param { RejectedNodePromisesSchema } res
   * @param { string } requestId
   *
   * @returns { void }
   *
   */
  _throwNodeError: z
    .function()
    .args(RejectedNodePromisesSchema, z.string())
    .returns(z.never()),

  // ========== API Calls to Nodes ==========
  sendCommandToNode: z
    .function()
    .args(SendNodeCommandSchema)
    .returns(z.promise(z.instanceof(Response))),
  /**
   *
   * Handshake with SGX
   *
   * @param { HandshakeWithNode } params
   *
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  handshakeWithNode: z
    .function()
    .args(HandshakeWithNodeSchema, z.string())
    .returns(z.promise(NodeCommandServerKeysResponseSchema)),

  // ========== Scoped Business Logics ==========
  /**
   *
   * Execute JS on the nodes and combine and return any resulting signatures
   *
   * @param { ExecuteJsRequest } params
   *
   * @returns { ExecuteJsResponse }
   *
   */
  executeJs: z
    .function()
    .args(JsonExecutionSdkParamsSchema)
    .returns(z.promise(z.union([ExecuteJsResponseSchema, z.undefined()]))),
  /**
   *
   * Request a signed JWT from the LIT network. Before calling this function, you must know the access control conditions for the item you wish to gain authorization for.
   *
   * @param { GetSignedTokenRequest } params
   *
   * @returns { Promise<string> } final JWT
   *
   */
  getSignedToken: z
    .function()
    .args(GetSignedTokenRequestSchema)
    .returns(z.promise(z.union([z.string(), z.undefined()]))),
  /**
   * Encrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  encrypt: z
    .function()
    .args(EncryptSdkParamsSchema)
    .returns(z.promise(EncryptResponseSchema)),
  /**
   * Decrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  decrypt: z
    .function()
    .args(DecryptRequestSchema)
    .returns(z.promise(DecryptResponseSchema)),
  /**
   *
   * Connect to the LIT nodes
   *
   * @returns { Promise } A promise that resolves when the nodes are connected.
   *
   */
  connect: z.function().returns(z.promise(z.void())),
  /**
   * Generates a session capability object
   *
   * @param litResources An array of ILitResource to be processed.
   * @returns A Promise resolving to an ISessionCapabilityObject.
   */
  generateSessionCapabilityObjectWithWildcards: z
    .function()
    .args(z.array(ILitResourceSchema))
    .returns(z.promise(ISessionCapabilityObjectSchema)),
});
