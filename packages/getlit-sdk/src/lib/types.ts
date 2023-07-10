import {
  AuthSig,
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export namespace Types {
  export interface ContractOptions {
    signer: ethers.Wallet | ethers.Signer; // No provider! ?default: PKP || window.web3
  }
  export interface AuthOptions {
    litRelayConfig?: LitRelayConfig;
    litOtpConfig?: OtpProviderOptions;
  }
  export type NodeOptions = { nodeOptions?: LitNodeClientConfig };

  export type NodeClient<T = LitNodeClient> = T;

  export type LitOptions = ContractOptions & AuthOptions & NodeOptions;
}

export interface EncryptProps {}

export interface DecryptProps {}

export interface CreateAccountProps {}

export interface SignProps {}

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

export interface LitCredentials {
  authSig?: AuthSig;
}
