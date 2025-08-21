import { Chain } from 'viem';
import type { INetworkConfig } from '../../shared/interfaces/NetworkContext';
import type { NagaEndpointsType } from '../../shared/managers/endpoints-manager/endpoints';

export interface BaseEnvironmentServices {
  authServiceBaseUrl: string;
  loginServiceBaseUrl: string;
}

export interface BaseEnvironmentOptions<T, M> {
  network: string;
  abiSignatures: T;
  networkSpecificConfigs?: M;
  services: BaseEnvironmentServices;
  minimumThreshold?: number;
  httpProtocol?: 'http://' | 'https://';
  requiredAttestation?: boolean;
}

export abstract class BaseNetworkEnvironment<T, M> {
  protected readonly config: INetworkConfig<T, M>;

  constructor(options: BaseEnvironmentOptions<T, M>) {
    this.config = {
      minimumThreshold: options.minimumThreshold || 3,
      network: options.network,
      rpcUrl: this.getRpcUrl(),
      abiSignatures: options.abiSignatures,
      chainConfig: this.getChainConfig(),
      httpProtocol: options.httpProtocol || 'https://',
      networkSpecificConfigs: options.networkSpecificConfigs,
      endpoints: this.getEndpoints(),
      services: options.services,
      requiredAttestation: options.requiredAttestation ?? true,
    };
  }

  public getConfig(): INetworkConfig<T, M> {
    return this.config;
  }

  public getNetworkName(): string {
    return this.config.network;
  }

  public getMinimumThreshold(): number {
    return this.config.minimumThreshold;
  }

  public getServices(): BaseEnvironmentServices {
    return this.config.services;
  }

  protected abstract getRpcUrl(): string;
  protected abstract getChainConfig(): Chain;
  protected abstract getEndpoints(): NagaEndpointsType;
  protected abstract getDefaultRealmId(): bigint;
}

export interface EnvironmentManager {
  createStateManager: <T>(params: {
    callback: (params: any) => Promise<T>;
    networkModule: any;
  }) => Promise<any>;
  getMaxPricesForNodeProduct: (params: any) => any;
  getUserMaxPrice: (params: any) => any;
}
