import { z } from 'zod';

import { BlsSigType, EcdsaSigType, FrostSigType } from '@lit-protocol/types';

import { ObjectMapFromArray } from './utils';

// ----- Frost Variant
export const LIT_FROST_VARIANT_VALUES = [
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
] as const satisfies readonly FrostSigType[];
export const LIT_FROST_VARIANT = ObjectMapFromArray(LIT_FROST_VARIANT_VALUES);
export const LIT_FROST_VARIANT_SCHEMA = z.enum(LIT_FROST_VARIANT_VALUES);
export type LitFrostVariantType = z.infer<typeof LIT_FROST_VARIANT_SCHEMA>;

// ----- BLS Variant
export const LIT_BLS_VARIANT_VALUES = [
  'Bls12381G1ProofOfPossession',
] as const satisfies readonly BlsSigType[];
export const LIT_BLS_VARIANT = ObjectMapFromArray(LIT_BLS_VARIANT_VALUES);
export const LIT_BLS_VARIANT_SCHEMA = z.enum(LIT_BLS_VARIANT_VALUES);
export type LitBlsVariantType = z.infer<typeof LIT_BLS_VARIANT_SCHEMA>;

// ----- ECDSA Variant
export const LIT_ECDSA_VARIANT_VALUES = [
  'EcdsaK256Sha256',
  'EcdsaP256Sha256',
  'EcdsaP384Sha384',
] as const satisfies readonly EcdsaSigType[];
export const LIT_ECDSA_VARIANT = ObjectMapFromArray(LIT_ECDSA_VARIANT_VALUES);
export const LIT_ECDSA_VARIANT_SCHEMA = z.enum(LIT_ECDSA_VARIANT_VALUES);
export type LitEcdsaVariantType = z.infer<typeof LIT_ECDSA_VARIANT_SCHEMA>;

// ----- All Curve Types
export const LIT_CURVE = {
  ...LIT_BLS_VARIANT,
  ...LIT_FROST_VARIANT,
  ...LIT_ECDSA_VARIANT,
};

export type LIT_CURVE_TYPE = keyof typeof LIT_CURVE; // Identical to Sig
// This should replicate SigShare.sigType in types package
export type LIT_CURVE_VALUES = (typeof LIT_CURVE)[keyof typeof LIT_CURVE];

export const CURVE_GROUPS = ['BLS', 'ECDSA', 'FROST'] as const;

export const CURVE_GROUP_BY_CURVE_TYPE: Record<
  LIT_CURVE_VALUES,
  (typeof CURVE_GROUPS)[number]
> = {
  // BLS
  [LIT_CURVE.Bls12381G1ProofOfPossession]: CURVE_GROUPS[0],
  // ECDSA
  [LIT_CURVE.EcdsaK256Sha256]: CURVE_GROUPS[1],
  [LIT_CURVE.EcdsaP256Sha256]: CURVE_GROUPS[1],
  [LIT_CURVE.EcdsaP384Sha384]: CURVE_GROUPS[1],
  // FROST
  [LIT_CURVE.SchnorrEd25519Sha512]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrK256Sha256]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrP256Sha256]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrP384Sha384]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrRistretto25519Sha512]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrEd448Shake256]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrRedJubjubBlake2b512]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrK256Taproot]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrRedDecaf377Blake2b512]: CURVE_GROUPS[2],
  [LIT_CURVE.SchnorrkelSubstrate]: CURVE_GROUPS[2],
} as const;
