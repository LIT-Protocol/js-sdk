import {
  DecryptRequest,
  DecryptResponse,
  EncryptSdkParams,
  EncryptResponse,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  HandshakeWithNode,
  JsonExecutionSdkParams,
  JsonHandshakeResponse,
  LitNodeClientConfig,
  MultipleAccessControlConditions,
  NodeBlsSigningShare,
  NodeCommandServerKeysResponse,
  RejectedNodePromises,
  SendNodeCommand,
  SuccessNodePromises,
} from './interfaces';
import { ILitResource, ISessionCapabilityObject } from './models';
import { SupportedJsonRequests } from './types';

export interface ILitNodeClient {
  config: LitNodeClientConfig;
  connectedNodes: Set<string>;
  serverKeys: Record<string, JsonHandshakeResponse>;
  ready: boolean;
  subnetPubKey: string | null;
  networkPubKey: string | null;
  networkPubKeySet: string | null;
  latestBlockhash: string | null;

  // ========== Constructor ==========
  // ** IMPORTANT !! You have to create your constructor when implementing this class **
  // constructor(customConfig: LitNodeClientConfig);

  // ========== Scoped Class Helpers ==========

  /**
   *
   * Set bootstrapUrls to match the network litNetwork unless it's set to custom
   *
   * @returns { void }
   *
   */
  setCustomBootstrapUrls(): void;

  /**
   * @deprecated - Delete me for Naga
   * Combine Shares from signature shares
   *
   * @param { NodeBlsSigningShare } signatureShares
   *
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT(
    signatureShares: NodeBlsSigningShare[]
  ): Promise<string>;

  /**
   *
   * Get different formats of access control conditions, eg. evm, sol, unified etc.
   *
   * @param { SupportedJsonRequests } params
   *
   * @returns { FormattedMultipleAccs }
   *
   */
  getFormattedAccessControlConditions(
    params: SupportedJsonRequests
  ): FormattedMultipleAccs;

  /**
   *
   * Get hash of access control conditions
   *
   * @param { MultipleAccessControlConditions } params
   *
   * @returns { Promise<ArrayBuffer | undefined> }
   *
   */
  getHashedAccessControlConditions(
    params: MultipleAccessControlConditions
  ): Promise<ArrayBuffer | undefined>;

  // ========== Promise Handlers ==========

  /**
   *
   * Get and gather node promises
   *
   * @param { string[] } nodeUrls URLs of nodes to get promises for
   * @param { any } callback
   *
   * @returns { Array<Promise<any>> }
   *
   */
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  getNodePromises(nodeUrls: string[], callback: Function): Promise<any>[];

  /**
   * Handle node promises
   *
   * @param { Array<Promise<T>> } nodePromises
   *
   * @param {string} requestId request Id used for logging
   * @param {number} minNodeCount The minimum number of nodes we need a successful response from to continue
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
   *
   */
  handleNodePromises<T>(
    nodePromises: Promise<T>[],
    requestId: string,
    minNodeCount: number
  ): Promise<SuccessNodePromises<T> | RejectedNodePromises>;

  /**
   *
   * Throw node error
   *
   * @param { RejectedNodePromises } res
   * @param { string } requestId
   *
   * @returns { void }
   *
   */
  _throwNodeError(res: RejectedNodePromises, requestId: string): never;

  // ========== API Calls to Nodes ==========
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendCommandToNode({ url, data, requestId }: SendNodeCommand): Promise<any>;

  /**
   *
   * Get JS Execution Shares from Nodes
   *
   * @param { JsonExecutionRequest } params
   *
   * @returns { Promise<any> }
   */

  /**
   *
   * Handshake with SGX
   *
   * @param { HandshakeWithNode } params
   *
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  handshakeWithNode(
    params: HandshakeWithNode,
    requestId: string
  ): Promise<NodeCommandServerKeysResponse>;

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
  executeJs(
    params: JsonExecutionSdkParams
  ): Promise<ExecuteJsResponse | undefined>;

  /**
   * Encrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  encrypt(params: EncryptSdkParams): Promise<EncryptResponse>;

  /**
   * Decrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  decrypt(params: DecryptRequest): Promise<DecryptResponse>;

  /**
   *
   * Connect to the LIT nodes
   *
   * @returns { Promise } A promise that resolves when the nodes are connected.
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect(): Promise<any>;

  /**
   * Generates a session capability object
   *
   * @param litResources An array of ILitResource to be processed.
   * @returns A Promise resolving to an ISessionCapabilityObject.
   */
  generateSessionCapabilityObjectWithWildcards(
    litResources: ILitResource[]
  ): Promise<ISessionCapabilityObject>;
}
