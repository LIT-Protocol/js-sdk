/**
 * Stytch SMS OTP authentication routes
 * Handles SMS OTP send and verify operations
 */

import { Elysia, t } from 'elysia';
import { resp } from '../../../response-helpers/response-helpers';

export const stytchSmsRoutes = <
  T extends Elysia<any, any, any, any, any, any, any>
>(
  app: T
): T => {
  // =============================================================
  //                SEND: Stytch SMS OTP (/auth/stytch/sms)
  // =============================================================
  app.post(
    '/stytch/sms/send-otp',
    async ({ body, stytchClient }) => {
      try {
        const stytchResponse = await stytchClient.otps.sms.loginOrCreate({
          phone_number: body.phoneNumber,
        });
        // Assuming stytchResponse.phone_id is available and can be used as methodId for the authenticate step.
        // Verify with your Stytch SDK version.
        return resp.SUCCESS({ methodId: stytchResponse.phone_id });
      } catch (error: any) {
        console.error('[AuthServer] Stytch Send SMS OTP Error:', error);
        const errorMessage =
          error.error_message || 'Failed to send SMS OTP via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        phoneNumber: t.String(), // Add validation if needed (e.g., E.164 format)
      }),
      detail: {
        summary: 'Send Stytch SMS OTP',
        description: 'Initiates the Stytch SMS OTP login or creation process.',
        tags: ['Auth - Stytch'],
      },
    }
  );

  // =============================================================
  //        VERIFY: Stytch SMS OTP (/auth/stytch/sms)
  // =============================================================
  app.post(
    '/stytch/sms/verify-otp',
    async ({ body, stytchClient }) => {
      try {
        const authResponse = await stytchClient.otps.authenticate({
          method_id: body.methodId, // This now expects the phone_id from the previous step
          code: body.code,
          session_duration_minutes: 60 * 24 * 7,
        });
        return resp.SUCCESS({
          accessToken: authResponse.session_jwt,
          userId: authResponse.user_id,
        });
      } catch (error: any) {
        console.error('[AuthServer] Stytch Verify SMS OTP Error:', error);
        const errorMessage =
          error.error_message || 'Failed to verify SMS OTP via Stytch.';
        return resp.ERROR(errorMessage, error.status_code || 500);
      }
    },
    {
      body: t.Object({
        methodId: t.String(), // This will be the phone_id from the send-otp step
        code: t.String(),
      }),
      detail: {
        summary: 'Verify Stytch SMS OTP',
        description: 'Verifies the SMS OTP and returns a Stytch session JWT.',
        tags: ['Auth - Stytch'],
      },
    }
  );

  return app;
};
