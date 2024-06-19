const CHAIN_ETHEREUM = 'ethereum';
const LIT_PREFIX = 'lit_';
export const NETWORK_EVM = 'evm';
export const NETWORK_SOLANA = 'solana';
export type Network = typeof NETWORK_EVM | typeof NETWORK_SOLANA;

// Update the endpoint to Wrapped Key project endpoint
const ENCRYPTED_PRIVATE_KEY_ENDPOINT =
  'https://8wugrwstu1.execute-api.us-east-2.amazonaws.com/encrypted';

const LIT_ACTION_CID_REPOSITORY = Object.freeze({
  signTransactionWithSolanaEncryptedKey:
    'QmSi9GL2weCFEP1SMAUw5PDpZRr436Zt3tLUNrSECPA5dT',
  signTransactionWithEthereumEncryptedKey:
    'QmdYUhPCCK5hpDWMK1NiDLNLG6RZQy61QE4J7dBm1Y2nbA',
  signMessageWithSolanaEncryptedKey:
    'QmYQC6cd4EMvyB4XPkfEEAwNXJupRZWU5JsTCUrjey4ovp',
  signMessageWithEthereumEncryptedKey:
    'QmTMGcyp77NeppGaqF2DmE1F8GXTSxQYzXCrbE7hNudUWx',
  generateEncryptedSolanaPrivateKey:
    'QmaoPMSqcze3NW3KSA75ecWSkcmWT1J7kVr8LyJPCKRvHd', // TODO!: Create Lit Action and Update
  generateEncryptedEthereumPrivateKey:
    'QmaoPMSqcze3NW3KSA75ecWSkcmWT1J7kVr8LyJPCKRvHd',
});

export {
  CHAIN_ETHEREUM,
  ENCRYPTED_PRIVATE_KEY_ENDPOINT,
  LIT_ACTION_CID_REPOSITORY,
  LIT_PREFIX,
};
