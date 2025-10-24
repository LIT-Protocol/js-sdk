import { STAKING_STATES, STAKING_STATES_VALUES } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import { getChildLogger } from '@lit-protocol/logger';
import type { CallbackParams, EpochInfo } from '@lit-protocol/types';
import { ConnectionInfo } from '../LitChainClient';
import { LitNetworkModuleBase } from '../../../../types';
import type { INetworkConfig } from '../../interfaces/NetworkContext';
import { areStringArraysDifferent } from './utils/areStringArraysDifferent';
import { fetchBlockchainData } from './helpers/fetchBlockchainData';
import {
  createEvmEventState,
  EventState,
} from './state-types/createEvmEventState';
import {
  createRefreshedValue,
  RefreshedValue,
} from './state-types/createRefreshedValue';
import { createReadOnlyContractsManager } from '../contract-manager';

const _logger = getChildLogger({
  module: 'StateManager',
});

// Constants
const BLOCKHASH_SYNC_INTERVAL = 30_000;

/**
 * It returns a blockhash manager for latestBlockhash/nonce and event state
 * manager for latest connection info.
 */
export const createStateManager = async <T>(params: {
  networkConfig: INetworkConfig<any, any>;
  callback: (params: CallbackParams) => Promise<T>;
  networkModule: LitNetworkModuleBase;
  createReadOnlyChainManager: () => any;
}) => {
  // --- Internal State --- Keep track of the latest known values
  let latestBootstrapUrls: string[] = [];
  let latestEpochInfo: EpochInfo | null = null;
  let latestConnectionInfo: ConnectionInfo | null = null;
  let callbackResult: T | null = null;

  // just a test to check on the Lit Client we are getting the latest result
  // let counter = 0;

  // --- Internal Managers --- (Not directly exposed)
  const blockhashManager: RefreshedValue<string> = createRefreshedValue<string>(
    {
      fetch: fetchBlockchainData,
      ttlMs: BLOCKHASH_SYNC_INTERVAL,
    }
  );

  const readOnlyChainManager = params.createReadOnlyChainManager();
  const contractManager = createReadOnlyContractsManager(params.networkConfig);

  // --- Initial Fetch for Connection Info ---
  try {
    const initialConnectionInfo =
      await readOnlyChainManager.api.connection.getConnectionInfo();
    latestBootstrapUrls = initialConnectionInfo.bootstrapUrls;
    latestEpochInfo = initialConnectionInfo.epochInfo; // Store initial epoch info
    latestConnectionInfo = initialConnectionInfo; // Store initial connection info
    _logger.info(
      {
        initialUrls: latestBootstrapUrls,
        initialEpoch: latestEpochInfo?.number,
        initialConnectionInfo,
      },
      'State Manager Initialized with Connection Info'
    );

    // --- Initial callback
    callbackResult = await params.callback({
      bootstrapUrls: latestBootstrapUrls,
      currentEpoch: latestEpochInfo?.number || 0,
      version: params.networkModule.version,
      requiredAttestation: params.networkModule.config.requiredAttestation,
      minimumThreshold: params.networkModule.config.minimumThreshold,
      abortTimeout: params.networkModule.config.abortTimeout,
      endpoints: params.networkModule.getEndpoints(),
      // releaseVerificationConfig: null,
      networkModule: params.networkModule,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    _logger.error(
      { error: err, message: err.message, stack: err.stack },
      'Failed to get initial connection info for State Manager'
    );
    throw err;
  }

  // --- Setup Staking Event Listener ---
  const stakingContract = new ethers.Contract(
    contractManager.stakingContract.address,
    contractManager.stakingContract.abi,
    new ethers.providers.JsonRpcProvider(params.networkConfig.rpcUrl)
  );

  const eventStateManager: EventState<STAKING_STATES_VALUES | null> =
    createEvmEventState<STAKING_STATES_VALUES | null>({
      contract: stakingContract,
      eventName: 'StateChanged',
      initialValue: null, // Initial value of the *event state itself*
      transform: (args: any[]): STAKING_STATES_VALUES => {
        return args[0] as STAKING_STATES_VALUES;
      },
      onChange: async (newState: STAKING_STATES_VALUES | null) => {
        // 1. check if the new state is valid
        if (newState === null) return;

        _logger.info(`New staking state detected: "${newState}"`);

        // 2. If state is Active, refresh connection info
        if (newState === (STAKING_STATES.Active as STAKING_STATES_VALUES)) {
          try {
            _logger.info(
              '🖐 Staking state is Active. Fetching latest connection info...'
            );
            const newConnectionInfo =
              await readOnlyChainManager.api.connection.getConnectionInfo();
            const newBootstrapUrls = newConnectionInfo.bootstrapUrls;
            const newEpochInfo = newConnectionInfo.epochInfo; // Get new epoch info
            latestConnectionInfo = newConnectionInfo; // Update internal state for connection info

            const bootstrapUrlsChanged = areStringArraysDifferent(
              latestBootstrapUrls,
              newBootstrapUrls
            );

            if (bootstrapUrlsChanged) {
              _logger.warn(
                {
                  oldUrls: latestBootstrapUrls,
                  newUrls: newBootstrapUrls,
                },
                'Bootstrap URLs changed. Updating internal state.'
              );
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

            // -- callback
            callbackResult = await params.callback({
              bootstrapUrls: latestBootstrapUrls,
              currentEpoch: latestEpochInfo!.number,
              version: params.networkModule.version,
              requiredAttestation:
                params.networkModule.config.requiredAttestation,
              minimumThreshold: params.networkModule.config.minimumThreshold,
              abortTimeout: params.networkModule.config.abortTimeout,
              endpoints: params.networkModule.getEndpoints(),
              releaseVerificationConfig: null,
              networkModule: params.networkModule,
            });
          } catch (error) {
            _logger.error(
              { error },
              'Failed to get connection info during staking onChange'
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

  _logger.info('State manager background processes started.');

  // -- Start counter
  // const timer = setInterval(() => {
  //   counter++;
  // }, 3000);

  // --- Return the Public Interface ---
  return {
    /**
     * Gets the latest known blockhash, potentially triggering a fetch or refresh if needed.
     */
    getLatestBlockhash: async (): Promise<string> => {
      try {
        return await blockhashManager.getOrRefreshAndGet();
      } catch (error) {
        _logger.error({ error }, 'Error getting latest blockhash');
        throw error; // Re-throw after logging
      }
    },

    getCallbackResult: (): T | null => {
      return callbackResult;
    },

    // getCounter: (): number => {
    //   return counter;
    // },

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
      eventStateManager.stop();
      // clearInterval(timer);
    },
    stakingContract,
  };
};
