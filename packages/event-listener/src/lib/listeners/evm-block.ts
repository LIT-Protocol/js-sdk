import { ethers } from 'ethers';

import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

import { Listener } from './listener';

export type BlockData = ethers.providers.Block;

export class EVMBlockListener extends Listener<BlockData> {
  constructor(rpcUrl: string = LIT_EVM_CHAINS['ethereum'].rpcUrls[0]) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    super({
      start: async () => {
        provider.on('block', async (blockNumber) => {
          const block = await provider.getBlock(blockNumber);
          if (block) {
            this.emit(block);
          }
        });
      },
      stop: async () => {
        provider.removeAllListeners('block');
      },
    });
  }
}
