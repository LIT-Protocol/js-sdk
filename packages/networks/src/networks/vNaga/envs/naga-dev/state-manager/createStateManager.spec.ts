import { createStateManager } from './createStateManager';
import { STAKING_STATES } from '@lit-protocol/constants';
import { createReadOnlyChainManager } from '@nagaDev/ChainManager';
import { createReadOnlyContractsManager } from '@vNaga/LitChainClient';
import { ethers } from 'ethers';
import { fetchBlockchainData } from '../../../../shared/StateManager/helpers/fetchBlockchainData';
import { createEvmEventState } from '../../../../shared/StateManager/src/createEvmEventState';
import { createRefreshedValue } from '../../../../shared/StateManager/src/createRefreshedValue';
import { getChildLogger } from '@lit-protocol/logger';

// Mock dependencies
jest.mock('@nagaDev/ChainManager');
jest.mock('@vNaga/LitChainClient');
jest.mock('ethers');
jest.mock('../../../../shared/StateManager/helpers/fetchBlockchainData');
jest.mock('../../../../shared/StateManager/src/createEvmEventState');
jest.mock('../../../../shared/StateManager/src/createRefreshedValue');
jest.mock('@lit-protocol/logger');

const mockGetChildLogger = getChildLogger as jest.Mock;
const mockCreateReadOnlyChainManager = createReadOnlyChainManager as jest.Mock;
const mockCreateReadOnlyContractsManager =
  createReadOnlyContractsManager as jest.Mock;
const mockEthersContract = ethers.Contract as jest.Mock;
const mockEthersJsonRpcProvider = ethers.providers.JsonRpcProvider as jest.Mock;
const mockFetchBlockchainData = fetchBlockchainData as jest.Mock;
const mockCreateEvmEventState = createEvmEventState as jest.Mock;
const mockCreateRefreshedValue = createRefreshedValue as jest.Mock;

describe('createStateManager', () => {
  let mockNetworkConfig: any;
  let mockLogger: any;
  let mockGetConnectionInfo: jest.Mock;
  let mockGetOrRefreshAndGet: jest.Mock;
  let mockEvmEventStateInstance: {
    listen: jest.Mock;
    stop: jest.Mock;
    onChangeCallback?: (newState: any) => Promise<void>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    mockGetChildLogger.mockReturnValue(mockLogger);

    mockGetConnectionInfo = jest.fn();
    mockCreateReadOnlyChainManager.mockReturnValue({
      api: {
        connection: {
          getConnectionInfo: mockGetConnectionInfo,
        },
      },
    });

    mockCreateReadOnlyContractsManager.mockReturnValue({
      stakingContract: {
        address: '0xStakingContractAddress',
        abi: [],
      },
    });

    mockEthersContract.mockImplementation(() => ({}));
    mockEthersJsonRpcProvider.mockImplementation(() => ({}));

    mockGetOrRefreshAndGet = jest.fn();
    mockCreateRefreshedValue.mockReturnValue({
      getOrRefreshAndGet: mockGetOrRefreshAndGet,
    });

    mockEvmEventStateInstance = {
      listen: jest.fn(),
      stop: jest.fn(),
    };
    mockCreateEvmEventState.mockImplementation(({ onChange }) => {
      // Capture the onChange callback to simulate events
      mockEvmEventStateInstance.onChangeCallback = onChange;
      return mockEvmEventStateInstance;
    });

    mockNetworkConfig = {
      rpcUrl: 'http://localhost:8545',
      // Add other necessary config properties if your tests need them
    };
  });

  const initialConnectionInfo = {
    bootstrapUrls: ['http://node1.com'],
    epochInfo: { number: 1, id: 'epoch1' },
    connectedNodes: new Map([['node1', {}]]),
  };

  const updatedConnectionInfo = {
    bootstrapUrls: ['http://node2.com', 'http://node3.com'],
    epochInfo: { number: 2, id: 'epoch2' },
    connectedNodes: new Map([['node2', {}]]),
  };

  it('should initialize, fetch initial connection info, and start listeners', async () => {
    mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);

    const stateManager = await createStateManager({
      networkConfig: mockNetworkConfig,
    });

    expect(mockGetChildLogger).toHaveBeenCalledWith({ module: 'StateManager' });
    expect(mockCreateReadOnlyChainManager).toHaveBeenCalled();
    expect(mockCreateReadOnlyContractsManager).toHaveBeenCalledWith(
      mockNetworkConfig
    );
    expect(mockGetConnectionInfo).toHaveBeenCalledTimes(1);
    expect(stateManager.getLatestConnectionInfo()).toEqual(
      initialConnectionInfo
    );
    expect(mockCreateEvmEventState).toHaveBeenCalled();
    expect(mockEvmEventStateInstance.listen).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'State manager background processes started.'
    );
  });

  it('should throw an error if initial connection info fetch fails', async () => {
    const error = new Error('Failed to connect');
    mockGetConnectionInfo.mockRejectedValueOnce(error);

    await expect(
      createStateManager({ networkConfig: mockNetworkConfig })
    ).rejects.toThrow('Failed to initialize state manager connection info.');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to get initial connection info for State Manager',
      error
    );
  });

  describe('getLatestBlockhash', () => {
    it('should return blockhash from blockhashManager', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });

      const mockBlockhash = '0x123abc';
      mockGetOrRefreshAndGet.mockResolvedValueOnce(mockBlockhash);

      const blockhash = await stateManager.getLatestBlockhash();
      expect(blockhash).toBe(mockBlockhash);
      expect(mockGetOrRefreshAndGet).toHaveBeenCalled();
    });

    it('should throw error if blockhashManager fails', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });

      const error = new Error('Blockhash fetch failed');
      mockGetOrRefreshAndGet.mockRejectedValueOnce(error);

      await expect(stateManager.getLatestBlockhash()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error getting latest blockhash',
        error
      );
    });
  });

  describe('getLatestConnectionInfo', () => {
    it('should return the latest connection info', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });
      expect(stateManager.getLatestConnectionInfo()).toEqual(
        initialConnectionInfo
      );
    });
  });

  describe('staking state changes', () => {
    it('should refresh connection info, update urls and epoch when state becomes Active and data changed', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });

      // Ensure onChangeCallback is defined
      if (!mockEvmEventStateInstance.onChangeCallback) {
        throw new Error(
          'onChangeCallback was not set on mockEvmEventStateInstance'
        );
      }

      // Simulate second call to getConnectionInfo
      mockGetConnectionInfo.mockResolvedValueOnce(updatedConnectionInfo);

      await mockEvmEventStateInstance.onChangeCallback(STAKING_STATES.Active);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'New staking state detected: "Active"'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Staking state is Active. Fetching latest connection info...'
      );
      expect(mockGetConnectionInfo).toHaveBeenCalledTimes(2); // Initial + Active state
      expect(stateManager.getLatestConnectionInfo()).toEqual(
        updatedConnectionInfo
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Bootstrap URLs changed. Updating internal state.',
          oldUrls: initialConnectionInfo.bootstrapUrls,
          newUrls: updatedConnectionInfo.bootstrapUrls,
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Epoch number updated from 1 to 2'
      );
    });

    it('should refresh connection info but not log warnings if URLs and epoch are the same', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });
      // Ensure onChangeCallback is defined
      if (!mockEvmEventStateInstance.onChangeCallback) {
        throw new Error(
          'onChangeCallback was not set on mockEvmEventStateInstance'
        );
      }

      // Simulate second call to getConnectionInfo returns same data
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      await mockEvmEventStateInstance.onChangeCallback(STAKING_STATES.Active);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'New staking state detected: "Active"'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Staking state is Active. Fetching latest connection info...'
      );
      expect(mockGetConnectionInfo).toHaveBeenCalledTimes(2);
      expect(stateManager.getLatestConnectionInfo()).toEqual(
        initialConnectionInfo
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'BootstrapUrls remain unchanged.'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Epoch number 1 remains the same.'
      );
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Bootstrap URLs changed. Updating internal state.',
        })
      );
    });

    it('should handle error when fetching connection info during Active state', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });

      if (!mockEvmEventStateInstance.onChangeCallback) {
        throw new Error(
          'onChangeCallback was not set on mockEvmEventStateInstance'
        );
      }

      const fetchError = new Error('Fetch connection info failed');
      mockGetConnectionInfo.mockRejectedValueOnce(fetchError); // Fail on the second call

      await mockEvmEventStateInstance.onChangeCallback(STAKING_STATES.Active);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get connection info during staking onChange',
        fetchError
      );
      // Connection info should remain the initial one
      expect(stateManager.getLatestConnectionInfo()).toEqual(
        initialConnectionInfo
      );
    });

    it('should not refresh connection info if state is not Active', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });

      if (!mockEvmEventStateInstance.onChangeCallback) {
        throw new Error(
          'onChangeCallback was not set on mockEvmEventStateInstance'
        );
      }

      await mockEvmEventStateInstance.onChangeCallback(STAKING_STATES.Paused);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'New staking state detected: "Paused"'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Staking state is "Paused", not Active. Connection info not refreshed via event.'
      );
      expect(mockGetConnectionInfo).toHaveBeenCalledTimes(1); // Only initial call
      expect(stateManager.getLatestConnectionInfo()).toEqual(
        initialConnectionInfo
      );
    });

    it('should do nothing if new state is null in onChange', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      await createStateManager({ networkConfig: mockNetworkConfig });

      if (!mockEvmEventStateInstance.onChangeCallback) {
        throw new Error(
          'onChangeCallback was not set on mockEvmEventStateInstance'
        );
      }

      await mockEvmEventStateInstance.onChangeCallback(null);
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('New staking state detected:')
      );
    });
  });

  describe('stop', () => {
    it('should call stop on eventStateManager', async () => {
      mockGetConnectionInfo.mockResolvedValueOnce(initialConnectionInfo);
      const stateManager = await createStateManager({
        networkConfig: mockNetworkConfig,
      });

      stateManager.stop();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Stopping state manager listeners...'
      );
      expect(mockEvmEventStateInstance.stop).toHaveBeenCalled();
    });
  });
});
