import {
  AuthMethod,
  BaseProviderOptions,
  OAuthProviderOptions,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import {
  prepareLoginUrl,
  parseLoginParams,
  getStateParam,
  decode,
  parseJWT,
} from '../utils';
import { utils } from 'ethers';

import { BaseProvider } from './BaseProvider';

export default class GoogleProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;

  /**
   * Google ID token
   */
  #idToken: string | undefined;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
  }

  /**
   * Redirect user to the Lit's Google login page
   *
   * @returns {Promise<void>} - Redirects user to Lit login page
   */
  public async signIn(): Promise<void> {
    // Get login url
    const loginUrl = await prepareLoginUrl('google', this.redirectUri);
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

    // Check if provider is Google
    if (!provider || provider !== 'google') {
      throw new Error(
        `OAuth provider "${provider}" passed in redirect callback URL does not match "google"`
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
        `Missing ID token in redirect callback URL for Google OAuth"`
      );
    }

    this.#idToken = idToken;

    const authMethod = {
      authMethodType: AuthMethodType.GoogleJwt,
      accessToken: idToken,
    };
    return authMethod;
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
   * Parse Google ID token
   *
   * @param {string} idToken - Google ID token
   *
   * @returns {Record<string, unknown>} - Google information
   */
  #parseIdToken(idToken: string): Record<string, unknown> {
    return parseJWT(idToken);
  }
}
