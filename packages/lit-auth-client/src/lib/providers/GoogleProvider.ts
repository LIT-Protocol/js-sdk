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
} from '../utils';
import { BaseProvider } from './BaseProvider';
import { OAuth2Client, TokenPayload } from "google-auth-library";

export default class GoogleProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;
  public oAuthClient: OAuth2Client;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
    this.oAuthClient = new OAuth2Client("355007986731-llbjq5kbsg8ieb705mo64nfnh88dhlmn.apps.googleusercontent.com");
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
    
    let tokenPayload: TokenPayload = await this.#verifyIDToken(idToken).catch(e => {
      throw new Error(`Error while verifying identifier token: ${e.message}`);
    });

    const authMethod = {
      authMethodType: AuthMethodType.GoogleJwt,
      accessToken: JSON.stringify(tokenPayload),
    };
    return authMethod;
  }

  // Validate given Google ID token
  async #verifyIDToken(idToken: string): Promise<TokenPayload> {
    const ticket = await this.oAuthClient.verifyIdToken({
      idToken,
    });
    return ticket.getPayload()!;
  }
}