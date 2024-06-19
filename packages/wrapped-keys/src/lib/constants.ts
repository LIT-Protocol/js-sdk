const CHAIN_ETHEREUM = 'ethereum';
const LIT_PREFIX = 'lit_';

// Update the endpoint to Wrapped Key project endpoint
const ENCRYPTED_PRIVATE_KEY_ENDPOINT =
  'https://8wugrwstu1.execute-api.us-east-2.amazonaws.com/encrypted';

const LIT_ACTION_CID_REPOSITORY = Object.freeze({
  signTransactionWithSolanaEncryptedKeyLitActionIpfsCid: 'QmSi9GL2weCFEP1SMAUw5PDpZRr436Zt3tLUNrSECPA5dT',
  signMessageWithSolanaEncryptedKeyLitActionIpfsCid: 'QmYQC6cd4EMvyB4XPkfEEAwNXJupRZWU5JsTCUrjey4ovp',
});

export {
  CHAIN_ETHEREUM,
  ENCRYPTED_PRIVATE_KEY_ENDPOINT,
  LIT_ACTION_CID_REPOSITORY,
  LIT_PREFIX,
};
