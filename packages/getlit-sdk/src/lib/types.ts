import {
  AuthMethod,
  AuthSig,
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
  SessionSig,
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

  export type Credential = AuthSig | SessionSig;
}

export type Credential = AuthSig | SessionSig;
/*
  Lit Serializable expresses any type that is indexable numerically, an array of numbers, 
  also indexable numerically, or a string which has numeric indexing
*/
export type LitSerializable = ArrayLike<number> | string | [index: number];

export type Account = {
  publicKey: string;
  ethAddress: string;
  tokenId: string;
};
export type Wallet = Account;

export interface EncryptProps {}

export interface DecryptProps {}

export interface CreateAccountProps {}

export interface SignProps {
  accountPublicKey: string;
  signingMaterial: LitSerializable;
  credentials: Credential[];
  authMatrial: Credential;
}

// understand what's possible and reasonable to set expectations with him

// what's possible
// - [x] createAccount
// - [x] sign
// - [x] utility for auto-type conversion for createAccount, sign
// - [] encrypt (ask questions @howard etc. for accs)
// - [] decrypt
// - tested on nodejs, spa, and vanilla-js for implicit loading (script tag)

// BUT
// - if they want to initialize other options, they have to re-run the builder

// expectation
// - earliest end of week, latest wednesday week after depending on collabland
// -

export type LitCredential = {
  accessToken: string;
  authMethodType: AuthMethodType;
};

export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
  btcAddress: string;
  cosmosAddress: string;
};

export type LitCredentialManual = {
  credentials: Array<LitCredential>;
};

export type LitCredentialAutomatic = {
  provider?: 'ethwallet' | 'google' | 'discord' | 'apple' | 'webauthn' | 'otp' | null;
};

// export type LitCredentialDefault = undefined;

export type LitCredentialOptions =
  // | LitCredentialDefault
  LitCredentialManual | LitCredentialAutomatic;

// public async createAccount(
//   options: LitCredentialOptions = {
//     manual: false,
//     provider: 'google',
//     credentials: []
//   }
// ): Promise<Array<PKPInfo>> {
//   // Your function implementation goes here
// }
