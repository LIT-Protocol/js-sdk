import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

export function getEvmChain(evmChainId: number) {
  const chain = Object.values(LIT_EVM_CHAINS).find(
    (chain) => chain.chainId === evmChainId
  );
  if (!chain) {
    throw new Error(`EVM chain with chainId ${evmChainId} not found`);
  }

  return chain;
}
