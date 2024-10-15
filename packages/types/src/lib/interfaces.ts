import { Provider } from '@ethersproject/abstract-provider';
import depd from 'depd';
import { z } from 'zod';

import {
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
  SessionSigsSchema,
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
  GetSignedTokenRequestSchema,
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
} from '@lit-protocol/schemas';

import { ILitNodeClient } from './ILitNodeClient';
import { ISessionCapabilityObject, LitResourceAbilityRequest } from './models';
import {
  AcceptedFileType,
  AccessControlConditions,
  Chain,
  EvmContractConditions,
  IRelayAuthStatus,
  JsonRequest,
  ResponseStrategy,
  SolRpcConditions,
  SymmetricKey,
  UnifiedAccessControlConditions,
} from './types';

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
export type AuthSig = z.infer<typeof AuthSigSchema>;

export interface SolanaAuthSig extends AuthSig {
  derivedVia: 'solana.signMessage';
}

export interface CosmosAuthSig extends AuthSig {
  derivedVia: 'cosmos.signArbitrary';
}

export type CosmosWalletType = z.infer<typeof CosmosWalletTypeSchema>;

export type SessionKeyPair = z.infer<typeof SessionKeyPairSchema>;

export type LitActionSdkParams = z.infer<typeof LitActionSdkParamsSchema>;

export type AuthCallbackParams = z.infer<typeof AuthCallbackParamsSchema>;

/** ---------- Web3 ---------- */
export interface IProvider {
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

export interface VerifyJWTProps {
  publicKey: string;
  // A JWT signed by the LIT network using the BLS12-381 algorithm
  jwt: string;
}

export interface IJWT<T> {
  verified: boolean;
  header: JWTHeader;
  payload: T;
  signature: Uint8Array;
}

export interface JWTHeader {
  alg: string;
  typ: string;
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
  tokenList?: (any | string)[];
  myWalletAddress?: string;
}

/** ---------- Key Value Type ---------- */
export type KV = Record<string, any>;

/**
 * Override for LocalStorage and SessionStorage
 * if running in NodeJs and this is implicitly
 * binded globally
 */
export type StorageProvider = z.infer<typeof StorageProviderSchema>;

/** ---------- Lit Node Client ---------- */
export type LitNodeClientConfig = z.infer<typeof LitNodeClientConfigSchema>;

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

export interface BaseJsonPkpSignRequest {
  authMethods?: AuthMethod[];
  toSign: ArrayLike<number>;
}

/**
 * The 'pkpSign' function param. Please note that the structure
 * is different than the payload sent to the node.
 */
export interface JsonPkpSignSdkParams extends BaseJsonPkpSignRequest {
  pubKey: string;
  sessionSigs: SessionSigsMap;
}

/**
 * The actual payload structure sent to the node /pkp/sign endpoint.
 */
export interface JsonPkpSignRequest extends BaseJsonPkpSignRequest {
  authSig: AuthSig;

  /**
   * note that 'key' is in lower case, because this is what the node expects
   */
  pubkey: string;
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

export interface JsonSignSessionKeyRequestV1
  extends Pick<LitActionSdkParams, 'jsParams'>,
    Pick<LitActionSdkParams, 'litActionIpfsId'> {
  sessionKey: string;
  authMethods: AuthMethod[];
  pkpPublicKey?: string;
  siweMessage: string;
  curveType: 'BLS';
  epoch?: number;

  // custom auth params
  code?: string;
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
    ProofOfPossession: string;
  };
  shareIndex: number;
  curveType: string;
  siweMessage: string;
  dataSigned: string;
  blsRootPubkey: string;
}

export type JsonSigningResourceId = z.infer<typeof JsonSigningResourceIdSchema>;

export type MultipleAccessControlConditions = z.infer<
  typeof MultipleAccessControlConditionsSchema
>;

export type JsonAccsRequest = z.infer<typeof JsonAccsRequestSchema>;

export type JsonSigningRetrieveRequest = z.infer<
  typeof JsonSigningRetrieveRequestSchema
>;

export type GetSignedTokenRequest = z.infer<typeof GetSignedTokenRequestSchema>;

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
  sessionSigs?: object;
}

export type JsonEncryptionRetrieveRequest = z.infer<
  typeof JsonEncryptionRetrieveRequestSchema
>;

export interface LitActionResponseStrategy {
  strategy: ResponseStrategy;
  customFilter?: (
    responses: Record<string, string>[]
  ) => Record<string, string>;
}

export type IpfsOptions = z.infer<typeof IpfsOptionsSchema>;

export interface JsonExecutionSdkParamsTargetNode
  extends JsonExecutionSdkParams {
  targetNodeRange: number;
}

export type JsonExecutionSdkParams = z.infer<
  typeof JsonExecutionSdkParamsSchema
>;

export type ExecuteJsAdvancedOptions = z.infer<
  typeof ExecuteJsAdvancedOptionsSchema
>;

export interface JsonExecutionRequestTargetNode extends JsonExecutionRequest {
  targetNodeRange: number;
}

export interface JsonExecutionRequest
  extends Pick<LitActionSdkParams, 'jsParams'> {
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

export type SessionSigsOrAuthSig = z.infer<typeof SessionSigsOrAuthSigSchema>;

export type DecryptRequestBase = z.infer<typeof DecryptRequestBaseSchema>;
export type EncryptSdkParams = z.infer<typeof EncryptSdkParamsSchema>;

export interface EncryptRequest extends DecryptRequestBase {
  // The data that you wish to encrypt as a Uint8Array
  dataToEncrypt: Uint8Array;
}

export type EncryptResponse = z.infer<typeof EncryptResponseSchema>;

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

export type DecryptRequest = z.infer<typeof DecryptRequestSchema>;

export type DecryptResponse = z.infer<typeof DecryptResponseSchema>;

export interface GetSigningShareForDecryptionRequest extends JsonAccsRequest {
  dataToEncryptHash: string;
}

export type SigResponse = z.infer<typeof SigResponseSchema>;

export type ExecuteJsResponseBase = z.infer<typeof ExecuteJsResponseBaseSchema>;

/**
 *
 * An object containing the resulting signatures.  Each signature comes with the public key and the data signed.
 *
 */
export type ExecuteJsResponse = z.infer<typeof ExecuteJsResponseSchema>;

export interface ExecuteJsNoSigningResponse extends ExecuteJsResponseBase {
  claims: {};
  decryptions: [];
  response: any;
  logs: string;
}

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

export interface PKPSignShare {
  success: boolean;
  signedData: any;
  signatureShare: any;
}

export type NodeBlsSigningShare = z.infer<typeof NodeBlsSigningShareSchema>;

export type BlsSignatureShare = z.infer<typeof BlsSignatureShareSchema>;

export type SuccessNodePromises = z.infer<typeof SuccessNodePromisesSchema>;

export type RejectedNodePromises = z.infer<typeof RejectedNodePromisesSchema>;

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
  callRequests: CallRequest[];

  // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
  chain: Chain;
}

export interface NodeCommandResponse {
  url: string;
  data: JsonRequest;
}

export type NodeCommandServerKeysResponse = z.infer<
  typeof NodeCommandServerKeysResponseSchema
>;

export type FormattedMultipleAccs = z.infer<typeof FormattedMultipleAccsSchema>;

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
}

export type HandshakeWithNode = z.infer<typeof HandshakeWithNodeSchema>;

export type NodeAttestation = z.infer<typeof NodeAttestationSchema>;

export type JsonHandshakeResponse = z.infer<typeof JsonHandshakeResponseSchema>;

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
}

export type EncryptToJsonDataType = 'string' | 'file';

export interface EncryptToJsonPayload extends DecryptRequestBase {
  ciphertext: string;
  dataToEncryptHash: string;
  dataType: EncryptToJsonDataType;
}

export interface DecryptFromJsonProps {
  // the session signatures to use to authorize the user with the nodes
  sessionSigs: SessionSigsMap;

  // An instance of LitNodeClient that is already connected
  litNodeClient: ILitNodeClient;

  parsedJsonData: EncryptToJsonPayload;
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
  capabilities: AuthSig[];
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

/** ========== Session ========== */
export type AuthMethod = z.infer<typeof AuthMethodSchema>;

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
export interface CommonGetSessionSigsProps {
  /**
   * Session signature properties shared across all functions that generate session signatures.
   */
  pkpPublicKey?: string;

  /**
   * When this session signature will expire. After this time is up you will need to reauthenticate, generating a new session signature. The default time until expiration is 24 hours. The formatting is an [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339) timestamp.
   */
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
   * The wildcard means that the session will be granted the ability to to perform operations with any access control condition.
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
   * @deprecated - use capabilityAuthSigs instead
   * Used for delegation of Capacity Credit. This signature will be checked for proof of capacity credit.
   * Capacity credits are required on the paid Lit networks (mainnets and certain testnets), and are not required on the unpaid Lit networks (certain testnets).
   * See more [here](https://developer.litprotocol.com/sdk/capacity-credits).
   */
  capacityDelegationAuthSig?: AuthSig;

  /**
   * Not limited to capacityDelegationAuthSig. Other AuthSigs with other purposes can also be in this array.
   */
  capabilityAuthSigs?: AuthSig[];
}

export interface BaseProviderGetSessionSigsProps
  extends CommonGetSessionSigsProps,
    LitActionSdkParams {
  /**
   * This is a callback that will be used to generate an AuthSig within the session signatures. It's inclusion is required, as it defines the specific resources and abilities that will be allowed for the current session.
   */
  authNeededCallback?: AuthCallback;
}

export interface GetSessionSigsProps
  extends CommonGetSessionSigsProps,
    LitActionSdkParams {
  /**
   * This is a callback that will be used to generate an AuthSig within the session signatures. It's inclusion is required, as it defines the specific resources and abilities that will be allowed for the current session.
   */
  authNeededCallback: AuthCallback;
}
export type AuthCallback = (params: AuthCallbackParams) => Promise<AuthSig>;

export type SessionSigsMap = z.infer<typeof SessionSigsSchema>;

export type SessionSigs = Record<string, AuthSig>;

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
  capabilities: any[];
  issuedAt: string;
  expiration: string;
  nodeAddress: string;
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

/**
 * ========== PKP ==========
 */
export interface LitClientSessionManager {
  getSessionKey: () => SessionKeyPair;
  isSessionKeyPair(obj: any): boolean;
  getExpiration: () => string;
  getWalletSig: (getWalletSigProps: GetWalletSigProps) => Promise<AuthSig>;
  // #authCallbackAndUpdateStorageItem: (params: {
  //   authCallbackParams: AuthCallbackParams;
  //   authCallback?: AuthCallback;
  // }) => Promise<AuthSig>;
  getPkpSessionSigs: (params: GetPkpSessionSigs) => Promise<SessionSigsMap>;
  checkNeedToResignSessionKey: (params: {
    authSig: AuthSig;
    sessionKeyUri: any;
    resourceAbilityRequests: LitResourceAbilityRequest[];
  }) => Promise<boolean>;
  getSessionSigs: (params: GetSessionSigsProps) => Promise<SessionSigsMap>;
  signSessionKey: (
    params: SignSessionKeyProp
  ) => Promise<SignSessionKeyResponse>;
}

export interface AuthenticationProps {
  /**
   * This params is equivalent to the `getSessionSigs` params in the `litNodeClient`
   */
  getSessionSigsProps: GetSessionSigsProps;
}

export interface PKPBaseProp {
  litNodeClient: ILitNodeClient;
  pkpPubKey: string;
  rpcs?: RPCUrls;
  authContext?: AuthenticationProps;
  debug?: boolean;
  litActionCode?: string;
  litActionIPFS?: string;
  litActionJsParams?: any;
  controllerSessionSigs?: SessionSigs;

  /**
   * @deprecated - use authContext
   */
  controllerAuthMethods?: AuthMethod[];

  /**
   * @deprecated - use authContext
   */
  controllerAuthSig?: AuthSig;
}

export interface RPCUrls {
  eth?: string;
  cosmos?: string;
  btc?: string;
}

export interface PKPWallet {
  getAddress: () => Promise<string>;
  init: () => Promise<void>;
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
  litNodeClient?: any;
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
  litNodeClient: any;
  capacityTokenId?: string;
  delegateeAddresses?: string[];
  uses?: string;
}

export interface CapacityDelegationRequest {
  nft_id?: string[]; // Optional array of strings
  delegate_to?: string[]; // Optional array of modified address strings
  uses?: string;
}

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

export interface GetPkpSessionSigs
  extends CommonGetSessionSigsProps,
    LitActionSdkParams {
  pkpPublicKey: string;

  /**
   * Lit Protocol supported auth methods: https://developer.litprotocol.com/v3/sdk/wallets/auth-methods
   * This CANNOT be used for custom auth methods. For custom auth methods, please pass the customAuth
   * object to jsParams, and handle the custom auth method in your Lit Action.
   *
   * Notes for internal dev: for the SDK, this value can be omitted, but it needs to be an empty array [] set in the SDK before
   * sending it to the node
   */
  authMethods?: AuthMethod[];

  ipfsOptions?: IpfsOptions;
}

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
