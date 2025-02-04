import { Provider } from '@ethersproject/abstract-provider';
import depd from 'depd';

import { ILitNodeClient } from './ILitNodeClient';
import { ISessionCapabilityObject, LitResourceAbilityRequest } from './models';
import {
  AcceptedFileType,
  AccessControlConditions,
  Chain,
  EvmContractConditions,
  IRelayAuthStatus,
  JsonRequest,
  LIT_NETWORKS_KEYS,
  LitContractContext,
  LitContractResolverContext,
  ResponseStrategy,
  SolRpcConditions,
  SymmetricKey,
  UnifiedAccessControlConditions,
} from './types';
import { SigType } from './EndpointResponses';
const deprecated = depd('lit-js-sdk:types:interfaces');

/** ---------- Access Control Conditions Interfaces ---------- */

export interface ABIParams {
  name: string;
  type: string;
}

export interface AccsOperatorParams {
  operator: string;
}

/** ---------- Auth Sig ---------- */

/**
 * An `AuthSig` represents a cryptographic proof of ownership for an Ethereum address, created by signing a standardized [ERC-5573 SIWE ReCap](https://eips.ethereum.org/EIPS/eip-5573) (Sign-In with Ethereum) message. This signature serves as a verifiable credential, allowing the Lit network to associate specific permissions, access rights, and operational parameters with the signing Ethereum address. By incorporating various capabilities, resources, and parameters into the SIWE message before signing, the resulting `AuthSig` effectively defines and communicates these authorizations and specifications for the address within the Lit network.
 */
export interface AuthSig {
  /**
   * The signature produced by signing the `signMessage` property with the corresponding private key for the `address` property.
   */
  sig: string;

  /**
   * The method used to derive the signature (e.g, `web3.eth.personal.sign`).
   */
  derivedVia: string;

  /**
   * An [ERC-5573](https://eips.ethereum.org/EIPS/eip-5573) SIWE (Sign-In with Ethereum) message. This can be prepared by using one of the `createSiweMessage` functions from the [`@auth-helpers`](https://v6-api-doc-lit-js-sdk.vercel.app/modules/auth_helpers_src.html) package:
   * -  [`createSiweMessage`](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessage.html)
   * -  [`createSiweMessageWithRecaps](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessageWithRecaps.html)
   * -  [`createSiweMessageWithCapacityDelegation`](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessageWithCapacityDelegation.html)
   */
  signedMessage: string;

  /**
   * The Ethereum address that was used to sign `signedMessage` and create the `sig`.
   */
  address: string;

  /**
   * An optional property only seen when generating session signatures, this is the signing algorithm used to generate session signatures.
   */
  algo?: string;
}

export interface SolanaAuthSig extends AuthSig {
  derivedVia: 'solana.signMessage';
}

export interface CosmosAuthSig extends AuthSig {
  derivedVia: 'cosmos.signArbitrary';
}

export type CosmosWalletType = 'keplr' | 'leap';

export interface AuthCallbackParams extends LitActionSdkParams {
  /**
   * The serialized session key pair to sign. If not provided, a session key pair will be fetched from localStorge or generated.
   */
  sessionKey?: SessionKeyPair;

  /**
   * The chain you want to use.  Find the supported list of chains here: https://developer.litprotocol.com/docs/supportedChains
   */
  chain: Chain;

  /**
   *   The statement that describes what the user is signing. If the auth callback is for signing a SIWE message, you MUST add this statement to the end of the SIWE statement.
   */
  statement?: string;

  /**
   * The blockhash that the nodes return during the handshake
   */
  nonce: string;

  /**
   * Optional and only used with EVM chains.  A list of resources to be passed to Sign In with Ethereum.  These resources will be part of the Sign in with Ethereum signed message presented to the user.
   */
  resources?: string[];

  /**
   * Optional and only used with EVM chains right now.  Set to true by default.  Whether or not to ask Metamask or the user's wallet to switch chains before signing.  This may be desired if you're going to have the user send a txn on that chain.  On the other hand, if all you care about is the user's wallet signature, then you probably don't want to make them switch chains for no reason.  Pass false here to disable this chain switching behavior.
   */
  switchChain?: boolean;

  // --- Following for Session Auth ---
  expiration?: string;

  uri?: string;

  /**
   * Cosmos wallet type, to support mutliple popular cosmos wallets
   * Keplr & Cypher -> window.keplr
   * Leap -> window.leap
   */
  cosmosWalletType?: CosmosWalletType;

  /**
   * Optional project ID for WalletConnect V2. Only required if one is using checkAndSignAuthMessage and wants to display WalletConnect as an option.
   */
  walletConnectProjectId?: string;

  resourceAbilityRequests?: LitResourceAbilityRequest[];
}

/** ---------- Web3 ---------- */
export interface IProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  account: string;
}

/** ---------- Crypto ---------- */

export interface EncryptedFile {
  encryptedFile: Blob;
  symmetricKey: SymmetricKey;
}

export interface DecryptFileProps {
  file: AcceptedFileType;
  symmetricKey: SymmetricKey;
}

export interface SigningAccessControlConditionJWTPayload
  extends MultipleAccessControlConditions {
  iss: string;
  sub: string;
  chain?: string;
  iat: number;
  exp: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenList?: (any | string)[];
  myWalletAddress?: string;
}

/** ---------- Key Value Type ---------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KV = Record<string, any>;

/** ---------- Lit Node Client ---------- */
export interface LitNodeClientConfig {
  litNetwork: LIT_NETWORKS_KEYS;
  alertWhenUnauthorized?: boolean;
  minNodeCount?: number;
  debug?: boolean;
  connectTimeout?: number;
  checkNodeAttestation?: boolean;
  contractContext?: LitContractContext | LitContractResolverContext;
  storageProvider?: StorageProvider;
  defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;
  rpcUrl?: string;
}

export type CustomNetwork = Pick<
  LitNodeClientConfig,
  'litNetwork' | 'contractContext' | 'checkNodeAttestation'
> &
  Partial<Pick<LitNodeClientConfig, 'minNodeCount'>>;

/**
 * Override for LocalStorage and SessionStorage
 * if running in NodeJs and this is implicitly
 * binded globally
 */
export interface StorageProvider {
  provider: Storage;
}

export interface Signature {
  r: string;
  s: string;
  v: number;
}

export interface ClaimKeyResponse {
  signatures: Signature[];
  claimedKeyId: string;
  pubkey: string;
  mintTx: string;
}

/**
 * Struct in rust
 * -----
pub struct JsonExecutionRequest {
  pub auth_sig: AuthSigItem,
  #[serde(default = "default_epoch")]
  pub epoch: u64,

  pub ipfs_id: Option<String>,
  pub code: Option<String>,
    pub js_params: Option<Value>,
    pub auth_methods: Option<Vec<AuthMethod>>,
}
 */

/**
 * The 'pkpSign' function param. Please note that the structure
 * is different than the payload sent to the node.
 */
export interface JsonPkpSignSdkParams {
  pubKey: string;
  toSign: ArrayLike<number>;
  authContext: AuthenticationContext;
  userMaxPrice?: bigint;
}

/**
 * The actual payload structure sent to the node /pkp/sign endpoint.
 */
export interface JsonPkpSignRequest<T> extends NodeSetRequired {
  toSign: ArrayLike<number>;
  authMethods?: AuthMethod[];
  authSig: AuthSig;

  /**
   * note that 'key' is in lower case, because this is what the node expects
   */
  pubkey: string;

  signingScheme: T;
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
  callRequests: CallRequest[];
  chain: Chain;
  iat: number;
  exp: number;
}

// Naga V8: Selected Nodes for ECDSA endpoints #1223
// https://github.com/LIT-Protocol/lit-assets/pull/1223/
export interface NodeSet {
  // reference: https://github.com/LIT-Protocol/lit-assets/blob/f82b28e83824a861547307aaed981a6186e51d48/rust/lit-node/common/lit-node-testnet/src/node_collection.rs#L185-L191
  // eg: 192.168.0.1:8080
  socketAddress: string;

  // (See PR description) the value parameter is a U64 that generates a sort order. This could be pricing related information, or another value to help select the right nodes. The value could also be zero with only the correct number of nodes participating in the signing request.
  value: number;
}

// Naga V8: Ability to pass selected nodes to ECDSA endpoints, and use these instead of the nodes' self-determined peers.
// https://github.com/LIT-Protocol/lit-assets/pull/1223
export interface NodeSetRequired {
  nodeSet: NodeSet[];
}

export interface JsonSignSessionKeyRequestV1
  extends Pick<LitActionSdkParams, 'jsParams'>,
    Pick<LitActionSdkParams, 'litActionIpfsId'>,
    NodeSetRequired {
  sessionKey: string;
  authMethods: AuthMethod[];
  pkpPublicKey?: string;
  siweMessage: string;
  curveType: 'BLS';
  epoch?: number;

  // custom auth params
  code?: string;
}

export interface JsonSignSessionKeyRequestV2<T>
  extends Pick<LitActionSdkParams, 'jsParams'>,
    Pick<LitActionSdkParams, 'litActionIpfsId'>,
    NodeSetRequired {
  sessionKey: string;
  authMethods: AuthMethod[];
  pkpPublicKey?: string;
  siweMessage: string;
  curveType: 'BLS';
  epoch?: number;

  // custom auth params
  code?: string;

  signingScheme: T;
}

// [
//   {
//     "result": "success",
//     "signatureShare": {
//       "ProofOfPossession": "01b191b1d281857a95d2fd189683db366ab1088723338c1805daa4650459e9fcaebaa57b58108c284d233404dd5f2e58f208aafb87d981098aba3fe850980184a4b29643a21107b03f1d928646245b57af3745a81418989e0b6aad9bd1f192723c"
//     },
//     "shareIndex": 0,
//     "curveType": "BLS",
//     "siweMessage": "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
//     "dataSigned": "b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5",
//     "blsRootPubkey": "a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902"
//   },
//   {
//     "result": "success",
//     "signatureShare": {
//       "ProofOfPossession": "038178034edcd5b48da4e2af6eb0891ece41389aa6119c80546d3fa00b5d2ba87eaec327b18d8013714b486246807498c8198e70cf8e917b1a5f1d8d0846787172521d41994de95bd641bdc1d9ccee9b459ceeb03f156cf357a4ff8faf5d2e167d"
//     },
//     "shareIndex": 2,
//     "curveType": "BLS",
//     "siweMessage": "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
//     "dataSigned": "b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5",
//     "blsRootPubkey": "a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902"
//   },
//   {
//     "result": "success",
//     "signatureShare": {
//       "ProofOfPossession": "0292a026325a166398b85b53f3a7a34d147c5337e189d75c33c0f227f7926c839b408dfcc5d242a8685a81c68e0ccedc080c051219161dbc37f06627259b19d15120ab2f710075a44b1dcef18d511bb99b6625c8f575d2688c6b5b01ba6bf448c9"
//     },
//     "shareIndex": 1,
//     "curveType": "BLS",
//     "siweMessage": "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
//     "dataSigned": "b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5",
//     "blsRootPubkey": "a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902"
//   }
// ]
export interface BlsResponseData {
  result: boolean | 'success';
  signatureShare: {
    ProofOfPossession: {
      identifier: string;
      value: string;
    };
  };
  curveType: string;
  siweMessage: string;
  dataSigned: string;
  blsRootPubkey: string;
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

export interface MultipleAccessControlConditions {
  // The access control conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  accessControlConditions?: AccessControlConditions;

  // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  evmContractConditions?: EvmContractConditions;

  // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.
  solRpcConditions?: SolRpcConditions;

  // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;
}

export interface JsonAccsRequest extends MultipleAccessControlConditions {
  // The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
  chain?: Chain;

  // The resourceId representing something on the web via a URL
  resourceId?: JsonSigningResourceId;

  // The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
  authSig?: AuthSig;

  sessionSigs?: SessionSigsMap;
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
  sessionSigs?: SessionSigsMap;
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
  permanant?: 0 | 1;
  permanent?: 0 | 1;
  authSig?: AuthSig;
  sessionSigs?: SessionSigsMap;
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

export interface LitActionResponseStrategy {
  strategy: ResponseStrategy;
  customFilter?: (
    responses: Record<string, string>[]
  ) => Record<string, string>;
}

export interface IpfsOptions {
  overwriteCode?: boolean;
  gatewayUrl?: `https://${string}/ipfs/`;
}

export interface JsonExecutionSdkParams
  extends Pick<LitActionSdkParams, 'jsParams'>,
    ExecuteJsAdvancedOptions {
  /**
   *  JS code to run on the nodes
   */
  code?: string;

  /**
   * The IPFS ID of some JS code to run on the nodes
   */
  ipfsId?: string;

  authContext: AuthenticationContext;
  userMaxPrice?: bigint;
}

export interface ExecuteJsAdvancedOptions {
  /**
   * a strategy for proccessing `reponse` objects returned from the
   * Lit Action execution context
   */
  responseStrategy?: LitActionResponseStrategy;

  /**
   * Allow overriding the default `code` property in the `JsonExecutionSdkParams`
   */
  ipfsOptions?: IpfsOptions;

  /**
   * Only run the action on a single node; this will only work if all code in your action is non-interactive
   */
  useSingleNode?: boolean;
}

export interface JsonExecutionRequest
  extends Pick<LitActionSdkParams, 'jsParams'>,
    NodeSetRequired {
  authSig: AuthSig;

  /**
   * auto-filled before sending each command to the node, but
   * in the rust struct, this type is required.
   */
  // epoch: number;
  ipfsId?: string;
  code?: string;
  authMethods?: AuthMethod[];
}

export interface DecryptRequestBase extends MultipleAccessControlConditions {
  /**
   * The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
   */
  chain: Chain;
  authSig?: AuthSig;
  authContext: AuthenticationContext;
  userMaxPrice?: bigint;
}
export interface EncryptSdkParams extends MultipleAccessControlConditions {
  dataToEncrypt: Uint8Array;
}

export interface EncryptRequest extends DecryptRequestBase {
  // The data that you wish to encrypt as a Uint8Array
  dataToEncrypt: Uint8Array;
}

export interface EncryptResponse {
  /**
   * The base64-encoded ciphertext
   */
  ciphertext: string;

  /**
   * The hash of the data that was encrypted
   */
  dataToEncryptHash: string;
}

export interface EncryptUint8ArrayRequest
  extends MultipleAccessControlConditions {
  /**
   * The uint8array that you wish to encrypt
   */
  dataToEncrypt: Uint8Array;
}

export interface EncryptStringRequest extends MultipleAccessControlConditions {
  /**
   * String that you wish to encrypt
   */
  dataToEncrypt: string;
}

export interface EncryptFileRequest extends DecryptRequestBase {
  file: AcceptedFileType;
}

export interface DecryptRequest extends EncryptResponse, DecryptRequestBase {}

export interface DecryptResponse {
  // The decrypted data as a Uint8Array
  decryptedData: Uint8Array;
}

export interface GetSigningShareForDecryptionRequest extends JsonAccsRequest {
  dataToEncryptHash: string;
}

export interface SigResponse {
  r: string;
  s: string;
  recid: number;
  signature: `0x${string}`;
  publicKey: string; // pkp public key (no 0x prefix)
  dataSigned: string;
}

export interface ExecuteJsResponseBase {
  signatures:
    | {
        sig: SigResponse;
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any;
}

/**
 *
 * An object containing the resulting signatures.  Each signature comes with the public key and the data signed.
 *
 */
export interface ExecuteJsResponse extends ExecuteJsResponseBase {
  success?: boolean;

  // FIXME: Fix if and when we enable decryptions from within a Lit Action.
  // decryptions: any[];
  response: string | object;
  logs: string;
  claims?: Record<string, { signatures: Signature[]; derivedKeyId: string }>;
  debug?: {
    allNodeResponses: NodeResponse[];
    allNodeLogs: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs: any;
    }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawNodeHTTPResponses: any;
  };
}

export interface ExecuteJsNoSigningResponse extends ExecuteJsResponseBase {
  // eslint-disable-next-line @typescript-eslint/ban-types
  claims: {};
  decryptions: [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  logs: string;
}

export interface SendNodeCommand {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  requestId: string;
}
export interface SigShare {
  sigType: SigType;
  signatureShare: string;
  bigR?: string;
  publicKey: string;
  dataSigned?: string | 'fail';
  siweMessage?: string;
  sigName?: string;
}

export interface NodeShare {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  claimData: any;

  // I think this is deprecated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unsignedJwt: any;
  signedData: SigShare;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decryptedData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logs: any;
  success?: boolean | '';
}

export interface NodeBlsSigningShare {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unsignedJwt?: any;
  signatureShare: BlsSignatureShare;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logs?: any;
}

export interface BlsSignatureShare {
  ProofOfPossession: {
    identifier: string;
    value: string;
  };
}

export interface SuccessNodePromises<T> {
  success: true;
  values: T[];
}

export interface RejectedNodePromises {
  success: false;
  error: NodeErrorV1;
}

export interface NodeErrorV1 {
  errorKind: string;
  status: number;
  details: string[];
  message?: string;
  errorCode?: string;
}

export interface NodeErrorV3 {
  errorKind: string;
  errorCode: string;
  status: number;
  message: string;
  correlationId: string;
  details: string[];
}

export interface NodeClientErrorV1 {
  message: string;
  errorKind: string;
  errorCode: string;
  details?: string[];
  status?: number;
  requestId?: string;
}

export interface NodeResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
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
  callRequests: CallRequest[];

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;
}

export interface NodeCommandResponse {
  url: string;
  data: JsonRequest;
}

export interface NodeCommandServerKeysResponse {
  serverPublicKey: string;
  subnetPublicKey: string;
  networkPublicKey: string;
  networkPublicKeySet: string;
  hdRootPubkeys: string[];
  attestation?: NodeAttestation;
  latestBlockhash?: string;
}

export interface FormattedMultipleAccs {
  error: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formattedAccessControlConditions: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formattedEVMContractConditions: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formattedSolRpcConditions: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface CombinedECDSASignature {
  r: string;
  s: string;
  recid: number;
  signature: `0x${string}`;
}

export interface HandshakeWithNode {
  url: string;
  challenge: string;
}

export interface NodeAttestation {
  type: string;
  noonce: string;
  data: {
    INSTANCE_ID: string;
    RELEASE_ID: string;
    UNIX_TIME: string;
  };
  signatures: string[];
  report: string;
}

export interface JsonHandshakeResponse {
  serverPubKey: string;
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
  hdRootPubkeys: string[];
  latestBlockhash?: string;
}

export interface EncryptToJsonProps extends MultipleAccessControlConditions {
  /**
   * The chain
   */
  chain: string;

  /**
   * The string you wish to encrypt
   */
  string?: string;

  /**
   * The file you wish to encrypt
   */
  file?: AcceptedFileType;

  /**
   * An instance of LitNodeClient that is already connected
   */
  litNodeClient: ILitNodeClient;

  authContext: AuthenticationContext;
}

export type EncryptToJsonDataType = 'string' | 'file';

export interface EncryptToJsonPayload extends DecryptRequestBase {
  ciphertext: string;
  dataToEncryptHash: string;
  dataType: EncryptToJsonDataType;
}

export interface DecryptFromJsonProps {
  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClient;

  parsedJsonData: EncryptToJsonPayload;
  authContext: AuthenticationContext;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resources?: any[];
  capabilities: AuthSig[];
  issuedAt: string;
  expiration: string;
  nodeAddress: string;
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

export interface CreateCustomAuthMethodRequest {
  /**
   * For a custom authentication method, the custom auth ID should uniquely identify the user for that project. For example, for Google, we use appId:userId, so you should follow a similar format for Telegram, Twitter, or any other custom auth method.
   */
  authMethodId: string | Uint8Array;

  authMethodType: number;

  /**
   * Permission scopes:
   * https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
   */
  scopes: string[] | number[];
}

// pub struct JsonSignSessionKeyRequest {
//     pub session_key: String,
//     pub auth_methods: Vec<AuthMethod>,
//     pub pkp_public_key: String,
//     pub auth_sig: Option<AuthSigItem>,
//     pub siwe_message: String,
// }
export interface SignSessionKeyProp extends LitActionSdkParams {
  /**
   * The serialized session key pair to sign. If not provided, a session key pair will be fetched from localStorge or generated.
   */
  sessionKey?: SessionKeyPair;

  /**
   * The statement text to place at the end of the SIWE statement field.
   */
  statement?: string;

  /**
   * The auth methods to use to sign the session key
   */
  authMethods: AuthMethod[];

  /**
   * The public key of the PKP
   */
  pkpPublicKey?: string;

  /**
   * The auth sig of the user.  Returned via the checkAndSignAuthMessage function
   */
  authSig?: AuthSig;

  /**
   * When this session signature will expire.  The user will have to reauthenticate after this time using whatever auth method you set up.  This means you will have to call this signSessionKey function again to get a new session signature.  This is a RFC3339 timestamp.  The default is 24 hours from now.
   */
  expiration?: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resources: any;

  chainId?: number;

  /**
   * domain param is required, when calling from environment that doesn't have the 'location' object. i.e. NodeJs server.
   */
  domain?: string;

  /**
   * A LIT resource ability is a combination of a LIT resource and a LIT ability.
   */
  resourceAbilityRequests?: LitResourceAbilityRequest[];
}

export interface SignSessionKeyResponse {
  pkpPublicKey: string;
  authSig: AuthSig;
}

export interface GetSignSessionKeySharesProp {
  body: SessionRequestBody;
}

export interface AuthenticationContext extends LitActionSdkParams {
  /**
   * Session signature properties shared across all functions that generate session signatures.
   */
  pkpPublicKey?: string;

  /**
   * When this session signature will expire. After this time is up you will need to reauthenticate, generating a new session signature. The default time until expiration is 24 hours. The formatting is an [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339) timestamp.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expiration?: any;

  /**
   * The chain to use for the session signature and sign the session key. This value is almost always `ethereum`. If you're using EVM, this parameter isn't very important.
   */
  chain?: Chain;

  /**
   * An array of resource abilities that you want to request for this session. These will be signed with the session key.
   * For example, an ability is added to grant a session permission to decrypt content associated with a particular Access Control Conditions (ACC) hash. When trying to decrypt, this ability is checked in the `resourceAbilityRequests` to verify if the session has the required decryption capability.
   * @example
   * [{ resource: new LitAccessControlConditionResource('someAccHash`), ability: LitAbility.AccessControlConditionDecryption }]
   */
  resourceAbilityRequests: LitResourceAbilityRequest[];

  /**
   * The session capability object that you want to request for this session.
   * It is likely you will not need this, as the object will be automatically derived from the `resourceAbilityRequests`.
   * If you pass nothing, then this will default to a wildcard for each type of resource you're accessing.
   * The wildcard means that the session will be granted the ability to perform operations with any access control condition.
   */
  sessionCapabilityObject?: ISessionCapabilityObject;

  /**
   * If you want to ask MetaMask to try and switch the user's chain, you may pass true here. This will only work if the user is using MetaMask, otherwise this will be ignored.
   */
  switchChain?: boolean;
  /**
   * The serialized session key pair to sign.
   * If not provided, a session key pair will be fetched from localStorage or generated.
   */
  sessionKey?: SessionKeyPair;

  /**
   * Not limited to capacityDelegationAuthSig. Other AuthSigs with other purposes can also be in this array.
   */
  capabilityAuthSigs?: AuthSig[];

  /**
   * This is a callback that will be used to generate an AuthSig within the session signatures. It's inclusion is required, as it defines the specific resources and abilities that will be allowed for the current session.
   */
  authNeededCallback?: AuthCallback;

  authMethods?: AuthMethod[];

  ipfsOptions?: IpfsOptions;
}

export type AuthCallback = (params: AuthCallbackParams) => Promise<AuthSig>;

/**
 * A map of node addresses to the session signature payload
 * for that node specifically.
 *
 * Each individual session signature for each node includes the following properties:
 * -  `sig`: The signature produced by the ECDSA key pair signing the `signedMessage` payload.
 *
 * -  `derivedVia`: Should be `litSessionSignViaNacl`, specifies that the session signature object was created via the `NaCl` library.
 *
 * -  `signedMessage`: The payload signed by the session key pair. This is the signed `AuthSig` with the contents of the AuthSig's `signedMessage` property being derived from the [`authNeededCallback`] (See @link AuthenticationContext) property.
 *
 * -  `address`: When the session key signs the SIWE ReCap message, this will be the session key pair public key. If an EOA wallet signs the message, then this will be the EOA Ethereum address.
 *
 * -  `algo`: The signing algorithm used to generate the session signature.
 */
export type SessionSigsMap = Record<string, AuthSig>;

export interface SessionRequestBody {
  sessionKey: string;
  authMethods: AuthMethod[];
  pkpPublicKey?: string;
  authSig?: AuthSig;
  siweMessage: string;
}

export interface GetWalletSigProps extends LitActionSdkParams {
  authNeededCallback?: AuthCallback;
  chain: string;
  sessionCapabilityObject: ISessionCapabilityObject;
  switchChain?: boolean;
  expiration: string;
  sessionKey: SessionKeyPair;
  sessionKeyUri: string;
  nonce: string;
  resourceAbilityRequests?: LitResourceAbilityRequest[];
}

export interface SessionSigningTemplate {
  sessionKey: string;
  resourceAbilityRequests: LitResourceAbilityRequest[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  capabilities: any[];
  issuedAt: string;
  expiration: string;
  nodeAddress: string;
  maxPrice: string;
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

export interface PKPBaseProp {
  litNodeClient: ILitNodeClient;
  pkpPubKey: string;
  rpcs?: RPCUrls;
  authContext: AuthenticationContext;
  debug?: boolean;
  litActionCode?: string;
  litActionIPFS?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  litActionJsParams?: any;
}

export interface RPCUrls {
  eth?: string;
  cosmos?: string;
  btc?: string;
}

export interface PKPWallet {
  getAddress: () => Promise<string>;
  init: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runLitAction: (toSign: Uint8Array, sigName: string) => Promise<any>;
  runSign: (toSign: Uint8Array) => Promise<SigResponse>;
}

export type PKPEthersWalletProp = Omit<
  PKPBaseProp,
  'controllerAuthSig' | 'controllerAuthMethods'
> & {
  litNodeClient: ILitNodeClient;
  provider?: Provider;
  rpc?: string;
};

export interface PKPCosmosWalletProp extends PKPBaseProp {
  addressPrefix: string | 'cosmos'; // bech32 address prefix (human readable part) (default: cosmos)
  rpc?: string;
}

// note: Omit removes the 'addressPrefix' from PKPCosmosWalletProp
export interface PKPClientProp extends PKPBaseProp {
  cosmosAddressPrefix?: string | 'cosmos';
}

export interface PKPBaseDefaultParams {
  toSign: Uint8Array;
  publicKey: Uint8Array;
  sigName: string;
}

export interface PKPClientHelpers {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest: (request: any) => Promise<any>;
  setRpc: (rpc: string) => void;
  getRpc: () => string;
}

/**
 * ========== Lit Auth Client ==========
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StytchToken = Record<string, any>;

export interface EthWalletAuthenticateOptions {
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

export interface StytchOtpAuthenticateOptions {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  litNodeClient?: ILitNodeClient;
}

export interface WithRecap extends BaseSiweMessage {
  uri: string;
  expiration: string;
  resources: LitResourceAbilityRequest[];
}

export interface WithCapacityDelegation extends BaseSiweMessage {
  uri: 'lit:capability:delegation';
  litNodeClient: ILitNodeClient;
  delegateeAddresses?: string[];
  // paymentId?: string;
  uses?: string;
}

export interface CapacityDelegationFields extends BaseSiweMessage {
  litNodeClient: ILitNodeClient;
  delegateeAddresses?: string[];
  uses?: string;
}

export interface CapacityDelegationRequest {
  delegate_to?: string[]; // Optional array of modified address strings
  uses?: string;
}

export interface CapacityCreditsReq {
  dAppOwnerWallet: SignerLike;

  /**
   * 1. Provided: Restricts the use of the delegation to the addresses listed in the array. Only users whose addresses are included can utilize the delegated capabilities.
   * 2. NOT Provided: The delegation is universally applicable to anyone. There are no restrictions on who can use the delegated capabilities.
   * 3. Empty Array: No one is allowed to use the delegated capabilities since there are no valid user addresses specified.
   */
  delegateeAddresses?: string[];

  // paymentId: string;

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

export interface LitActionSdkParams {
  /**
   * The litActionCode is the JavaScript code that will run on the nodes.
   * You will need to convert the string content to base64.
   *
   * @example
   * Buffer.from(litActionCodeString).toString('base64');
   */
  litActionCode?: string;

  /**
   * You can obtain the Lit Action IPFS CID by converting your JavaScript code using this tool:
   * https://explorer.litprotocol.com/create-action
   *
   * Note: You do not need to pin your code to IPFS necessarily.
   * You can convert a code string to an IPFS hash using the "ipfs-hash-only" or 'ipfs-unixfs-importer' library.
   *
   * @example
   * async function stringToIpfsHash(input: string): Promise<string> {
   *   // Convert the input string to a Buffer
   *   const content = Buffer.from(input);
   *
   *   // Import the content to create an IPFS file
   *   const files = importer([{ content }], {} as any, { onlyHash: true });
   *
   *   // Get the first (and only) file result
   *   const result = (await files.next()).value;
   *
   *   const ipfsHash = (result as any).cid.toString();
   *   if (!ipfsHash.startsWith('Qm')) {
   *     throw new Error('Generated hash does not start with Qm');
   *   }
   *
   *   return ipfsHash;
   * }
   */
  litActionIpfsId?: string;

  /**
   * An object that contains params to expose to the Lit Action.  These will be injected to the JS runtime before your code runs, so you can use any of these as normal variables in your Lit Action.
   */
  jsParams?:
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
        publicKey?: string;
        sigName?: string;
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signMessage: (message: string | any) => Promise<string>;
  getAddress: () => Promise<string>;
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
