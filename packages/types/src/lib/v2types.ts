import {
  LIT_ENDPOINT_VERSION,
  PRODUCT_ID_VALUES,
} from '@lit-protocol/constants';

export interface MaxPricesForNodes {
  nodePrices: { url: string; prices: bigint[] }[];
  userMaxPrice: bigint;
  productId: PRODUCT_ID_VALUES;
  numRequiredNodes?: number;
}

/**
 * Interface for a single request item to be sent to a Lit Protocol node.
 * This structure should match the objects within the '_request' array in createLitClient.ts.
 */
export interface RequestItem<T> {
  fullPath: string; // The full URL endpoint of the node
  data: T; // The payload for the request
  requestId: string; // Identifier for this specific request/batch
  epoch: number; // The current epoch number
  version: string; // The version of the Lit Protocol client/network
}

// Definition for a single endpoint
export type EndpointDefinition = {
  path: string;
  version: (typeof LIT_ENDPOINT_VERSION)[keyof typeof LIT_ENDPOINT_VERSION];
};

// Collection of known endpoints
export type EndPoint = {
  HANDSHAKE: EndpointDefinition;
  SIGN_SESSION_KEY: EndpointDefinition;
  EXECUTE_JS: EndpointDefinition;
  PKP_SIGN: EndpointDefinition;
  PKP_CLAIM: EndpointDefinition;
  ENCRYPTION_SIGN: EndpointDefinition;
};

/**
 * @deprecateed - TODO: we need to move this into the network module, as this might be different for each network
 */
export type CallbackParams = {
  bootstrapUrls: string[];
  currentEpoch: number;
  version: string;
  requiredAttestation: boolean;
  minimumThreshold: number;
  abortTimeout: number;
  endpoints: EndPoint;
  releaseVerificationConfig?: any;
  networkModule: any;
};

// Helper type to ensure only one property exists
type ExactlyOne<T> = {
  [K in keyof T]: Record<K, T[K]> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

// Raw input type that ensures only one identifier is provided
export type PkpIdentifierRaw = ExactlyOne<{
  tokenId: string | number | bigint;
  address: string;
  pubkey: string;
}>;

export type RawHandshakeNagaResponse = {
  serverPublicKey: string;
  subnetPublicKey: string;
  networkPublicKey: string;
  networkPublicKeySet: string;
  clientSdkVersion: string;
  hdRootPubkeys: string[];
  attestation?: any; // ❗️ Attestation data if provided by node. <network>-dev version will be null.
  latestBlockhash: string;
  nodeVersion: string;
  epoch: number;

  // only in Naga
  nodeIdentityKey: string;
};

export interface ResolvedHandshakeNagaResponse {
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
  hdRootPubkeys: string[];
  latestBlockhash: string;
  // lastBlockHashRetrieved: number;
}

export type OrchestrateHandshakeResponse = {
  serverKeys: Record<string, RawHandshakeNagaResponse>;
  connectedNodes: Set<string>;
  coreNodeConfig: ResolvedHandshakeNagaResponse | null;
  threshold: number;
};

// export type RawHandshakeDatilResponse = {
//   serverPublicKey: string;
//   subnetPublicKey: string;
//   networkPublicKey: string;
//   networkPublicKeySet: string;
//   clientSdkVersion: string;
//   hdRootPubkeys: string[];
//   attestation?: any; // ❗️ Attestation data if provided by node. <network>-dev version will be null.
//   latestBlockhash: string;
//   nodeVersion: string;
//   epoch: number;

//   // only in Naga
//   nodeIdentityKey: string;
// };

export type KeySet = Record<
  string,
  { publicKey: Uint8Array; secretKey: Uint8Array }
>;

// aka. Network Prices
export type NodePrices = {
  url: string;
  prices: bigint[];
}[];

export type NagaJitContext = {
  keySet: KeySet;
  nodePrices: NodePrices;
};
