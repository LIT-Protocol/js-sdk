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
import * as uint8arrays from '@lit-protocol/uint8arrays';

export type OrNull<T> = T | null;
export type OrUndefined<T> = T | undefined;

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
  credentials: Credential[],
  authMatrial: Credential,
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

export type LitCredentials = OrNull<{
  authSig?: AuthSig;
}>;
