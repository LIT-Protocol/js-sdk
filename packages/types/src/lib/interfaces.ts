/** ---------- Access Control Conditions Interfaces ---------- */

import {
  AcceptedFileType,
  AccessControlConditions,
  Chain,
  ConditionType,
  EncryptedSymmetricKey,
  EvmContractConditions,
  JsonRequest,
  LIT_NETWORKS_KEYS,
  SolRpcConditions,
  SymmetricKey,
  UnifiedAccessControlConditions,
} from './types';
import { ILitNodeClient } from './ILitNodeClient';

export interface AccsOperatorParams {
  operator: string;
}

export interface AccsRegularParams {
  conditionType?: ConditionType;
  returnValueTest: {
    key?: string;
    comparator: string;
    value: string;
  };
  method?: string;
  params?: any[];
  chain: Chain;
}

export interface AccsDefaultParams extends AccsRegularParams {
  contractAddress?: string;
  standardContractType?: string;
  parameters?: any;
}

export interface AccsSOLV2Params extends AccsRegularParams {
  pdaKey: string;
  pdaInterface: {
    offset: string | number;
    fields: string | object;
  };
  pdaParams: [];
}

export interface ABIParams {
  name: string;
  type: string;
}

export interface FunctionABI {
  name: string;
  type?: string;
  stateMutability: string;
  inputs: Array<ABIParams | any>;
  outputs: Array<ABIParams | any>;
  constant?: string | boolean;
  payable?: boolean;
}

export interface AccsEVMParams extends AccsRegularParams {
  functionAbi: FunctionABI;
  contractAddress: string;
  functionName: string;
  functionParams: any[];
}

export interface AccsCOSMOSParams extends AccsRegularParams {
  path: string;
}

/** ---------- Auth Sig ---------- */

// TODO: This should ideally be generated from the rust side
// pub struct JsonAuthSig {
//     pub sig: String,
//     pub derived_via: String,
//     pub signed_message: String,
//     pub address: String,
//     pub capabilities: Option<Vec<JsonAuthSig>>,
//     pub algo: Option<String>,
// }
export interface JsonAuthSig {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
  capabilities?: [];
  algo?: [];
}

export interface CheckAndSignAuthParams {
  // The chain you want to use.  Find the supported list of chains here: https://developer.litprotocol.com/docs/supportedChains
  chain: Chain;

  // Optional and only used with EVM chains.  A list of resources to be passed to Sign In with Ethereum.  These resources will be part of the Sign in with Ethereum signed message presented to the user.
  resources?: any[];

  // ptional and only used with EVM chains right now.  Set to true by default.  Whether or not to ask Metamask or the user's wallet to switch chains before signing.  This may be desired if you're going to have the user send a txn on that chain.  On the other hand, if all you care about is the user's wallet signature, then you probably don't want to make them switch chains for no reason.  Pass false here to disable this chain switching behavior.
  switchChain?: boolean;

  // --- Following for Session Auth ---
  expiration?: any;

  uri?: string;
}

/** ---------- Web3 ---------- */
export interface IProvider {
  provider: any;
  account: string;
}

/** ---------- Crypto ---------- */
export interface EncryptedString {
  symmetricKey: SymmetricKey;
  encryptedString: Blob;
  encryptedData?: Blob;
}

export interface EncryptedZip {
  symmetricKey: SymmetricKey;
  encryptedZip: Blob;
}

export interface ThreeKeys {
  // zipBlob is a zip file that contains an encrypted file and the metadata needed to decrypt it via the Lit network.
  zipBlob: any;

  // encryptedSymmetricKey is the symmetric key needed to decrypt the content, encrypted with the Lit network public key.  You may wish to store encryptedSymmetricKey in your own database to support quicker re-encryption operations when adding additional access control conditions in the future, but this is entirely optional, and this key is already stored inside the zipBlob.
  encryptedSymmetricKey: EncryptedSymmetricKey;

  // symmetricKey is the raw symmetric key used to encrypt the files.  DO NOT STORE IT.  It is provided in case you wish to create additional "OR" access control conditions for the same file.
  symmetricKey: SymmetricKey;
}

export interface DecryptZipFileWithMetadata {
  decryptedFile: Uint8Array;
  metadata: string;
}

export interface EncryptedFile {
  encryptedFile: Blob;
  symmetricKey: SymmetricKey;
}

export interface DecryptFileProps {
  file: AcceptedFileType;
  symmetricKey: SymmetricKey;
}

export interface VerifyJWTProps {
  // A JWT signed by the LIT network using the BLS12-381 algorithm
  jwt: string;
}

export interface IJWT {
  verified: boolean;
  header: object;
  payload: object;
  signature: Uint8Array;
}

export interface HumanizedAccsProps {
  // The array of access control conditions that you want to humanize
  accessControlConditions?: AccessControlConditions;

  // The array of evm contract conditions that you want to humanize
  evmContractConditions?: EvmContractConditions;

  // The array of Solana RPC conditions that you want to humanize
  solRpcConditions?: SolRpcConditions;

  // The array of unified access control conditions that you want to humanize
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;
  tokenList?: Array<any | string>;
  myWalletAddress?: string;
}

/** ---------- Key Value Type ---------- */
export interface KV {
  [key: string]: any;
}

/** ---------- Lit Node Client ---------- */
export interface LitNodeClientConfig {
  alertWhenUnauthorized: boolean;
  minNodeCount: number;
  debug: boolean;
  bootstrapUrls: Array<string>;
  litNetwork: LIT_NETWORKS_KEYS;
  connectTimeout: number;
  defaultAuthCallback?: (
    authSigParams: CheckAndSignAuthParams
  ) => Promise<JsonAuthSig>;
}

export interface CustomNetwork {
  litNetwork: LIT_NETWORKS_KEYS;
}

/**
 * Struct in rust
 * -----
 pub struct JsonExecutionRequest {
    pub code: Option<String>,
    pub ipfs_id: Option<String>,
    pub auth_sig: AuthSigItem,
    pub js_params: Option<serde_json::Value>,
}
 */
export interface JsonExecutionRequest {
  // the authSig to use to authorize the user with the nodes
  authSig: JsonAuthSig;

  // An object that contains params to expose to the Lit Action.  These will be injected to the JS runtime before your code runs, so you can use any of these as normal variables in your Lit Action.
  jsParams: any;

  // JS code to run on the nodes
  code?: string;

  // The IPFS ID of some JS code to run on the nodes
  ipfsId?: string;

  // the session signatures to use to authorize the user with the nodes
  sessionSigs?: any;

  // whether to run this on a single node or many
  targetNodeRange?: number;

  // auth methods to resolve
  authMethods?: Array<Object>;
}

/**
 * Struct in rust
 * -----
pub struct JsonSignChainDataRequest {
    pub call_requests: Vec<web3::types::CallRequest>,
    pub chain: Chain,
    pub iat: u64,
    pub exp: u64,
}
*/
export interface JsonSignChainDataRequest {
  callRequests: Array<CallRequest>;
  chain: Chain;
  iat: number;
  exp: number;
}

/**
 * Struct in rust
 * -----
 pub struct JsonSigningResourceId {
    pub base_url: String,
    pub path: String,
    pub org_id: String,
    pub role: String,
    pub extra_data: String,
}
*/
export interface JsonSigningResourceId {
  baseUrl: string;
  path: string;
  orgId: string;
  role: string;
  extraData: string;
}

export interface JsonAccsRequest {
  // The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  accessControlConditions?: AccessControlConditions;

  // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  evmContractConditions?: EvmContractConditions;

  // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
  solRpcConditions?: SolRpcConditions;

  // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;

  // The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
  chain?: string;

  // The resourceId representing something on the web via a URL
  resourceId?: JsonSigningResourceId;

  // The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
  authSig?: JsonAuthSig;

  sessionSigs?: object;
}

/**
 * Struct in rust
 * -----
pub struct JsonSigningRetrieveRequest {
    pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
    pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
    pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
    pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
    pub chain: Option<String>,
    pub resource_id: JsonSigningResourceId,
    pub auth_sig: AuthSigItem,
    pub iat: u64,
    pub exp: u64,
}
*/
export interface JsonSigningRetrieveRequest extends JsonAccsRequest {
  iat?: number;
  exp?: number;
  sessionSigs?: any;
}

export interface JsonStoreSigningRequest extends JsonAccsRequest {
  // Whether or not the access control condition should be saved permanently.  If false, the access control conditions will be updateable by the creator.  If you don't pass this param, it's set to true by default.
  permanant?: number;
  permanent?: number;
  sessionSigs?: any;
}

/**
 * Struct in rust
 * -----
pub struct JsonSigningStoreRequest {
    pub key: String,
    pub val: String,
    pub chain: Option<String>,
    pub permanant: Option<usize>,
    pub auth_sig: AuthSigItem,
}
 */
export interface JsonSigningStoreRequest {
  key: string;
  val: string;
  chain?: string;
  permanant?: number;
  permanent?: number;
  authSig?: JsonAuthSig;
  sessionSigs?: object;
}

/**
 * Struct in rust
 * -----
 pub struct JsonEncryptionRetrieveRequest {
    pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
    pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
    pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
    pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
    pub chain: Option<String>,
    pub to_decrypt: String,
    pub auth_sig: AuthSigItem,
}
 */
export interface JsonEncryptionRetrieveRequest extends JsonAccsRequest {
  // The ciphertext that you wish to decrypt encoded as a hex string
  toDecrypt: string;
}

export interface ExecuteJsProps extends JsonExecutionRequest {
  // A boolean that defines if debug info will be returned or not.
  debug?: boolean;
}

export interface JsonSaveEncryptionKeyRequest {
  accessControlConditions?: AccessControlConditions;
  evmContractConditions?: EvmContractConditions;
  solRpcConditions?: SolRpcConditions;
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;
  authSig?: JsonAuthSig;
  chain: Chain;

  // The symmetric encryption key that was used to encrypt the locked content inside the LIT as a Uint8Array.  You should use zipAndEncryptString or zipAndEncryptFiles to get this encryption key.  This key will be hashed and the hash will be sent to the LIT nodes.  You must pass either symmetricKey or encryptedSymmetricKey.
  symmetricKey: SymmetricKey;

  // The encrypted symmetric key of the item you with to update.  You must pass either symmetricKey or encryptedSymmetricKey.
  encryptedSymmetricKey?: EncryptedSymmetricKey;

  permanant?: number;
  permanent?: number;

  sessionSigs?: object;
}

export interface SignConditionECDSA {
  accessControlConditions: any;
  evmContractConditions: undefined;
  solRpcConditions: undefined;
  auth_sig: JsonAuthSig;
  chain: Chain;
  iat: number;
  exp: number;
}

/**
 *
 * An object containing the resulting signatures.  Each signature comes with the public key and the data signed.
 *
 */
export interface ExecuteJsResponse {
  signatures: any;
  decryptions: any[];
  response: string;
  logs: string;
  debug?: {
    allNodeResponses: NodeResponse[];
    allNodeLogs: NodeLog[];
    rawNodeHTTPResponses: any;
  };
}

export interface LitNodePromise {}

export interface SendNodeCommand {
  url: string;
  data: any;
  requestId: string;
}

export interface NodeShare {
  shareIndex: any;
  unsignedJwt: any;
  signedData: any;
  decryptedData: any;
  response: any;
  logs: any;
}

export interface SuccessNodePromises {
  success: boolean;
  values: Array<NodeShare>;
}

export interface RejectedNodePromises {
  success: boolean;
  error: any;
}

export interface NodePromiseResponse {
  status?: string;
  value?: any;
  reason?: any;
}

export interface NodeError {
  error: {
    errorCode: string;
  };
}

export interface SigShare {
  sigType: any;
  shareHex: any;
  shareIndex: any;
  localX: any;
  localY: any;
  publicKey: any;
  dataSigned: any;
  siweMessage?: string;
}

export interface SignedData {
  signedData: any;
}

export interface DecryptedData {
  decryptedData: any;
}

export interface NodeResponse {
  response: any;
}

export interface NodeLog {
  logs: any;
}

export interface CallRequest {
  // to - The address of the contract that will be queried
  to: string;

  // The address calling the function.
  from?: string;

  // Hex encoded data to send to the contract.
  data: string;
}

export interface SignedChainDataToken {
  // The call requests to make.  The responses will be signed and returned.
  callRequests: Array<CallRequest>;

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;
}

export interface NodeCommandResponse {
  url: string;
  data: JsonRequest;
}

export interface NodeCommandServerKeysResponse {
  serverPublicKey: any;
  subnetPublicKey: any;
  networkPublicKey: any;
  networkPublicKeySet: any;
}

export interface FormattedMultipleAccs {
  error: boolean;
  formattedAccessControlConditions: any;
  formattedEVMContractConditions: any;
  formattedSolRpcConditions: any;
  formattedUnifiedAccessControlConditions: any;
}

export interface SignWithECDSA {
  // TODO: The message to be signed - note this message is not currently converted to a digest!!!!!
  message: string;

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;

  iat: number;
  exp: number;
}

export interface ValidateAndSignECDSA {
  accessControlConditions: AccessControlConditions;
  chain: Chain;
  auth_sig: JsonAuthSig;
}

export interface HandshakeWithSgx {
  url: string;
}

export interface JsonHandshakeResponse {
  serverPubKey: string;
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
}

export interface EncryptToIpfsProps {
  // The authSig of the user.  Returned via the checkAndSignAuthMessage function
  authSig?: JsonAuthSig;

  // the session signatures to use to authorize the user with the nodes
  sessionSigs?: any;

  // The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  accessControlConditions?: AccessControlConditions;

  // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  evmContractConditions?: EvmContractConditions;

  // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
  solRpcConditions?: SolRpcConditions;

  // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;

  // The string you wish to encrypt
  string?: string;

  // The file you wish to encrypt
  file?: AcceptedFileType;

  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClient;

  // Your Infura Project Id
  infuraId: string;

  // Your Infura API Key Secret
  infuraSecretKey: string;
}

export interface DecryptFromIpfsProps {
  // The authSig of the user.  Returned via the checkAndSignAuthMessage function
  authSig?: JsonAuthSig;

  // the session signatures to use to authorize the user with the nodes
  sessionSigs?: any;

  // The ipfsCid/ipfsHash of the encrypted string & metadata stored on IPFS
  ipfsCid: string;

  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClient;
}

export interface EncryptFileAndZipWithMetadataProps {
  // The authSig of the user.  Returned via the checkAndSignAuthMessage function
  authSig?: JsonAuthSig;

  // the session signatures to use to authorize the user with the nodes
  sessionSigs?: any;

  // The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  accessControlConditions?: AccessControlConditions;

  // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  evmContractConditions?: EvmContractConditions;

  // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
  solRpcConditions?: SolRpcConditions;

  // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: string;

  // The file you wish to encrypt
  file: File;

  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClient;

  // An optional readme text that will be inserted into readme.txt in the final zip file.  This is useful in case someone comes across this zip file and wants to know how to decrypt it.  This file could contain instructions and a URL to use to decrypt the file.
  readme: string;
}

export interface DecryptZipFileWithMetadataProps {
  // The authSig of the user.  Returned via the checkAndSignAuthMessage function
  authSig?: JsonAuthSig;

  // the session signatures to use to authorize the user with the nodes
  sessionSigs?: any;

  // The zip file blob with metadata inside it and the encrypted asset
  file: File | Blob;

  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClient;

  // Addtional access control conditions
  additionalAccessControlConditions?: any[];
}

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
  capabilities: string[];
  issuedAt: string;
  expiration: string;
  nodeAddress: string;
}

export interface SessionSigsProp {
  expiration?: any;
  chain: Chain;
  resources: any[];
  sessionCapabilities?: any;
  switchChain?: boolean;
  litNodeClient: ILitNodeClient;
}

export interface SessionKeyPair {
  publicKey: string;
  secretKey: string;
}

/** ========== Session ========== */

// pub struct AuthMethod {
//     pub auth_method_type: u32,
//     pub access_token: String,
// }
export interface AuthMethod {
  authMethodType: number;
  accessToken: string;
}

// pub struct JsonSignSessionKeyRequest {
//     pub session_key: String,
//     pub auth_methods: Vec<AuthMethod>,
//     pub pkp_public_key: String,
//     pub auth_sig: Option<AuthSigItem>,
//     pub siwe_message: String,
// }
export interface SignSessionKeyProp {
  // The session key to sign
  sessionKey?: string;

  // The auth methods to use to sign the session key
  authMethods: AuthMethod[];

  // The public key of the PKP
  pkpPublicKey?: string;

  // The auth sig of the user.  Returned via the checkAndSignAuthMessage function
  authSig?: JsonAuthSig;

  // The siwe message
  // siweMessage: string;

  //   When this session signature will expire.  The user will have to reauthenticate after this time using whatever auth method you set up.  This means you will have to call this signSessionKey function again to get a new session signature.  This is a RFC3339 timestamp.  The default is 24 hours from now.
  expiration: string;

  resources: any;

  chainId?: number;
  
  //domain param is required, when calling from environment that doesn't have the 'location' object. i.e. NodeJs server.
  domain?: string;
}

export interface SignSessionKeyResponse {
  pkpPublicKey: string;
  authSig: JsonAuthSig;
}

export interface GetSignSessionKeySharesProp {
  body: SessionRequestBody;
}

export interface GetSessionSigsProps {
  // When this session signature will expire.  The user will have to reauthenticate after this time using whatever auth method you set up.  This means you will have to call this signSessionKey function again to get a new session signature.  This is a RFC3339 timestamp.  The default is 24 hours from now.
  expiration?: any;

  //   The chain to use for the session signature.  This is the chain that will be used to sign the session key.  If you're using EVM then this probably doesn't matter at all.
  chain: any;

  //   These are the resources that will be signed with the session key.  You may pass a wildcard that allows these session signatures to work with any resource on Lit.  To see a list of resources, check out the docs: https://developer.litprotocol.com/sdk/explanation/walletsigs/sessionsigs/#resources-you-can-request
  resources: any;

  //   An optional list of capabilities that you want to request for this session.  If you pass nothing, then this will default to a wildcard for each type of resource you're accessing.  For example, if you passed ["litEncryptionCondition://123456"] then this would default to ["litEncryptionConditionCapability://*"], which would grant this session signature the ability to decrypt any resource.
  sessionCapabilities?: any;

  //   If you want to ask Metamask to try and switch the user's chain, you may pass true here.  This will only work if the user is using Metamask.  If the user is not using Metamask, then this will be ignored.
  switchChain?: any;

  //   This is a callback that will be called if the user needs to authenticate using a PKP.  For example, if the user has no wallet, but owns a Lit PKP though something like Google Oauth, then you can use this callback to prompt the user to authenticate with their PKP.  This callback should use the LitNodeClient.signSessionKey function to get a session signature for the user from their PKP.  If you don't pass this callback, then the user will be prompted to authenticate with their wallet, like metamask.
  authNeededCallback?: any;
  sessionKey?: any;
}

/* body must include:
    pub session_key: String,
    pub auth_methods: Vec<AuthMethod>,
    pub pkp_public_key: String,
    pub auth_sig: Option<AuthSigItem>,
    pub siwe_message: String,
*/
export interface SessionRequestBody {
  sessionKey: string;
  authMethods: Array<AuthMethod>;
  pkpPublicKey?: string;
  authSig?: JsonAuthSig;
  siweMessage: string;
}

export interface WalletSig {
  signedMessage: string;
  sig: any;
}

export interface SessionSigningTemplate {
  sessionKey: string;
  resources: any[];
  capabilities: any[];
  issuedAt: string;
  expiration: string;
}

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
  authenticatorAttachment: AuthenticatorAttachment;
}

export declare type AuthenticatorAttachment = 'cross-platform' | 'platform';
