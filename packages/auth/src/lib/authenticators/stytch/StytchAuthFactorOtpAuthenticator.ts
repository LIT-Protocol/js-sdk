import {
  AUTH_METHOD_TYPE,
  AUTH_METHOD_TYPE_VALUES,
  InvalidArgumentException,
  WrongParamFormat,
} from '@lit-protocol/constants';
import { AuthMethod, StytchToken } from '@lit-protocol/types';

import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { AuthMethodTypeStringMap } from '../../types';
import {
  FactorParser,
  emailOtpAuthFactorParser,
  smsOtpAuthFactorParser,
  totpAuthFactorParser,
  whatsAppOtpAuthFactorParser,
} from './parsers';

export type StytchAuthFactorOtpConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  accessToken: string;
  factor: FactorParser;
};

/**
 * @deprecated - we need to break this out into a separate authenticator as they are different auth method type
 * eg. 
    StytchEmailFactorOtp: "StytchEmailFactorOtp";
    StytchSmsFactorOtp: "StytchSmsFactorOtp";
    StytchWhatsAppFactorOtp: "StytchWhatsAppFactorOtp";
    StytchTotpFactorOtp: "StytchTotpFactorOtp";

    public static id = AuthMethodTypeStringMap.StytchEmailFactorOtp;
    public static id = AuthMethodTypeStringMap.StytchSmsFactorOtp;
    public static id = AuthMethodTypeStringMap.StytchWhatsAppFactorOtp;
    public static id = AuthMethodTypeStringMap.StytchTotpFactorOtp;
 */
export class StytchAuthFactorOtpAuthenticator<T extends FactorParser> {
  public static id = AuthMethodTypeStringMap.StytchOtp;

  private static _provider: string = 'https://stytch.com/session';

  constructor(public config: StytchAuthFactorOtpConfig) {}

  /**
   * Validates claims within a stytch authenticated JSON Web Token
   * Will parse out the given `authentication factor` and use the transport
   * for the otp code as the `user identifier` for the given auth method.
   * @param options authentication option containing the authenticated token
   * @returns {AuthMethod} Authentication Method for auth method type OTP
   *
   */
  public static async authenticate(
    options: StytchAuthFactorOtpConfig
  ): Promise<AuthMethod> {
    return new Promise<AuthMethod>((resolve, reject) => {
      const accessToken: string | undefined = options.accessToken;
      if (!accessToken) {
        reject(
          new Error('No access token provided, please provide a stych auth jwt')
        );
        return;
      }

      try {
        const parsedToken: StytchToken =
          StytchAuthFactorOtpAuthenticator._parseJWT(accessToken);

        const factorParser =
          StytchAuthFactorOtpAuthenticator._resolveAuthFactor(options.factor);

        factorParser.parser(
          parsedToken,
          StytchAuthFactorOtpAuthenticator._provider
        );

        resolve({
          authMethodType: factorParser.authMethodType,
          accessToken: accessToken,
        });
      } catch (e) {
        reject(e);
      }
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
  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const accessToken = authMethod.accessToken;
      if (!accessToken) {
        reject(new Error('Access token missing from AuthMethod'));
        return;
      }
      try {
        const parsedToken: StytchToken =
          StytchAuthFactorOtpAuthenticator._parseJWT(accessToken);
        let factor: FactorParser;
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
              'Unsupported stytch auth type for authMethodId generation'
            );
        }
        const factorResolver = this._resolveAuthFactor(factor);
        const authId = factorResolver.parser(parsedToken, this._provider);
        resolve(authId);
      } catch (e) {
        reject(e);
      }
    });
  }

  private static _resolveAuthFactor(factor: FactorParser): {
    parser: (parsedToken: StytchToken, provider: string) => string;
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
      default:
        throw new InvalidArgumentException(
          { info: { factor } },
          `Invalid factor type: ${factor}`
        );
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
