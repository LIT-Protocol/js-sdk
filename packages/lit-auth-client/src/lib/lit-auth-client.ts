import {
  EthWalletProviderOptions,
  IRelay,
  LitAuthClientOptions,
  OAuthProviderOptions,
  ProviderOptions,
} from '@lit-protocol/types';
import { ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitRelay } from './relay';
import { BaseProvider } from './providers/BaseProvider';
import GoogleProvider from './providers/GoogleProvider';
import DiscordProvider from './providers/DiscordProvider';
import EthWalletProvider from './providers/EthWalletProvider';
import WebAuthnProvider from './providers/WebAuthnProvider';

export type Providers = {
  [ProviderType.Discord]: DiscordProvider;
  [ProviderType.Google]: GoogleProvider;
  [ProviderType.EthWallet]: EthWalletProvider;
  [ProviderType.WebAuthn]: WebAuthnProvider;
};

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
  private providers: Map<ProviderType, BaseProvider>;

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
   * Initialize a provider
   *
   * @param {T} type - Type of provider to initialize
   * @param {ProviderOptions} [options] - Options for the provider
   *
   * @returns {BaseProvider} - Provider
   */
  public initProvider<T extends ProviderType>(
    type: T,
    options?: ProviderOptions
  ): Providers[T] {
    const baseParams = {
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    };

    let provider: Providers[T];

    switch (type) {
      case ProviderType.Google:
        provider = new GoogleProvider({
          ...baseParams,
          ...(options as OAuthProviderOptions),
        }) as Providers[T];
        break;
      case ProviderType.Discord:
        provider = new DiscordProvider({
          ...baseParams,
          ...(options as OAuthProviderOptions),
        }) as Providers[T];
        break;
      case ProviderType.EthWallet:
        provider = new EthWalletProvider({
          ...baseParams,
          ...(options as EthWalletProviderOptions),
        }) as Providers[T];
        break;
      case ProviderType.WebAuthn:
        provider = new WebAuthnProvider({
          ...baseParams,
        }) as Providers[T];
        break;
      default:
        throw new Error(
          "Invalid provider type provided. Only 'google', 'discord', 'ethereum', and 'webauthn' are supported at the moment."
        );
    }

    this.providers.set(type, provider);
    return provider;
  }

  /**
   * Returns an initialized provider by type
   *
   * @param {ProviderType} type - Type of provider to get
   *
   * @returns {BaseProvider | undefined} - Provider if found, undefined otherwise
   */
  getProvider(type: ProviderType): BaseProvider | undefined {
    return this.providers.get(type);
  }
}
