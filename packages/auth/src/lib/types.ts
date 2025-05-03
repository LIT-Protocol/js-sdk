import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import { ExpirationSchema, SessionKeyPairSchema } from '@lit-protocol/schemas';
import { z } from 'zod';

// Get the keys as an array/tuple of literal types
// I didn't do this smart thing, AI did.
const authMethodTypeKeys = Object.keys(AUTH_METHOD_TYPE) as [
  keyof typeof AUTH_METHOD_TYPE,
  ...(keyof typeof AUTH_METHOD_TYPE)[]
];

export type AuthMethodType = (typeof authMethodTypeKeys)[number];

export const LitAuthDataSchema = z.object({
  sessionKey: z.object({
    keyPair: SessionKeyPairSchema,
    expiresAt: ExpirationSchema,
  }),
  // Use z.enum with the strongly-typed keys array
  authMethodType: z.enum(authMethodTypeKeys),
});

export type LitAuthData = z.infer<typeof LitAuthDataSchema>;

// export interface LitAuthData {
//   sessionKey: {
//     keyPair: z.infer<typeof SessionKeyPairSchema>;
//     expiresAt: z.infer<typeof ExpirationSchema>;
//   };

//   // result of authenticator
//   authMethodType: keyof typeof AUTH_METHOD_TYPE;
// }
