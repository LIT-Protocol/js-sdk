import {
  AUTH_METHOD_TYPE,
  AUTH_METHOD_TYPE_VALUES,
  InvalidArgumentException,
  WrongParamFormat,
} from '@lit-protocol/constants';
import {
  AuthMethod,
  BaseProviderOptions,
  StytchOtpProviderOptions,
  StytchOtpAuthenticateOptions,
  StytchToken,
} from '@lit-protocol/types';

import { BaseProvider } from './BaseProvider';
import {
  FactorParser,
  emailOtpAuthFactorParser,
  smsOtpAuthFactorParser,
  totpAuthFactorParser,
  whatsAppOtpAuthFactorParser,
} from './StytchAuthFactors';

export default class StytchAuthFactorOtpProvider<
  T extends FactorParser
> extends BaseProvider {
  private _params: StytchOtpProviderOptions;
  private _factor: T;
  private static _provider: string = 'https://stytch.com/session';

  constructor(
    params: BaseProviderOptions,
    config: StytchOtpProviderOptions,
    factor: T
  ) {
    super(params);
    this._params = config;
    this._factor = factor;
  }

  /**
   * Validates claims within a stytch authenticated JSON Web Token
   * Will parse out the given `authentication factor` and use the transport
   * for the otp code as the `user identifier` for the given auth method.
   * @param options authentication option containing the authenticated token
   * @returns {AuthMethod} Authentication Method for auth method type OTP
   *
   */
  public async authenticate<T>(options?: T | undefined): Promise<AuthMethod> {
    return new Promise<AuthMethod>((resolve, reject) => {
      if (!options) {
        reject(
          new Error(
            'No Authentication options provided, please supply an authenticated JWT'
          )
        );
      }

      const accessToken: string | undefined = (
        options as unknown as StytchOtpAuthenticateOptions
      )?.accessToken;
      if (!accessToken) {
        reject(
          new Error('No access token provided, please provide a stych auth jwt')
        );
      }

      const parsedToken: StytchToken =
        StytchAuthFactorOtpProvider._parseJWT(accessToken);
      const factorParser = StytchAuthFactorOtpProvider._resolveAuthFactor(
        this._factor
      );

      try {
        factorParser.parser(parsedToken, StytchAuthFactorOtpProvider._provider);
      } catch (e) {
        reject(e);
      }

      resolve({
        authMethodType: factorParser.authMethodType,
        accessToken: accessToken,
      });
    });
  }

  /**
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<string>} - Auth method id
   */
  public async getAuthMethodId(authMethod: AuthMethod): Promise<string> {
    return StytchAuthFactorOtpProvider.authMethodId(authMethod);
  }

  /**
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method.
   * Will parse out the given `authentication factor` and use the transport
   * for the otp code as the `user identifier` for the given auth method.
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<string>} - Auth method id
   */
  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const accessToken = authMethod.accessToken;
      const parsedToken: StytchToken =
        StytchAuthFactorOtpProvider._parseJWT(accessToken);
      let factor: FactorParser = 'email';
      switch (authMethod.authMethodType) {
        case AUTH_METHOD_TYPE.StytchEmailFactorOtp:
          factor = 'email';
          break;
        case AUTH_METHOD_TYPE.StytchSmsFactorOtp:
          factor = 'sms';
          break;
        case AUTH_METHOD_TYPE.StytchWhatsAppFactorOtp:
          factor = 'whatsApp';
          break;
        case AUTH_METHOD_TYPE.StytchTotpFactorOtp:
          factor = 'totp';
          break;
        default:
          throw new InvalidArgumentException(
            {
              info: {
                authMethodType: authMethod.authMethodType,
              },
            },
            'Unsupport stytch auth type'
          );
      }
      const factorParser = this._resolveAuthFactor(factor).parser;
      try {
        resolve(factorParser(parsedToken, this._provider));
      } catch (e) {
        reject(e);
      }
    });
  }

  private static _resolveAuthFactor(factor: FactorParser): {
    parser: Function;
    authMethodType: AUTH_METHOD_TYPE_VALUES;
  } {
    switch (factor) {
      case 'email':
        return {
          parser: emailOtpAuthFactorParser,
          authMethodType: AUTH_METHOD_TYPE.StytchEmailFactorOtp,
        };
      case 'sms':
        return {
          parser: smsOtpAuthFactorParser,
          authMethodType: AUTH_METHOD_TYPE.StytchSmsFactorOtp,
        };
      case 'whatsApp':
        return {
          parser: whatsAppOtpAuthFactorParser,
          authMethodType: AUTH_METHOD_TYPE.StytchWhatsAppFactorOtp,
        };
      case 'totp':
        return {
          parser: totpAuthFactorParser,
          authMethodType: AUTH_METHOD_TYPE.StytchTotpFactorOtp,
        };
    }
  }

  /**
   *
   * @param jwt token to parse
   * @returns {string}- userId contained within the token message
   */
  private static _parseJWT(jwt: string): StytchToken {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new WrongParamFormat(
        {
          info: {
            jwt,
          },
        },
        'Invalid token length'
      );
    }
    const body = Buffer.from(parts[1], 'base64');
    const parsedBody: StytchToken = JSON.parse(body.toString('ascii'));
    return parsedBody;
  }
}
