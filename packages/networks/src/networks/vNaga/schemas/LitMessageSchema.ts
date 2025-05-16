import {
  CURVE_GROUP_BY_CURVE_TYPE,
  EcdsaSigType,
  SigningSchemeSchema,
} from '@lit-protocol/constants';
import { hashLitMessage } from '@lit-protocol/crypto';
import { BytesArraySchema } from '@lit-protocol/schemas';
import { sha256, sha384 } from '@noble/hashes/sha2';
import { z } from 'zod'; // Import ZodError for custom error handling if needed

// only want the EcdsaSigType from the SigningSchemeSchema
type DesiredEcdsaSchemes = Extract<
  z.infer<typeof SigningSchemeSchema>,
  EcdsaSigType
>;

export const ecdsaHashFunctions: Record<
  DesiredEcdsaSchemes,
  (arg0: Uint8Array) => Uint8Array
> = {
  EcdsaK256Sha256: sha256,
  EcdsaP256Sha256: sha256,
  EcdsaP384Sha384: sha384,
} as const;

export const LitMessageSchema = z
  .object({
    toSign: BytesArraySchema,
    signingScheme: SigningSchemeSchema,
  })
  .transform(({ toSign, signingScheme }) => {
    if (CURVE_GROUP_BY_CURVE_TYPE[signingScheme] === 'FROST') {
      return toSign;
    }

    if (CURVE_GROUP_BY_CURVE_TYPE[signingScheme] === 'ECDSA') {
      const hashedMessage = ecdsaHashFunctions[
        signingScheme as DesiredEcdsaSchemes
      ](new Uint8Array(toSign));
      return BytesArraySchema.parse(hashedMessage);
    }

    throw new Error(
      `Invalid or unsupported signing scheme for message transformation: ${signingScheme}`
    );
  });
