import { Chain } from 'viem';
import { NagaEndpointsType } from '../endpoints-manager/endpoints';
import { signatures as localDevSignatures } from '../envs/naga-local/generated/naga-develop';

const HTTP = 'http://' as const;
const HTTPS = 'https://' as const;

type SupportedProtocols = typeof HTTP | typeof HTTPS;

export interface INetworkConfig<T, M> {
  minimumThreshold: number;
  network: string;
  rpcUrl: string;
  abiSignatures: T;
  chainConfig: Chain;
  httpProtocol: SupportedProtocols;
  networkSpecificConfigs?: M;
  endpoints: NagaEndpointsType;
  services: {
    authServiceBaseUrl: string;
    loginServiceBaseUrl: string;
  };
}

export type DefaultNetworkConfig = INetworkConfig<
  typeof localDevSignatures,
  any
>;
