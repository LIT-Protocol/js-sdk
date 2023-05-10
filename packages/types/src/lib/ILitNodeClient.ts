import { SupportedJsonRequests } from './types';
import {
  ExecuteJsProps,
  ExecuteJsResponse,
  FormattedMultipleAccs,
  HandshakeWithSgx,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSaveEncryptionKeyRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  JsonSigningStoreRequest,
  JsonStoreSigningRequest,
  KV,
  LitNodeClientConfig,
  NodeCommandResponse,
  NodeCommandServerKeysResponse,
  NodeShare,
  RejectedNodePromises,
  SendNodeCommand,
  SignedChainDataToken,
  // SignWithECDSA,
  SignConditionECDSA,
  SuccessNodePromises,
  ValidateAndSignECDSA,
} from './interfaces';

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
   * Combine Shares from network public key set and signature shares
   *
   * @param { string } networkPubKeySet
   * @param { any } signatureShares
   *
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT(
    networkPubKeySet: string,
    signatureShares: Array<NodeShare>
  ): string;

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
   * @param { JsonStoreSigningRequest } params
   *
   * @returns { Promise<ArrayBuffer | undefined> }
   *
   */
  getHashedAccessControlConditions(
    params: JsonStoreSigningRequest
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
   * @param { Array<Promise<any>> } nodePromises
   *
   * @returns { Promise<SuccessNodePromises | RejectedNodePromises> }
   *
   */
  handleNodePromises(
    nodePromises: Array<Promise<any>>
  ): Promise<SuccessNodePromises | RejectedNodePromises>;

  /**
   *
   * Throw node error
   *
   * @param { RejectedNodePromises } res
   *
   * @returns { void }
   *
   */
  throwNodeError(res: RejectedNodePromises): void;

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
   * Get the decryptions from the decrypted data list
   *
   * @param { Array<any> } decryptedData
   *
   * @returns { Promise<Array<any> }
   *
   */
  getDecryptions(decryptedData: Array<any>): Promise<Array<any>>;

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
   *
   * Get Signing Shares from Nodes
   *
   * @param { string } url
   * @param { JsonSigningRetrieveRequest } params
   *
   * @returns { Promise<any>}
   *
   */
  getSigningShare(
    url: string,
    params: JsonSigningRetrieveRequest,
    requestId: string
  ): Promise<NodeCommandResponse>;

  /**
   *
   * Ger Decryption Shares from Nodes
   *
   * @param { string } url
   * @param { JsonEncryptionRetrieveRequest } params
   *
   * @returns { Promise<any> }
   *
   */
  getDecryptionShare(
    url: string,
    params: JsonEncryptionRetrieveRequest,
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
   * Store encryption conditions to nodes
   *
   * @param { string } urk
   * @param { JsonEncryptionStoreRequest } params
   *
   * @returns { Promise<NodeCommandResponse> }
   *
   */
  storeEncryptionConditionWithNode(
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
   * Request a signed JWT from the LIT network. Before calling this function, you must either create or know of a resource id and access control conditions for the item you wish to gain authorization for. You can create an access control condition using the saveSigningCondition function.
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
   *
   * Associated access control conditions with a resource on the web.  After calling this function, users may use the getSignedToken function to request a signed JWT from the LIT network.  This JWT proves that the user meets the access control conditions, and is authorized to access the resource you specified in the resourceId parameter of the saveSigningCondition function.
   *
   * @param { JsonStoreSigningRequest } params
   *
   * @returns { Promise<boolean | undefined }
   *
   */
  saveSigningCondition(
    params: JsonStoreSigningRequest
  ): Promise<boolean | undefined>;

  /**
   *
   * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
   *
   */
  getEncryptionKey(params: JsonEncryptionRetrieveRequest): Promise<Uint8Array>;

  /**
   *
   * Securely save the association between access control conditions and something that you wish to decrypt
   *
   * @param { JsonSaveEncryptionKeyRequest } params
   *
   * @returns { Promise<Uint8Array | undefined }
   *
   */
  saveEncryptionKey(params: JsonSaveEncryptionKeyRequest): Promise<Uint8Array>;

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
