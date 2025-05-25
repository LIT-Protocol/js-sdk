/**
 * Stytch Email OTP authentication routes
 * Handles email OTP send and verify operations
 */

import { Elysia, t } from 'elysia';
import { resp } from '../../../response-helpers/response-helpers';

export const stytchEmailRoutes = <
  T extends Elysia<any, any, any, any, any, any, any>
>(
  app: T
): T => {
  // =============================================================
  //            SEND: Stytch Email OTP (/auth/stytch/email)
  // =============================================================
  app.post(
    '/stytch/email/send-otp',
    async ({ body, stytchClient }) => {
      try {
        const stytchResponse = await stytchClient.otps.email.loginOrCreate({
          email: body.email,
          // You can add other parameters like expiration_minutes if needed
        });

        console.log('stytchResponse', stytchResponse);
        // Assuming stytchResponse.email_id is available and can be used as methodId for the authenticate step.
        // Verify with your Stytch SDK version.
        return resp.SUCCESS({ methodId: stytchResponse.email_id });
      } catch (error: any) {
        console.error('[AuthServer] Stytch Send Email OTP Error:', error);
        const errorMessage =
          error.error_message || 'Failed to send OTP via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
      detail: {
        summary: 'Send Stytch Email OTP',
        description:
          'Initiates the Stytch Email OTP login or creation process by sending an OTP to the provided email address.',
        tags: ['Auth - Stytch'],
      },
    }
  );

  // =============================================================
  //        VERIFY: Stytch Email OTP (/auth/stytch/email)
  // =============================================================
  app.post(
    '/stytch/email/verify-otp',
    async ({ body, stytchClient }) => {
      try {
        const authResponse = await stytchClient.otps.authenticate({
          method_id: body.methodId, // This now expects the email_id from the previous step
          code: body.code,
          session_duration_minutes: 60 * 24 * 7, // Example: 1 week session
        });
        // The session_jwt is the accessToken the client-side authenticator needs
        return resp.SUCCESS({
          accessToken: authResponse.session_jwt,
          userId: authResponse.user_id,
        });
      } catch (error: any) {
        console.error('[AuthServer] Stytch Verify Email OTP Error:', error);
        const errorMessage =
          error.error_message || 'Failed to verify OTP via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        methodId: t.String(), // This will be the email_id from the send-otp step
        code: t.String(),
      }),
      detail: {
        summary: 'Verify Stytch Email OTP',
        description:
          'Verifies the Email OTP using the method ID (which should be the email_id from send-otp) and code, and returns a Stytch session JWT (accessToken).',
        tags: ['Auth - Stytch'],
      },
    }
  );

  return app;
};
