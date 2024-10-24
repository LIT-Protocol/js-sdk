import depd from 'depd';
import { z } from 'zod';

import {
  ABIParamsSchema,
  AuthSigSchema,
  CosmosWalletTypeSchema,
  SessionKeyPairSchema,
  LitActionSdkParamsSchema,
  AuthCallbackParamsSchema,
  StorageProviderSchema,
  LitNodeClientConfigSchema,
  EncryptResponseSchema,
  JsonHandshakeResponseSchema,
  BlsSignatureShareSchema,
  NodeBlsSigningShareSchema,
  SessionSigsMapSchema,
  AuthMethodSchema,
  JsonSigningResourceIdSchema,
  SendNodeCommandSchema,
  HandshakeWithNodeSchema,
  NodeCommandServerKeysResponseSchema,
  IpfsOptionsSchema,
  JsonExecutionSdkParamsSchema,
  SigResponseSchema,
  ExecuteJsResponseBaseSchema,
  ExecuteJsResponseSchema,
  MultipleAccessControlConditionsSchema,
  EncryptSdkParamsSchema,
  DecryptResponseSchema,
  DecryptRequestBaseSchema,
  SessionSigsOrAuthSigSchema,
  DecryptRequestSchema,
  FormattedMultipleAccsSchema,
  JsonAccsRequestSchema,
  JsonSigningRetrieveRequestSchema,
  JsonEncryptionRetrieveRequestSchema,
  SuccessNodePromisesSchema,
  NodeErrorV1Schema,
  RejectedNodePromisesSchema,
  NodeAttestationSchema,
  ExecuteJsAdvancedOptionsSchema,
  CapacityDelegationRequestSchema,
  JsonExecutionRequestSchema,
  NodeCommandResponseSchema,
  CallRequestSchema,
  EncryptUint8ArrayRequestSchema,
  EncryptRequestSchema,
  EncryptStringRequestSchema,
  EncryptFileRequestSchema,
  EncryptToJsonPayloadSchema,
  ChainedSessionSigsOrAuthSigSchema,
  DecryptFromJsonPropsSchema,
  EncryptToJsonPropsSchema,
  AccsOperatorParamsSchema,
  SolanaAuthSigSchema,
  CosmosAuthSigSchema,
  IProviderSchema,
  ClaimKeyResponseSchema,
  SignatureSchema,
  BaseJsonPkpSignRequestSchema,
  JsonPkpSignSdkParamsSchema,
  JsonPkpSignRequestSchema,
  JsonSignChainDataRequestSchema,
  JsonSignSessionKeyRequestV1Schema,
  BlsResponseDataSchema,
  JsonSigningStoreRequestSchema,
  JsonExecutionSdkParamsTargetNodeSchema,
  LitActionResponseStrategySchema,
  JsonExecytionRequestTargetNodeSchema,
  SigningAccessControlConditionJWTPayloadSchema,
  GetSigningShareForDecryptionRequestSchema,
  ExecuteJsNoSigningResponseSchema,
  NodeResponseSchema,
  PKPSignShareSchema,
  NodeLogSchema,
  CombinedECDSASignatureSchema,
  CreateCustomAuthMethodRequestSchema,
  SignSessionKeyResponseSchema,
  SessionRequestBodySchema,
  AuthCallbackSchema,
  RPCUrlsSchema,
  GetWalletSigPropsSchema,
  SessionSigningTemplateSchema,
  SignSessionKeyPropSchema,
  CommonGetSessionSigsPropsSchema,
  GetSessionSigsPropsSchema,
  GetPkpSessionSigsSchema,
  LitClientSessionManagerSchema,
  AuthenticationPropsSchema,
  PKPBasePropSchema,
  PKPWalletSchema,
  PKPEthersWalletPropSchema,
  PKPClientPropSchema,
  PKPBaseDefaultParamsSchema,
  PKPClientHelpersSchema,
  PKPCosmosWalletPropSchema,
  BaseProviderGetSessionSigsPropsSchema,
} from '@lit-protocol/schemas';

import { ILitNodeClient } from './ILitNodeClient';
import { LitResourceAbilityRequest } from './models';
import {
  AcceptedFileType,
  AccessControlConditions,
  Chain,
  EvmContractConditions,
  IRelayAuthStatus,
  SolRpcConditions,
  SymmetricKey,
  UnifiedAccessControlConditions,
} from './types';

const deprecated = depd('lit-js-sdk:types:interfaces');

export type ABIParams = z.infer<typeof ABIParamsSchema>;

/** ---------- Access Control Conditions Interfaces ---------- */

export type AccsOperatorParams = z.infer<typeof AccsOperatorParamsSchema>;

/** ---------- Auth Sig ---------- */

/**
 * An `AuthSig` represents a cryptographic proof of ownership for an Ethereum address, created by signing a standardized [ERC-5573 SIWE ReCap](https://eips.ethereum.org/EIPS/eip-5573) (Sign-In with Ethereum) message. This signature serves as a verifiable credential, allowing the Lit network to associate specific permissions, access rights, and operational parameters with the signing Ethereum address. By incorporating various capabilities, resources, and parameters into the SIWE message before signing, the resulting `AuthSig` effectively defines and communicates these authorizations and specifications for the address within the Lit network.
 */
export type AuthSig = z.infer<typeof AuthSigSchema>;

export type SolanaAuthSig = z.infer<typeof SolanaAuthSigSchema>;

export type CosmosAuthSig = z.infer<typeof CosmosAuthSigSchema>;

export type CosmosWalletType = z.infer<typeof CosmosWalletTypeSchema>;

export type SessionKeyPair = z.infer<typeof SessionKeyPairSchema>;

export type LitActionSdkParams = z.infer<typeof LitActionSdkParamsSchema>;

export type AuthCallbackParams = z.infer<typeof AuthCallbackParamsSchema>;

/** ---------- Web3 ---------- */
export type IProvider = z.infer<typeof IProviderSchema>;

/** ---------- Crypto ---------- */

/**
 * @deprecated
 */
export interface EncryptedFile {
  encryptedFile: Blob;
  symmetricKey: SymmetricKey;
}

/**
 * @deprecated
 */
export interface DecryptFileProps {
  file: AcceptedFileType;
  symmetricKey: SymmetricKey;
}

export type SigningAccessControlConditionJWTPayload = z.infer<
  typeof SigningAccessControlConditionJWTPayloadSchema
>;

export interface HumanizedAccsProps {
  // The array of access control conditions that you want to humanize
  accessControlConditions?: AccessControlConditions;

  // The array of evm contract conditions that you want to humanize
  evmContractConditions?: EvmContractConditions;

  // The array of Solana RPC conditions that you want to humanize
  solRpcConditions?: SolRpcConditions;

  // The array of unified access control conditions that you want to humanize
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;
  tokenList?: (any | string)[];
  myWalletAddress?: string;
}

/**
 * ---------- Key Value Type ----------
 * @deprecated
 * */
export type KV = Record<string, any>;

/**
 * Override for LocalStorage and SessionStorage
 * if running in NodeJs and this is implicitly
 * binded globally
 */
export type StorageProvider = z.infer<typeof StorageProviderSchema>;

/** ---------- Lit Node Client ---------- */
export type LitNodeClientConfig = z.infer<typeof LitNodeClientConfigSchema>;

export type Signature = z.infer<typeof SignatureSchema>;

export type ClaimKeyResponse = z.infer<typeof ClaimKeyResponseSchema>;

export type BaseJsonPkpSignRequest = z.infer<
  typeof BaseJsonPkpSignRequestSchema
>;

export type JsonPkpSignSdkParams = z.infer<typeof JsonPkpSignSdkParamsSchema>;

export type JsonPkpSignRequest = z.infer<typeof JsonPkpSignRequestSchema>;

export type JsonSignChainDataRequest = z.infer<
  typeof JsonSignChainDataRequestSchema
>;

export type JsonSignSessionKeyRequestV1 = z.infer<
  typeof JsonSignSessionKeyRequestV1Schema
>;

export type BlsResponseData = z.infer<typeof BlsResponseDataSchema>;

export type JsonSigningResourceId = z.infer<typeof JsonSigningResourceIdSchema>;

export type MultipleAccessControlConditions = z.infer<
  typeof MultipleAccessControlConditionsSchema
>;

/**
 * @deprecated
 */
export type JsonAccsRequest = z.infer<typeof JsonAccsRequestSchema>;

export type JsonSigningRetrieveRequest = z.infer<
  typeof JsonSigningRetrieveRequestSchema
>;

/**
 * @deprecated
 */
export type JsonSigningStoreRequest = z.infer<
  typeof JsonSigningStoreRequestSchema
>;

export type JsonEncryptionRetrieveRequest = z.infer<
  typeof JsonEncryptionRetrieveRequestSchema
>;

export type LitActionResponseStrategy = z.infer<
  typeof LitActionResponseStrategySchema
>;

export type IpfsOptions = z.infer<typeof IpfsOptionsSchema>;

export type JsonExecutionSdkParamsTargetNode = z.infer<
  typeof JsonExecutionSdkParamsTargetNodeSchema
>;

export type JsonExecutionSdkParams = z.infer<
  typeof JsonExecutionSdkParamsSchema
>;

export type ExecuteJsAdvancedOptions = z.infer<
  typeof ExecuteJsAdvancedOptionsSchema
>;

export type JsonExecutionRequest = z.infer<typeof JsonExecutionRequestSchema>;

export type JsonExecutionRequestTargetNode = z.infer<
  typeof JsonExecytionRequestTargetNodeSchema
>;

export type ChainedSessionSigsOrAuthSig = z.infer<
  typeof ChainedSessionSigsOrAuthSigSchema
>;

export type SessionSigsOrAuthSig = z.infer<typeof SessionSigsOrAuthSigSchema>;

export type DecryptRequestBase = z.infer<typeof DecryptRequestBaseSchema>;
export type EncryptSdkParams = z.infer<typeof EncryptSdkParamsSchema>;

export type EncryptRequest = z.infer<typeof EncryptRequestSchema>;

export type EncryptResponse = z.infer<typeof EncryptResponseSchema>;

export type EncryptUint8ArrayRequest = z.infer<
  typeof EncryptUint8ArrayRequestSchema
>;

export type EncryptStringRequest = z.infer<typeof EncryptStringRequestSchema>;

export type EncryptFileRequest = z.infer<typeof EncryptFileRequestSchema>;

export type DecryptRequest = z.infer<typeof DecryptRequestSchema>;

export type DecryptResponse = z.infer<typeof DecryptResponseSchema>;

export type GetSigningShareForDecryptionRequest = z.infer<
  typeof GetSigningShareForDecryptionRequestSchema
>;

export type SigResponse = z.infer<typeof SigResponseSchema>;

export type ExecuteJsResponseBase = z.infer<typeof ExecuteJsResponseBaseSchema>;

/**
 *
 * An object containing the resulting signatures.  Each signature comes with the public key and the data signed.
 *
 */
export type ExecuteJsResponse = z.infer<typeof ExecuteJsResponseSchema>;

export type ExecuteJsNoSigningResponse = z.infer<
  typeof ExecuteJsNoSigningResponseSchema
>;

/**
 * @deprecated will be removed in v8
 */
export interface LitNodePromise {}

export type SendNodeCommand = z.infer<typeof SendNodeCommandSchema>;
export interface SigShare {
  sigType:
    | 'BLS'
    | 'K256'
    | 'ECDSA_CAIT_SITH' // Legacy alias of K256
    | 'EcdsaCaitSithP256';

  signatureShare: string;
  shareIndex?: number;
  bigr?: string; // backward compatibility
  bigR?: string;
  publicKey: string;
  dataSigned?: string | 'fail';
  siweMessage?: string;
  sigName?: string;
}

export interface PkpSignedData {
  digest: string;
  shareIndex: number;
  signatureShare: string;
  bigR: string;
  publicKey: string;
  sigType: string;
  dataSigned: string;
}
export interface NodeShare extends NodeLog {
  claimData: any;
  shareIndex: any;

  // I think this is deprecated
  unsignedJwt: any;
  signedData: SigShare;
  decryptedData: any;
  response: any;
  success?: boolean | '';
}

export type PKPSignShare = z.infer<typeof PKPSignShareSchema>;

export type NodeBlsSigningShare = z.infer<typeof NodeBlsSigningShareSchema>;

export type BlsSignatureShare = z.infer<typeof BlsSignatureShareSchema>;

export type SuccessNodePromises = z.infer<typeof SuccessNodePromisesSchema>;

export type RejectedNodePromises = z.infer<typeof RejectedNodePromisesSchema>;

/**
 * @deprecated will be removed in v8
 */
export interface NodePromiseResponse {
  status?: string;
  value?: any;
  reason?: any;
}

export type NodeErrorV1 = z.infer<typeof NodeErrorV1Schema>;

export interface NodeErrorV3 {
  errorKind: string;
  errorCode: string;
  status: number;
  message: string;
  correlationId: string;
  details: string[];
}

/**
 * @deprecated - This is the old error object.  It will be removed in the future. Use NodeClientErrorV1 instead.
 */
export const NodeClientErrorV0 = new Proxy(
  {
    errorCode: '',
    message: '',
    error: '',
    name: '',
  },
  {
    get(target, prop, receiver) {
      deprecated(
        'NodeClientErrorV0 is deprecated and will be removed in a future version. Use NodeClientErrorV1 instead.'
      );
      return Reflect.get(target, prop, receiver);
    },
  }
);

/**
 * @deprecated - This is the old error object.  It will be removed in the future. Use NodeClientErrorV1 instead.
 */
export type NodeClientErrorV0 = typeof NodeClientErrorV0 & {
  errorCode?: string;
  message: string;
  error: any;
  name?: string;
};

export interface NodeClientErrorV1 {
  message: string;
  errorKind: string;
  errorCode: string;
  details?: string[];
  status?: number;
  requestId?: string;
}

/**
 * @deprecated will be removed in v8
 */
export interface SignedData {
  signedData: any;
}

/**
 * @deprecated will be removed in v8
 */
export interface DecryptedData {
  decryptedData: any;
}

export type NodeResponse = z.infer<typeof NodeResponseSchema>;

export type NodeLog = z.infer<typeof NodeLogSchema>;

export type CallRequest = z.infer<typeof CallRequestSchema>;

/**
 * @deprecated will be removed in v8
 */
export interface SignedChainDataToken {
  // The call requests to make.  The responses will be signed and returned.
  callRequests: CallRequest[];

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;
}

export type NodeCommandResponse = z.infer<typeof NodeCommandResponseSchema>;

export type NodeCommandServerKeysResponse = z.infer<
  typeof NodeCommandServerKeysResponseSchema
>;

export type FormattedMultipleAccs = z.infer<typeof FormattedMultipleAccsSchema>;

/**
 * @deprecated will be removed in v8
 */
export interface SignWithECDSA {
  // TODO: The message to be signed - note this message is not currently converted to a digest!!!!!
  message: string;

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;

  iat: number;
  exp: number;
}

export type CombinedECDSASignature = z.infer<
  typeof CombinedECDSASignatureSchema
>;

export type HandshakeWithNode = z.infer<typeof HandshakeWithNodeSchema>;

export type NodeAttestation = z.infer<typeof NodeAttestationSchema>;

export type JsonHandshakeResponse = z.infer<typeof JsonHandshakeResponseSchema>;

export type EncryptToJsonProps = z.infer<typeof EncryptToJsonPropsSchema>;

export type EncryptToJsonPayload = z.infer<typeof EncryptToJsonPayloadSchema>;

export type DecryptFromJsonProps = z.infer<typeof DecryptFromJsonPropsSchema>;

/**
 * Struct in rust
 * -----
 pub struct SessionKeySignedMessage {
    pub session_key: String,
    pub resources: Vec<String>,
    pub capabilities: Vec<String>,
    pub issued_at: String,
    pub expiration: String,
    pub node_address: String,
}
 */
export interface SessionKeySignedMessage {
  sessionKey: string;
  resources?: any[];
  capabilities: AuthSig[];
  issuedAt: string;
  expiration: string;
  nodeAddress: string;
}

/**
 * @deprecated will be removed in v8
 */
export interface SessionSigsProp {
  expiration?: any;
  chain: Chain;
  resources: any[];
  sessionCapabilities?: any;
  switchChain?: boolean;
  litNodeClient: ILitNodeClient;
}

/** ========== Session ========== */
export type AuthMethod = z.infer<typeof AuthMethodSchema>;

export type CreateCustomAuthMethodRequest = z.infer<
  typeof CreateCustomAuthMethodRequestSchema
>;

export type SignSessionKeyProp = z.infer<typeof SignSessionKeyPropSchema>;

export type SignSessionKeyResponse = z.infer<
  typeof SignSessionKeyResponseSchema
>;

export interface GetSignSessionKeySharesProp {
  body: SessionRequestBody;
}
export type CommonGetSessionSigsProps = z.infer<
  typeof CommonGetSessionSigsPropsSchema
>;

export type BaseProviderGetSessionSigsProps = z.infer<
  typeof BaseProviderGetSessionSigsPropsSchema
>;

export type GetSessionSigsProps = z.infer<typeof GetSessionSigsPropsSchema>;

export type AuthCallback = z.infer<typeof AuthCallbackSchema>;

export type SessionSigsMap = z.infer<typeof SessionSigsMapSchema>;

export type SessionSigs = Record<string, AuthSig>;

export type SessionRequestBody = z.infer<typeof SessionRequestBodySchema>;

export type GetWalletSigProps = z.infer<typeof GetWalletSigPropsSchema>;

export type SessionSigningTemplate = z.infer<
  typeof SessionSigningTemplateSchema
>;

/**
 * @deprecated will be removed in v8
 */
export interface WebAuthnAuthenticationVerificationParams {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string;
  };
  type: string;
  clientExtensionResults: object;
  authenticatorAttachment: 'cross-platform' | 'platform';
}

/**
 * ========== PKP ==========
 */
export type LitClientSessionManager = z.infer<
  typeof LitClientSessionManagerSchema
>;

export type AuthenticationProps = z.infer<typeof AuthenticationPropsSchema>;

export type RPCUrls = z.infer<typeof RPCUrlsSchema>;

export type PKPBaseProp = z.infer<typeof PKPBasePropSchema>;

export type PKPWallet = z.infer<typeof PKPWalletSchema>;

export type PKPEthersWalletProp = z.infer<typeof PKPEthersWalletPropSchema>;

export type PKPCosmosWalletProp = z.infer<typeof PKPCosmosWalletPropSchema>;

/**
 * @deprecated will be removed in v8
 */
export type PKPClientProp = z.infer<typeof PKPClientPropSchema>;

export type PKPBaseDefaultParams = z.infer<typeof PKPBaseDefaultParamsSchema>;

export type PKPClientHelpers = z.infer<typeof PKPClientHelpersSchema>;

/**
 * ========== Lit Auth Client ==========
 */

/**
 * @deprecated will be removed in v8
 */
export interface OtpSessionResult {
  /**
   * Status message of the request
   */
  message?: string;
  /**
   * jwt from successful otp check
   */
  token_jwt?: string;
  /**
   * status of the otp check
   */
  status?: string;
}

export interface LoginUrlParams {
  /**
   * Auth method name
   */
  provider: string | null;
  /**
   * Access token
   */
  accessToken: string | null;
  /**
   * ID token
   */
  idToken: string | null;
  /**
   * OAuth state param
   */
  state: string | null;
  /**
   * Error codes from Lit's login server
   */
  error: string | null;
}

export interface IRelay {
  /**
   * Mint a new PKP for the given auth method
   *
   * @param {string} body - Body of the request
   *
   * @returns {Promise<IRelayMintResponse>} Response from the relay server
   */
  mintPKP(body: string): Promise<IRelayMintResponse>;
  /**
   * Mint a new PKP for the given auth method
   *
   * @throws {Error} - Throws an error if no AuthMethods are given
   * @param {AuthMethod[]} authMethods - AuthMethods authentication methods to be added to the pkp
   * @param {{ pkpPermissionScopes?: number[][]; sendPkpToitself?: boolean; addPkpEthAddressAsPermittedAddress?: boolean;}} options
   *
   * @returns {Promise<{pkpTokenId?: string; pkpEthAddress?: string; pkpPublicKey?: string}>} pkp information
   */
  mintPKPWithAuthMethods(
    authMethods: AuthMethod[],
    options: {
      pkpPermissionScopes?: number[][];
      sendPkpToitself?: boolean;
      addPkpEthAddressAsPermittedAddress?: boolean;
    }
  ): Promise<{
    pkpTokenId?: string;
    pkpEthAddress?: string;
    pkpPublicKey?: string;
  }>;
  /**
   * Poll the relay server for status of minting request
   *
   * @param {string} requestId - Request ID to poll, likely the minting transaction hash
   *
   * @returns {Promise<IRelayPollStatusResponse>} Response from the relay server
   */
  pollRequestUntilTerminalState(
    requestId: string
  ): Promise<IRelayPollStatusResponse>;
  /**
   * Fetch PKPs associated with the given auth method
   *
   * @param {string} body - Body of the request
   *
   * @returns {Promise<IRelayFetchResponse>} Response from the relay server
   */
  fetchPKPs(body: string): Promise<IRelayFetchResponse>;
  /**
   * Generate options for registering a new credential to pass to the authenticator
   *
   * @param {string} [username] - Optional username to associate with the credential
   *
   * @returns {Promise<any>} Registration options for the browser to pass to the authenticator
   */
  generateRegistrationOptions(username?: string): Promise<any>;

  /**
   * returns the relayUrl
   */
  getUrl(): string;
}

export interface LitRelayConfig {
  /**
   * Lit's relay server URL
   */
  relayUrl?: string;
  /**
   * API key for Lit's relay server
   */
  relayApiKey?: string;
}

export interface MintRequestBody {
  keyType?: number;
  permittedAuthMethodTypes?: number[];
  permittedAuthMethodIds?: string[];
  permittedAuthMethodPubkeys?: string[];
  permittedAuthMethodScopes?: any[][]; // ethers.BigNumber;
  addPkpEthAddressAsPermittedAddress?: boolean;
  sendPkpToItself?: boolean;
}

export interface IRelayRequestData {
  /**
   * Type of auth method
   */
  authMethodType: number;
  /**
   * ID of auth method
   */
  authMethodId: string;
  /**
   * Public key associated with the auth method (used only in WebAuthn)
   */
  authMethodPubKey?: string;
}

export interface IRelayMintResponse {
  /**
   * Transaction hash of PKP being minted
   */
  requestId?: string;
  /**
   * Error from relay server
   */
  error?: string;
}

export interface IRelayFetchResponse {
  /**
   * Fetched PKPs
   */
  pkps?: IRelayPKP[];
  /**
   * Error from relay server
   */
  error?: string;
}

/**
 * @deprecated will be removed in v8
 */
export interface IRelayPollingEvent {
  /**
   * Polling count
   */
  pollCount: number;
  /**
   * Transaction hash of PKP being minted
   */
  requestId: string;
}

export interface IRelayPollStatusResponse {
  /**
   * Polling status
   */
  status?: IRelayAuthStatus;
  /**
   * Token ID of PKP being minted
   */
  pkpTokenId?: string;
  /**
   * Eth address of new PKP
   */
  pkpEthAddress?: string;
  /**
   * Public key of new PKP
   */
  pkpPublicKey?: string;
  /**
   * Polling error
   */
  error?: string;
}

export interface IRelayPKP {
  /**
   * PKP token ID
   */
  tokenId: string;
  /**
   * PKP public key
   */
  publicKey: string;
  /**
   * PKP Eth address
   */
  ethAddress: string;
}

export interface BaseProviderOptions {
  /**
   * Relay server to use
   */
  relay: IRelay;
  /**
   * Lit Node Client to use
   */
  litNodeClient: any;
}

export interface OAuthProviderOptions {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  redirectUri?: string;
  /**
   * OAuth client ID
   */
  clientId?: string;
}

export interface EthWalletProviderOptions {
  /**
   * The domain from which the signing request is made
   */
  domain?: string;
  /**
   * The origin from which the signing request is made
   */
  origin?: string;
}

export interface WebAuthnProviderOptions {
  /**
   * Name of relying party. Defaults to "lit"
   */
  rpName?: string;
}

/**
 * @deprecated will be removed in v8
 */
export interface SignInWithOTPParams {
  /**
   * otp transport (email or phone #)
   * used as the user ID for the auth method
   */
  userId: string;

  /**
   * tracking for the session
   */
  requestId?: string;

  /**
   * Allows for specifying custom sender information
   * Note: for most users the `from_name` is the configurable option and `from` should not be populated
   */
  emailCustomizationOptions: OtpEmailCustomizationOptions;

  customName?: string;
}

/**
 * @deprecated will be removed in v8
 */
export interface OtpProviderOptions {
  baseUrl?: string;
  port?: string;
  startRoute?: string;
  checkRoute?: string;
}

export interface OtpEmailCustomizationOptions {
  from?: string;
  fromName: string;
}

/**
 * @deprecated will be removed in v8
 */
export interface SignInWithStytchOTPParams {
  // JWT from an authenticated session
  // see stych docs for more info: https://stytch.com/docs/api/session-get
  accessToken?: string;
  // username or phone number where OTP was delivered
  userId: string;
}

export interface StytchOtpProviderOptions {
  /*
    Stytch application identifier
  */
  appId: string;
  /*
   Stytch user identifier for a project
  */
  userId?: string;
}

export type StytchToken = Record<string, any>;

export interface BaseProviderSessionSigsParams {
  /**
   * Public key of PKP to auth with
   */
  pkpPublicKey: string;
  /**
   * Auth method verifying ownership of PKP
   */
  authMethod: AuthMethod;
  /**
   * Params for getSessionSigs function
   */
  sessionSigsParams: BaseProviderGetSessionSigsProps;
  /**
   * Lit Node Client to use. If not provided, will use an existing Lit Node Client or create a new one
   */
  litNodeClient?: ILitNodeClient;

  resourceAbilityRequests?: LitResourceAbilityRequest[];
}

export interface BaseAuthenticateOptions {}

export interface EthWalletAuthenticateOptions extends BaseAuthenticateOptions {
  /**
   * Ethereum wallet address
   */
  address?: string;
  /**
   * Function to sign message
   *
   * @param {string} message - Message to sign
   *
   * @returns {Promise<string>} - Raw signature of message
   */
  signMessage?: (message: string) => Promise<string>;
  /**
   * Name of chain to use for signature
   */
  chain?: string;
  /**
   * When the auth signature expires
   */
  expiration?: string;

  /**
   * Get the address of the wallet
   * @returns {string} - Ethereum wallet address
   */
  getAddress?: () => string;
}

/**
 * @deprecated will be removed in v8
 */
export interface OtpAuthenticateOptions extends BaseAuthenticateOptions {
  /**
   * User provided authentication code
   */
  code: string;
}

export interface StytchOtpAuthenticateOptions extends BaseAuthenticateOptions {
  /*
   * JWT from an authenticated session
   * see stych docs for more info: https://stytch.com/docs/api/session-get
   */
  accessToken: string;
  /*
   Stytch user identifier for a project
  */
  userId?: string;
}

export interface BaseMintCapacityContext {
  daysUntilUTCMidnightExpiration: number;
}

export interface MintCapacityCreditsPerDay extends BaseMintCapacityContext {
  requestsPerDay?: number;
}
export interface MintCapacityCreditsPerSecond extends BaseMintCapacityContext {
  requestsPerSecond?: number;
}
export interface MintCapacityCreditsPerKilosecond
  extends BaseMintCapacityContext {
  requestsPerKilosecond?: number;
}
export interface MintCapacityCreditsContext
  extends MintCapacityCreditsPerDay,
    MintCapacityCreditsPerSecond,
    MintCapacityCreditsPerKilosecond,
    GasLimitParam {}
export interface MintCapacityCreditsRes {
  rliTxHash: string;
  capacityTokenId: any;
  capacityTokenIdStr: string;
}

/**
 * ========== Siwe Messages ==========
 */
export interface BaseSiweMessage {
  walletAddress: string;
  nonce: string;

  // -- filled in by default
  expiration?: string;
  resources?: LitResourceAbilityRequest[];
  uri?: string; // This is important in authNeededCallback params eg. (lit:session:xxx)
  domain?: string;
  statement?: string;
  version?: string;
  chainId?: number;
  litNodeClient?: any; // TODO ILitNodeClient but not always required
}

export interface WithRecap extends BaseSiweMessage {
  uri: string;
  expiration: string;
  resources: LitResourceAbilityRequest[];
}
export interface WithCapacityDelegation extends BaseSiweMessage {
  uri: 'lit:capability:delegation';
  litNodeClient: ILitNodeClient;
  capacityTokenId?: string;
  delegateeAddresses?: string[];
  uses?: string;
}

export interface CapacityDelegationFields extends BaseSiweMessage {
  litNodeClient: ILitNodeClient;
  capacityTokenId?: string;
  delegateeAddresses?: string[];
  uses?: string;
}

export type CapacityDelegationRequest = z.infer<
  typeof CapacityDelegationRequestSchema
>;

export interface CapacityCreditsReq {
  dAppOwnerWallet: SignerLike;

  /**
   * 1. Provided with values: Scopes the delegation to specific NFTs identified by the IDs in the array. The function will only consider the NFTs whose IDs are listed.
   * 2. NOT Provided: All NFTs owned by the user are considered eligible under the delegation. The delegation applies universally to all NFTs the user owns.
   */
  capacityTokenId?: string;

  /**
   * 1. Provided: Restricts the use of the delegation to the addresses listed in the array. Only users whose addresses are included can utilize the delegated capabilities.
   * 2. NOT Provided: The delegation is universally applicable to anyone. There are no restrictions on who can use the delegated capabilities.
   * 3. Empty Array: No one is allowed to use the delegated capabilities since there are no valid user addresses specified.
   */
  delegateeAddresses?: string[];

  /**
   * 1. Provided: Sets a limit on the number of times the delegation can be used. The function enforces this limit and prevents use beyond it.
   * 2. NOT Provided: There is no limit on the number of times the delegation can be used.
   * 3. Empty Array: Theoretically, an empty value for uses would mean no uses are possible, effectively disabling the delegation, but typically this scenario should either not be allowed by schema/logic or treated as zero, which also disables the delegation.
   */
  uses?: string;
  domain?: string;
  expiration?: string;
  statement?: string;
}
export interface CapacityCreditsRes {
  capacityDelegationAuthSig: AuthSig;
}

export interface LitEndpoint {
  path: string;
  version: string;
}

/**
 * Signer that has the ability to sign messages
 * eg. ethers.Wallet or ethers.Signer
 *
 * for context: This is a common interface so can keep this package clean without
 * importing external libraries directly
 */
export interface SignerLike {
  signMessage: (message: string | any) => Promise<string>;
  getAddress: () => Promise<string>;
}

export type GetPkpSessionSigs = z.infer<typeof GetPkpSessionSigsSchema>;

/**
 * Includes common session signature properties, parameters for a Lit Action,
 * and either a required litActionCode or a required litActionIpfsId, but not both.
 */
export type GetLitActionSessionSigs = CommonGetSessionSigsProps &
  Pick<GetPkpSessionSigs, 'pkpPublicKey'> &
  Pick<GetPkpSessionSigs, 'authMethods'> &
  Pick<Required<LitActionSdkParams>, 'jsParams'> &
  (
    | (Pick<Required<LitActionSdkParams>, 'litActionCode'> & {
        litActionIpfsId?: never;
      })
    | (Pick<Required<LitActionSdkParams>, 'litActionIpfsId'> & {
        litActionCode?: never;
      })
  ) & {
    ipfsOptions?: IpfsOptions;
  };

/**
 * @deprecated will be removed in v8
 */
export interface SessionKeyCache {
  value: SessionKeyPair;
  timestamp: number;
}

export interface SignatureData {
  signature: string;
  derivedKeyId: string;
}

export type ClaimsList = Record<string, SignatureData>[];

export interface GasLimitParam {
  gasLimit?: number;
}

export interface MintNextAndAddAuthMethods extends GasLimitParam {
  keyType: string;
  permittedAuthMethodTypes: string[];
  permittedAuthMethodIds: string[];
  permittedAuthMethodPubkeys: string[];
  permittedAuthMethodScopes: string[][];
  addPkpEthAddressAsPermittedAddress: boolean;
  sendPkpToItself: boolean;
}

export interface MintWithAuthParams extends GasLimitParam {
  /**
   * auth method to use for minting
   */
  authMethod: AuthMethod;

  /**
   * Permission scopes:
   * https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
   */
  scopes: string[] | number[];

  /**
   * only applies to webauthn auth method
   */
  pubkey?: string;

  /**
   * The Auth ID of the given auth method. If it's custom auth, then it could be
   * anything.
   */
  authMethodId?: Uint8Array;
}

export interface MintWithAuthResponse<T> {
  pkp: {
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  };
  tx: T;
}

export interface BlockHashErrorResponse {
  messages: string[];
  reason: string;
  codde: number;
}

export interface EthBlockhashInfo {
  blockhash: string;
  timestamp: string;
  blockNumber: number;
}
