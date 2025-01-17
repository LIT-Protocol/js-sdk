import { z } from 'zod';

// rust/lit-node/src/tss/common/signing_scheme.rs -> SigningScheme
export const SIGNING_SCHEMES = [
  'Bls12381',
  'EcdsaK256Sha256',
  'EcdsaP256Sha256',
  'EcdsaP384Sha384',
  'SchnorrEd25519Sha512',
  'SchnorrK256Sha256',
  'SchnorrP256Sha256',
  'SchnorrP384Sha384',
  'SchnorrRistretto25519Sha512',
  'SchnorrEd448Shake256',
  'SchnorrRedJubjubBlake2b512',
  'SchnorrK256Taproot',
  'SchnorrRedDecaf377Blake2b512',
  'SchnorrkelSubstrate',
  'Bls12381G1ProofOfPossession',
] as const;

export const signingSchemeSchema = z.enum(SIGNING_SCHEMES);

export type SigningScheme = z.infer<typeof signingSchemeSchema>;
