/** ---------- Chains ---------- */
export enum VMTYPE {
  EVM = 'EVM',
  SVM = 'SVM',
  CVM = 'CVM',
}

export enum SIGTYPE {
  BLS = 'BLS',
  EcdsaCaitSith = 'ECDSA_CAIT_SITH',
  EcdsaCAITSITHP256 = 'EcdsaCaitSithP256'
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
  LitAction,
  WebAuthn,
  Discord,
  Google,
  GoogleJwt,
  OTP,
  AppleJwt,
  StytchOtp,
}

/**
 * Supported provider types
 */
export enum ProviderType {
  Discord = 'discord',
  Google = 'google',
  EthWallet = 'ethwallet',
  WebAuthn = 'webauthn',
  Otp = 'otp',
  Apple = 'apple',
  StytchOtp = 'stytchOtp'
}
