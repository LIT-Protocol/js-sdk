import {
  AuthenticationContext,
  CapacityCreditsReq,
  CapacityCreditsRes,
  ClaimKeyResponse,
  DecryptRequest,
  DecryptResponse,
  EncryptResponse,
  EncryptSdkParams,
  ExecuteJsResponse,
  JsonExecutionSdkParams,
  JsonHandshakeResponse,
  JsonPkpSignSdkParams,
  LitNodeClientConfig,
  SigResponse,
} from './interfaces';

import { PRODUCT_IDS } from '@lit-protocol/constants';
import { ClaimProcessor, ClaimRequest } from './types';

export interface ILitNodeClient {
  config: LitNodeClientConfig;
  connectedNodes: Set<string>;
  serverKeys: Record<string, JsonHandshakeResponse>;
  ready: boolean;
  subnetPubKey: string | null;
  networkPubKey: string | null;
  networkPubKeySet: string | null;
  latestBlockhash: string | null;

  // ========== Core ==========
  /**
   * Connect to the LIT nodes
   * @returns { Promise } A promise that resolves when the nodes are connected.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect(): Promise<any>;

  // ========== Helpers ==========
  /**
   * Set the default max price for a specific product
   * @param product - The product type to set the max price for
   * @param price - The max price to set
   */
  setDefaultMaxPrice(product: keyof typeof PRODUCT_IDS, price: bigint): void;

  /**
   * Get PKP authentication context
   * @param params - Authentication context parameters
   * @returns Authentication context with PKP-specific configuration
   */
  getPkpAuthContext(params: AuthenticationContext): AuthenticationContext;

  /**
   * Get maximum prices for node products
   * @param params - Parameters including user max price and product type
   */
  getMaxPricesForNodeProduct(params: {
    userMaxPrice?: bigint;
    product: keyof typeof PRODUCT_IDS;
  }): { url: string; price: bigint }[];

  /**
   * Create capacity delegation authentication signature
   * @param params - Capacity credits request parameters
   */
  createCapacityDelegationAuthSig(
    params: CapacityCreditsReq
  ): Promise<CapacityCreditsRes>;

  /**
   * Encrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  encrypt(params: EncryptSdkParams): Promise<EncryptResponse>;

  // ========== ENDPOINTS ==========

  /**
   * Sign using PKP
   * @param params - PKP signing parameters
   */
  pkpSign(params: JsonPkpSignSdkParams): Promise<SigResponse>;

  /**
   * Execute JS on the nodes and combine and return any resulting signatures
   * @param { ExecuteJsRequest } params
   * @returns { ExecuteJsResponse }
   */
  executeJs(
    params: JsonExecutionSdkParams
  ): Promise<ExecuteJsResponse | undefined>;

  /**
   * Decrypt data with Lit identity-based Timelock Encryption.
   * @param params
   */
  decrypt(params: DecryptRequest): Promise<DecryptResponse>;

  /**
   * Claim a key ID using authentication method
   * @param params - Claim request parameters
   */
  claimKeyId(params: ClaimRequest<ClaimProcessor>): Promise<ClaimKeyResponse>;
}
