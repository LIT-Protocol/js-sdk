import { AuthMethodType } from '@lit-protocol/constants';
import {
  AuthMethod,
  BaseAuthenticateOptions,
  BaseProviderOptions,
  StytchOtpAuthenticateOptions,
  StytchToken,
} from '@lit-protocol/types';
import { BaseProvider } from './BaseProvider';
import { StytchOtpProviderOptions } from '@lit-protocol/types';

export class StytchOtpProvider extends BaseProvider {
  private _params: StytchOtpProviderOptions;
  private _provider: string = 'https://stytch.com/session';

  constructor(params: BaseProviderOptions, config: StytchOtpProviderOptions) {
    super(params);
    this._params = config;
  }

  /**
   * Validates claims within a stytch authenticated JSON Web Token
   * @param options authentication option containing the authenticated token
   * @returns {AuthMethod} Authentication Method for auth method type OTP
   * */
  override authenticate<T extends BaseAuthenticateOptions>(
    options?: T | undefined
  ): Promise<AuthMethod> {
    return new Promise<AuthMethod>((resolve, reject) => {
      if (!options) {
        reject(
          new Error(
            'No Authentication options provided, please supply an authenticated JWT'
          )
        );
      }

      const userId: string | undefined =
        this._params.userId ??
        (options as unknown as StytchOtpAuthenticateOptions).userId;

      if (!userId) {
        reject(new Error('User id must be provided'));
      }
      const accessToken: string | undefined = (
        options as unknown as StytchOtpAuthenticateOptions
      )?.accessToken;
      if (!accessToken) {
        reject(
          new Error('No access token provided, please provide a stych auth jwt')
        );
      }

      const parsedToken: StytchToken = this._parseJWT(accessToken);
      console.log(`otpProvider: parsed token body`, parsedToken);
      const audience = (parsedToken['aud'] as string[])[0];
      if (audience != this._params.appId) {
        reject(new Error('Parsed application id does not match parameters'));
      }

      if (!audience) {
        reject(
          new Error(
            'could not find project id in token body, is this a stych token?'
          )
        );
      }
      const session = parsedToken[this._provider];
      const authFactor = session['authentication_factors'][0];
      if (!authFactor) {
        reject(new Error('Could not find authentication info in session'));
      }

      if (userId != parsedToken['sub']) {
        reject(
          new Error(
            'AppId does not match token contents. is this the right token for your application?'
          )
        );
      }

      resolve({
        authMethodType: AuthMethodType.StytchOtp,
        accessToken: accessToken,
      });
    });
  }

  /**
   *
   * @param jwt token to parse
   * @returns {string}- userId contained within the token message
   */
  private _parseJWT(jwt: string): StytchToken {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token length');
    }
    const body = Buffer.from(parts[1], 'base64');
    const parsedBody: StytchToken = JSON.parse(body.toString('ascii'));
    console.log('JWT body: ', parsedBody);
    return parsedBody;
  }
}
