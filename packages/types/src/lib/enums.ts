export enum IRelayAuthStatus {
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
}

export enum AuthMethodType {
  EthWallet = 1,
  LitAction,
  WebAuthn,
  Discord,
  Google,
  GoogleJwt,
}
