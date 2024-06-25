import { Network } from '../types';

export type LitActionType =
  | 'signTransaction'
  | 'signMessage'
  | 'generateEncryptedKey';

export type LitActionSupportedNetworks = Extract<Network, 'solana' | 'evm'>;

// 'custom' have no entries in the CID repository, by definition they are external resources.
export type LitCidRepositoryEntry = Readonly<
  Record<LitActionSupportedNetworks, string>
>;

export type LitCidRepository = Readonly<
  Record<LitActionType, LitCidRepositoryEntry>
>;
