import {
  EthWalletProviderOptions,
  IRelay,
  LitAuthClientOptions,
  OAuthProviderOptions,
  StytchOtpProviderOptions,
  ProviderOptions,
  SignInWithOTPParams,
  OtpProviderOptions
} from '@lit-protocol/types';
import { ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitRelay } from './relay';
import { BaseProvider } from './providers/BaseProvider';
import GoogleProvider from './providers/GoogleProvider';
import DiscordProvider from './providers/DiscordProvider';
import EthWalletProvider from './providers/EthWalletProvider';
import WebAuthnProvider from './providers/WebAuthnProvider';
import { StytchOtpProvider } from './providers/StytchOtpProvider';
import AppleProvider from './providers/AppleProvider';
import { OtpProvider } from './providers/OtpProvider';

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
  
  private litOtpOptions: OtpProviderOptions | undefined;

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
      if (options?.litOtpConfig) {
        this.litOtpOptions = options?.litOtpConfig;
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
   * @param {ProviderType} type - Type of provider to initialize
   * @param {ProviderOptions} options - Options for the provider
   *
   * @returns {T} - Provider
   */
  public initProvider<T extends BaseProvider>(
    type: ProviderType,
    options?: ProviderOptions
  ): T {
    const baseParams = {
      rpcUrl: this.rpcUrl,
      relay: this.relay,
      litNodeClient: this.litNodeClient,
    };

    let provider: T;

    switch (type) {
      case 'google':
        provider = new GoogleProvider({
          ...baseParams,
          ...(options as OAuthProviderOptions),
        }) as unknown as T;
        break;
      case 'apple':
        provider = new AppleProvider({
          ...baseParams,
          ...(options as OAuthProviderOptions),
        }) as unknown as T;
        break;
      case 'discord':
        provider = new DiscordProvider({
          ...baseParams,
          ...(options as OAuthProviderOptions),
        }) as unknown as T;
        break;
      case 'ethwallet':
        provider = new EthWalletProvider({
          ...baseParams,
          ...(options as EthWalletProviderOptions),
        }) as unknown as T;
        break;
      case 'webauthn':
        provider = new WebAuthnProvider({
          ...baseParams,
        }) as unknown as T;
        break;
      case `stytchOtp`:
        provider = new StytchOtpProvider(
          {
            ...baseParams,
          },
          (options as StytchOtpProviderOptions)
        ) as unknown as T;
        break;
        case `otp`:
          provider = new OtpProvider(
            {
              ...baseParams,
              ...(options as SignInWithOTPParams),
            },
            this.litOtpOptions
          ) as unknown as T;
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
