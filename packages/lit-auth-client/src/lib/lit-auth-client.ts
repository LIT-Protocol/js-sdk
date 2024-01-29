import {
  EthWalletProviderOptions,
  IRelay,
  LitAuthClientOptions,
  OAuthProviderOptions,
  StytchOtpProviderOptions,
  ProviderOptions,
  WebAuthnProviderOptions,
  AuthMethod,
  MintRequestBody,
} from '@lit-protocol/types';
import { AuthMethodType, ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitRelay } from './relay';
import { BaseProvider } from './providers/BaseProvider';
import GoogleProvider from './providers/GoogleProvider';
import DiscordProvider from './providers/DiscordProvider';
import EthWalletProvider from './providers/EthWalletProvider';
import WebAuthnProvider from './providers/WebAuthnProvider';
import { StytchOtpProvider } from './providers/StytchOtpProvider';
import AppleProvider from './providers/AppleProvider';
import StytchAuthFactorOtpProvider from './providers/StytchAuthFactorOtp';
import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';

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
   * Configures logging
   */
  private debug: boolean;

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
    this.debug = options?.debug ?? false;
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
    if (options?.litNodeClient) {
      this.litNodeClient = options?.litNodeClient;
    } else {
      this.litNodeClient = new LitNodeClient({
        litNetwork: 'cayenne',
        debug: options.debug ?? false,
      });
    }

    // Set RPC URL
    this.rpcUrl = options?.rpcUrl || 'https://chain-rpc.litprotocol.com/http';
    log('rpc url: ', this.rpcUrl);
    log('relay config: ', options.litRelayConfig);
    log('relay instance: ', this.relay);
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
    log('resolving provider of type: ', type);
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
          ...(options as WebAuthnProviderOptions),
        }) as unknown as T;
        break;
      case 'stytchOtp':
        provider = new StytchOtpProvider(
          {
            ...baseParams,
          },
          options as StytchOtpProviderOptions
        ) as unknown as T;
        break;
      case 'stytchEmailFactorOtp':
        provider = new StytchAuthFactorOtpProvider<'email'>(
          { ...baseParams },
          options as StytchOtpProviderOptions,
          'email'
        ) as unknown as T;
        break;
      case 'stytchSmsFactorOtp':
        provider = new StytchAuthFactorOtpProvider<'sms'>(
          { ...baseParams },
          options as StytchOtpProviderOptions,
          'sms'
        ) as unknown as T;
        break;
      case 'stytchWhatsAppFactorOtp':
        provider = new StytchAuthFactorOtpProvider<'whatsApp'>(
          { ...baseParams },
          options as StytchOtpProviderOptions,
          'whatsApp'
        ) as unknown as T;
        break;
      case 'stytchTotpFactor':
        provider = new StytchAuthFactorOtpProvider<'totp'>(
          { ...baseParams },
          options as StytchOtpProviderOptions,
          'totp'
        ) as unknown as T;
        break;
      default:
        throw new Error(
          "Invalid provider type provided. Only 'google', 'discord', 'ethereum', and 'webauthn', 'Stytch', and 'StytchFactor' are supported at the moment."
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

  /**
   * Retrieves the authentication ID based on the provided authentication method.
   *
   * @param {AuthMethod} authMethod - The authentication method
   * @returns {Promise<string>} - The authentication ID
   */
  public static async getAuthIdByAuthMethod(
    authMethod: AuthMethod
  ): Promise<string> {
    let authId;

    switch (authMethod.authMethodType) {
      case AuthMethodType.EthWallet:
        authId = await EthWalletProvider.authMethodId(authMethod);
        break;
      case AuthMethodType.Discord:
        authId = await DiscordProvider.authMethodId(authMethod);
        break;
      case AuthMethodType.WebAuthn:
        authId = await WebAuthnProvider.authMethodId(authMethod);
        break;
      case AuthMethodType.GoogleJwt:
        authId = await GoogleProvider.authMethodId(authMethod);
        break;
      case AuthMethodType.StytchOtp:
        authId = await StytchOtpProvider.authMethodId(authMethod);
        break;
      case AuthMethodType.StytchEmailFactorOtp:
      case AuthMethodType.StytchSmsFactorOtp:
      case AuthMethodType.StytchTotpFactorOtp:
      case AuthMethodType.StytchWhatsAppFactorOtp:
        authId = await StytchAuthFactorOtpProvider.authMethodId(authMethod);
        break;
      default:
        log(`unsupported AuthMethodType: ${authMethod.authMethodType}`);
        throw new Error(
          `Unsupported auth method type: ${authMethod.authMethodType}`
        );
    }

    return authId;
  }

  /**
   * Mints a new pkp with all AuthMethods provided. Allows for permissions and flags to be set seperately.
   * If no permissions are provided then each auth method will be assigned `1` for sign anything
   * If no flags are provided then `sendPkpToitself` will be false, and `addPkpEthAddressAsPermittedAddress` will be true
   * It is then up to the implementor to transfer the pkp nft to the pkp address.
   * **note** When adding permissions, each permission should be added in the same order the auth methods are ordered
   * @throws {Error} - Throws an error if no AuthMethods are given
   * @param {AuthMethod[]} - AuthMethods authentication methods to be added to the pkp
   * @param {{ pkpPermissionScopes?: number[][]; sendPkpToitself?: boolean; addPkpEthAddressAsPermittedAddress?: boolean;}}
   * @returns {Promise<{pkpTokenId?: string; pkpEthAddress?: string; pkpPublicKey?: string}>} pkp information
   */
  public async mintPKPWithAuthMethods(
    authMethods: AuthMethod[],
    options: {
      pkpPermissionScopes?: number[][];
      sendPkpToitself?: boolean;
      addPkpEthAddressAsPermittedAddress?: boolean;
    }
  ): Promise<{
    pkpTokenId?: string;
    pkpEthAddress?: string;
    pkpPublicKey?: string;
  }> {
    if (authMethods.length < 1) {
      throw new Error('Must provide atleast one auth method');
    }

    if (
      !options.pkpPermissionScopes ||
      options.pkpPermissionScopes.length < 1
    ) {
      options.pkpPermissionScopes = [];
      for (let i = 0; i < authMethods.length; i++) {
        options.pkpPermissionScopes.push([
          ethers.BigNumber.from('1').toNumber(),
        ]);
      }
    }

    const reqBody: MintRequestBody = {
      keyType: 2,
      permittedAuthMethodTypes: authMethods.map((value) => {
        return value.authMethodType;
      }),
      permittedAuthMethodScopes: options.pkpPermissionScopes,
      addPkpEthAddressAsPermittedAddress:
        options.addPkpEthAddressAsPermittedAddress ?? true,
      sendPkpToItself: options.sendPkpToitself ?? false,
    };

    const permittedAuthMethodIds = [];
    const permittedAuthMethodPubkeys = [];
    for (const authMethod of authMethods) {
      const id = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
      permittedAuthMethodIds.push(id);
      if (authMethod.authMethodType === AuthMethodType.WebAuthn) {
        permittedAuthMethodPubkeys.push(
          WebAuthnProvider.getPublicKeyFromRegistration(
            JSON.parse(authMethod.accessToken)
          )
        );
      } else {
        // only webauthn has a `authMethodPubkey`
        permittedAuthMethodPubkeys.push('0x');
      }
    }

    reqBody.permittedAuthMethodIds = permittedAuthMethodIds;
    reqBody.permittedAuthMethodPubkeys = permittedAuthMethodPubkeys;

    const mintRes = await this.relay.mintPKP(JSON.stringify(reqBody));
    if (!mintRes || !mintRes.requestId) {
      throw new Error(
        `Missing mint response or request ID from mint response ${mintRes.error}`
      );
    }

    const pollerResult = await this.relay.pollRequestUntilTerminalState(
      mintRes.requestId
    );

    return {
      pkpTokenId: pollerResult.pkpTokenId,
      pkpPublicKey: pollerResult.pkpPublicKey,
      pkpEthAddress: pollerResult.pkpEthAddress,
    };
  }
}
