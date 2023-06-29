import {
  AuthMethod,
  BaseProviderOptions,
  OAuthProviderOptions,
  RelayerRequest,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import {
  prepareLoginUrl,
  parseLoginParams,
  getStateParam,
  decode,
  parseJWT,
} from '../utils';
import { BaseProvider } from './BaseProvider';
import { utils } from 'ethers';

export default class AppleProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;
  /**
   * Apple client ID
   */
  #clientId: string = '...';
  /**
   * Apple JWT
   */
  #idToken: string | undefined;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
  }

  /**
   * Redirect user to the Lit's Apple login page
   *
   * @returns {Promise<void>} - Redirects user to Lit login page
   */
  public async signIn(): Promise<void> {
    // Get login url
    const loginUrl = await prepareLoginUrl('apple', this.redirectUri);
    // Redirect to login url
    window.location.assign(loginUrl);
  }

  /**
   * Validate the URL parameters returned from Lit's login server and return the authentication data
   *
   * @returns {Promise<AuthMethod>} - Auth method object that contains OAuth token
   */
  public async authenticate(): Promise<AuthMethod> {
    // Check if current url matches redirect uri
    if (!window.location.href.startsWith(this.redirectUri)) {
      throw new Error(
        `Current url "${window.location.href}" does not match provided redirect uri "${this.redirectUri}"`
      );
    }

    // Check url for params
    const { provider, idToken, state, error } = parseLoginParams(
      window.location.search
    );

    // Check if there's an error
    if (error) {
      throw new Error(error);
    }

    // Check if provider is Apple
    if (!provider || provider !== 'apple') {
      throw new Error(
        `OAuth provider "${provider}" passed in redirect callback URL does not match "apple"`
      );
    }

    // Check if state param matches
    if (!state || decode(decodeURIComponent(state)) !== getStateParam()) {
      throw new Error(
        `Invalid state parameter "${state}" passed in redirect callback URL`
      );
    }

    // Clear params from url
    window.history.replaceState(
      null,
      window.document.title,
      window.location.pathname
    );

    // Check if id token is present in url
    if (!idToken) {
      throw new Error(
        `Missing ID token in redirect callback URL for Apple OAuth"`
      );
    }
    this.#idToken = idToken;

    const authMethod = {
      authMethodType: AuthMethodType.AppleJwt,
      accessToken: idToken,
    };
    return authMethod;
  }

  /**
   * Check whether the authentication data is valid
   *
   * @returns {Promise<boolean>} - True if authentication data is valid
   */
  public async verify(): Promise<boolean> {
    if (!this.#idToken) {
      throw new Error('Id token is not defined. Call authenticate first.');
    }
    const tokenPayload = this.#parseIdToken(this.#idToken);
    // Verify the JWS E256 signature using the server’s public key
    // Verify the nonce for the authentication

    // Verify that the iss field contains https://appleid.apple.com
    const iss = tokenPayload['iss'];
    if (iss !== 'https://appleid.apple.com') {
      return false;
    }
    // Verify that the aud field is the developer’s client_id
    const aud = tokenPayload['aud'];
    if (aud !== this.#clientId) {
      return false;
    }
    // Verify that the time is earlier than the exp value of the token
    // Exp is the number of seconds since the Unix epoch in UTC
    const exp = tokenPayload['exp'] as number;
    const current = Math.floor(Date.now() / 1000);
    if (current > exp) {
      return false;
    }

    return true;
  }

  /**
   * Derive unique identifier from authentication material produced by auth providers
   *
   * @returns {Promise<string>} - Auth method id that can be used for look-up and as an argument when
   * interacting directly with Lit contracts
   */
  public async getAuthMethodId(): Promise<string> {
    if (!this.#idToken) {
      throw new Error('Id token is not defined. Call authenticate first.');
    }
    const tokenPayload = this.#parseIdToken(this.#idToken);
    const userId: string = tokenPayload['sub'] as string;
    const audience: string = tokenPayload['aud'] as string;
    const authMethodId = utils.keccak256(
      utils.toUtf8Bytes(`${userId}:${audience}`)
    );
    return authMethodId;
  }

  /**
   * Constructs a {@link RelayerRequest} from the access token, {@link authenticate} must be called prior.
   * @returns {Promise<RelayerRequest>} Formed request for sending to Relayer Server
   */
  protected override async getRelayerRequest(): Promise<RelayerRequest> {
    if (!this.#idToken) {
      throw new Error('Access token is not defined. Call authenticate first.');
    }

    const payload = parseJWT(this.#idToken);
    const authMethodId = `${payload['aud']}:${payload['sub']}`;

    return {
      authMethodType: AuthMethodType.AppleJwt,
      authMethodId,
    };
  }

  /**
   * Parse Apple ID token
   *
   * @param {string} idToken - Apple ID token
   *
   * @returns {Record<string, unknown>} - Apple information
   */
  #parseIdToken(idToken: string): Record<string, unknown> {
    return parseJWT(idToken);
  }
}
