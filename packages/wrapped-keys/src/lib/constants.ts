import { Network, KeyType } from './types';

export const CHAIN_ETHEREUM = 'ethereum' as const;
export const LIT_PREFIX = 'lit_' as const;

export const NETWORK_EVM: Network = 'evm' as const;
export const NETWORK_SOLANA: Network = 'solana' as const;

export const KEYTYPE_K256: KeyType = 'K256' as const;
export const KEYTYPE_ED25519: KeyType = 'ed25519' as const;
