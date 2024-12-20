import { ethers } from 'ethers';

import {
  EVMContractEventListener,
  ContractInfo,
  EventInfo,
} from './evm-contract-event';

jest.mock('ethers');

describe('EVMContractEventListener', () => {
  let evmContractEventListener: EVMContractEventListener;
  let contractMock: jest.Mocked<ethers.Contract>;
  const rpcUrl = 'http://example-rpc-url.com';
  const contractInfo: ContractInfo = {
    address: '0x123',
    abi: [],
  };
  const eventInfo: EventInfo = {
    name: 'TestEvent',
  };

  beforeEach(() => {
    contractMock = {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      filters: {
        TestEvent: jest.fn().mockReturnValue({}),
      },
    } as unknown as jest.Mocked<ethers.Contract>;

    (ethers.Contract as unknown as jest.Mock).mockImplementation(
      () => contractMock
    );

    evmContractEventListener = new EVMContractEventListener(
      rpcUrl,
      contractInfo,
      eventInfo
    );
  });

  afterEach(async () => {
    await evmContractEventListener.stop();
    jest.clearAllMocks();
  });

  it('should start listening to contract events', async () => {
    await evmContractEventListener.start();

    expect(contractMock.on).toHaveBeenCalledWith({}, expect.any(Function));
  });

  it('should emit event data on contract event', async () => {
    const callback = jest.fn();
    evmContractEventListener.onStateChange(callback);

    await evmContractEventListener.start();

    // Simulate contract event
    const eventCallback = contractMock.on.mock.calls[0][1];
    const mockEvent = { blockNumber: 123, transactionHash: '0xabc' };
    eventCallback('arg1', 'arg2', mockEvent);

    expect(callback).toHaveBeenCalledWith({
      event: mockEvent,
      args: ['arg1', 'arg2'],
      blockNumber: 123,
      transactionHash: '0xabc',
    });
  });

  it('should stop listening to contract events', async () => {
    await evmContractEventListener.start();
    await evmContractEventListener.stop();

    expect(contractMock.removeAllListeners).toHaveBeenCalledWith(
      eventInfo.name
    );
  });
});
