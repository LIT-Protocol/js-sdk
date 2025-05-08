import { EpochCache } from '../types';

/**
 * This number is primarily used for local testing. When running nodes locally,
 * epoch 1 is the first epoch and does not contain any peers, we need to
 * wait for the DKG process to complete.
 */
const EPOCH_READY_FOR_LOCAL_DEV = 3;

// On epoch change, we wait this many seconds for the nodes to update to the new epoch before using the new epoch #
const EPOCH_PROPAGATION_DELAY = 45_000;

// if the epoch started less than 15s ago (aka EPOCH_PROPAGATION_DELAY), use the previous epoch number
// this gives the nodes time to sync with the chain and see the new epoch before we try to use it
export const calculateEffectiveEpochNumber = (epochCache: EpochCache) => {
  if (
    epochCache.currentNumber &&
    epochCache.startTime &&
    Math.floor(Date.now() / 1000) <
      epochCache.startTime + Math.floor(EPOCH_PROPAGATION_DELAY / 1000) &&
    epochCache.currentNumber >= EPOCH_READY_FOR_LOCAL_DEV
  ) {
    return epochCache.currentNumber - 1;
  }
  return epochCache.currentNumber;
};
