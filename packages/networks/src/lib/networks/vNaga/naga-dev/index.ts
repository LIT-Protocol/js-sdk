import { HTTPS, LIT_CHAINS, LIT_ENDPOINT } from '@lit-protocol/constants';
import { nagaDev } from '@lit-protocol/contracts';

import { LitNetwork } from '../../../LitNetwork';

import type { LitNetworkConfig } from '../../../types';

export class NagaDev extends LitNetwork {
  constructor(params: Partial<LitNetworkConfig>) {
    // NOTE: only contractData is managed by network; LitChainClient must handle the full ContractContext as it needs to actually hit the chain
    // to get contract addresses, and the LitNetwork doesn't use the chain directly
    super({
      name: 'naga-dev',
      endpoints: LIT_ENDPOINT,
      httpProtocol: HTTPS,
      chainConfig: {
        chain: LIT_CHAINS['yellowstone'],
        contractData: nagaDev.data.map((c) => ({
          address: c.contracts[0].address_hash,
          abi: c.contracts[0].ABI,
          name: c.name,
        })),
      },
      ...params,
    });
  }

  // Note: Node selection logic happens in the createXXXRequest() methods, as it is network-specific

  // TODO: Input: LitNodeClient.decrypt() params
  // TODO: Output: LitNodeClient.sendCommandToNode() params array
  async createDecryptRequests(params: unknown) {
    return undefined;
  }

  // TODO: Input: Result from sending decrypt requests to all necessary nodes
  // TODO: Output: LitNodeClient.decrypt() return value
  async handleDecryptResponses(response: unknown) {
    return {};
  }

  // TODO: LitNodeClient.executeJs() params
  async createExecuteJsRequests(params: unknown) {
    return undefined;
  }

  // TODO: LitNodeClient.executeJs() return value
  async handleExecuteJsResponses(response: unknown) {
    return {};
  }

  // TODO: LitNodeClient.pkpSign() params
  async createSignRequests(params: unknown) {
    return undefined;
  }

  // TODO: LitNodeClient.pkpSign() return value
  async handleSignResponses(response: unknown) {
    return {};
  }
}
