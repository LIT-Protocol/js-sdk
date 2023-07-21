/** ---------- Chains ---------- */
export enum VMTYPE {
  EVM = 'EVM',
  SVM = 'SVM',
  CVM = 'CVM',
}

export enum SIGTYPE {
  BLS = 'BLS',
  EcdsaCAITSITHK256 = 'EcdsaCaitSithK256',
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
  LitAction, // 2
  WebAuthn, // 3
  Discord, // 4
  Google, // 5
  GoogleJwt, // 6
  OTP, // 7
  AppleJwt, // 8
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
}
