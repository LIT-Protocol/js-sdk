import {
  DecryptRequest,
  DecryptResponse,
  EncryptRequest,
  EncryptResponse,
  ExecuteJsProps,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  HandshakeWithSgx,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  JsonSigningStoreRequest,
  KV,
  LitNodeClientConfig,
  MultipleAccessControlConditions,
  NodeCommandResponse,
  NodeCommandServerKeysResponse,
  NodeShare,
  RejectedNodePromises,
  SendNodeCommand,
  SignConditionECDSA,
  SignedChainDataToken,
  SigningAccessControlConditionRequest,
  SuccessNodePromises,
  ValidateAndSignECDSA,
} from './interfaces';
import { SupportedJsonRequests } from './types';

export interface ILitNodeClient {
  config: LitNodeClientConfig;
  connectedNodes: SetConstructor | Set<any> | any;
  serverKeys: KV | any;
  ready: boolean;
  subnetPubKey: string | null;
  networkPubKey: string | null;
  networkPubKeySet: string | null;

  // ========== Constructor ==========
  // ** IMPORTANT !! You have to create your constructor when implementing this class **
  // constructor(customConfig: LitNodeClientConfig);

  // ========== Scoped Class Helpers ==========

  /**
   *
   * (Browser Only) Get the config from browser local storage and override default config
   *
   * @returns { void }
   *
   */
  overrideConfigsFromLocalStorage(): void;

  /**
   *
   * Set bootstrapUrls to match the network litNetwork unless it's set to custom
   *
   * @returns { void }
   *
   */
  setCustomBootstrapUrls(): void;

  /**
   *
   * Get the request body of the lit action
   *
   * @param { ExecuteJsProps } params
   *
   * @returns { JsonExecutionRequest }
   *
   */
  getLitActionRequestBody(params: ExecuteJsProps): JsonExecutionRequest;

  /**
   *
   * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
   *
   */
  getJWTParams(): { iat: number; exp: number };

  /**
   *
   * Combine Shares from signature shares
   *
   * @param { any } signatureShares
   *
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT(signatureShares: Array<NodeShare>): string;

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
   * @param { any } callback
   *
   * @returns { Array<Promise<any>> }
   *
   */
  getNodePromises(callback: Function): Array<Promise<any>>;

  /**
   * Handle node promises
   *
   * @param { Array<Promise<T>> } nodePromises
   *
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
   *
   */
  handleNodePromises<T>(
    nodePromises: Array<Promise<T>>
  ): Promise<SuccessNodePromises<T> | RejectedNodePromises>;

  /**
   *
   * Throw node error
   *
   * @param { RejectedNodePromises } res
   *
   * @returns { void }
   *
   */
  _throwNodeError(res: RejectedNodePromises): void;

  // ========== Shares Resolvers ==========
  /**
   *
   * Get signatures from signed data
   *
   * @param { Array<any> } signedData
   *
   * @returns { any }
   *
   */
  getSignatures(signedData: Array<any>): any;

  /**
   *
   * Parse the response string to JSON
   *
   * @param { string } responseString
   *
   * @returns { any } JSON object
   *
   */
  parseResponses(responseString: string): any;

  /**
   *
   * Get Signature
   *
   * @param { Array<any> } shareData from all node promises
   *
   * @returns { string } signature
   *
   */
  getSignature(shareData: Array<any>): Promise<any>;

  // ========== API Calls to Nodes ==========
  sendCommandToNode({ url, data, requestId }: SendNodeCommand): Promise<any>;

  /**
   *
   * Get JS Execution Shares from Nodes
   *
   * @param { JsonExecutionRequest } params
   *
   * @returns { Promise<any> }
   */
  getJsExecutionShares(
    url: string,
    params: JsonExecutionRequest,
    requestId: string
  ): Promise<NodeCommandResponse>;

  /**
   *
   * Get Chain Data Signing Shares
   *
   * @param { string } url
   * @param { JsonSignChainDataRequest } params
   *
   * @returns { Promise<any> }
   *
   */
  getChainDataSigningShare(
    url: string,
    params: JsonSignChainDataRequest,
    requestId: string
  ): Promise<NodeCommandResponse>;

  /**
   * Get Signing Shares for Token containing Access Control Condition
   *
   * @param { string } url
   * @param { SigningAccessControlConditionRequest } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  getSigningShareForToken(
    url: string,
    params: SigningAccessControlConditionRequest,
    requestId: string
  ): Promise<NodeCommandResponse>;

  /**
   *
   * Store signing conditions to nodes
   *
   * @param { string } url
   * @param { JsonSigningStoreRequest } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  storeSigningConditionWithNode(
    url: string,
    params: JsonSigningStoreRequest,
    requestId: string
  ): Promise<NodeCommandResponse>;

  /**
   *
   * Sign Condition ECDSA
   *
   * @param { string } url
   * @param { SignConditionECDSA } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  signConditionEcdsa(
    url: string,
    params: SignConditionECDSA,
    requestId: string
  ): Promise<NodeCommandResponse>;

  /**
   *
   * Handshake with SGX
   *
   * @param { HandshakeWithSgx } params
   *
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  handshakeWithSgx(
    params: HandshakeWithSgx,
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
  executeJs(params: ExecuteJsProps): Promise<ExecuteJsResponse | undefined>;

  /**
   *
   * Request a signed JWT of any solidity function call from the LIT network.  There are no prerequisites for this function.  You should use this function if you need to transmit information across chains, or from a blockchain to a centralized DB or server.  The signature of the returned JWT verifies that the response is genuine.
   *
   * @param { SignedChainDataToken } params
   *
   * @returns { Promise<string | undefined>}
   */
  getSignedChainDataToken(
    params: SignedChainDataToken
  ): Promise<string | undefined>;

  /**
   *
   * Request a signed JWT from the LIT network. Before calling this function, you must know the access control conditions for the item you wish to gain authorization for.
   *
   * @param { JsonSigningRetrieveRequest } params
   *
   * @returns { Promise<string> } final JWT
   *
   */
  getSignedToken(
    params: JsonSigningRetrieveRequest
  ): Promise<string | undefined>;

  /**
   * Encrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  encrypt(params: EncryptRequest): Promise<EncryptResponse>;

  /**
   * Decrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  decrypt(params: DecryptRequest): Promise<DecryptResponse>;

  /**
   *
   * Signs a message with Lit threshold ECDSA algorithms.
   *
   * @param { `SignWithECDSA } params
   *
   * @returns { Promise<string> }
   *
   */
  // signWithEcdsa(params: SignWithECDSA): Promise<string>;

  /**
   *
   * Validates a condition, and then signs the condition if the validation returns true.
   * Before calling this function, you must know the on chain conditions that you wish to validate.
   *
   * @param { ValidateAndSignECDSA } params
   *
   * @returns { Promise<string> }
   */
  validateAndSignEcdsa(
    params: ValidateAndSignECDSA
  ): Promise<string | undefined>;

  /**
   *
   * Connect to the LIT nodes
   *
   * @returns { Promise } A promise that resolves when the nodes are connected.
   *
   */
  connect(): Promise<any>;
}
