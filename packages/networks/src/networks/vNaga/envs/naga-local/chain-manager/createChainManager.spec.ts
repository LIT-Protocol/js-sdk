import { createChainManager } from './createChainManager';
import { privateKeyToAccount } from 'viem/accounts';

describe('createChainManager', () => {
  it('should create a chain manager', () => {
    const viemAccount = privateKeyToAccount(
      process.env['PRIVATE_KEY']! as `0x${string}`
    );

    const chainManager = createChainManager(viemAccount);

    console.log(chainManager);
  });
});
