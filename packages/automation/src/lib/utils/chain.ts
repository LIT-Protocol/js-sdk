import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

import { OnEvmChainEvent } from '../types';

export function getChain(event: OnEvmChainEvent) {
  const chain = Object.values(LIT_EVM_CHAINS).find(
    (chain) => chain.chainId === event.evmChainId
  );
  if (!chain) {
    throw new Error(`EVM chain with chainId ${event.evmChainId} not found`);
  }

  return chain;
}
