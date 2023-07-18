import {
  AccessControlConditions,
  AuthMethod,
  AuthSig,
  DecryptRequest,
  EncryptResponse,
  EthWalletAuthenticateOptions,
  EvmContractConditions,
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
  SessionSig,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { AuthMethodType } from '@lit-protocol/constants';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

export type OrNull<T> = T | null;
export type OrUndefined<T> = T | undefined;
export type OrNever<T> = T | never;

export namespace Types {
  export interface ContractOptions {
    signer?: ethers.Wallet | ethers.Signer; // No provider! ?default: PKP || window.web3
  }
  export interface AuthOptions {
    litRelayConfig?: LitRelayConfig;
    litOtpConfig?: OtpProviderOptions;
  }

  export type NodeOptions = { nodeOptions?: LitNodeClientConfig };

  export type NodeClient<T = LitNodeClient> = T;

  export type AuthClient<T = LitAuthClient> = T;

  export type LitOptions = ContractOptions & AuthOptions & NodeOptions;
}

export type Credential = AuthSig | SessionSig;

/*
  Lit Serializable expresses any type that is indexable numerically, an array of numbers, 
  also indexable numerically, or a string which has numeric indexing
*/
export type LitSerializable = ArrayLike<number> | string | [index: number];
export type LitSerialized<T = LitSerializable> = {
  data: T;
  type: string;
};

export type Account = {
  publicKey: string;
  ethAddress: string;
  tokenId: string;
};
export type Wallet = Account;

export type AccessControlType = AccessControlConditions
| EvmContractConditions
| SolRpcConditions
| UnifiedAccessControlConditions;

export interface EncryptProps {
  encryptMaterial: LitSerializable;
  accessControlConditions?: AccessControlType
  chain: string;
  authMaterial?: Credential;
  provider?: LitAuthMethodWithProvider;
}

export interface DecryptProps {
  storageContext?: {storageKey: string};
  decryptionContext?: {decryptionMaterial: string};
  decryptResponse?: DecryptRequest;
}

export interface CreateAccountProps {}

export interface SignProps {
  accountPublicKey: string;
  signingMaterial: LitSerializable;
  credentials: Credential[];
  authMatrial: Credential;
}

export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
  btcAddress: string;
  cosmosAddress: string;
};

export type LitAuthMethod = {
  accessToken: string;
  authMethodType: AuthMethodType;
  otpType?: 'email' | 'phone';
};

export type LitAuthMethodWithAuthData = {
  authData: Array<LitAuthMethod>;
};

export type LitAuthMethodOTP = {
  provider: 'otp';
  phoneNumber: string;
};

export type LitAuthMethodEthWallet = {
  provider: 'ethwallet';
  opts?: EthWalletAuthenticateOptions;
};

export type LitAuthMethodWithProvider = {
  provider: 'ethwallet' | 'google' | 'discord' | 'apple' | 'webauthn' | 'otp';
};

export type AuthKeys = LitAuthMethodWithProvider['provider'] extends infer T
  ? T
  : never;

export type LitAuthMethodNull = {
  provider: null;
  authData: Array<LitAuthMethod>;
};

export type LitAuthMethodOptions =
  | LitAuthMethodWithAuthData
  | LitAuthMethodWithProvider
  | LitAuthMethodOTP
  | LitAuthMethodEthWallet
  | LitAuthMethodNull;

export interface IStorage {
  length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}
