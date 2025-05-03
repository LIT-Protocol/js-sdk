import { ethers } from 'ethers';

import { AUTH_METHOD_TYPE, WrongParamFormat } from '@lit-protocol/constants';
import {
  AuthMethod,
  StytchOtpAuthenticateOptions,
  StytchToken,
} from '@lit-protocol/types';

import { StytchOtpConfig } from '../../auth-manager';

export class StytchOtpAuthenticator {
  private _provider: string = 'https://stytch.com/session';

  constructor(public config: StytchOtpConfig) {}

  /**
   * Validates claims within a stytch authenticated JSON Web Token
   * @param options authentication option containing the authenticated token
   * @returns {Promise<AuthMethod>} Authentication Method for auth method type OTP
   * */
  authenticate(options: StytchOtpConfig): Promise<AuthMethod> {
    return new Promise<AuthMethod>((resolve, reject) => {
      const userId: string | undefined =
        options.userId ??
        (options as StytchOtpAuthenticateOptions)?.userId;

      const accessToken: string | undefined = options.accessToken;
      if (!accessToken) {
        reject(
          new Error('No access token provided, please provide a stytch auth jwt')
        );
        return;
      }

      try {
        const parsedToken: StytchToken =
          StytchOtpAuthenticator._parseJWT(accessToken);
        const audience = (parsedToken['aud'] as string[])[0];
        if (audience != options.appId) {
          reject(new Error('Parsed application id does not match parameters'));
          return;
        }

        if (!audience) {
          reject(
            new Error(
              'could not find project id in token body, is this a stych token?'
            )
          );
          return;
        }
        const session = parsedToken[this._provider];
        const authFactor = session['authentication_factors'][0];

        if (!authFactor) {
          reject(new Error('Could not find authentication info in session'));
          return;
        }

        if (userId && userId != parsedToken['sub']) {
          reject(
            new Error(
              'UserId does not match token contents. is this the right token for your application?'
            )
          );
          return;
        }

        resolve({
          authMethodType: AUTH_METHOD_TYPE.StytchOtp,
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
  public static async getAuthMethodId(authMethod: AuthMethod): Promise<string> {
    return StytchOtpAuthenticator.authMethodId(authMethod);
  }

  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    const tokenBody = StytchOtpAuthenticator._parseJWT(authMethod.accessToken);
    const userId = tokenBody['sub'] as string;
    const orgId = (tokenBody['aud'] as string[])[0];
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId.toLowerCase()}:${orgId.toLowerCase()}`)
    );
    return authMethodId;
  }

  /**
   *
   * @param jwt token to parse
   * @returns {string}- userId contained within the token message
   */
  public static _parseJWT(jwt: string): StytchToken {
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
