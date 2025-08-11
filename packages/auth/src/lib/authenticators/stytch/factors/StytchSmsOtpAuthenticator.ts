import { AUTH_METHOD_TYPE, WrongParamFormat } from '@lit-protocol/constants';
import { AuthData } from '@lit-protocol/schemas';
import { AuthMethod, StytchToken } from '@lit-protocol/types';
import { AuthMethodTypeStringMap } from '../../../types';
import { smsOtpAuthFactorParser } from '../parsers';

/**
 * Configuration for initiating the Stytch SMS OTP sending process.
 */
export type StytchSmsOtpSendOtpConfig = {
  phoneNumber: string; // Changed from email to phoneNumber
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Configuration for the Stytch SMS OTP authenticate method.
 */
export type StytchSmsOtpAuthConfig = {
  /** The method ID obtained from Stytch after initiating OTP. */
  methodId: string;
  /** The OTP code entered by the user. */
  code: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Authenticator for Stytch SMS OTP.
 * This class handles authentication and auth method ID generation for PKPs
 * associated with Stytch SMS OTP, by interacting with a backend service.
 */
export class StytchSmsOtpAuthenticator {
  public static id = AuthMethodTypeStringMap.StytchSmsFactorOtp;
  private static _provider: string = 'https://stytch.com/session'; // Stytch session identifier in the JWT

  /**
   * Initiates the Stytch SMS OTP process by calling your backend service.
   *
   * @param {StytchSmsOtpSendOtpConfig} options - Configuration for sending the OTP.
   * @returns {Promise<{ methodId: string }>} The method ID from Stytch, returned by your auth service.
   */
  public static async sendOtp(
    options: StytchSmsOtpSendOtpConfig
  ): Promise<{ methodId: string }> {
    const { phoneNumber, authServiceBaseUrl } = options;
    const endpoint = `${authServiceBaseUrl}/auth/stytch/sms/send-otp`; // Adjusted endpoint for SMS

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }), // Sending phoneNumber
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to send Stytch SMS OTP. Status: ${response.status}. Body: ${errorBody}`
        );
      }

      const responseData = await response.json();
      if (!responseData.methodId) {
        throw new Error(
          'methodId not found in response from auth service for SMS OTP'
        );
      }
      return { methodId: responseData.methodId };
    } catch (e: any) {
      console.error('Error in StytchSmsOtpAuthenticator sendOtp:', e);
      throw e;
    }
  }

  /**
   * Authenticates with Stytch SMS OTP by verifying the code via your backend service,
   * then generates AuthData.
   *
   * @param {StytchSmsOtpAuthConfig} options - Authentication options.
   * @returns {Promise<AuthData>} Authentication Data containing the AuthMethod and its ID.
   */
  public static async authenticate(
    options: StytchSmsOtpAuthConfig
  ): Promise<AuthData> {
    const { methodId, code, authServiceBaseUrl } = options;
    const verifyEndpoint = `${authServiceBaseUrl}/auth/stytch/sms/verify-otp`; // Adjusted endpoint for SMS
    let accessToken: string;
    let userId: string;

    try {
      const verifyResponse = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ methodId, code }),
      });

      if (!verifyResponse.ok) {
        const errorBody = await verifyResponse.text();
        throw new Error(
          `Failed to verify Stytch SMS OTP. Status: ${verifyResponse.status}. Body: ${errorBody}`
        );
      }
      const verifyData = await verifyResponse.json();
      if (!verifyData.accessToken) {
        throw new Error(
          'accessToken not found in response from auth service for SMS OTP'
        );
      }
      accessToken = verifyData.accessToken;
      userId = verifyData.userId;
    } catch (e: any) {
      console.error('Error verifying SMS OTP via auth service:', e);
      throw e;
    }

    return new Promise<AuthData>(async (resolve, reject) => {
      if (!accessToken) {
        reject(
          new Error('No access token obtained from auth service for SMS OTP.')
        );
        return;
      }

      try {
        const parsedToken: StytchToken =
          StytchSmsOtpAuthenticator._parseJWT(accessToken);

        smsOtpAuthFactorParser(
          parsedToken,
          StytchSmsOtpAuthenticator._provider
        );

        const authMethod: AuthMethod = {
          authMethodType: AUTH_METHOD_TYPE.StytchSmsFactorOtp,
          accessToken: accessToken,
        };

        const generatedAuthMethodId =
          await StytchSmsOtpAuthenticator.authMethodId(authMethod);

        resolve({
          ...authMethod,
          authMethodId: generatedAuthMethodId,
          metadata: {
            userId,
          },
        });
      } catch (e) {
        console.error('Error processing Stytch SMS token:', e);
        reject(e);
      }
    });
  }

  /**
   * Generates the auth method ID for a Stytch SMS OTP.
   *
   * @param {AuthMethod} authMethod - Auth method object containing the Stytch accessToken.
   * @returns {Promise<string>} - Auth method ID.
   */
  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const accessToken = authMethod.accessToken;
      if (!accessToken) {
        reject(
          new Error(
            'Access token missing from AuthMethod for SMS authMethodId generation'
          )
        );
        return;
      }
      try {
        const parsedToken: StytchToken =
          StytchSmsOtpAuthenticator._parseJWT(accessToken);
        const authId = smsOtpAuthFactorParser(
          parsedToken,
          StytchSmsOtpAuthenticator._provider
        );
        resolve(authId);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Parses a JWT token.
   *
   * @param {string} jwt - Token to parse.
   * @returns {StytchToken} - Parsed token body.
   * @throws {WrongParamFormat} If the token format is invalid.
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
