import {
  IRelay,
  InitEthereumAccountProviderOptions,
  InitOAuthProviderOptions,
  LitAuthClientOptions,
  ProviderOptions,
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
   * Initialize a provider
   *
   * @param {ProviderOptions} params
   *
   * @returns {BaseProvider} - Provider
   */
  initProvider<T extends ProviderOptions>(params: T): BaseProvider {
    const baseParams = {
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    };

    let provider: BaseProvider;

    switch (params.type) {
      case 'google':
        provider = new GoogleProvider({ ...baseParams, ...params });
        break;
      case 'discord':
        provider = new DiscordProvider({ ...baseParams, ...params });
        break;
      case 'ethereum':
        provider = new EthereumAccountProvider({ ...baseParams, ...params });
        break;
      case 'webauthn':
        provider = new WebAuthnProvider({ ...baseParams, ...params });
        break;
      default:
        throw new Error(
          "Invalid provider type provided. Only 'google', 'discord', 'ethereum', and 'webauthn' are supported at the moment."
        );
    }

    this.providers.set(params.type, provider);
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
