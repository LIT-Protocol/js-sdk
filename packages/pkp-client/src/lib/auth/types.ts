import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { GetSessionSigsProps } from '@lit-protocol/types';

export interface AuthOptions {
  /**
   * Your application's domain
   */
  domain: string;
  /**
   * The redirect URI that Lit's auth server should send the user back to
   */
  redirectUri: string;
  /**
   * Client to connect to Lit nodes
   *
   * Learn more about initializing LitNodeClient [here](https://serrano-sdk-docs.litprotocol.com/)
   */
  litNodeClient: LitNodeClient;
  /**
   * Configure the relay server to facilitate and subsidize minting of PKPs
   *
   * Learn more about the relay server [here](https://github.com/LIT-Protocol/relay-server)
   */
  relayConfig: RelayerConfig;
}

export interface RelayerConfig {
  /**
   * URL for relay server
   */
  relayUrl?: string;
  /**
   * API key for relay server (required when using Lit's relay server)
   */
  relayApiKey?: string;
}

export interface AuthInfo {
  /**
   * Authentication provider used
   */
  provider?: string;
  /**
   * Access token
   */
  accessToken?: string;
  /**
   * ID token
   */
  idToken?: string;
  /**
   * Wallet signature
   */
  authSig?: AuthSig;
}

export interface AuthState {
  /**
   * Authenticated user's credentials
   */
  authInfo: AuthInfo;
  /**
   * Public key of the PKP currently being used for signing
   */
  pkpPublicKey: string | null;
  /**
   * Session signatures for the current PKP
   */
  sessionSigs: SessionSigs;
  /**
   * When session signatures expire
   */
  sessionExpiration: string | null;
}

export interface AuthSig {
  /**
   * The actual hex-encoded signature
   */
  sig: string;
  /**
   * The method used to derive the signature. Typically "web3.eth.personal.sign"
   */
  derivedVia: string;
  /**
   * The message that was signed
   */
  signedMessage: string;
  /**
   * The crypto wallet address that signed the message
   */
  address: string;
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
   * Error codes from Lit's auth server
   */
  error: string | null;
}

export interface HandleSignInRedirectParams {
  /**
   * Parameters for creating session signatures
   */
  sessionParams: GetSessionSigsProps;
  /**
   * Public key of PKP to use for creating session signatures
   */
  pkpPublicKey?: string;
}

export interface SignOutOptions {
  /**
   * Url to redirect to after logout
   */
  redirectTo?: string;
}

export interface DiscordAuthParams {
  /**
   * Discord access token
   */
  accessToken: string | null;
  /**
   * Parameters for creating session signatures
   */
  sessionParams: GetSessionSigsProps;
  /**
   * Public key of PKP to use for creating session signatures
   */
  pkpPublicKey?: string;
}

export interface GoogleAuthParams {
  /**
   * Google ID token
   */
  idToken: string | null;
  /**
   * Parameters for creating session signatures
   */
  sessionParams: GetSessionSigsProps;
  /**
   * Public key of PKP to use for creating session signatures
   */
  pkpPublicKey?: string;
}

export interface WalletAuthParams {
  /**
   * Parameters for creating session signatures
   *
   * Options described in more depth in these [docs](https://serrano-sdk-docs.litprotocol.com/)
   */
  sessionParams: GetSessionSigsProps;
  /**
   * Signature from Eth wallet
   */
  authSig?: AuthSig | null;
  /**
   * Public key of PKP to use for creating session signatures
   */
  pkpPublicKey?: string;
}

export interface AuthNeededCallbackParams {
  /**
   * Chain to use
   */
  chainId: number;
  /**
   * Resources that will be signed with session key
   */
  resources: string[];
  /**
   * Expiration date for when sigs will expire
   */
  expiration: string;
  /**
   * Session key to sign
   */
  uri: string;
  /**
   * Client to connect to Lit nodes
   *
   * Learn more about initializing LitNodeClient [here](https://serrano-sdk-docs.litprotocol.com/)
   */
  litNodeClient: LitNodeClient;
}

export interface PKP {
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

export enum AuthMethodType {
  EthWallet = 1,
  LitAction,
  WebAuthn,
  Discord,
  Google,
  GoogleJwt,
}

export interface AuthMethod {
  /**
   * Auth method enum as defined in the Lit [contracts](https://github.com/LIT-Protocol/LitNodeContracts/blob/main/contracts/PKPPermissions.sol#L25)
   */
  authMethodType: AuthMethodType;
  /**
   * Auth method credential
   */
  accessToken: string;
}

export interface SessionSigs {
  /**
   * Map of Lit node urls to session signatures
   */
  [key: string]: SessionSig;
}

export interface SessionSig {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
  algo: string;
}

export interface RelayMintResponse {
  /**
   * Transaction hash of PKP being minted
   */
  requestId?: string;
  /**
   * Error from relay server
   */
  error?: string;
}

export interface RelayFetchResponse {
  /**
   * Fetched PKPs
   */
  pkps?: PKP[];
  /**
   * Error from relay server
   */
  error?: string;
}

export interface RelayPollingEvent {
  /**
   * Polling count
   */
  pollCount: number;
  /**
   * Transaction hash of PKP being minted
   */
  requestId: string;
}

export interface RelayPollStatusResponse {
  /**
   * Polling status
   */
  status?: AuthStatus;
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

export interface FetchPKPByAuthMethodParams {
  /**
   * Auth method enum as defined in the Lit [contracts](https://github.com/LIT-Protocol/LitNodeContracts/blob/main/contracts/PKPPermissions.sol#L25)
   */
  authMethodType: AuthMethodType;
  /**
   * Access token
   */
  accessToken?: string;
  /**
   * ID token
   */
  idToken?: string;
  /**
   * Wallet signature
   */
  authSig?: AuthSig;
}

export enum AuthStatus {
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
}

export enum AUTH_CLIENT_EVENTS {
  MINTING = 'relayer_minting',
  POLLING = 'relayer_polling',
  MINTED = 'relayer_minted',
  HANDLING_REDIRECT = 'handling_redirect',
  CREATING_SESSION = 'creating_session',
  SESSION_CREATED = 'session_created',
  SIGNED_OUT = 'signed_out',
  ERROR = 'error',
}
