import {
  IRelay,
  InitEthereumAccountProviderOptions,
  InitOAuthProviderOptions,
  LitAuthClientOptions,
} from '@lit-protocol/types';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitRelay } from './relay';
import { BaseProvider } from './providers/BaseProvider';
import GoogleProvider from './providers/GoogleProvider';
import DiscordProvider from './providers/DiscordProvider';
import EthereumAccountProvider from './providers/EthereumAccountProvider';
import WebAuthnProvider from './providers/WebAuthnProvider';

/**
 * Class that handles authentication through Lit login
 */
export class LitAuthClient {
  /**
   * The redirect URI that Lit's auth server should send the user back to
   */
  public rpcUrl: string;
  /**
   * Relay server to subsidize minting of PKPs
   */
  public relay: IRelay;
  /**
   * Client to connect to Lit nodes
   */
  public litNodeClient: LitNodeClient;
  /**
   * Map of providers
   */
  private providers: Map<string, BaseProvider>;

  /**
   * Create a LitAuthClient instance
   *
   * @param {LitAuthClientOptions} options
   * @param {string} [options.rpcUrl] - Endpoint to interact with a blockchain network
   * @param {LitRelayConfig} [options.litRelayConfig] - Options for Lit's relay server
   * @param {IRelay} [options.customRelay] - Custom relay server to subsidize minting of PKPs
   * @param {LitNodeClient} [options.litNodeClient] - Client to connect to Lit nodes
   */
  constructor(options?: LitAuthClientOptions) {
    this.providers = new Map();

    // Check if custom relay object is provided
    if (options?.customRelay) {
      this.relay = options?.customRelay;
    } else {
      // Check if configuration options for Lit Relay are provided
      if (options?.litRelayConfig?.relayApiKey) {
        this.relay = new LitRelay(options.litRelayConfig);
      } else {
        throw new Error(
          'An API key is required to use the default Lit Relay server. Please provide either an API key or a custom relay server.'
        );
      }
    }

    // Check if Lit node client is provided
    if (
      options?.litNodeClient &&
      options.litNodeClient instanceof LitNodeClient
    ) {
      this.litNodeClient = options?.litNodeClient;
    } else {
      this.litNodeClient = new LitNodeClient({
        litNetwork: 'serrano',
        debug: false,
      });
    }

    // Set RPC URL
    this.rpcUrl = options?.rpcUrl || 'https://chain-rpc.litprotocol.com/http';
  }

  /**
   * Initialize a Google OAuth provider
   *
   * @param {InitOAuthProviderOptions} params
   * @param {string} params.redirectUri - Redirect URI that Lit's login server should send the user back to
   *
   * @returns {GoogleProvider} - Google OAuth provider
   */
  initGoogleProvider(params: InitOAuthProviderOptions): GoogleProvider {
    const provider = new GoogleProvider({
      ...params,
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    });
    this.providers.set('google', provider);
    return provider;
  }

  /**
   * Initialize a Discord OAuth provider
   *
   * @param {InitOAuthProviderOptions} params
   * @param {string} params.redirectUri - Redirect URI that Lit's login server should send the user back to
   *
   * @returns {DiscordProvider} - Discord OAuth provider
   */
  initDiscordProvider(params: InitOAuthProviderOptions): DiscordProvider {
    const provider = new DiscordProvider({
      ...params,
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    });
    this.providers.set('discord', provider);
    return provider;
  }

  /**
   * Initialize an Ethereum account provider
   *
   * @param {InitEthereumAccountProviderOptions} params - Options for initializing the provider
   * @param {string} params.address - Ethereum address of the account
   * @param {Function} params.signMessage - Function that signs a message
   * @param {string} [params.domain] - The domain from which the signing request is made
   * @param {string} [params.origin] - The origin from which the signing request is made
   *
   * @returns {EthereumAccountProvider} - Ethereum account provider
   */
  initEthereumAccountProvider(
    params: InitEthereumAccountProviderOptions
  ): EthereumAccountProvider {
    const provider = new EthereumAccountProvider({
      ...params,
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    });
    this.providers.set('ethereum', provider);
    return provider;
  }

  /**
   * Initialize a WebAuthn provider
   *
   * @returns {WebAuthnProvider} - WebAuthn provider
   */
  initWebAuthnProvider(): WebAuthnProvider {
    const provider = new WebAuthnProvider({
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    });
    this.providers.set('webauthn', provider);
    return provider;
  }

  /**
   * Returns an initialized provider by name
   *
   * @param name {string} - Name of the provider
   *
   * @returns {BaseProvider | undefined} - Provider if found, undefined otherwise
   */
  getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }
}
