import { createChainManager } from 'packages/networks/dist/src/networks/vNaga/envs/naga-dev/chain-manager/createChainManager';
import { privateKeyToAccount } from 'viem/accounts';

describe('createChainManager', () => {
  it('should create a chain manager', () => {
    const viemAccount = privateKeyToAccount(`0x${process.env['PRIVATE_KEY']!}`);

    const chainManager = createChainManager(viemAccount);

    console.log(chainManager);
  });
});
