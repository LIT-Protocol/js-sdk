import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import {
  ExpirationSchema,
  ObjectMapFromArray,
  SessionKeyPairSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';

/**
 * Get the keys as an array/tuple of literal types
 * @return { Array<keyof typeof AUTH_METHOD_TYPE> }
 * @example
 * ```
 * [
  "EthWallet",
  "LitAction",
  "WebAuthn",
  "Discord",
  "Google",
  "GoogleJwt",
  "AppleJwt",
  "StytchOtp",
  "StytchEmailFactorOtp",
  "StytchSmsFactorOtp",
  "StytchWhatsAppFactorOtp",
  "StytchTotpFactorOtp"
]
  ```
 */
const authMethodTypeKeys = Object.keys(AUTH_METHOD_TYPE) as [
  keyof typeof AUTH_METHOD_TYPE,
  ...(keyof typeof AUTH_METHOD_TYPE)[]
];

/**
 * Map of auth method type keys to their string values
 * @example
 * ```
 * {
 *  EthWallet: 'EthWallet',
 *  LitAction: 'LitAction',
 *  WebAuthn: 'WebAuthn',
 *  Discord: 'Discord',
 *  Google: 'Google',
 *  GoogleJwt: 'GoogleJwt',
 *  AppleJwt: 'AppleJwt',
 * }
 * ```
 */
export const AuthMethodTypeStringMap = ObjectMapFromArray(authMethodTypeKeys);

/**
 * Auth method type keys
 * @example
 * ```
 * 'EthWallet' | 'LitAction' | 'WebAuthn' | 'Discord' | 'Google' | 'GoogleJwt' | 'AppleJwt'
 * ```
 */
export type AuthMethodType = (typeof authMethodTypeKeys)[number];

export const LitAuthDataSchema = z.object({
  sessionKey: z.object({
    keyPair: SessionKeyPairSchema,
    expiresAt: ExpirationSchema,
  }),
  authMethodType: z.enum(authMethodTypeKeys),
});

export type LitAuthData = z.infer<typeof LitAuthDataSchema>;
