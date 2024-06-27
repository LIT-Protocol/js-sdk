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