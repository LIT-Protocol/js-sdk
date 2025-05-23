/**
 * Stytch TOTP (Time-based One-Time Password) authentication routes
 * Handles TOTP authentication operations
 */

import { Elysia, t } from 'elysia';
import { resp } from '../../../response-helpers/response-helpers';

export const stytchTotpRoutes = <
  T extends Elysia<any, any, any, any, any, any, any>
>(
  app: T
): T => {
  // =============================================================
  //        VERIFY: Stytch TOTP (/auth/stytch/totp)
  // =============================================================
  app.post(
    '/stytch/totp/authenticate',
    async ({ body, stytchClient }) => {
      try {
        // Ensure your Stytch client is configured for the correct environment (test/live)
        // Parameters for totps.authenticate might vary slightly based on Stytch product (Consumer vs B2B)
        // For Consumer, user_id and totp_code are typical.
        // For B2B, it might be organization_id, member_id, and code/totp_code.
        // This example assumes Consumer product with user_id.
        const authResponse = await stytchClient.totps.authenticate({
          user_id: body.userId,
          totp_code: body.totpCode,
          session_duration_minutes: 60 * 24 * 7, // Example: 1 week session
          // If authenticating a new TOTP registration (second step of registration),
          // you might also need `totp_id` here.
          // For login with an existing/verified TOTP, user_id and code are usually sufficient.
        });
        return resp.SUCCESS({ accessToken: authResponse.session_jwt });
      } catch (error: any) {
        console.error('[AuthServer] Stytch TOTP Authenticate Error:', error);
        const errorMessage =
          error.error_message || 'Failed to authenticate TOTP via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        userId: t.String(), // Stytch user_id
        totpCode: t.String(), // 6-digit TOTP code
        // Add organizationId and memberId if using Stytch B2B
      }),
      detail: {
        summary: 'Authenticate Stytch TOTP',
        description:
          'Authenticates a TOTP code for a given user and returns a Stytch session JWT.',
        tags: ['Auth - Stytch'],
      },
    }
  );

  // Optional: Add endpoints for TOTP registration if needed
  // POST /stytch/totp/create-registration  (calls stytchClient.totps.create())
  // POST /stytch/totp/verify-registration (calls stytchClient.totps.authenticate() with totp_id)

  // =============================================================
  //        CREATE: Stytch TOTP Registration (/auth/stytch/totp/create-registration)
  // =============================================================
  app.post(
    '/stytch/totp/create-registration',
    async ({ body, stytchClient }) => {
      try {
        // Create a TOTP registration for the user
        // This generates a secret and QR code that the user can add to their authenticator app
        const createResponse = await stytchClient.totps.create({
          user_id: body.userId,
          expiration_minutes: 5, // How long the registration is valid for
        });

        return resp.SUCCESS({
          totpRegistrationId: createResponse.totp_id,
          secret: createResponse.secret,
          qrCode: createResponse.qr_code,
          recoveryCodes: createResponse.recovery_codes,
        });
      } catch (error: any) {
        console.error(
          '[AuthServer] Stytch TOTP Create Registration Error:',
          error
        );
        const errorMessage =
          error.error_message ||
          'Failed to create TOTP registration via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        userId: t.String(), // Stytch user_id
      }),
      detail: {
        summary: 'Create Stytch TOTP Registration',
        description:
          'Creates a new TOTP registration for a user, returning secret and QR code for authenticator app setup.',
        tags: ['Auth - Stytch'],
      },
    }
  );

  // =============================================================
  //        VERIFY: Stytch TOTP Registration (/auth/stytch/totp/verify-registration)
  // =============================================================
  app.post(
    '/stytch/totp/verify-registration',
    async ({ body, stytchClient }) => {
      try {
        // Verify the TOTP registration by authenticating with the registration ID
        // This confirms the user has successfully set up their authenticator app
        const verifyResponse = await stytchClient.totps.authenticate({
          user_id: body.userId,
          // totp_id: body.totpRegistrationId,
          totp_code: body.totpCode,
          session_duration_minutes: 60 * 24 * 7, // Example: 1 week session
        });

        return resp.SUCCESS({
          accessToken: verifyResponse.session_jwt,
          totpId: verifyResponse.totp_id, // The verified TOTP ID for future authentications
          userId: verifyResponse.user_id,
        });
      } catch (error: any) {
        console.error(
          '[AuthServer] Stytch TOTP Verify Registration Error:',
          error
        );
        const errorMessage =
          error.error_message ||
          'Failed to verify TOTP registration via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        totpRegistrationId: t.String(), // From create-registration response
        totpCode: t.String(), // 6-digit TOTP code from user's authenticator app
        userId: t.String(),
      }),
      detail: {
        summary: 'Verify Stytch TOTP Registration',
        description:
          "Verifies a TOTP registration by validating the code from the user's authenticator app.",
        tags: ['Auth - Stytch'],
      },
    }
  );

  return app;
};
