import { Network } from '../types';

export type LitActionType =
  | 'signTransaction'
  | 'signMessage'
  | 'generateEncryptedKey'
  | 'exportPrivateKey';

export type LitCidRepositoryEntry = Readonly<Record<Network, string>>;

export type LitCidRepository = Readonly<
  Record<LitActionType, LitCidRepositoryEntry>
>;

/**
 * A type that represents an entry in a Lit Action Code repository.
 *
 * LitActionCodeRepositoryEntry is a record that maps a Network (evm, solana) to a string that is valid LIT action source code
 *
 * @typedef {Record<Network, string>} LitActionCodeRepositoryEntry
 */
export type LitActionCodeRepositoryEntry = Record<Network, string>;

/**
 * @typedef {Record<LitActionType, LitActionCodeRepositoryEntry>} LitActionCodeRepository
 * @property {LitActionCodeRepositoryEntry} signTransaction - Ethereum and Solana transaction signing actions.
 * @property {LitActionCodeRepositoryEntry} signMessage - Ethereum and Solana message signing actions.
 * @property {LitActionCodeRepositoryEntry} generateEncryptedKey - Ethereum and Solana encrypted key generation actions.
 * @property {LitActionCodeRepositoryEntry} exportPrivateKey - Ethereum and Solana private key export actions.
 */
export type LitActionCodeRepository = Record<
  LitActionType,
  LitActionCodeRepositoryEntry
>;
