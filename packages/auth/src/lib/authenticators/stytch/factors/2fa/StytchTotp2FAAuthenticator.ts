import { AUTH_METHOD_TYPE, WrongParamFormat } from '@lit-protocol/constants';
import { AuthData } from '@lit-protocol/schemas';
import { AuthMethod, StytchToken } from '@lit-protocol/types';
import { AuthMethodTypeStringMap } from '../../../../types';
import { totpAuthFactorParser } from '../../parsers';
import { getChildLogger } from '@lit-protocol/logger';

const _logger = getChildLogger({ module: 'StytchTotp2FAAuthenticator' });

/**
 * Configuration for the Stytch TOTP authenticate method.
 */
export type StytchTotpAuthConfig = {
  /** The Stytch user_id for whom the TOTP is being verified. */
  userId: string;
  /** The 6-digit code from the user's authenticator app. */
  totpCode: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
  // Add organizationId and memberId if using Stytch B2B, and adjust backend accordingly
};

/**
 * Configuration for initiating TOTP registration.
 */
export type TotpRegistrationInitConfig = {
  /** The Stytch user_id for whom to create TOTP registration. */
  userId: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Configuration for verifying TOTP registration.
 */
export type TotpRegistrationVerifyConfig = {
  /** The Stytch user_id for whom to verify TOTP registration. */
  userId: string;
  /** The TOTP registration ID returned from initiateTotpRegistration. */
  totpRegistrationId: string;
  /** The 6-digit code from the user's authenticator app. */
  totpCode: string;
  /** Base URL of your authentication service that handles Stytch interaction. */
  authServiceBaseUrl: string;
};

/**
 * Response from initiating TOTP registration.
 */
export type TotpRegistrationResponse = {
  /** Registration ID for verification step. */
  totpRegistrationId: string;
  /** Secret key for manual entry in authenticator apps. */
  secret: string;
  /** QR code data URL for easy setup in authenticator apps. */
  qrCode: string;
  /** Recovery codes for backup access. */
  recoveryCodes: string[];
};

/**
 * Response from verifying TOTP registration.
 */
export type TotpRegistrationVerifyResponse = {
  /** Access token (Stytch session JWT). */
  accessToken: string;
  /** The verified TOTP ID for future authentications. */
  totpId: string;
};

/**
 * Authenticator for Stytch TOTP (Authenticator App).
 * This class handles authentication via a backend service for PKPs
 * associated with Stytch TOTP.
 */
export class StytchTotp2FAAuthenticator {
  public static id = AUTH_METHOD_TYPE.StytchTotpFactorOtp;
  private static _provider: string = 'https://stytch.com/session'; // Stytch session identifier in the JWT

  // Constructor not strictly needed for static methods

  /**
   * Authenticates with Stytch TOTP by verifying the code via your backend service,
   * then generates AuthData.
   *
   * @param {StytchTotpAuthConfig} options - Authentication options.
   * @returns {Promise<AuthData>} Authentication Data containing the AuthMethod and its ID.
   */
  public static async authenticate(
    options: StytchTotpAuthConfig
  ): Promise<AuthData> {
    const { userId, totpCode, authServiceBaseUrl } = options;
    // Example endpoint, adjust if Stytch B2B (member authentication) is used
    const verifyEndpoint = `${authServiceBaseUrl}/auth/stytch/totp/authenticate`;
    let accessToken: string;

    try {
      const verifyResponse = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, totpCode }), // Send userId and totpCode
      });

      if (!verifyResponse.ok) {
        const errorBody = await verifyResponse.text();
        throw new Error(
          `Failed to verify Stytch TOTP. Status: ${verifyResponse.status}. Body: ${errorBody}`
        );
      }
      const verifyData = await verifyResponse.json();
      if (!verifyData.accessToken) {
        throw new Error(
          'accessToken not found in response from auth service for TOTP'
        );
      }
      accessToken = verifyData.accessToken;
    } catch (e: any) {
      _logger.error({ e }, 'Error verifying TOTP via auth service');
      throw e;
    }

    return new Promise<AuthData>(async (resolve, reject) => {
      if (!accessToken) {
        reject(
          new Error('No access token obtained from auth service for TOTP.')
        );
        return;
      }

      try {
        const parsedToken: StytchToken =
          StytchTotp2FAAuthenticator._parseJWT(accessToken);

        // The totpAuthFactorParser will derive the authMethodId from the accessToken (Stytch Session JWT)
        totpAuthFactorParser(parsedToken, StytchTotp2FAAuthenticator._provider);

        const authMethod: AuthMethod = {
          authMethodType: AUTH_METHOD_TYPE.StytchTotpFactorOtp,
          accessToken: accessToken,
        };

        const generatedAuthMethodId =
          await StytchTotp2FAAuthenticator.authMethodId(authMethod);

        resolve({
          ...authMethod,
          authMethodId: generatedAuthMethodId,
        });
      } catch (e) {
        _logger.error({ e }, 'Error processing Stytch TOTP token');
        reject(e);
      }
    });
  }

  /**
   * Generates the auth method ID for a Stytch TOTP.
   * This uses the accessToken (Stytch Session JWT) to derive the ID.
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
            'Access token missing from AuthMethod for TOTP authMethodId generation'
          )
        );
        return;
      }
      try {
        const parsedToken: StytchToken =
          StytchTotp2FAAuthenticator._parseJWT(accessToken);
        const authId = totpAuthFactorParser(
          parsedToken,
          StytchTotp2FAAuthenticator._provider
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

  // Optional: Add methods for TOTP registration if needed by the client application
  // public static async initiateTotpRegistration(options: { userId: string; authServiceBaseUrl: string; }) { /* ... */ }
  // public static async verifyTotpRegistration(options: { userId: string; totpCode: string; totpRegistrationId: string; authServiceBaseUrl: string; }) { /* ... */ }

  /**
   * Initiates TOTP registration for a user by calling the backend service.
   * Returns secret and QR code for authenticator app setup.
   *
   * @param {TotpRegistrationInitConfig} options - Registration initiation options.
   * @returns {Promise<TotpRegistrationResponse>} Registration data including QR code and secret.
   */
  public static async initiateTotpRegistration(
    options: TotpRegistrationInitConfig
  ): Promise<TotpRegistrationResponse> {
    const { userId, authServiceBaseUrl } = options;
    const createEndpoint = `${authServiceBaseUrl}/auth/stytch/totp/create-registration`;

    try {
      const createResponse = await fetch(createEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(
          `Failed to create Stytch TOTP registration. Status: ${createResponse.status}. Body: ${errorBody}`
        );
      }

      const createData = await createResponse.json();

      _logger.debug({ createData }, 'TOTP registration create response');

      if (
        !createData.totpRegistrationId ||
        !createData.secret ||
        !createData.qrCode
      ) {
        throw new Error(
          'Missing required fields in response from TOTP registration creation'
        );
      }

      return {
        totpRegistrationId: createData.totpRegistrationId,
        secret: createData.secret,
        qrCode: createData.qrCode,
        recoveryCodes: createData.recoveryCodes || [],
      };
    } catch (e: any) {
      _logger.error(
        { e },
        'Error initiating TOTP registration via auth service'
      );
      throw e;
    }
  }

  /**
   * Verifies TOTP registration by validating the code from the user's authenticator app.
   * Completes the TOTP setup process.
   *
   * @param {TotpRegistrationVerifyConfig} options - Verification options.
   * @returns {Promise<TotpRegistrationVerifyResponse>} Verification response with access token.
   */
  public static async verifyTotpRegistration(
    options: TotpRegistrationVerifyConfig
  ): Promise<TotpRegistrationVerifyResponse> {
    const { userId, totpRegistrationId, totpCode, authServiceBaseUrl } =
      options;
    const verifyEndpoint = `${authServiceBaseUrl}/auth/stytch/totp/verify-registration`;

    try {
      const verifyResponse = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, totpRegistrationId, totpCode }),
      });

      if (!verifyResponse.ok) {
        const errorBody = await verifyResponse.text();
        throw new Error(
          `Failed to verify Stytch TOTP registration. Status: ${verifyResponse.status}. Body: ${errorBody}`
        );
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.accessToken) {
        throw new Error(
          'accessToken not found in response from TOTP registration verification'
        );
      }

      _logger.debug({ verifyData }, 'TOTP registration verify response');

      return {
        accessToken: verifyData.accessToken,
        totpId: verifyData.totpId || '',
      };
    } catch (e: any) {
      _logger.error(
        { e },
        'Error verifying TOTP registration via auth service'
      );
      throw e;
    }
  }
}
