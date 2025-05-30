import { SigningSchemeSchema } from '@lit-protocol/constants';
import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
  HexPrefixedSchema,
  SigningChainSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';

export const PKPSignInputSchema = z.object({
  /**
   * Picking the chains would use the correct hash function for the signing scheme.
   *
   * @example
   * ethereum -> keccak256(<to_sign_bytes_array>)
   * bitcoin -> sha256(<to_sign_bytes_array>)
   */
  chain: SigningChainSchema,
  signingScheme: SigningSchemeSchema,
  pubKey: HexPrefixedSchema,
  toSign: z.any(),
  authContext: z.union([PKPAuthContextSchema, EoaAuthContextSchema]),
  userMaxPrice: z.bigint().optional(),
});

export const EthereumPKPSignInputSchema = PKPSignInputSchema.omit({
  chain: true,
  signingScheme: true,
})
  .extend({
    // chain: z.literal('ethereum'),
    // signingScheme: z.enum([
    //   'EcdsaK256Sha256',
    //   'EcdsaP256Sha256',
    //   'EcdsaP384Sha384',
    // ]),
  })
  .transform((item) => {
    return {
      ...item,
      signingScheme: SigningSchemeSchema.parse('EcdsaK256Sha256'),
      chain: SigningChainSchema.parse('ethereum'),
    };
  });

export const BitCoinPKPSignInputSchema = PKPSignInputSchema.omit({
  chain: true,
  signingScheme: true,
})
  .extend({
    // chain: z.literal('ethereum'),
    signingScheme: z.enum([
      'EcdsaK256Sha256',
      'SchnorrK256Sha256',
      'SchnorrK256Taproot',
    ]),
  })
  .transform((item) => {
    return {
      ...item,
      // signingScheme: SigningSchemeSchema.parse('EcdsaK256Sha256'),
      chain: SigningChainSchema.parse('bitcoin'),
    };
  });
