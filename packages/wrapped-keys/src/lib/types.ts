import {
  ILitNodeClient,
  LIT_NETWORKS_KEYS,
  SessionSigsMap,
} from '@lit-protocol/types';

/** @typedef Network
 * The network type that the wrapped key is for.
 * In case of 'evm' or 'solana', pre-written LIT actions will be used to perform operations
 * In case of 'custom', you will need to provide a LIT action source code or an IPFS CID where LIT action source code exists in order to perform the operation when you call API methods
 */
export type Network = 'evm' | 'solana' | 'custom';

/** All API calls for the wrapped keys service require these arguments.
 *
 * @typedef BaseApiParams
 * @property {SessionSigsMap} pkpSessionSigs - The PKP sessionSigs used to associate the PKP with the generated private key and authenticate with the wrapped keys backend service.
 * @property {ILitNodeClient} litNodeClient - The Lit Node Client used for executing the Lit Action and identifying which wrapped keys backend service to communicate with.
 */
export interface BaseApiParams {
  pkpSessionSigs: SessionSigsMap;
  litNodeClient: ILitNodeClient;
}

export interface ApiParamsSupportedNetworks {
  network: Extract<Network, 'evm' | 'solana'>;
}

export interface ApiParamsCustomIpfs extends BaseApiParams {
  network: Extract<Network, 'custom'>;
  litActionIpfsCid: string;
  params?: Record<string, unknown>;
}

export interface ApiParamsCustomCode extends BaseApiParams {
  network: Extract<Network, 'custom'>;
  litActionCode: string;
  params?: Record<string, unknown>;
}

/** Fetching a previously persisted key's metadata only requires valid pkpSessionSigs and a LIT Node Client instance configured for the appropriate network.
 *
 * @typedef GetEncryptedKeyMetadataParams
 * @extends BaseApiParams
 *
 */
export type GetEncryptedKeyMetadataParams = BaseApiParams;

/** Exporting a previously persisted key only requires valid pkpSessionSigs and a LIT Node Client instance configured for the appropriate network.
 *
 * @typedef ExportPrivateKeyParams
 * @extends BaseApiParams
 *
 */
export type ExportPrivateKeyParams = BaseApiParams;

/** Includes the decrypted private key and metadata that was stored alongside it in the wrapped keys service
 *
 * @typedef ExportPrivateKeyResult
 * @property { LIT_NETWORKS_KEYS } litNetwork The LIT network that the LIT Node Client was configured for when the key was persisted to the wrapped keys service
 * @property { string } decryptedPrivateKey The decrypted, plain text private key that was persisted to the wrapped keys service
 * @property { string } pkpAddress The LIT PKP Address that the key was linked to; this is derived from the provided pkpSessionSigs
 * @property { string } address The 'address' is typically based on the public key of the key being imported into the wrapped keys service
 * @property { string } keyType The algorithm type of the key; this might be K256, ed25519, or other key formats.  The `keyType` will be included in the metadata returned from the wrapped keys service
 *
 */
export interface ExportPrivateKeyResult {
  pkpAddress: string;
  decryptedPrivateKey: string;
  address: string;
  litNetwork: LIT_NETWORKS_KEYS;
  keyType: string;
}

type GeneratePrivateKeyParamsSupportedNetworks = BaseApiParams &
  ApiParamsSupportedNetworks;
type GeneratePrivateKeyParamsCustomIpfs = BaseApiParams & ApiParamsCustomIpfs;
type GeneratePrivateKeyParamsCustomCode = BaseApiParams & ApiParamsCustomCode;

/** @typedef GeneratePrivateKeyParams
 * @extends BaseApiParams
 * @property {Network} network The network for which the private key needs to be generated; keys are generated differently for different networks
 * @property {string} [litActionIpfsCid] The IPFS CID of the LIT Action to run which will be responsible for generating the key
 * @property {string} [litActionCode] A string of the raw source code of the LIT Action to run which will be responsible for generating the key
 * @property {object} [params] Additional parameters to be passed through to the LIT action that is performing the key generation
 */
export type GeneratePrivateKeyParams =
  | GeneratePrivateKeyParamsSupportedNetworks
  | GeneratePrivateKeyParamsCustomIpfs
  | GeneratePrivateKeyParamsCustomCode;

/** @typedef GeneratePrivateKeyResult
 * @property { string } pkpAddress The LIT PKP Address that the key was linked to; this is derived from the provided pkpSessionSigs
 * @property { string } generatedPublicKey The public key component of the newly generated keypair
 *
 */
export interface GeneratePrivateKeyResult {
  pkpAddress: string;
  generatedPublicKey: string;
}

/** @typedef ImportPrivateKeyParams
 * @extends BaseApiParams
 *
 * @property { string } privateKey The private key to be imported into the wrapped keys service
 * @property { string } address The 'address' is typically based on the public key of the key being imported into the wrapped keys service
 * @property { string } keyType The algorithm type of the key; this might be K256, ed25519, or other key formats.  The `keyType` will be included in the metadata returned from the wrapped keys service
 */
export interface ImportPrivateKeyParams extends BaseApiParams {
  privateKey: string;
  address: string;
  keyType: string;
}

interface SignMessageParams {
  messageToSign: string | Uint8Array;
}

type SignMessageWithEncryptedKeyParamsSupportedNetworks = BaseApiParams &
  ApiParamsSupportedNetworks &
  SignMessageParams;

type SignMessageWithEncryptedKeyParamsCustomIpfs = BaseApiParams &
  ApiParamsCustomIpfs &
  SignMessageParams;

type SignMessageWithEncryptedKeyParamsCustomCode = BaseApiParams &
  ApiParamsCustomCode &
  SignMessageParams;

/** @typedef SignMessageWithEncryptedKeyParams
 * @extends BaseApiParams
 *
 * @property { string | Uint8Array } messageToSign The message to be signed
 * @property {string} [litActionIpfsCid] The IPFS CID of the LIT Action to run which will be responsible for generating the key. Only relevant when using network is `custom`. You can only include this OR litActionCode.
 * @property {string} [litActionCode] A string of the raw source code of the LIT Action to run which will be responsible for generating the key. Only relevant when using `custom` network. You can only include this OR litActionIpfsCid.
 * @property {object} [params] Additional parameters to be passed through to the LIT action that is signing the provided message
 */
export type SignMessageWithEncryptedKeyParams =
  | SignMessageWithEncryptedKeyParamsSupportedNetworks
  | SignMessageWithEncryptedKeyParamsCustomIpfs
  | SignMessageWithEncryptedKeyParamsCustomCode;

interface BaseLitTransaction {
  chain: string;
}

/**  EthereumLitTransaction must be provided to the `SignTransaction` endpoint when `network` is `evm`.
 *
 * @typedef EthereumLitTransaction
 *
 * @property { string } toAddress The address the transaction is 'to'
 * @property { string } value The value of the transaction to be sent
 * @property { number } chainId The chain ID of the target chain that the transaction will be executed on
 * @property { string } [gasPrice] The exact gas price that you are willing to pay to execute the transaction
 * @property { string } [gasLimit] The maximum gas price that you are willing to pay to execute the transaction
 * @property { string } [dataHex] Data in hex format to be included in the transaction
 *
 */
export interface EthereumLitTransaction extends BaseLitTransaction {
  toAddress: string;
  value: string;
  chainId: number;
  gasPrice?: string;
  gasLimit?: number;
  dataHex?: string;
}

export interface SerializedTransaction extends BaseLitTransaction {
  serializedTransaction: string;
}

interface SignTransactionParams extends BaseApiParams {
  broadcast: boolean;
}

interface SignTransactionParamsSupportedEvm extends SignTransactionParams {
  unsignedTransaction: EthereumLitTransaction;
  network: Extract<Network, 'evm'>;
}

interface SignTransactionParamsSupportedSolana extends SignTransactionParams {
  unsignedTransaction: SerializedTransaction;
  network: Extract<Network, 'solana'>;
}

interface SignTransactionWithEncryptedKeyParamsCustomIpfs
  extends SignTransactionParams,
    ApiParamsCustomIpfs {
  unsignedTransaction: SerializedTransaction;
}

interface SignTransactionWithEncryptedKeyParamsCustomCode
  extends SignTransactionParams,
    ApiParamsCustomCode {
  unsignedTransaction: SerializedTransaction;
}

/** @typedef SignTransactionWithEncryptedKeyParams
 * @extends BaseApiParams
 * @property { boolean } broadcast Whether the LIT action should broadcast the signed transaction to RPC, or only sign the transaction and return the signed transaction to the caller
 * @property { EthereumLitTransaction | SerializedTransaction } unsignedTransaction The unsigned transaction to be signed. When network is 'solana' or 'custom', be sure to provided a {@link SerializedTransaction} instance.
 * @property {string} [litActionIpfsCid] The IPFS CID of the LIT Action to run which will be responsible for generating the key. Only relevant when using network is `custom`. You can only include this OR litActionCode.
 * @property {string} [litActionCode] A string of the raw source code of the LIT Action to run which will be responsible for generating the key. Only relevant when using `custom` network. You can only include this OR litActionIpfsCid.
 * @property {object} [params] Additional parameters to be passed through to the LIT action that is signing the provided transaction
 *
 */
export type SignTransactionWithEncryptedKeyParams =
  | SignTransactionParamsSupportedEvm
  | SignTransactionParamsSupportedSolana
  | SignTransactionWithEncryptedKeyParamsCustomIpfs
  | SignTransactionWithEncryptedKeyParamsCustomCode;
