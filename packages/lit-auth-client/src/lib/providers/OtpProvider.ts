import { AuthMethodType } from '@lit-protocol/constants';
import {
  AuthMethod,
  BaseAuthenticateOptions,
  BaseProviderOptions,
  StychToken
} from '@lit-protocol/types';
import { BaseProvider } from './BaseProvider';
import { OtpProviderOptions } from '@lit-protocol/types';

export class OtpProvider extends BaseProvider {
  private _params: OtpProviderOptions | undefined;
  private _provider: string = "https://stytch.com/session";
  private _authFactors: string[] = ['email_factor', 'sms_factor'];

  constructor(
    params: BaseProviderOptions,
    config?: OtpProviderOptions
  ) {
    super(params);
    this._params = config;
  }

  override authenticate<T extends BaseAuthenticateOptions>(options?: T | undefined): Promise<AuthMethod> {
    return new Promise<AuthMethod>((resolve, reject) => {
      if (!options && !this._params) {
        throw new Error("No Authentication options provided, please supply an authenticated JWT");
      }
      const userId: string = (options as unknown as OtpProviderOptions)?.userId ?? this?._params?.userId;
      if (!userId) {
        throw new Error("User id must be provided");
      }
      const accessToken: string | undefined = (options as unknown as OtpProviderOptions)?.accessToken ?? this._params?.accessToken;
      if (!accessToken) {
        throw new Error("No access token provided, please provide a stych auth jwt");
      }

      const parsedToken: StychToken = this._parseJWT(accessToken);
      console.log(`otpProvider: parsed token body`, parsedToken);
      const audience = (parsedToken['aud'] as string[])[0];
      if (!audience) { throw new Error("could not find project id in token body, is this a stych token?"); }
      const session = parsedToken[this._provider];
      const authFactor = session['authentication_factors'][0];
      for (const factor in this._authFactors) {
        const authInfo = authFactor[factor];
        if (authInfo) {
          if (authInfo["email_address"] == userId) {
            throw new Error("userId and session authentication do not match");
          }
        }
      }

      resolve({
        authMethodType: AuthMethodType.OTP,
        accessToken: accessToken
      });
    });
  }

  /**
 *
 * @param jwt token to parse
 * @returns {string}- userId contained within the token message
 */
 private _parseJWT(jwt: string): StychToken {
	const parts = jwt.split(".");
	if (parts.length !== 3) {
		throw new Error("Invalid token length");
	}
	const body =  Buffer.from(parts[1], 'base64');
	const parsedBody: StychToken = JSON.parse(body.toString('ascii'));
	console.log("JWT body: ", parsedBody);
	return parsedBody;
}
}
