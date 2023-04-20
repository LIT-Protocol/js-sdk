import {
  IRelay,
  LitAuthClientOptions,
  IRelayPKP,
  AuthSig,
  AuthMethod,
  SignInWithEthWalletParams,
  SessionSigs,
  AuthCallbackParams,
  SignSessionKeyResponse,
  GetSessionSigsWithAuthParams,
  LitRelayConfig,
  SignInWithOTPParams,
} from '@lit-protocol/types';
import {
  LIT_CHAINS,
  AuthMethodType,
  ALL_LIT_CHAINS,
} from '@lit-protocol/constants';
import { SiweMessage } from 'lit-siwe';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import { LitRelay } from './relay';
import {
  decode,
  getStateParam,
  isSocialLoginSupported,
  parseLoginParams,
  prepareLoginUrl,
} from './utils';
import { OtpSession } from '../otp';

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
   * Client to connect to Lit nodes
   */
  public litNodeClient: LitNodeClient | undefined;

  /**
   * Create a LitAuthClient instance
   *
   * @param {LitAuthClientOptions} options
   * @param {string} options.redirectUri - The redirect URI that Lit's auth server should send the user back to
   * @param {LitRelayConfig} [options.litRelayConfig] - Options for Lit's relay server
   * @param {IRelay} [options.customRelay] - Custom relay server to subsidize minting of PKPs
   * @param {LitNodeClient} [options.litNodeClient] - Client to connect to Lit nodes
   */
  constructor(options: LitAuthClientOptions) {
    this.domain = options.domain;
    this.redirectUri = options.redirectUri.replace(/\/+$/, ''); // Remove trailing slashes

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

  public async signInWithOTP(params: SignInWithOTPParams): Promise<OtpSession> {
    // TODO: add OTP server config
    let session = new OtpSession(params);
    
    // Should we start the otp session for them? or make the caller explicitly invoke?
    await session.sendOtpCode();
    
    return session;
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

  /**
   * Generate session sigs for given auth method and PKP
   *
   * @param {GetSessionSigsForAuthMethodParams} params
   * @param {string} params.pkpPublicKey - Public key of PKP to auth with
   * @param {AuthMethod} params.authMethod - Auth method verifying ownership of PKP
   * @param {GetSessionSigsProps} params.sessionSigsParams - Params for getSessionSigs function
   * @param {LitNodeClient} params.litNodeClient - Lit Node Client to use. If not provided, will use an existing Lit Node Client or create a new one
   *
   * @returns {Promise<SessionSigs>} - Session sigs
   */
  public async getSessionSigsWithAuth(
    params: GetSessionSigsWithAuthParams
  ): Promise<SessionSigs> {
    // Use provided LitNodeClient or create a new one
    if (params.litNodeClient && params.litNodeClient instanceof LitNodeClient) {
      this.litNodeClient = params.litNodeClient;
    } else {
      if (!this.litNodeClient) {
        this.litNodeClient = new LitNodeClient({
          litNetwork: 'serrano',
          debug: false,
        });
      }
    }
    // Connect to LitNodeClient if not already connected
    if (!this.litNodeClient.ready) {
      await this.litNodeClient.connect();
    }

    let authNeededCallback = params.sessionSigsParams.authNeededCallback;

    // If no authNeededCallback is provided, create one that uses the provided PKP and auth method
    // to sign a session key and return an auth sig
    if (!authNeededCallback) {
      const nodeClient = this.litNodeClient;

      authNeededCallback = async (
        authCallbackParams: AuthCallbackParams
      ): Promise<AuthSig> => {
        let chainId = 1;
        try {
          const chainInfo = ALL_LIT_CHAINS[authCallbackParams.chain];
          // @ts-expect-error - chainId is not defined on the type
          chainId = chainInfo.chainId;
        } catch {
          // Do nothing
        }

        let response: SignSessionKeyResponse;

        if (params.authMethod.authMethodType === AuthMethodType.EthWallet) {
          const authSig = JSON.parse(params.authMethod.accessToken);
          response = await nodeClient.signSessionKey({
            authMethods: [],
            authSig: authSig,
            pkpPublicKey: params.pkpPublicKey,
            expiration: authCallbackParams.expiration,
            resources: authCallbackParams.resources,
            chainId,
          });
        } else {
          response = await nodeClient.signSessionKey({
            authMethods: [params.authMethod],
            pkpPublicKey: params.pkpPublicKey,
            expiration: authCallbackParams.expiration,
            resources: authCallbackParams.resources,
            chainId,
          });
        }

        return response.authSig;
      };
    }

    // Generate session sigs with the given session params
    const sessionSigs = await this.litNodeClient.getSessionSigs({
      ...params.sessionSigsParams,
      authNeededCallback,
    });

    return sessionSigs;
  }
}
