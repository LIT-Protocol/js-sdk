import { z } from 'zod';
import { ObjectMapFromArray } from './utils';

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

// ----- All Curve Types
export const LIT_CURVE = {
  ...LIT_BLS_VARIANT,
  ...LIT_FROST_VARIANT,
  EcdsaK256: 'K256',
  EcdsaCaitSith: 'ECDSA_CAIT_SITH', // Legacy alias of K256
  EcdsaCAITSITHP256: 'EcdsaCaitSithP256',
} as const;

export type LIT_CURVE_TYPE = keyof typeof LIT_CURVE;
// This should replicate SigShare.sigType in types package
export type LIT_CURVE_VALUES = (typeof LIT_CURVE)[keyof typeof LIT_CURVE];

