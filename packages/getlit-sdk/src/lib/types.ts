import {
  LitNodeClientConfig,
  LitRelayConfig,
  OtpProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export namespace Types {
  export interface ContractOptions {
    signer: ethers.Wallet | ethers.Signer; // No provider! ?window.ethereum
  }
  export interface AuthOptions {
    litRelayConfig?: LitRelayConfig;
    litOtpConfig?: OtpProviderOptions;
  }
  export type NodeOptions = { nodeOptions?: LitNodeClientConfig };

  export type NodeClient<T = LitNodeClient | LitNodeClientNodeJs> = T;

  export type LitOptions = ContractOptions & AuthOptions & NodeOptions;
}

export interface EncryptProps {}

export interface DecryptProps {}

export interface CreateAccountProps {}

export interface SignProps {}
