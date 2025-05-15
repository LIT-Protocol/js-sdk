import {
  AuthSigSchema,
  HexPrefixedSchema,
  ISessionCapabilityObjectSchema,
  LitResourceAbilityRequestSchema,
  SessionKeyPairSchema,
  AuthConfigSchema,
  AuthMethodSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';
import { Account } from 'viem';

// {
//   pkpPublicKey: "0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18",
//   chain: "ethereum",
//   resourceAbilityRequests: [
//     {
//       resource: {
//         getResourceKey: [Function],
//         isValidLitAbility: [Function],
//         toString: [Function],
//         resourcePrefix: "lit-pkp",
//         resource: "*",
//       },
//       ability: "pkp-signing",
//     }
//   ],
//   sessionKeyPair: {
//     publicKey: "1d8e32983aa1fb77db9f21b6d53e73db671b886e72e914c67e8602cc4d8b3699",
//     secretKey: "faa9b3b04f89ef6066f8842ad713a8c1d2d12540b65129f328a1e301366ebc051d8e32983aa1fb77db9f21b6d53e73db671b886e72e914c67e8602cc4d8b3699",
//   },
//   sessionCapabilityObject: SessionCapabilityObjectSchema,
//   authNeededCallback: [AsyncFunction: authNeededCallback],
//   capabilityAuthSigs: [],
// }
export const AuthContextSchema = z.object({
  pkpPublicKey: HexPrefixedSchema.optional(),
  // viemAccount: z.custom<Account>().optional(),
  // authMethod: AuthMethodSchema.optional(),
  chain: z.string(),
  sessionKeyPair: SessionKeyPairSchema,
  // which one do we need here?
  resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema),
  // which one do we need here?
  sessionCapabilityObject: ISessionCapabilityObjectSchema,
  // which one do we need here? TODO: ❗️ specify the type properly
  siweResources: z.any(),
  authNeededCallback: z.function(),
  capabilityAuthSigs: z.array(AuthSigSchema),
  authConfig: AuthConfigSchema,
});

export type AuthContext = z.infer<typeof AuthContextSchema>;

export const EoaAuthContextSchema = z.object({
  viemAccount: z.custom<Account>(),
  authMethod: AuthMethodSchema,
  authNeededCallback: z.function(),
  sessionKeyPair: SessionKeyPairSchema,
  authConfig: AuthConfigSchema,
});

export const GenericAuthContextSchema = z.union([
  AuthContextSchema,
  EoaAuthContextSchema,
]);

export type GenericAuthContext = z.infer<typeof GenericAuthContextSchema>;
