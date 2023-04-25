import {
  AuthMethod,
  BaseProviderOptions,
  OAuthProviderOptions,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { BaseProvider } from './BaseProvider';
import {
  prepareLoginUrl,
  parseLoginParams,
  getStateParam,
  decode,
} from '../utils';

export default class DiscordProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri;
  }

  /**
   * Redirect user to the Lit's Discord login page
   *
   * @returns {DiscordProvider} - Redirects user to Lit login page
   */
  public signIn(): void {
    // Get login url
    const loginUrl = prepareLoginUrl('discord', this.redirectUri);
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

    // Check if provider is Discord
    if (!provider || provider !== 'Discord') {
      throw new Error(
        `OAuth provider "${provider}" passed in redirect callback URL does not match "Discord"`
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

    // Check if access token is present in url
    if (!accessToken) {
      throw new Error(
        `Missing access token in redirect callback URL for Discord OAuth"`
      );
    }

    const authMethod = {
      authMethodType: AuthMethodType.Discord,
      accessToken: accessToken,
    };
    return authMethod;
  }
}
