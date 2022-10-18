import { LIT_NETWORKS_KEYS } from "./constants";
import { LIT_ERROR } from "./errors";
import { Accs, EVMAccs, SOLAccs, UnifiedAccs } from "./types"

/** ---------- Common Interfaces ---------- */
export interface ILitError{
    message?: string,
    name?: string,
    errorCode?: string,
    error?: ILitErrorTypeParams,
}

export interface ILitErrorTypeParams{
    NAME: string,
    CODE: string,
}

/**
 * The only either possible error types
 */
 export const enum IEitherErrorType{
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

/**
 * A standardized way to return either error or success
 */
export interface IEither{
    type: 'ERROR' | 'SUCCESS',
    result: any | ILitError
}

/**
 * 
 * This method should be used when there's an expected error
 * 
 * @param { any } result 
 * @returns { IEither }
 */
export const ELeft = (result: any) : IEither => {
    return {
        type: IEitherErrorType.ERROR,
        result: result,
    }
}

/**
 * 
 * This method should be used when there's an expected success outcome
 * 
 * @param result 
 * @returns 
 */
export const ERight = (result: any) : IEither => {
    return {
        type: IEitherErrorType.SUCCESS,
        result: result,
    }
}

/** ---------- Access Control Conditions Interfaces ---------- */

export type AccessControlConditions = Array<AccsRegularParams | AccsDefaultParams>;

export type EvmContractConditions = Array<AccsEVMParams>;
export type SolRpcConditions = Array<AccsSOLV2Params>;
export type UnifiedAccessControlConditions = Array<AccsRegularParams | AccsDefaultParams | AccsSOLV2Params | AccsEVMParams | AccsCOSMOSParams>;

export interface AccsOperatorParams { 
    operator: string
}

export interface AccsRegularParams{
    conditionType?: string,
    returnValueTest: {
        key?: string,
        comparator: string,
        value: string
    },
    method?: string,
    params?: [],
    chain: string,
}

export interface AccsDefaultParams extends AccsRegularParams{
    contractAddress?: string,
    standardContractType?: string,
    parameters?: [],
}

export interface AccsSOLV2Params extends AccsRegularParams{
    pdaKey: string,
    pdaInterface: {
        offset: string,
        fields: string,
    }
    pdaParams: [],   
}

export interface ABIParams {
    name: string,
    type: string,
}

export interface FunctionABI { 
    name: string,
    type?: string,
    stateMutability: string,
    inputs: Array<ABIParams | any>,
    outputs: Array<ABIParams | any>,
    constant: string | boolean,
}

export interface AccsEVMParams extends AccsRegularParams{
    functionAbi: FunctionABI,
    contractAddress: string,
    functionName: string,
    functionParams: [],
}

export interface AccsCOSMOSParams extends AccsRegularParams{
    path: string,
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
export interface JsonAuthSig{
    sig: string,
    derivedVia: string,
    signedMessage: string,
    address: string,
    capabilities?: [],
    algo?: [],
}


export interface CheckAndSignAuthParams {

    // The chain you want to use.  Find the supported list of chains here: https://developer.litprotocol.com/docs/supportedChains
    chain: string,

    // Optional and only used with EVM chains.  A list of resources to be passed to Sign In with Ethereum.  These resources will be part of the Sign in with Ethereum signed message presented to the user.
    resources: any[],

    // ptional and only used with EVM chains right now.  Set to true by default.  Whether or not to ask Metamask or the user's wallet to switch chains before signing.  This may be desired if you're going to have the user send a txn on that chain.  On the other hand, if all you care about is the user's wallet signature, then you probably don't want to make them switch chains for no reason.  Pass false here to disable this chain switching behavior.
    switchChain: boolean,
}

/** ---------- Web3 ---------- */
export interface IProvider{
    provider: any,
    account: string,
}


/** ---------- Crypto ---------- */
export interface EncryptedString{
    symmetricKey: Uint8Array,
    encryptedString: Blob,
    encryptedData?: Blob
}

export interface EncryptedZip{
    symmetricKey: Uint8Array,
    encryptedZip: Blob
}

export interface ThreeKeys{

    // zipBlob is a zip file that contains an encrypted file and the metadata needed to decrypt it via the Lit network.
    zipBlob: any,
    
    // encryptedSymmetricKey is the symmetric key needed to decrypt the content, encrypted with the Lit network public key.  You may wish to store encryptedSymmetricKey in your own database to support quicker re-encryption operations when adding additional access control conditions in the future, but this is entirely optional, and this key is already stored inside the zipBlob.
    encryptedSymmetricKey: Uint8Array | any,
    
    // symmetricKey is the raw symmetric key used to encrypt the files.  DO NOT STORE IT.  It is provided in case you wish to create additional "OR" access control conditions for the same file.
    symmetricKey: Uint8Array
}

export interface DecryptZipFileWithMetadata{
    decryptedFile: Uint8Array,
    metadata: string,
}

export interface EncryptedFile{
    encryptedFile: Blob,
    symmetricKey: CryptoKey | Uint8Array,
}

export interface DecryptFileProps{
    file: Blob | File,
    symmetricKey: Uint8Array
}


export interface VerifyJWTProps{

    // A JWT signed by the LIT network using the BLS12-381 algorithm
    jwt: string
}

export interface IJWT{
    verified: boolean,
    header: object,
    payload: object,
    signature: Uint8Array
}

export interface HumanizedAccsProps{

    // The array of access control conditions that you want to humanize
    accessControlConditions: AccessControlConditions;

    // The array of evm contract conditions that you want to humanize
    evmContractConditions: EvmContractConditions,

    // The array of Solana RPC conditions that you want to humanize
    solRpcConditions: SolRpcConditions,

    // The array of unified access control conditions that you want to humanize
    unifiedAccessControlConditions: UnifiedAccessControlConditions;
    tokenList: Array<any | string>,
    myWalletAddress: string,
}

/** ---------- Key Value Type ---------- */
export interface KV{
    [key: string] : any
}

/** ---------- Lit Node Client ---------- */
export interface LitNodeClientConfig{
    alertWhenUnauthorized: boolean;
    minNodeCount: number;
    debug: boolean;
    bootstrapUrls: Array<string>;
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
export interface JsonExecutionRequest{

    // the authSig to use to authorize the user with the nodes
    authSig: JsonAuthSig,

    // An object that contains params to expose to the Lit Action.  These will be injected to the JS runtime before your code runs, so you can use any of these as normal variables in your Lit Action.
    jsParams: any,

    // JS code to run on the nodes
    code?: string,

    // The IPFS ID of some JS code to run on the nodes
    ipfsId?: string,
}

/**
 * Struct in rust
 * -----
pub struct JsonSignChainDataRequest {
    pub call_requests: Vec<web3::types::CallRequest>,
    pub chain: String,
    pub iat: u64,
    pub exp: u64,
}
*/
export interface JsonSignChainDataRequest{
    callRequests: Array<CallRequest>,
    chain: string,
    iat: number,
    exp: number,
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
export interface JsonSigningResourceId{
    baseUrl: string,
    path: string,
    orgId: string,
    role: string,
    extraData: string,
}

export interface JsonAccsRequest{

    // The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    accessControlConditions?: AccessControlConditions,

    // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    evmContractConditions?: EvmContractConditions,

    // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
    solRpcConditions?: SolRpcConditions,

    // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    unifiedAccessControlConditions?: UnifiedAccessControlConditions,

    // The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
    chain?: string,

    // The resourceId representing something on the web via a URL
    resourceId?: JsonSigningResourceId,

    // The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
    authSig: JsonAuthSig,
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
export interface JsonSigningRetrieveRequest extends JsonAccsRequest{
    iat: number,
    exp: number,
}


export interface JsonStoreSigningRequest extends JsonAccsRequest{

    // Whether or not the access control condition should be saved permanently.  If false, the access control conditions will be updateable by the creator.  If you don't pass this param, it's set to true by default.
    permanant?: number,
    permanent?: number,
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
export interface JsonSigningStoreRequest{
    key: string,
    val: string,
    chain?: string,
    permanant?: number,
    permanent?: number,
    authSig: JsonAuthSig,
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
export interface JsonEncryptionRetrieveRequest extends JsonAccsRequest{

    // The ciphertext that you wish to decrypt encoded as a hex string
    toDecrypt: string,
}

export interface ExecuteJsProps extends JsonExecutionRequest{
    
    // A boolean that defines if debug info will be returned or not.
    debug: boolean,
}

export type SupportedJsonRequests = JsonSigningRetrieveRequest | JsonEncryptionRetrieveRequest;

export interface JsonSaveEncryptionKeyRequest extends JsonStoreSigningRequest{

    // The symmetric encryption key that was used to encrypt the locked content inside the LIT as a Uint8Array.  You should use zipAndEncryptString or zipAndEncryptFiles to get this encryption key.  This key will be hashed and the hash will be sent to the LIT nodes.  You must pass either symmetricKey or encryptedSymmetricKey.
    symmetricKey: string | Uint8Array,

    // The encrypted symmetric key of the item you with to update.  You must pass either symmetricKey or encryptedSymmetricKey.
    encryptedSymmetricKey?: string | Uint8Array,
}

export interface SingConditionECDSA{
    accessControlConditions: any,
    evmContractConditions: undefined,
    solRpcConditions: undefined,
    auth_sig: JsonAuthSig,
    chain: string,
    iat: number,
    exp: number,
  }

/**
 * 
 * An object containing the resulting signatures.  Each signature comes with the public key and the data signed.
 * 
 */
export interface ExecuteJsResponse{
    signatures: any;
    decryptions: any[];
    response: string;
    logs: string;
    debug?: {
        allNodeResponses: NodeResponse[],
        allNodeLogs: NodeLog[],
        rawNodeHTTPResponses: any
    };
}

export interface LitNodePromise{

}

export interface SendNodeCommand{
    url: string,
    data: any,
}

export interface NodeShare{
    shareIndex: any,
    unsignedJwt: any,
    signedData: any,
    decryptedData: any,
    response: any,
    logs: any,
}

export interface SuccessNodePromises{
    success: boolean,
    values: Array<NodeShare>,
}

export interface RejectedNodePromises{
    success: boolean,
    error: any,
}

export interface NodePromiseResponse{
    status?: string,
    value?: any,
    reason?: any,
}

export interface NodeError{
    error: {
        errorCode: string,
    }
}

export interface SigShare{
    sigType: any;
    shareHex: any;
    shareIndex: any;
    localX: any;
    localY: any;
    publicKey: any;
    dataSigned: any;
}

export type SigShares = Array<SigShare>;

export interface SignedData{
    signedData: any,
}

export interface DecryptedData{
    decryptedData: any,
}

export interface NodeResponse{
    response: any,
}

export interface NodeLog{
    logs: any,
}

export interface CallRequest{

    // to - The address of the contract that will be queried
    to: string,

    // The address calling the function.
    from?: string,

    // Hex encoded data to send to the contract.
    data: string,
}

export interface SignedChainDataToken{

    // The call requests to make.  The responses will be signed and returned.
    callRequests: Array<CallRequest>,

    // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
    chain: string,
}

export type JsonRequest = JsonExecutionRequest | JsonSignChainDataRequest;

export interface NodeCommandResponse{
    url: string,
    data: JsonRequest,
}

export interface NodeCommandServerKeysResponse{
    serverPublicKey: any,
    subnetPublicKey: any,
    networkPublicKey: any,
    networkPublicKeySet: any,
}

export interface FormattedMultipleAccs {
    error: boolean,
    formattedAccessControlConditions: any,
    formattedEVMContractConditions: any,
    formattedSolRpcConditions: any,
    formattedUnifiedAccessControlConditions: any,
}

export interface SignWithECDSA{

    // TODO: The message to be signed - note this message is not currently converted to a digest!!!!!
    message: string,

    // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
    chain: string,

    iat: number,
    exp: number,
}

export interface ValidateAndSignECDSA{
    accessControlConditions: AccessControlConditions,
    chain: string,
    auth_sig: JsonAuthSig,
}

export interface HandshakeWithSgx{
    url: string,
}

export interface JsonHandshakeResponse{
    serverPubKey: string,
    subnetPubKey: string,
    networkPubKey: string,
    networkPubKeySet: string,
}