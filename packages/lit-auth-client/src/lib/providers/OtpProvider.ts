import { AuthMethodType } from '@lit-protocol/constants';
import {
  AuthMethod,
  AuthenticateOptions,
  BaseProviderOptions,
  OtpAuthenticateOptions,
  SignInWithOTPParams,
  OtpVerificationPayload,
  AuthMethodWithOTPType,
} from '@lit-protocol/types';
import { BaseProvider } from './BaseProvider';
import { OtpProviderOptions } from '@lit-protocol/types';
import { parseJWT } from '../utils';

export class OtpProvider extends BaseProvider {
  #accessToken: string | undefined;

  private _params: SignInWithOTPParams;
  private _baseUrl: string; // TODO: REMOVE THIS HARD CODED STRING
  private _port: string;
  private _startRoute: string;
  private _checkRoute: string;
  private _requestId: string = '';

  constructor(
    params: BaseProviderOptions & SignInWithOTPParams,
    config?: OtpProviderOptions
  ) {
    super(params);
    this._params = params;
    this._baseUrl = config?.baseUrl || 'https://auth-api.litgateway.com';
    this._port = config?.port || '443';
    this._startRoute = config?.startRoute || '/api/otp/start';
    this._checkRoute = config?.checkRoute || '/api/otp/check';
  }

  public getAuthMethodStorageUID(accessToken: any): string {
    const UID = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString('utf-8')
    ).extraData.split('|')[0];

    return `lit-otp-token-${UID}`;
  }

  /**
   * Validates OTP code from {@link sendOtpCode}
   * @param options {T extends AuthenticateOptions} options used in authentication
   * @returns {Promise<AuthMethod>} Auth Method object containing Json Web Token
   */
  public async authenticate<T extends AuthenticateOptions>(
    options?: T
  ): Promise<AuthMethod> {
    const _options = options as unknown as OtpAuthenticateOptions;

    // default to caching
    if (_options && _options.cache === undefined) {
      _options.cache = true;
    }

    // Check if it exists in cache
    // let storageItem = this.storageProvider.getExpirableItem('lit-otp-token');

    // if (storageItem) {
    //   return JSON.parse(storageItem);
    // }

    if (options) {
      const authData = this.checkOtpCode(
        (options as unknown as OtpAuthenticateOptions).code
      );

      const accessToken = (await authData).accessToken;

      if (_options.cache) {
        const item = JSON.stringify(await authData);

        const storageUID = this.getAuthMethodStorageUID(accessToken);

        this.storageProvider.setExpirableItem(
          storageUID,
          item,
          _options.expirationLength ?? 24,
          _options.expirationUnit ?? 'hours'
        );
      }

      return authData;
    } else {
      throw new Error(
        `Must provide authentication options for OTP check options given are: ${options}`
      );
    }
  }

  /**
   * Starts an otp session for a given email or phone number from the {@link SignInWithOTPParams}
   * @returns {Promise<string>} returns a callback to check status of the verification session if successful
   */
  public async sendOtpCode(): Promise<string> {
    const url = this._buildUrl('start');
    this._requestId =
      this._params.requestId ??
      (Math.random() * 10000 + 1).toString(10).replace('.', '');

    let body: any = {
      otp: this._params.userId,
      request_id: this._requestId,
    };

    if (this._params.emailCustomizationOptions) {
      body.email_configuration = {};
      body.email_configuration.from_name =
        this._params.emailCustomizationOptions.fromName;
      if (this._params.emailCustomizationOptions.from)
        body.email_configuration.from =
          this._params.emailCustomizationOptions.from;
    }

    if (this._params.customName) body.custom_name = this._params.customName;

    body = JSON.stringify(body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'api-key': '67e55044-10b1-426f-9247-bb680e5fe0c8_JsSdk',
      },
      body,
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn('Something wrong with  OTP request', await response.json());
      const err = new Error('Unable to start otp verification');
      throw err;
    }
    let respBody: { status: string; callback: string } = await response.json();

    return respBody.callback;
  }

  /**
   * Sets the user id & send otp code to the user
   */
  public send(userId: string) {
    this._params.userId = userId;
    return this.sendOtpCode();
  }

  /**
   * Validates otp code from {@link sendOtpCode}
   *
   * @param code {string} - OTP code sent to the user, should be retrieved from user input.
   * @returns {Promise<AuthMethod>} - Auth method that contains Json Web Token
   */
  private async checkOtpCode(code: string): Promise<AuthMethod> {
    const url = this._buildUrl('check');

    /**
        pub struct OtpCheckRequest {
            pub otp: String,
            pub code: String,
            pub request_id: String,
        }
    */
    let body: any = {
      otp: this._params.userId,
      code,
      request_id: this._requestId,
    };
    body = JSON.stringify(body);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'api-key': '67e55044-10b1-426f-9247-bb680e5fe0c8_JsSdk',
      },
      body,
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn('Something wrong with  OTP request', await response.json());
      const err = new Error('unsucessful otp check');
      throw err;
    }

    const respBody: any = await response.json();

    if (!respBody.token_jwt) {
      throw new Error('Invalid otp code, operation was aborted');
    }

    this.#accessToken = respBody.token_jwt;

    return {
      accessToken: respBody.token_jwt,
      authMethodType: AuthMethodType.OTP,
    };
  }

  private _buildUrl(route: string): string {
    switch (route) {
      case 'start':
        return `${this._baseUrl}:${this._port}${this._startRoute}`;
      case 'check':
        return `${this._baseUrl}:${this._port}${this._checkRoute}`;
      default:
        return '';
    }
  }

  /**
   * Derive unique identifier from authentication material produced by auth providers
   *
   * @returns {Promise<string>} - Auth method id that can be used for look-up and as an argument when
   * interacting directly with Lit contracts
   */
  public async getAuthMethodId(accessToken?: string): Promise<string> {
    const _accessToken = accessToken || this.#accessToken;

    if (!_accessToken) {
      throw new Error('Access token is not defined. Call authenticate first.');
    }
    const resp = await this.#verifyOtpJWT(_accessToken);
    const userId = resp.userId;
    const payload = parseJWT(_accessToken);
    const audience = (payload['orgId'] as string).toLowerCase() || 'lit';
    const authMethodId = `${userId}:${audience}`;
    return authMethodId;
  }

  /**
   * Parse OTP token
   *
   * @param {string} jwt - JWT
   *
   * @returns {Promise<OtpVerificationPayload>} - OTP verification payload
   */
  async #verifyOtpJWT(jwt: string): Promise<OtpVerificationPayload> {
    const res = await fetch(this._buildUrl('verify'), {
      redirect: 'error',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
      },
      body: JSON.stringify({
        token: jwt,
      }),
    });
    if (res.status < 200 || res.status >= 400) {
      throw new Error('Error while verifying token on remote endpoint');
    }
    const respBody = await res.json();

    return respBody as OtpVerificationPayload;
  }
}
