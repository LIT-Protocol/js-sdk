import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

import { OnEvmChain } from '../types';

export function getChain(event: OnEvmChain) {
  const chain = Object.values(LIT_EVM_CHAINS).find(
    (chain) => chain.chainId === event.evmChainId
  );
  if (!chain) {
    throw new Error(`EVM chain with chainId ${event.evmChainId} not found`);
  }

  return chain;
}
