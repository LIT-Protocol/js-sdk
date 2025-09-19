import { Express } from 'express';
import { StytchClient } from '../../providers/stytch';

export const registerStytchRoutes = (
  app: Express,
  stytchClient: StytchClient
) => {
  // Email OTP
  app.post('/auth/stytch/email/send-otp', async (req, res) => {
    try {
      const stytchResponse = await stytchClient.otps.email.loginOrCreate({
        email: req.body?.email,
      });
      return res.status(200).json({ methodId: stytchResponse.email_id });
    } catch (error: any) {
      console.error('[AuthServer] Stytch Send Email OTP Error:', error);
      return res.status(error?.status_code || 500).json({
        error: error?.error_message || 'Failed to send OTP via Stytch.',
      });
    }
  });

  app.post('/auth/stytch/email/verify-otp', async (req, res) => {
    try {
      const authResponse = await stytchClient.otps.authenticate({
        method_id: req.body?.methodId,
        code: req.body?.code,
        session_duration_minutes: 60 * 24 * 7,
      });
      return res.status(200).json({
        accessToken: authResponse.session_jwt,
        userId: authResponse.user_id,
      });
    } catch (error: any) {
      console.error('[AuthServer] Stytch Verify Email OTP Error:', error);
      return res.status(error?.status_code || 500).json({
        error: error?.error_message || 'Failed to verify OTP via Stytch.',
      });
    }
  });

  // SMS OTP
  app.post('/auth/stytch/sms/send-otp', async (req, res) => {
    try {
      const stytchResponse = await stytchClient.otps.sms.loginOrCreate({
        phone_number: req.body?.phoneNumber,
      });
      return res.status(200).json({ methodId: stytchResponse.phone_id });
    } catch (error: any) {
      console.error('[AuthServer] Stytch Send SMS OTP Error:', error);
      return res.status(error?.status_code || 500).json({
        error: error?.error_message || 'Failed to send SMS OTP via Stytch.',
      });
    }
  });

  app.post('/auth/stytch/sms/verify-otp', async (req, res) => {
    try {
      const authResponse = await stytchClient.otps.authenticate({
        method_id: req.body?.methodId,
        code: req.body?.code,
        session_duration_minutes: 60 * 24 * 7,
      });
      return res.status(200).json({
        accessToken: authResponse.session_jwt,
        userId: authResponse.user_id,
      });
    } catch (error: any) {
      console.error('[AuthServer] Stytch Verify SMS OTP Error:', error);
      return res.status(error?.status_code || 500).json({
        error: error?.error_message || 'Failed to verify SMS OTP via Stytch.',
      });
    }
  });

  // WhatsApp OTP
  app.post('/auth/stytch/whatsapp/send-otp', async (req, res) => {
    try {
      const stytchResponse = await stytchClient.otps.whatsapp.loginOrCreate({
        phone_number: req.body?.phoneNumber,
      });
      return res.status(200).json({ methodId: stytchResponse.phone_id });
    } catch (error: any) {
      console.error('[AuthServer] Stytch Send WhatsApp OTP Error:', error);
      return res.status(error?.status_code || 500).json({
        error:
          error?.error_message || 'Failed to send WhatsApp OTP via Stytch.',
      });
    }
  });

  app.post('/auth/stytch/whatsapp/verify-otp', async (req, res) => {
    try {
      const authResponse = await stytchClient.otps.authenticate({
        method_id: req.body?.methodId,
        code: req.body?.code,
        session_duration_minutes: 60 * 24 * 7,
      });
      return res.status(200).json({
        accessToken: authResponse.session_jwt,
        userId: authResponse.user_id,
      });
    } catch (error: any) {
      console.error('[AuthServer] Stytch Verify WhatsApp OTP Error:', error);
      return res.status(error?.status_code || 500).json({
        error:
          error?.error_message || 'Failed to verify WhatsApp OTP via Stytch.',
      });
    }
  });

  // TOTP
  app.post('/auth/stytch/totp/authenticate', async (req, res) => {
    try {
      const authResponse = await stytchClient.totps.authenticate({
        user_id: req.body?.userId,
        totp_code: req.body?.totpCode,
        session_duration_minutes: 60 * 24 * 7,
      });
      return res.status(200).json({ accessToken: authResponse.session_jwt });
    } catch (error: any) {
      console.error('[AuthServer] Stytch TOTP Authenticate Error:', error);
      return res.status(error?.status_code || 500).json({
        error:
          error?.error_message || 'Failed to authenticate TOTP via Stytch.',
      });
    }
  });

  app.post('/auth/stytch/totp/create-registration', async (req, res) => {
    try {
      const createResponse = await stytchClient.totps.create({
        user_id: req.body?.userId,
        expiration_minutes: 5,
      });
      return res.status(200).json({
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
      return res.status(error?.status_code || 500).json({
        error:
          error?.error_message ||
          'Failed to create TOTP registration via Stytch.',
      });
    }
  });

  app.post('/auth/stytch/totp/verify-registration', async (req, res) => {
    try {
      const verifyResponse = await stytchClient.totps.authenticate({
        user_id: req.body?.userId,
        totp_code: req.body?.totpCode,
        session_duration_minutes: 60 * 24 * 7,
      });
      return res.status(200).json({
        accessToken: verifyResponse.session_jwt,
        totpId: verifyResponse.totp_id,
        userId: verifyResponse.user_id,
      });
    } catch (error: any) {
      console.error(
        '[AuthServer] Stytch TOTP Verify Registration Error:',
        error
      );
      return res.status(error?.status_code || 500).json({
        error:
          error?.error_message ||
          'Failed to verify TOTP registration via Stytch.',
      });
    }
  });
};
