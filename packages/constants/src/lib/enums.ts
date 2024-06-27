/** ---------- Chains ---------- */
export enum VMTYPE {
  EVM = 'EVM',
  SVM = 'SVM',
  CVM = 'CVM',
}

export enum LIT_CURVE {
  BLS = 'BLS',
  EcdsaK256 = 'K256',
  EcdsaCaitSith = 'ECDSA_CAIT_SITH', // Legacy alias of K256
  EcdsaCAITSITHP256 = 'EcdsaCaitSithP256',
}

/**
 * The only either possible error types
 */
export const enum EITHER_TYPE {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

/**
 * Supported PKP auth method types
 */
export enum AuthMethodType {
  EthWallet = 1,
  LitAction = 2,
  WebAuthn = 3,
  Discord = 4,
  Google = 5,
  GoogleJwt = 6,
  AppleJwt = 8,
  StytchOtp = 9,
  StytchEmailFactorOtp = 10,
  StytchSmsFactorOtp = 11,
  StytchWhatsAppFactorOtp = 12,
  StytchTotpFactorOtp = 13,
}

export enum StakingStates {
  Active,
  NextValidatorSetLocked,
  ReadyForNextEpoch,
  Unlocked,
  Paused,
  Restore,
}

export enum AuthMethodScope {
  NoPermissions = 0,
  SignAnything = 1,
  PersonalSign = 2,
}

export enum LitNetwork {
  Cayenne = 'cayenne',
  Manzano = 'manzano',
  Habanero = 'habanero',
  Custom = 'custom',
}

/**
 * Supported provider types
 */
export enum ProviderType {
  Discord = 'discord',
  Google = 'google',
  EthWallet = 'ethwallet',
  WebAuthn = 'webauthn',
  Apple = 'apple',
  StytchOtp = 'stytchOtp',
  StytchEmailFactorOtp = 'stytchEmailFactorOtp',
  StytchSmsFactorOtp = 'stytchSmsFactorOtp',
  StytchWhatsAppFactorOtp = 'stytchWhatsAppFactorOtp',
  StytchTotpFactor = 'stytchTotpFactor',
}

export enum LogLevel {
  INFO = 0,
  DEBUG = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  TIMING_START = 5,
  TIMING_END = 6,
  OFF = -1,
}