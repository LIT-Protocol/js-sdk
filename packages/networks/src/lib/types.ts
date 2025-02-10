import { LITEVMChain } from 'packages/constants/src/lib/constants/types';

// TODO: These types can probably be moved into the `networks` package and only exposed by way of the `LitNetwork` if necessary
import { LIT_ENDPOINT, HTTP, HTTPS } from '@lit-protocol/constants';

import type { LitContract } from '@lit-protocol/types';

export interface LitChainConfig {
  chain: LITEVMChain;
  contractData: LitContract[];
}

export interface LitNetworkConfig {
  name: string;
  chainConfig: LitChainConfig;
  endpoints: typeof LIT_ENDPOINT;
  httpProtocol: typeof HTTP | typeof HTTPS;
  options?: unknown;
}
