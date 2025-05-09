import { Chain } from 'viem';
import { NagaEndpointsType } from '../shared/endpoints';

const HTTP = 'http://' as const;
const HTTPS = 'https://' as const;

type SupportedProtocols = typeof HTTP | typeof HTTPS;

export interface INetworkContext<T, M> {
  minimumThreshold: number;
  network: string;
  rpcUrl: string;
  abiSignatures: T;
  chainConfig: Chain;
  httpProtocol: SupportedProtocols;
  networkSpecificConfigs?: M;
  endpoints: NagaEndpointsType;
}
