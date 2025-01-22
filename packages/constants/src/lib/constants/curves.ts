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

export const LIT_CURVE = {
  BLS: 'BLS',
  EcdsaK256: 'K256',
  EcdsaCaitSith: 'ECDSA_CAIT_SITH', // Legacy alias of K256
  EcdsaCAITSITHP256: 'EcdsaCaitSithP256',
  EcdsaK256Sha256: 'EcdsaK256Sha256', // same as caitsith
} as const;

export type LIT_CURVE_TYPE = keyof typeof LIT_CURVE;

// This should replicate SigShare.sigType in types package
export type LIT_CURVE_VALUES = (typeof LIT_CURVE)[keyof typeof LIT_CURVE];

export const CURVE_GROUPS = ['ECDSA', 'BLS'] as const;

export const CURVE_GROUP_BY_CURVE_TYPE: Record<LIT_CURVE_VALUES, typeof CURVE_GROUPS[number]> = {
  [LIT_CURVE.EcdsaK256]: CURVE_GROUPS[0],
  [LIT_CURVE.EcdsaK256Sha256]: CURVE_GROUPS[0],
  [LIT_CURVE.EcdsaCAITSITHP256]: CURVE_GROUPS[0],
  [LIT_CURVE.EcdsaCaitSith]: CURVE_GROUPS[0],
  [LIT_CURVE.BLS]: CURVE_GROUPS[1],
} as const; 
