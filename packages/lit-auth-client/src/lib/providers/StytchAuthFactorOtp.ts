import { AuthMethodType } from '@lit-protocol/constants';
import { BaseProvider } from './BaseProvider';
import {
  BaseAuthenticateOptions,
  AuthMethod,
  BaseProviderOptions,
  StytchOtpProviderOptions,
  StytchOtpAuthenticateOptions,
  StytchToken,
} from '@lit-protocol/types';

export interface EmailAuthFactor {
  email_address: string;
  email_id: string;
  created_at: string;
  delivery_method: string;
  last_authenticated_at: string;
  type: string;
  updated_at: string;
}
import { ethers } from 'ethers';
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
  private _provider: string = 'https://stytch.com/session';
  private _factor: T;
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
   *
   *
   */
  public async authenticate<T extends BaseAuthenticateOptions>(
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

      const accessToken: string | undefined = (
        options as unknown as StytchOtpAuthenticateOptions
      )?.accessToken;
      if (!accessToken) {
        reject(
          new Error('No access token provided, please provide a stych auth jwt')
        );
      }

      const parsedToken: StytchToken = this._parseJWT(accessToken);
      const factorParser = this._resolveAuthFactor(this._factor);

      try {
        factorParser(parsedToken, this._provider);
      } catch (e) {
        reject(e);
      }

      resolve({
        authMethodType: AuthMethodType.StytchOtp,
        accessToken: accessToken,
      });
    });
  }

  public async getAuthMethodId(
    authMethod: AuthMethod,
    options?: any
  ): Promise<string> {
    return new Promise<string>((_resolve, _reject) => {
      const accessToken = authMethod.accessToken;
      const parsedToken: StytchToken = this._parseJWT(accessToken);
      const factorParser = this._resolveAuthFactor(this._factor);

      return factorParser(parsedToken, this._provider);
    });
  }

  private _resolveAuthFactor(factor: T): Function {
    switch (factor) {
      case 'email':
        return emailOtpAuthFactorParser;
      case 'sms':
        return smsOtpAuthFactorParser;
      case 'whatsapp':
        return whatsAppOtpAuthFactorParser;
      case 'totp':
        return totpAuthFactorParser;
    }

    // if we get here somehow its bad so just return a function that will blow up in the caller
    return () => {};
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
