import {
  IRelay,
  LitAuthClientOptions,
  IRelayPKP,
  AuthSig,
  AuthMethod,
  SignInWithEthWalletParams,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { SiweMessage } from 'lit-siwe';
import { ethers } from 'ethers';
import { LitRelay } from './relay';
import {
  decode,
  getStateParam,
  isSocialLoginSupported,
  parseLoginParams,
  prepareLoginUrl,
} from './utils';
import { LIT_CHAINS } from '@lit-protocol/constants';

/**
 * Class that handles authentication through Lit login
 */
export class LitAuthClient {
  /**
   * Domain of the app using LitAuthClient
   */
  public readonly domain: string;
  /**
   * The redirect URI that Lit's auth server should send the user back to
   */
  public readonly redirectUri: string;
  /**
   * Relay server to subsidize minting of PKPs
   */
  public relay: IRelay;

  /**
   * Create a LitAuthClient instance
   *
   * @param {LitAuthClientOptions} options
   * @param {string} options.redirectUri - The redirect URI that Lit's auth server should send the user back to
   * @param {string} [options.litRelayApiKey] - API key for Lit's relay server
   * @param {IRelay} [options.customRelay] - Custom relay server to subsidize minting of PKPs
   */
  constructor(options: LitAuthClientOptions) {
    this.domain = options.domain;
    this.redirectUri = options.redirectUri.replace(/\/+$/, ''); // Remove trailing slashes

    if (options?.customRelay) {
      this.relay = options?.customRelay;
    } else {
      if (options?.litRelayApiKey) {
        this.relay = new LitRelay({ relayApiKey: options.litRelayApiKey });
      } else {
        throw new Error(
          'An API key is required to use the default Lit Relay server. Please provide either an API key or a custom relay server.'
        );
      }
    }
  }

  /**
   * Redirect user to the given social login provider's authorization page
   *
   * @param {string} provider - Social login provider to use
   *
   * @returns {void} - Redirects user to Lit login page
   */
  public signInWithSocial(provider: string): void {
    // Check if provider is supported
    if (!isSocialLoginSupported(provider)) {
      throw new Error(
        `Invalid OAuth provider: ${provider}. Please ensure that the given provider is either 'google' and 'discord'.`
      );
    }
    // Get login url
    const loginUrl = prepareLoginUrl(provider, this.redirectUri);
    // Redirect to login url
    window.location.assign(loginUrl);
  }

  /**
   * Validate the URL parameters returned from Lit's login server and return the OAuth token
   *
   * @returns {AuthMethod} - Auth method object containing the OAuth token
   */
  public handleSignInRedirect(): AuthMethod {
    // Check if current url matches redirect uri
    if (!window.location.href.startsWith(this.redirectUri)) {
      throw new Error(
        `Current url "${window.location.href}" does not match provided redirect uri "${this.redirectUri}"`
      );
    }

    // Check url for params
    const { provider, accessToken, idToken, state, error } = parseLoginParams(
      window.location.search
    );

    // Check if there's an error
    if (error) {
      throw new Error(error);
    }

    // Check if provider exists and is supported
    if (!provider || !isSocialLoginSupported(provider)) {
      throw new Error(
        `Invalid OAuth provider "${provider}" passed in redirect callback URL`
      );
    }

    // Check if state param matches
    if (!state || decode(decodeURIComponent(state)) !== getStateParam()) {
      throw new Error(
        `Invalid state parameter "${state}" passed in redirect callback URL`
      );
    }

    // Clear params from url
    window.history.replaceState({}, document.title, this.redirectUri);

    // Handle provider-specific logic
    let authMethod: AuthMethod;
    switch (provider) {
      case 'discord':
        if (!accessToken) {
          throw new Error(
            `Missing access token in redirect callback URL for Discord OAuth"`
          );
        }
        authMethod = {
          authMethodType: AuthMethodType.Discord,
          accessToken: accessToken,
        };
        break;
      case 'google':
        if (!idToken) {
          throw new Error(
            `Missing ID token in redirect callback URL for Google OAuth"`
          );
        }
        authMethod = {
          authMethodType: AuthMethodType.GoogleJwt,
          accessToken: idToken,
        };
        break;
      default:
        throw new Error(
          `Invalid OAuth provider "${provider}" passed in redirect callback URL`
        );
    }

    return authMethod;
  }

  /**
   * Check if current url is redirect uri to determine if app was redirected back from external login page
   *
   * @returns {boolean} - True if current url is redirect uri
   */
  public isSignInRedirect(): boolean {
    // Check if current url matches redirect uri
    const isRedirectUri = window.location.href.startsWith(this.redirectUri);
    if (!isRedirectUri) {
      return false;
    }
    // Check url for redirect params
    const { provider, accessToken, idToken, state, error } = parseLoginParams(
      window.document.location.search
    );
    // Check if current url is redirect uri and has redirect params
    if (
      isRedirectUri &&
      (provider || accessToken || idToken || state || error)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Generate a wallet signature to use as an auth method
   *
   * @param {SignInWithEthWalletParams} params
   * @param {string} params.address - Ethereum wallet address
   * @param {Function} params.signMessage - Function to sign message
   * @param {string} [params.origin] - Origin of signing request
   * @param {string} [params.chain] - Name of chain to use for signature
   * @param {number} [params.expiration] - When the auth signature expires
   *
   * @returns {AuthMethod} - Auth method object containing the auth signature
   */
  public async signInWithEthWallet(
    params: SignInWithEthWalletParams
  ): Promise<AuthMethod> {
    // Get chain ID or default to Ethereum mainnet
    const chain = params.chain || 'ethereum';
    const selectedChain = LIT_CHAINS[chain];
    const chainId = selectedChain?.chainId ? selectedChain.chainId : 1;

    // Get expiration or default to 24 hours
    const expiration =
      params.expiration ||
      new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    // Prepare Sign in with Ethereum message
    const preparedMessage: Partial<SiweMessage> = {
      domain: this.domain,
      address: ethers.utils.getAddress(params.address), // convert to EIP-55 format or else SIWE complains
      version: '1',
      chainId,
      expirationTime: expiration,
    };

    if (origin) {
      preparedMessage.uri = origin;
    } else {
      preparedMessage.uri = globalThis.location.href;
    }

    const message: SiweMessage = new SiweMessage(preparedMessage);
    const toSign: string = message.prepareMessage();

    // Use provided function to sign message
    const signature = await params.signMessage(toSign);

    const authSig: AuthSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: params.address,
    };

    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(authSig),
    };
    return authMethod;
  }

  /**
   * Mint a new PKP for the given auth method and poll until the PKP is ready
   *
   * @param {AuthMethod} authMethod
   * @param {AuthMethodType} authMethod.authMethodType - Auth method type
   * @param {string} authMethod.accessToken - Auth method access token
   *
   * @returns {Promise<IRelayPKP>} - new PKP
   */
  public async mintPKPWithAuthMethod(
    authMethod: AuthMethod
  ): Promise<IRelayPKP> {
    let mintRes;

    switch (authMethod.authMethodType) {
      case AuthMethodType.Discord:
        mintRes = await this.relay.mintPKP(
          AuthMethodType.Discord,
          JSON.stringify({
            accessToken: authMethod.accessToken,
          })
        );
        break;
      case AuthMethodType.GoogleJwt:
        mintRes = await this.relay.mintPKP(
          AuthMethodType.GoogleJwt,
          JSON.stringify({
            idToken: authMethod.accessToken,
          })
        );
        break;
      case AuthMethodType.EthWallet:
        mintRes = await this.relay.mintPKP(
          AuthMethodType.EthWallet,
          // Auth sig is a JSON string
          authMethod.accessToken
        );
        break;
      default:
        throw new Error(
          `Invalid auth method type "${authMethod.authMethodType}" passed`
        );
    }

    if (!mintRes || !mintRes.requestId) {
      throw new Error('Missing mint response or request ID from relay server');
    }
    const pollRes = await this.relay.pollRequestUntilTerminalState(
      mintRes.requestId
    );
    if (
      !pollRes ||
      !pollRes.pkpTokenId ||
      !pollRes.pkpEthAddress ||
      !pollRes.pkpPublicKey
    ) {
      throw new Error('Missing poll response or new PKP from relay server');
    }
    const newPKP: IRelayPKP = {
      tokenId: pollRes.pkpTokenId,
      ethAddress: pollRes.pkpEthAddress,
      publicKey: pollRes.pkpPublicKey,
    };

    return newPKP;
  }

  /**
   * Fetch PKPs associated with given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<IRelayPKP[]>} - Array of PKPs
   */
  public async fetchPKPsByAuthMethod(
    authMethod: AuthMethod
  ): Promise<IRelayPKP[]> {
    let fetchRes;

    switch (authMethod.authMethodType) {
      case AuthMethodType.Discord:
        fetchRes = await this.relay.fetchPKPs(
          AuthMethodType.Discord,
          JSON.stringify({
            accessToken: authMethod.accessToken,
          })
        );
        break;
      case AuthMethodType.GoogleJwt:
        fetchRes = await this.relay.fetchPKPs(
          AuthMethodType.GoogleJwt,
          JSON.stringify({
            idToken: authMethod.accessToken,
          })
        );
        break;
      case AuthMethodType.EthWallet:
        // Auth sig is already a string
        fetchRes = await this.relay.fetchPKPs(
          AuthMethodType.EthWallet,
          // Auth sig is a JSON string
          authMethod.accessToken
        );
        break;
      default:
        throw new Error(
          `Invalid auth method type "${authMethod.authMethodType}" passed`
        );
    }

    if (!fetchRes || !fetchRes.pkps) {
      throw new Error('Missing PKPs in fetch response from relay server');
    }
    return fetchRes.pkps;
  }
}
