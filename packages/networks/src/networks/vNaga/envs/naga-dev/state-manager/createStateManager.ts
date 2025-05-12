import { STAKING_STATES, STAKING_STATES_VALUES } from '@lit-protocol/constants';
import { createReadOnlyChainManager } from '@nagaDev/ChainManager';
import { createReadOnlyContractsManager } from '@vNaga/LitChainClient';
import { ethers } from 'ethers';
import { fetchBlockchainData } from '../../../../shared/StateManager/helpers/fetchBlockchainData';
import {
  createEvmEventState,
  EventState,
} from '../../../../shared/StateManager/src/createEvmEventState';
import {
  createRefreshedValue,
  RefreshedValue,
} from '../../../../shared/StateManager/src/createRefreshedValue';
import { NagaDevNetworkConfig } from '../naga-dev.config';
// Import EpochInfo type (adjust path if necessary based on actual export location)
import type { EpochInfo } from '@lit-protocol/types';
import { getChildLogger } from '@lit-protocol/logger';
import { ConnectionInfo } from '@vNaga/LitChainClient/apis/highLevelApis/connection/getConnectionInfo';

const _logger = getChildLogger({
  module: 'StateManager',
});

const BLOCKHASH_SYNC_INTERVAL = 30_000;

// -- Helper Function (copied from lit-node-client) --
/**
 * Compares two arrays of strings to determine if they are different.
 * Two arrays are considered different if they have different lengths,
 * or if they do not contain the same elements with the same frequencies, regardless of order.
 *
 * @param arr1 The first array of strings.
 * @param arr2 The second array of strings.
 * @returns True if the arrays are different, false otherwise.
 */
const areStringArraysDifferent = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) {
    return true;
  }

  // Create sorted copies of the arrays
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  // Compare the sorted arrays element by element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return true; // Found a difference
    }
  }

  return false; // Arrays are permutations of each other (same elements, same frequencies)
};
// -- End Helper Function --

/**
 * It returns a blockhash manager for latestBlockhash/nonce and event state
 * manager for latest connection info.
 */
export const createStateManager = async ({
  networkConfig,
}: {
  networkConfig: NagaDevNetworkConfig;
}) => {
  // --- Internal State --- Keep track of the latest known values
  let latestBootstrapUrls: string[] = [];
  let latestEpochInfo: EpochInfo | null = null;
  let latestConnectionInfo: ConnectionInfo | null = null;

  // --- Internal Managers --- (Not directly exposed)
  const blockhashManager: RefreshedValue<string> = createRefreshedValue<string>(
    {
      fetch: fetchBlockchainData,
      ttlMs: BLOCKHASH_SYNC_INTERVAL,
    }
  );

  const readOnlyChainManager = createReadOnlyChainManager();
  const contractManager = createReadOnlyContractsManager(networkConfig);

  // --- Initial Fetch for Connection Info ---
  try {
    const initialConnectionInfo =
      await readOnlyChainManager.api.connection.getConnectionInfo();
    latestBootstrapUrls = initialConnectionInfo.bootstrapUrls;
    latestEpochInfo = initialConnectionInfo.epochInfo; // Store initial epoch info
    latestConnectionInfo = initialConnectionInfo; // Store initial connection info
    _logger.info({
      msg: 'State Manager Initialized with Connection Info',
      initialUrls: latestBootstrapUrls,
      initialEpoch: latestEpochInfo?.number,
      initialConnectionInfo,
    });
  } catch (error) {
    _logger.error(
      'Failed to get initial connection info for State Manager',
      error
    );
    // Depending on requirements, might want to re-throw or handle differently
    throw new Error('Failed to initialize state manager connection info.');
  }

  // --- Setup Staking Event Listener ---
  const stakingContract = new ethers.Contract(
    contractManager.stakingContract.address,
    contractManager.stakingContract.abi,
    new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl)
  );

  const eventStateManager: EventState<STAKING_STATES_VALUES | null> =
    createEvmEventState<STAKING_STATES_VALUES | null>({
      contract: stakingContract,
      eventName: 'StateChanged',
      initialValue: null, // Initial value of the *event state itself*
      transform: (args: any[]): STAKING_STATES_VALUES => {
        return args[0] as STAKING_STATES_VALUES;
      },
      onChange: async (newState) => {
        // 1. check if the new state is valid
        if (!newState) return;

        _logger.info(`New staking state detected: "${newState}"`);

        // 2. If state is Active, refresh connection info
        if (
          newState === (STAKING_STATES.Active as STAKING_STATES_VALUES) ||
          newState ===
            (STAKING_STATES.NextValidatorSetLocked as STAKING_STATES_VALUES)
          // newState === (STAKING_STATES.ReadyForNextEpoch as STAKING_STATES_VALUES)
        ) {
          try {
            _logger.info(
              'Staking state is Active. Fetching latest connection info...'
            );
            const validatorData =
              await readOnlyChainManager.api.connection.getConnectionInfo();
            const newBootstrapUrls = validatorData.bootstrapUrls;
            const newEpochInfo = validatorData.epochInfo; // Get new epoch info
            latestConnectionInfo = validatorData; // Update internal state for connection info

            const isDifferent = areStringArraysDifferent(
              latestBootstrapUrls,
              newBootstrapUrls
            );

            if (isDifferent) {
              _logger.warn({
                msg: 'Bootstrap URLs changed. Updating internal state.',
                oldUrls: latestBootstrapUrls,
                newUrls: newBootstrapUrls,
              });
              latestBootstrapUrls = newBootstrapUrls; // Update internal state
            } else {
              _logger.info('BootstrapUrls remain unchanged.');
            }

            // Always update epoch info when Active state is processed
            if (latestEpochInfo?.number !== newEpochInfo.number) {
              _logger.info(
                `Epoch number updated from ${latestEpochInfo?.number} to ${newEpochInfo.number}`
              );
              latestEpochInfo = newEpochInfo;
            } else {
              _logger.info(
                `Epoch number ${newEpochInfo.number} remains the same.`
              );
            }
          } catch (error) {
            _logger.error(
              'Failed to get connection info during staking onChange',
              error
            );
            // Decide how to handle this error - maybe keep old state?
          }
        } else {
          _logger.info(
            `Staking state is "${newState}", not Active. Connection info not refreshed via event.`
          );
        }
      },
    });

  // --- Start Listeners ---
  // Assumes createEvmEventState requires explicit start or returns an interface with listen()
  // If createRefreshedValue requires explicit start, call it too.
  // Adjust based on actual library API.
  eventStateManager.listen(); // Assuming .listen() starts the EVM listener
  // blockhashManager.start(); // Assuming .start() might be needed for createRefreshedValue

  _logger.info('State manager background processes started.');

  // --- Return the Public Interface ---
  return {
    /**
     * Gets the latest known blockhash, potentially triggering a fetch or refresh if needed.
     */
    getLatestBlockhash: async (): Promise<string> => {
      try {
        return await blockhashManager.getOrRefreshAndGet();
      } catch (error) {
        _logger.error('Error getting latest blockhash', error);
        throw error; // Re-throw after logging
      }
    },

    /**
     * Gets the latest known list of bootstrap URLs, updated when staking state becomes Active.
     */
    getLatestBootstrapUrls: (): string[] => {
      return [...latestBootstrapUrls]; // Return a copy
    },

    /**
     * Gets the latest known epoch info, updated when staking state becomes Active.
     */
    getLatestEpochInfo: (): EpochInfo | null => {
      // Return a deep copy if EpochInfo is mutable, otherwise direct return is fine
      return latestEpochInfo ? { ...latestEpochInfo } : null;
    },

    /**
     * Gets the latest known connection info, updated when staking state becomes Active.
     */
    getLatestConnectionInfo: (): ConnectionInfo | null => {
      // Return a deep copy if ConnectionInfo is mutable, otherwise direct return is fine
      return latestConnectionInfo ? { ...latestConnectionInfo } : null;
    },

    /**
     * Stops the background listeners (blockhash refresh, event listening).
     */
    stop: () => {
      _logger.info('Stopping state manager listeners...');
      // RefreshedValue does not have a stop method, only stop the event listener
      // blockhashManager.stop();
      eventStateManager.stop();
    },
  };
};
