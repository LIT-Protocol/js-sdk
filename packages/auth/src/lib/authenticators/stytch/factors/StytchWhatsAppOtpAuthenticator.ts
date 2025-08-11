import { AUTH_METHOD_TYPE, WrongParamFormat } from '@lit-protocol/constants';
import { AuthData } from '@lit-protocol/schemas';
import { AuthMethod, StytchToken } from '@lit-protocol/types';
import { AuthMethodTypeStringMap } from '../../../types';
import { whatsAppOtpAuthFactorParser } from '../parsers';

/**
 * Configuration for initiating the Stytch WhatsApp OTP sending process.
 */
export type StytchWhatsAppOtpSendOtpConfig = {
  phoneNumber: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Configuration for the Stytch WhatsApp OTP authenticate method.
 */
export type StytchWhatsAppOtpAuthConfig = {
  /** The method ID obtained from Stytch after initiating OTP. */
  methodId: string;
  /** The OTP code entered by the user. */
  code: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Authenticator for Stytch WhatsApp OTP.
 * This class handles authentication and auth method ID generation for PKPs
 * associated with Stytch WhatsApp OTP, by interacting with a backend service.
 */
export class StytchWhatsAppOtpAuthenticator {
  public static id = AuthMethodTypeStringMap.StytchWhatsAppFactorOtp;
  private static _provider: string = 'https://stytch.com/session'; // Stytch session identifier in the JWT

  /**
   * Initiates the Stytch WhatsApp OTP process by calling your backend service.
   *
   * @param {StytchWhatsAppOtpSendOtpConfig} options - Configuration for sending the OTP.
   * @returns {Promise<{ methodId: string }>} The method ID from Stytch, returned by your auth service.
   */
  public static async sendOtp(
    options: StytchWhatsAppOtpSendOtpConfig
  ): Promise<{ methodId: string }> {
    const { phoneNumber, authServiceBaseUrl } = options;
    const endpoint = `${authServiceBaseUrl}/auth/stytch/whatsapp/send-otp`; // Adjusted endpoint for WhatsApp

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to send Stytch WhatsApp OTP. Status: ${response.status}. Body: ${errorBody}`
        );
      }

      const responseData = await response.json();
      if (!responseData.methodId) {
        throw new Error(
          'methodId not found in response from auth service for WhatsApp OTP'
        );
      }
      return { methodId: responseData.methodId };
    } catch (e: any) {
      console.error('Error in StytchWhatsAppOtpAuthenticator sendOtp:', e);
      throw e;
    }
  }

  /**
   * Authenticates with Stytch WhatsApp OTP by verifying the code via your backend service,
   * then generates AuthData.
   *
   * @param {StytchWhatsAppOtpAuthConfig} options - Authentication options.
   * @returns {Promise<AuthData>} Authentication Data containing the AuthMethod and its ID.
   */
  public static async authenticate(
    options: StytchWhatsAppOtpAuthConfig
  ): Promise<AuthData> {
    const { methodId, code, authServiceBaseUrl } = options;
    const verifyEndpoint = `${authServiceBaseUrl}/auth/stytch/whatsapp/verify-otp`; // Adjusted endpoint for WhatsApp
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
          `Failed to verify Stytch WhatsApp OTP. Status: ${verifyResponse.status}. Body: ${errorBody}`
        );
      }
      const verifyData = await verifyResponse.json();
      if (!verifyData.accessToken) {
        throw new Error(
          'accessToken not found in response from auth service for WhatsApp OTP'
        );
      }
      accessToken = verifyData.accessToken;
      userId = verifyData.userId;
    } catch (e: any) {
      console.error('Error verifying WhatsApp OTP via auth service:', e);
      throw e;
    }

    return new Promise<AuthData>(async (resolve, reject) => {
      if (!accessToken) {
        reject(
          new Error(
            'No access token obtained from auth service for WhatsApp OTP.'
          )
        );
        return;
      }

      try {
        const parsedToken: StytchToken =
          StytchWhatsAppOtpAuthenticator._parseJWT(accessToken);

        whatsAppOtpAuthFactorParser(
          parsedToken,
          StytchWhatsAppOtpAuthenticator._provider
        );

        const authMethod: AuthMethod = {
          authMethodType: AUTH_METHOD_TYPE.StytchWhatsAppFactorOtp,
          accessToken: accessToken,
        };

        const generatedAuthMethodId =
          await StytchWhatsAppOtpAuthenticator.authMethodId(authMethod);

        resolve({
          ...authMethod,
          authMethodId: generatedAuthMethodId,
          metadata: {
            userId,
          },
        });
      } catch (e) {
        console.error('Error processing Stytch WhatsApp token:', e);
        reject(e);
      }
    });
  }

  /**
   * Generates the auth method ID for a Stytch WhatsApp OTP.
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
            'Access token missing from AuthMethod for WhatsApp authMethodId generation'
          )
        );
        return;
      }
      try {
        const parsedToken: StytchToken =
          StytchWhatsAppOtpAuthenticator._parseJWT(accessToken);
        const authId = whatsAppOtpAuthFactorParser(
          parsedToken,
          StytchWhatsAppOtpAuthenticator._provider
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
