import type { INetworkConfig } from './interfaces/NetworkContext';

export interface SharedManagerDependencies<T, M> {
  networkConfig: INetworkConfig<T, M>;
}

export interface PricingContext {
  product: string;
  realmId?: bigint;
}

export interface AuthContext {
  authMethodType: number;
  authMethodId: string;
  publicKey?: string;
  accessToken?: string;
}

export interface ConnectionInfo {
  bootstrapUrls: string[];
  epochState: {
    currentNumber: number;
  };
}

export interface JitContext {
  keySet: Record<
    string,
    {
      publicKey: Uint8Array;
      secretKey: Uint8Array;
    }
  >;
  nodePrices: any;
}
