import { ethers } from 'ethers';

import {
  LIT_EVM_CHAINS,
  InvalidArgumentException,
  UnsupportedChainException,
} from '@lit-protocol/constants';

export function getEvmChain(evmChainId: ethers.BigNumberish) {
  const evmChainIdNumber = ethers.BigNumber.from(evmChainId).toNumber();
  if (evmChainIdNumber === 0) {
    throw new InvalidArgumentException(
      {
        info: {
          evmChainId: evmChainIdNumber,
        },
      },
      'EVM chainId cannot be 0'
    );
  }

  const chain = Object.values(LIT_EVM_CHAINS).find(
    (chain) => chain.chainId === evmChainIdNumber
  );
  if (!chain) {
    throw new UnsupportedChainException(
      {
        info: {
          evmChainId: evmChainIdNumber,
        },
      },
      `EVM chain with chainId ${evmChainId} not found`
    );
  }

  return chain;
}
