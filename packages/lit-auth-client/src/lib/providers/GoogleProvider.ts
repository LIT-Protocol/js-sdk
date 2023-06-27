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
import { toUtf8Bytes } from 'ethers/lib/utils';

export default class GoogleProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;
  /**
   * Google client ID
   */
  #clientId: string =
    '355007986731-llbjq5kbsg8ieb705mo64nfnh88dhlmn.apps.googleusercontent.com';
  /**
   * Google ID token
   */
  #accessToken: string | undefined;

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
    const { provider, accessToken, state, error } = parseLoginParams(
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
    if (!accessToken) {
      throw new Error(
        `Missing ID token in redirect callback URL for Google OAuth"`
      );
    }

    this.#accessToken = accessToken;

    const authMethod = {
      authMethodType: AuthMethodType.GoogleJwt,
      accessToken: accessToken,
    };
    return authMethod;
  }

  /**
   * Constructs a {@link RelayerRequest} from the access token, {@link authenticate} must be called prior.
   * @returns {Promise<RelayerRequest>} Formed request for sending to Relayer Server
   */
  protected override async getRelayerRequest(): Promise<RelayerRequest> {
    if (!this.#accessToken) {
      throw new Error(
        'Access token not defined, did you authenticate before calling validate?'
      );
    }

    const tokenPayload: Record<string, unknown> = this.#parseIDToken(
      this.#accessToken
    );

    const userId: string = tokenPayload['sub'] as string;
    const audience: string = tokenPayload['aud'] as string;
    const authMethodId = utils.keccak256(toUtf8Bytes(`${userId}:${audience}`));
    return {
      authMethodType: 6,
      authMethodId: authMethodId,
    };
  }

  /**
   * Parse Google ID token
   *
   * @param {string} accessToken - Google ID token
   *
   * @returns {Record<string, unknown>} - Google information
   */
  #parseIDToken(accessToken: string): Record<string, unknown> {
    return parseJWT(accessToken);
  }
}
