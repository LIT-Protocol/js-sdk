import { z } from 'zod';

import { ObjectMapFromArray } from './utils';

// pub enum SigningScheme {

//  -- BLS
//   Bls12381,

//  -- ECDSA
//   EcdsaK256Sha256,
//   EcdsaP256Sha256,
//   EcdsaP384Sha384,

//  -- Frost
//   SchnorrEd25519Sha512,
//   SchnorrK256Sha256,
//   SchnorrP256Sha256,
//   SchnorrP384Sha384,
//   SchnorrRistretto25519Sha512,
//   SchnorrEd448Shake256,
//   SchnorrRedJubjubBlake2b512,
//   SchnorrK256Taproot,
//   SchnorrRedDecaf377Blake2b512,
//   SchnorrkelSubstrate,
// }

// ----- Frost Variant
export const LIT_FROST_VARIANT_VALUES = [
  'Ed25519Sha512',
  'Ed448Shake256',
  'Ristretto25519Sha512',
  'K256Sha256',
  'P256Sha256',
  'P384Sha384',
  'RedJubjubBlake2b512',
  'K256Taproot',
] as const;
export const LIT_FROST_VARIANT = ObjectMapFromArray(LIT_FROST_VARIANT_VALUES);
export const LIT_FROST_VARIANT_SCHEMA = z.enum(LIT_FROST_VARIANT_VALUES);
export type LitFrostVariantType = z.infer<typeof LIT_FROST_VARIANT_SCHEMA>;

// ----- BLS Variant
export const LIT_BLS_VARIANT_VALUES = ['BLS'] as const;
export const LIT_BLS_VARIANT = ObjectMapFromArray(LIT_BLS_VARIANT_VALUES);
export const LIT_BLS_VARIANT_SCHEMA = z.enum(LIT_BLS_VARIANT_VALUES);
export type LitBlsVariantType = z.infer<typeof LIT_BLS_VARIANT_SCHEMA>;

// ----- ECDSA Variant
export const LIT_ECDSA_VARIANT_VALUES = [
  'EcdsaK256Sha256',
  'EcdsaP256Sha256',
  'EcdsaP384Sha384',
] as const;
export const LIT_ECDSA_VARIANT = {
  // Legacy values
  EcdsaK256: 'K256',
  EcdsaCaitSith: 'ECDSA_CAIT_SITH',
  EcdsaCAITSITHP256: 'EcdsaCaitSithP256',
  ...ObjectMapFromArray(LIT_ECDSA_VARIANT_VALUES),
} as const;
export const LIT_ECDSA_VARIANT_SCHEMA = z.enum(LIT_ECDSA_VARIANT_VALUES);
export type LitEcdsaVariantType = z.infer<typeof LIT_ECDSA_VARIANT_SCHEMA>;

// ----- All Curve Types
export const LIT_CURVE = {
  ...LIT_BLS_VARIANT,
  ...LIT_FROST_VARIANT,
  ...LIT_ECDSA_VARIANT,
};

export type LIT_CURVE_TYPE = keyof typeof LIT_CURVE;
// This should replicate SigShare.sigType in types package
export type LIT_CURVE_VALUES = (typeof LIT_CURVE)[keyof typeof LIT_CURVE];
