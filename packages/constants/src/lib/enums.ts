/** ---------- Chains ---------- */
export enum VMTYPE {
  EVM = 'EVM',
  SVM = 'SVM',
  CVM = 'CVM',
}

// BREAKING: This enum has been from `SIGTYPE` to `LIT_CURVE`
export enum LIT_CURVE {
  BLS = 'BLS',
  EcdsaK256 = 'K256',
  EcdsaCaitSith = 'ECDSA_CAIT_SITH', // Legacy alias of K256
  EcdsaCAITSITHP256 = 'EcdsaCaitSithP256',
}

export enum DERIVED_VIA {
  BLS = 'lit.bls',
  LIT_ETH_PERSONAL_SIGN = 'web3.eth.personal.sign via Lit PKP',
  LIT_SESSION_SIGN = 'litSessionSignViaNacl',
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

export enum LIT_ENDPOINT {
  HANDSHAKE = '/web/handshake',
  SIGN_SESSION_KEY = '/web/sign_session_key',
  EXECUTE_JS = '/web/execute',
  PKP_SIGN = '/web/pkp/sign',
  PKP_CLAIM = '/web/pkp/claim',
  SIGN_ACCS = '/web/signing/access_control_condition',
  ENCRYPTION_SIGN = '/web/encryption/sign',
  SIGN_ECDSA = '/web/signing/signConditionEcdsa',
}

export enum LIT_URI {
  SESSION_KEY = 'lit:session:',
  CAPABILITY_DELEGATION = 'lit:capability:delegation',
}

export enum AUTHSIG_ALGO {
  BLS = 'LIT_BLS',
  ED25519 = 'ed25519',
}

/**
 * CLI arguments
 */
export enum LIT_PROCESS_ENV {
  LIT_ENDPOINT_VERSION = 'LIT_ENDPOINT_VERSION',
  LOG_FILE = 'LOG_FILE',
}

export enum LIT_PROCESS_FLAG {
  VERSION = '--version=',
  FILTER = '--filter=',
  SHOW = '--show',
  NETWORK = '--network=',
}

export enum LIT_ENDPOINT_VERSION {
  LEGACY = '/',
  V1 = '/v1',
}
