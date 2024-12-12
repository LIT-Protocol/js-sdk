import { ethers } from 'ethers';

import { EVMBlockListener } from './evm-block';

jest.mock('ethers');

describe('EVMBlockListener', () => {
  let evmBlockListener: EVMBlockListener;
  let providerMock: jest.Mocked<ethers.providers.JsonRpcProvider>;

  beforeEach(() => {
    providerMock = {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      getBlock: jest.fn().mockResolvedValue({ number: 123, hash: '0xabc' }),
    } as unknown as jest.Mocked<ethers.providers.JsonRpcProvider>;

    (
      ethers.providers.JsonRpcProvider as unknown as jest.Mock
    ).mockImplementation(() => providerMock);

    evmBlockListener = new EVMBlockListener('http://example-rpc-url.com');
  });

  afterEach(async () => {
    await evmBlockListener.stop();
    jest.clearAllMocks();
  });

  it('should start listening to block events', async () => {
    await evmBlockListener.start();

    expect(providerMock.on).toHaveBeenCalledWith('block', expect.any(Function));
  });

  it('should emit block data on block event', async () => {
    const callback = jest.fn();
    evmBlockListener.onStateChange(callback);

    await evmBlockListener.start();

    // Simulate block event
    const blockEventCallback = providerMock.on.mock.calls[0][1];
    await blockEventCallback(123);

    expect(providerMock.getBlock).toHaveBeenCalledWith(123);
    expect(callback).toHaveBeenCalledWith({ number: 123, hash: '0xabc' });
  });

  it('should stop listening to block events', async () => {
    await evmBlockListener.start();
    await evmBlockListener.stop();

    expect(providerMock.removeAllListeners).toHaveBeenCalledWith('block');
  });
});
