import {
  AuthMethod,
  BaseProviderOptions,
  OAuthProviderOptions,
  RegistrationMethod,
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

  private _accessToken: string | undefined;
  private _clientId: string =  "105287423965869266";

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
  }

  /**
   * Redirect user to the Lit's Discord login page
   *
   * @returns {Promise<void>} - Redirects user to Lit login page
   */
  public async signIn(): Promise<void> {
    // Get login url
    const loginUrl = await prepareLoginUrl('discord', this.redirectUri);
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
    if (!provider || provider !== 'discord') {
      throw new Error(
        `OAuth provider "${provider}" passed in redirect callback URL does not match "discord"`
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

  public override async validate(): Promise<RegistrationMethod> {
    if (!this._accessToken) {
      throw new Error(
        'Access token not defined, did you authenticate before calling validate?'
      );
    }
    const userToken: string = await this.#verifyAndFetchDiscordUserId(
      this._accessToken
    ).catch((e) => {
      throw e;
    });

    return {
      authMethodType: 4,
      authMethodId: `${userToken}:${this._clientId}`
    };
  }

  async #verifyAndFetchDiscordUserId(accessToken: string): Promise<string> {
    const meResponse = await fetch('https://discord.com/api/users/@me', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    if (meResponse.ok) {
      const user = await meResponse.json();
      return JSON.stringify(user);
    } else {
      throw new Error('Unable to verify Discord account');
    }
  }
}
