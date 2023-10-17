import {
  AccessControlConditions,
  AuthMethod,
  AuthSig,
  DecryptRequest,
  EncryptResponse,
  EthWalletAuthenticateOptions,
  EvmContractConditions,
  LIT_NETWORKS_KEYS,
  LitNodeClientConfig,
  LitRelayConfig,
  StytchOtpProviderOptions,
  SessionSigs,
  SolRpcConditions,
  UnifiedAccessControlConditions,
  ExpirableOptions,
} from '@lit-protocol/types';
import { BigNumber, ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { AuthMethodType } from '@lit-protocol/constants';
import {
  AppleProvider,
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  LitAuthClient,
  StytchOtpProvider,
  WebAuthnProvider,
} from '@lit-protocol/lit-auth-client';
import { BaseIPFSProvider } from './ipfs-provider/providers/base-ipfs-provider';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';

export type OrNull<T> = T | null;
export type OrUndefined<T> = T | undefined;
export type OrNever<T> = T | never;

export namespace Types {
  export interface ContractOptions {
    signer?: ethers.Wallet | ethers.Signer; // No provider! ?default: PKP || window.web3
  }
  export interface AuthOptions {
    litRelayConfig?: LitRelayConfig;
    litOtpConfig?: StytchOtpProviderOptions;
  }

  export type NodeOptions = { nodeOptions?: LitNodeClientConfig };

  export type NodeClient<T = LitNodeClient> = T;

  export type AuthClient<T = LitAuthClient> = T;

  export type OTPProvider = OTPConfig;

  export type LitOptions = ContractOptions & AuthOptions & NodeOptions;
}

export type Credential = AuthSig | SessionSigs;

/*
  Lit Serializable expresses any type that is indexable numerically, an array of numbers, 
  also indexable numerically, or a string which has numeric indexing
*/
export type LitSerializable = ArrayLike<number> | string | [index: number];
export type LitSerialized<T = LitSerializable> = {
  data: T;
  type: string;
};

export type DeserialisedMessage =
  | LitSerializable
  | string
  | Blob
  | File
  | ArrayBuffer
  | Uint8Array;

export type EncryptionMetadata = {
  accessControlConditions?: AccessControlType;
  network: LIT_NETWORKS_KEYS | any;
  sdkVersion: string;
  nodeVersion: string;
  chain: string;
  messageType: any;
  [key: string]: any; // For the spread properties from 'acc'
};

export type Account = {
  publicKey: string;
  ethAddress: string;
  tokenId: string;
};
export type Wallet = Account;

export type AccessControlType =
  | AccessControlConditions
  | EvmContractConditions
  | SolRpcConditions
  | UnifiedAccessControlConditions;

export interface EncryptProps {
  content: LitSerializable;
  accessControlConditions?: AccessControlType;
  chain?: string;
  cache?: boolean;
  extraData?: any; // extra metadata to be added to the encryption metadata
  uploadToIPFS?: boolean;
  persistentStorage?: BaseIPFSProvider;
}

export interface EncryptResult {
  storageContext?: StorageContext;
  decryptionContext: DecryptionContext;
  encryptResponse: EncryptResponse & {
    accessControlConditions: AccessControlType;
    chain: string;
  };
}

export interface DecryptionContext {
  decryptionMaterial: string;
}

export interface StorageContext {
  storageKey: string;
}
// export interface DecryptProps {
//   storageContext?: StorageContext;
//   decryptionContext?: DecryptionContext;
//   decryptResponse?: DecryptRequest;
//   authMaterial?: Credential;
//   provider?: LitAuthMethodWithProvider;
// }

//  ensure that at least one of the context is present
export type DecryptProps =
  | {
    storageContext: StorageContext;
    decryptionContext?: DecryptionContext;
    decryptResponse?: DecryptRequest;
    authMaterial?: Credential;
    provider?: LitAuthMethodWithProvider;
  }
  | {
    decryptionContext: DecryptionContext;
    storageContext?: StorageContext;
    decryptResponse?: DecryptRequest;
    authMaterial?: Credential;
    provider?: LitAuthMethodWithProvider;
  };

export interface CreateAccountProps { }

export interface SignProps {
  accountPublicKey: string;
  content: LitSerializable;
  provider?: LitAuthMethodWithProvider;
  authMaterial: Credential;
}

export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
  btcAddress: string;
  cosmosAddress: string;
};

export type LitAuthMethod = {
  storageKey?: string;
  accessToken: string;
  authMethodType: AuthMethodType;
  otpType?: 'email' | 'phone';
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

export type DecryptRes = {
  rawData: Uint8Array;
  data: DeserialisedMessage;
};

export type pinataConfig = {
  JWT?: string;
};

export type infuraConfig = {
  API_KEY: string;
  API_KEY_SECRET: string;
};

export type PersistentStorageConfigOptions = pinataConfig | infuraConfig;

export type PersistentStorageConfig = {
  provider: 'pinata' | 'helia' | 'infura';
  options?: PersistentStorageConfigOptions;
};

// --------- OTP Configs ---------
export interface StytchOTPProviderOptionsBrowser {
  publicToken?: string;
}
export interface StytchOTPProviderOptionsNodeJS {
  projectId?: string;
  secret?: string;
}

export type OTPBarConfig = {};
// Add more configs here if needed
export type OTPConfigOptions =
  StytchOTPProviderOptionsBrowser |
  StytchOTPProviderOptionsNodeJS |
  OTPBarConfig;


export type OTPConfig = {
  provider: 'stytch';
  options?: OTPConfigOptions;
}

// export type LitAuthMethodTypes =
//   | GoogleProvider
//   | DiscordProvider
//   | EthWalletProvider
//   | OtpProvider
//   | AppleProvider
//   | WebAuthnProvider
//   | StytchOtpProvider;

export interface StytchOTPProviderBrowserOptions extends ExpirableOptions {
  code: string;
};

export interface StytchOTPProviderNodeJSOptions extends StytchOTPProviderBrowserOptions { };

export type SessionItemValue = {
  pkpInfo: {
    tokenId: BigNumber,
    publicKey: string,
    ethAddress: string,
  },
  sessionSigs: {
    [key: string]: {
      sig: string;
      derivedVia: string;
      signedMessage: string;
      address: string;
      algo?: string;
    }
  }
};

export interface GetLitAccount {
  accountPublicKey: string,
  sessionSigs: SessionSigs,
  configs?: {
    platform: 'eth' | 'cosmos' | 'btc',
    eth?: {
      rpc: string,
    },
    cosmos?: {
      rpc?: string,
      addressPrefix: string | 'cosmos',
    }
  }
}

export interface GetLitAccountInstanceSend {
  to: string;
  amount: string;
  tokenAddress?: string;
  // eth only
  decimal?: number;
  defaultEthGas?: number;

  // cosmos only
  denom?: string | "uatom";
  defaultCosmosGas?: number;
  defaultCosmosGasLimit?: number;
}

export interface GetLitAccountInstanceBalance {
  tokenAddress: string;
  denom?: string;
}

export interface GetLitAccountInstance {
  eth: () => Promise<PKPEthersWallet>,
  cosmos: () => Promise<PKPCosmosWallet>,
  send: (params: GetLitAccountInstanceSend) => Promise<void>;
  sign: (content: any) => Promise<any>;
  balance: (params: GetLitAccountInstanceBalance) => Promise<any>;
}