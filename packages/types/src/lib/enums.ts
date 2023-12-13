export enum IRelayAuthStatus {
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
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
