// TODO: These types can probably be moved into the `networks` package and only exposed by way of the `LitNetwork` if necessary
import { LIT_ENDPOINT, HTTP, HTTPS, LIT_CHAINS } from '@lit-protocol/constants';

import type { LitContract } from '@lit-protocol/types';

export interface LitChainConfig {
  chain: (typeof LIT_CHAINS)[keyof typeof LIT_CHAINS];
  contractData: LitContract[];
}

export interface LitNetworkConfig {
  name: string;
  chainConfig: LitChainConfig;
  endpoints: typeof LIT_ENDPOINT;
  httpProtocol: typeof HTTP | typeof HTTPS;
  options?: unknown;
}
