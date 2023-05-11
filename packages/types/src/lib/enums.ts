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


export enum ECDSASigTypes {
  EcdsaCaitSithK256 = 'EcdsaCaitSithK256',
  EcdsaCaitSithP256 = 'EcdsaCaitSithP256' 
}
