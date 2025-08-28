import { z } from 'zod';

const AUTH_METHOD_TYPE = {
  EthWallet: 1,
  LitAction: 2,
  WebAuthn: 3,
  Discord: 4,
  Google: 5,
  GoogleJwt: 6,
  AppleJwt: 8,
  StytchOtp: 9,
  StytchEmailFactorOtp: 10,
  StytchSmsFactorOtp: 11,
  StytchWhatsAppFactorOtp: 12,
  StytchTotpFactorOtp: 13,
} as const;

export const AuthMethodSchema = z.object({
  authMethodType: z.nativeEnum(AUTH_METHOD_TYPE),
  accessToken: z.string(),
});

// enable this if needed
// export type AuthMethod = z.infer<typeof AuthMethodSchema>;
