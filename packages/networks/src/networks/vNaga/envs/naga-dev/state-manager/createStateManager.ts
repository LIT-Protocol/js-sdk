import { STAKING_STATES_VALUES } from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import { ethers } from 'ethers';
import { fetchBlockchainData } from '../../../../shared/StateManager/helpers/fetchBlockchainData';
import { createEvmEventState } from '../../../../shared/StateManager/src/createEvmEventState';
import { createRefreshedValue } from '../../../../shared/StateManager/src/createRefreshedValue';

const _logger = getChildLogger({
  module: '[NagaDev] createStateManager',
});

const BLOCKHASH_SYNC_INTERVAL = 30_000;

export const createStateManager = ({
  contract,
}: {
  contract: ethers.Contract;
}) => {
  // 1. create a blockhash manager
  const blockhashManager = createRefreshedValue<string>({
    fetch: fetchBlockchainData,
    ttlMs: BLOCKHASH_SYNC_INTERVAL,
    initialValue: '',
  });

  // 2. create an event state manager
  const eventStateManager = createEvmEventState({
    contract: contract,
    eventName: 'StateChanged',
    initialValue: null,
    transform: (args: any[]): STAKING_STATES_VALUES => {
      return args[0] as STAKING_STATES_VALUES;
    },
    onChange: async (newState) => {
      // 1. check if the new state is valid
      if (!newState) return;

      _logger.info(`New state detected via createEvmEventState: "${newState}"`);

      // 2. get the current connection info
    },
  });

  return {
    blockhashManager,
  };
};
