import { nagaLocal } from '@lit-protocol/networks';
import type {
  ConnectionInfo,
  PKPStorageProvider,
} from '@lit-protocol/networks';
import {
  ExecuteJsResponse,
  AuthSig,
  LitNodeSignature,
  EncryptSdkParams,
  EncryptResponse,
  DecryptRequest,
  DecryptResponse,
  PkpIdentifierRaw,
  OrchestrateHandshakeResponse,
} from '@lit-protocol/types';
import { z } from 'zod';
import { MintWithCustomAuthRequest } from '../schemas/MintWithCustomAuthSchema';
import { BaseLitClient } from './BaseClient.type';
import {
  AuthContextSchema2,
  AuthData,
  HexPrefixedSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
} from '@lit-protocol/schemas';
import { Chain, Hex } from 'viem';

type GetMaxPricesForNodeProductFn =
  typeof import('@lit-protocol/networks')['getMaxPricesForNodeProduct'];
type GetUserMaxPriceFn =
  typeof import('@lit-protocol/networks')['getUserMaxPrice'];

type RawPkpSignInput = z.infer<typeof nagaLocal.api.pkpSign.schemas.Input.raw>;

type EthereumPkpSignInput = Omit<
  z.input<typeof nagaLocal.api.pkpSign.schemas.Input.ethereum>,
  'chain' | 'signingScheme'
> & {
  chain?: never;
  signingScheme?: never;
};

type BitcoinPkpSignInput = Omit<
  z.input<typeof nagaLocal.api.pkpSign.schemas.Input.bitcoin>,
  'chain'
> & {
  chain?: never;
};

export interface NagaLitClientContext {
  latestBlockhash: string;
  latestConnectionInfo: ConnectionInfo | null;
  handshakeResult: OrchestrateHandshakeResponse | null;
  getMaxPricesForNodeProduct: GetMaxPricesForNodeProductFn;
  getUserMaxPrice: GetUserMaxPriceFn;
  signSessionKey: (params: {
    nodeUrls: string[];
    requestBody: z.infer<typeof JsonSignSessionKeyRequestForPkpReturnSchema>;
  }) => Promise<AuthSig>;
  signCustomSessionKey: (params: {
    nodeUrls: string[];
    requestBody: z.infer<
      typeof JsonSignCustomSessionKeyRequestForPkpReturnSchema
    >;
  }) => Promise<AuthSig>;
  executeJs: (
    params: z.infer<typeof nagaLocal.api.executeJs.schemas.Input>
  ) => Promise<ExecuteJsResponse>;
}

/**
 * Naga network client with full PKP signing capabilities
 */
export interface NagaLitClient extends BaseLitClient<NagaLitClientContext> {
  /**
   * Encrypts data with access control conditions using BLS encryption
   * @param params - Encryption parameters including data and access control conditions
   * @returns Promise resolving to encrypted data with ciphertext and hash
   * @example
   * ```typescript
   * const encryptedData = await litClient.encrypt({
   *   dataToEncrypt: "sensitive data",
   *   accessControlConditions: [
   *     {
   *       contractAddress: '',
   *       standardContractType: '',
   *       chain: 'ethereum',
   *       method: 'eth_getBalance',
   *       parameters: [':userAddress', 'latest'],
   *       returnValueTest: {
   *         comparator: '>=',
   *         value: '1000000000000000000'
   *       }
   *     }
   *   ]
   * });
   * ```
   */
  encrypt: (params: EncryptSdkParams) => Promise<EncryptResponse>;

  /**
   * Decrypts data encrypted with access control conditions
   * @param params - Decryption parameters including ciphertext and access control conditions
   * @returns Promise resolving to decrypted data
   * @example
   * ```typescript
   * const decryptedData = await litClient.decrypt({
   *   ciphertext: "encrypted_data_here",
   *   dataToEncryptHash: "hash_here",
   *   accessControlConditions: [...],
   *   authContext: { ... }
   * });
   * ```
   */
  decrypt: (params: DecryptRequest) => Promise<DecryptResponse>;

  /**
   * Gets the current client context including handshake results and connection info
   * @returns Promise resolving to the current client context
   */
  getContext: () => Promise<NagaLitClientContext>;

  /**
   * Gets chain configuration including Viem config and RPC URL
   * @returns Chain configuration object with Viem config and RPC URL
   */
  getChainConfig: () => {
    viemConfig: Chain;
    rpcUrl: string;
  };

  /**
   * Default service URLs for authentication and login
   */
  getDefault: {
    authServiceUrl?: string;
    loginUrl: string;
  };

  /**
   * Disconnects the client and stops the state manager
   */
  disconnect: () => void;

  /**
   * Mints a PKP using an Externally Owned Account (EOA)
   * @param params - Minting parameters for EOA-based PKP creation
   * @returns Promise resolving to the minted PKP data
   */
  mintWithEoa: (params: any) => Promise<any>;

  /**
   * Mints a PKP using authentication
   * @param params - Authentication minting parameters
   * @returns Promise resolving to the minted PKP data
   */
  mintWithAuth: (params: any) => Promise<any>;

  /**
   * Mints a PKP using custom authentication including Lit Actions
   * @param params - Custom authentication parameters including validation code or IPFS CID
   * @returns Promise resolving to PKP data and validation IPFS CID
   * @example
   * ```typescript
   * const pkp = await litClient.mintWithCustomAuth({
   *   account: viemAccount,
   *   authData: {
   *     authMethodType: 1,
   *     authMethodId: 'your_auth_method_id'
   *   },
   *   validationIpfsCid: 'QmYourLitActionCID',
   *   scope: 1,
   *   addPkpEthAddressAsPermittedAddress: true,
   *   sendPkpToItself: true
   * });
   * ```
   */
  mintWithCustomAuth: (params: MintWithCustomAuthRequest) => Promise<{
    validationIpfsCid: string;
    pkpData: any;
  }>;

  /**
   * Gets a PKP permissions manager instance for managing PKP permissions
   * @param params - Parameters including PKP identifier and account
   * @returns Promise resolving to PKP permissions manager
   */
  getPKPPermissionsManager: (params: any) => Promise<any>;

  /**
   * Gets a payment manager instance for managing Ledger contract payments
   * @param params - Configuration parameters
   * @param params.account - The account to use for transactions
   * @returns Promise resolving to payment manager instance for deposits, withdrawals, and balance queries
   * @example
   * ```typescript
   * const paymentManager = await litClient.getPaymentManager({ account: myAccount });
   *
   * // Deposit funds
   * await paymentManager.deposit({ amountInEth: "0.1" });
   *
   * // Check balance
   * const balance = await paymentManager.getBalance({ userAddress: "0x..." });
   *
   * // Request withdrawal
   * await paymentManager.requestWithdraw({ amountInEth: "0.05" });
   * ```
   */
  getPaymentManager: (params: { account: any }) => Promise<any>;

  /**
   * Views permissions associated with a PKP
   * @param pkpIdentifier - The PKP identifier (public key or token ID)
   * @returns Promise resolving to PKP permissions including actions, addresses, and auth methods
   * @example
   * ```typescript
   * const permissions = await litClient.viewPKPPermissions('0x...');
   * console.log(permissions.actions, permissions.addresses, permissions.authMethods);
   * ```
   */
  viewPKPPermissions: (pkpIdentifier: PkpIdentifierRaw) => Promise<{
    actions: readonly `0x${string}`[];
    addresses: readonly `0x${string}`[];
    authMethods: readonly any[];
  }>;

  /**
   * Views PKPs associated with specific authentication data
   * @param params - Parameters including auth data and optional pagination
   * @returns Promise resolving to list of PKPs associated with the auth data
   * @example
   * ```typescript
   * const pkps = await litClient.viewPKPsByAuthData({
   *   authData: {
   *     authMethodType: 1,
   *     authMethodId: 'google_oauth_user_id'
   *   },
   *   pagination: { limit: 10, offset: 0 }
   * });
   * ```
   */
  viewPKPsByAuthData: (params: {
    authData: Partial<AuthData>;
    pagination?: { limit?: number; offset?: number };
    storageProvider?: PKPStorageProvider;
  }) => Promise<any>;

  /**
   * Views PKPs owned by a specific address
   * @param params - Parameters including owner address and optional pagination
   * @returns Promise resolving to list of PKPs owned by the address
   * @example
   * ```typescript
   * const pkps = await litClient.viewPKPsByAddress({
   *   ownerAddress: '0x...',
   *   pagination: { limit: 10, offset: 0 }
   * });
   * ```
   */
  viewPKPsByAddress: (params: {
    ownerAddress: string;
    pagination?: { limit?: number; offset?: number };
    storageProvider?: PKPStorageProvider;
  }) => Promise<any>;

  /**
   * Authentication service methods for PKP operations
   */
  authService: {
    /**
     * Mints a PKP using the authentication service
     * @param params - Authentication service minting parameters
     * @returns Promise resolving to PKP minting result
     */
    mintWithAuth: (params: any) => Promise<any>;
    /**
     * Registers a payer via the authentication service
     */
    registerPayer: (params: any) => Promise<any>;
    /**
     * Delegates users via the authentication service
     */
    delegateUsers: (params: any) => Promise<any>;
  };

  /**
   * Executes JavaScript/Lit Actions on the Lit network
   * @param params - Execution parameters including code or IPFS ID and context
   * @returns Promise resolving to execution response
   * @example
   * ```typescript
   * const result = await litClient.executeJs({
   *   code: `
   *     const go = async () => {
   *       const message = "Hello from Lit Action!";
   *       Lit.Actions.setResponse({ response: message });
   *     };
   *     go();
   *   `,
   *   authContext: { ... },
   *   jsParams: { customParam: "value" }
   * });
   * ```
   */
  executeJs: (
    params: z.infer<typeof nagaLocal.api.executeJs.schemas.Input>
  ) => Promise<ExecuteJsResponse>;

  /**
   * Creates a Viem account instance that can sign transactions using a PKP
   * @param params - Parameters including PKP public key, auth context, and chain config
   * @returns Promise resolving to a Viem account instance
   * @example
   * ```typescript
   * const pkpAccount = await litClient.getPkpViemAccount({
   *   pkpPublicKey: '0x...',
   *   authContext: { ... },
   *   chainConfig: mainnet // from viem/chains
   * });
   *
   * // Use with viem client
   * const txHash = await viemClient.sendTransaction({
   *   account: pkpAccount,
   *   to: '0x...',
   *   value: parseEther('0.1')
   * });
   * ```
   */
  getPkpViemAccount: (params: {
    pkpPublicKey: string | Hex;
    authContext: AuthContextSchema2;
    chainConfig: Chain;
  }) => Promise<any>;

  /**
   * Chain-specific signing methods for different blockchain networks
   */
  chain: {
    /**
     * Raw PKP signing interface that allows direct access to the underlying signing mechanism.
     * This provides the most flexible way to sign data as it accepts any valid signing scheme and chain combination.
     */
    raw: {
      /**
       * Raw PKP signing with complete control over parameters
       * @param params - The raw signing parameters
       * @returns A promise that resolves to the signature result
       * @example
       * ```typescript
       * const signature = await litClient.chain.raw.pkpSign({
       *   chain: 'ethereum',
       *   signingScheme: 'EcdsaK256Sha256',
       *   pubKey: '0x...',
       *   toSign: '0x...',
       *   authContext: { ... }
       * });
       * ```
       */
      pkpSign: (params: RawPkpSignInput) => Promise<LitNodeSignature>;
    };
    /**
     * Ethereum-specific PKP signing methods
     */
    ethereum: {
      /**
       * Sign data using Ethereum's ECDSA signing scheme
       * @param params - Ethereum signing parameters
       * @example
       * ```typescript
       * const signature = await litClient.chain.ethereum.pkpSign({
       *   pubKey: '0x...',
       *   toSign: messageHash,
       *   authContext: { ... }
       * });
       * ```
       */
      pkpSign: (params: EthereumPkpSignInput) => Promise<LitNodeSignature>;
    };
    /**
     * Bitcoin-specific PKP signing methods
     */
    bitcoin: {
      /**
       * Sign data using Bitcoin's signing scheme
       * @param params - Bitcoin signing parameters
       * @example
       * ```typescript
       * const signature = await litClient.chain.bitcoin.pkpSign({
       *   pubKey: '0x...',
       *   toSign: transactionHash,
       *   authContext: { ... }
       * });
       * ```
       */
      pkpSign: (params: BitcoinPkpSignInput) => Promise<LitNodeSignature>;
    };
  };
}
