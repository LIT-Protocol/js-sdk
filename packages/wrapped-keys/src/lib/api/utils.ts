import { NETWORK_EVM, NETWORK_SOLANA } from '../constants';
import { KeyType, Network } from '../types';

export function getKeyTypeFromNetwork(network: Network): KeyType {
  if (network === NETWORK_EVM) {
    return 'K256';
  } else if (network === NETWORK_SOLANA) {
    return 'ed25519';
  } else {
    throw new Error(`Network not implemented ${network}`);
  }
}
