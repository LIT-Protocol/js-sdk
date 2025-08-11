import { AUTH_METHOD_TYPE, WrongParamFormat } from '@lit-protocol/constants';
import { AuthData } from '@lit-protocol/schemas';
import { AuthMethod, StytchToken } from '@lit-protocol/types';
import { AuthMethodTypeStringMap } from '../../../types';
import { emailOtpAuthFactorParser } from '../parsers';

/**
 * Configuration for initiating the Stytch Email OTP sending process.
 */
export type StytchEmailOtpSendOtpConfig = {
  email: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Configuration for the Stytch Email OTP authenticate method.
 */
export type StytchEmailOtpAuthConfig = {
  /** The method ID obtained from Stytch after initiating OTP. */
  methodId: string;
  /** The OTP code entered by the user. */
  code: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Authenticator for Stytch Email OTP.
 * This class handles authentication and auth method ID generation for PKPs
 * associated with Stytch Email OTP, by interacting with a backend service.
 */
export class StytchEmailOtpAuthenticator {
  public static id = AuthMethodTypeStringMap.StytchEmailFactorOtp;
  private static _provider: string = 'https://stytch.com/session'; // Stytch session identifier in the JWT

  // Constructor is not strictly needed if all methods are static and don't rely on instance state.
  // If you had instance-specific configurations (like authServiceBaseUrl pre-set), you might use it.
  // constructor() {}

  /**
   * Initiates the Stytch Email OTP process by calling your backend service.
   *
   * @param {StytchEmailOtpSendOtpConfig} options - Configuration for sending the OTP.
   * @returns {Promise<{ methodId: string }>} The method ID from Stytch, returned by your auth service.
   */
  public static async sendOtp(
    options: StytchEmailOtpSendOtpConfig
  ): Promise<{ methodId: string }> {
    const { email, authServiceBaseUrl } = options;
    const endpoint = `${authServiceBaseUrl}/auth/stytch/email/send-otp`; // Example endpoint

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to send Stytch Email OTP. Status: ${response.status}. Body: ${errorBody}`
        );
      }

      const responseData = await response.json();
      if (!responseData.methodId) {
        throw new Error('methodId not found in response from auth service');
      }
      return {
        methodId: responseData.methodId,
      };
    } catch (e: any) {
      console.error('Error in sendOtp:', e);
      throw e; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Authenticates with Stytch Email OTP by verifying the code via your backend service,
   * then generates AuthData.
   *
   * @param {StytchEmailOtpAuthConfig} options - Authentication options.
   * @returns {Promise<AuthData>} Authentication Data containing the AuthMethod and its ID.
   */
  public static async authenticate(
    options: StytchEmailOtpAuthConfig
  ): Promise<AuthData> {
    const { methodId, code, authServiceBaseUrl } = options;
    const verifyEndpoint = `${authServiceBaseUrl}/auth/stytch/email/verify-otp`; // Example endpoint
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
          `Failed to verify Stytch Email OTP. Status: ${verifyResponse.status}. Body: ${errorBody}`
        );
      }
      const verifyData = await verifyResponse.json();
      if (!verifyData.accessToken) {
        throw new Error('accessToken not found in response from auth service');
      }

      accessToken = verifyData.accessToken;
      userId = verifyData.userId;
    } catch (e: any) {
      console.error('Error verifying OTP via auth service:', e);
      throw e; // Re-throw the error
    }

    // At this point, accessToken is the Stytch session JWT obtained from your auth service.
    // The rest of the logic is similar to what you had before.
    return new Promise<AuthData>(async (resolve, reject) => {
      if (!accessToken) {
        // This case should ideally be caught by the try/catch above
        reject(new Error('No access token obtained from auth service.'));
        return;
      }

      try {
        // Validate the Stytch JWT structure and extract necessary claims for authMethodId generation.
        // The _parseJWT and emailOtpAuthFactorParser are used here as before.
        const parsedToken: StytchToken =
          StytchEmailOtpAuthenticator._parseJWT(accessToken);

        // The parser also implicitly validates if the token contains the expected email factor info.
        emailOtpAuthFactorParser(
          parsedToken,
          StytchEmailOtpAuthenticator._provider
        );

        const authMethod: AuthMethod = {
          authMethodType: AUTH_METHOD_TYPE.StytchEmailFactorOtp,
          accessToken: accessToken,
        };

        // Generate authMethodId using the obtained and parsed accessToken
        const generatedAuthMethodId =
          await StytchEmailOtpAuthenticator.authMethodId(authMethod);

        resolve({
          ...authMethod,
          authMethodId: generatedAuthMethodId,
          metadata: {
            userId,
          },
        });
      } catch (e) {
        console.error('Error processing Stytch token:', e);
        reject(e);
      }
    });
  }

  /**
   * Generates the auth method ID for a Stytch Email OTP.
   * (This method remains largely the same as it operates on the accessToken)
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
            'Access token missing from AuthMethod for authMethodId generation'
          )
        );
        return;
      }
      try {
        const parsedToken: StytchToken =
          StytchEmailOtpAuthenticator._parseJWT(accessToken);
        const authId = emailOtpAuthFactorParser(
          parsedToken,
          StytchEmailOtpAuthenticator._provider
        );
        resolve(authId);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Parses a JWT token.
   * (This method remains the same)
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
