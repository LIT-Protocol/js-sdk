import { AuthData } from '@lit-protocol/schemas';
import { Optional } from '@lit-protocol/types';
import { z } from 'zod';

/**
 * Base schema for common fields
 */
const BaseMintWithCustomAuthSchema = z.object({
  // Account information - this will be passed from the calling context
  account: z.any(), // Account type varies by network
  // Authentication data for the user
  authData: z.custom<Optional<AuthData, 'accessToken'>>(),
  scope: z.enum(['no-permissions', 'sign-anything', 'personal-sign']),
  // Optional overrides
  addPkpEthAddressAsPermittedAddress: z.boolean().default(false),
  sendPkpToItself: z.boolean().default(true),
});

/**
 * Schema variant for validation code
 */
// const MintWithValidationCodeSchema = BaseMintWithCustomAuthSchema.extend({
//   validationCode: z.string().min(1, 'validationCode cannot be empty'),
//   validationIpfsCid: z.undefined().optional(),
// });

/**
 * Schema variant for validation IPFS CID
 */
const MintWithValidationCidSchema = BaseMintWithCustomAuthSchema.extend({
  validationCode: z.undefined().optional(),
  validationIpfsCid: z.string().refine(
    (cid) => cid.startsWith('Qm') && cid.length >= 46,
    {
      message: 'validationIpfsCid must be a valid IPFS CID starting with "Qm" and at least 46 characters long',
    }
  ),
});

/**
 * Union schema that enforces exactly one validation method
 */
export const MintWithCustomAuthSchema = MintWithValidationCidSchema

// Create discriminated union types
// type MintWithValidationCode = z.input<typeof MintWithValidationCodeSchema>;
type MintWithValidationCid = z.input<typeof MintWithValidationCidSchema>;

/**
 * TypeScript type that enforces exactly one of validationCode or validationIpfsCid
 */
export type MintWithCustomAuthRequest = MintWithValidationCid;