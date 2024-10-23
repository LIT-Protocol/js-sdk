const fs = require('fs');
const path = require('path');

const Hash = require('ipfs-only-hash');

const {
  code: batchGenerateEncryptedKey,
} = require('../wrapped-keys-lit-actions/src/generated/common/batchGenerateEncryptedKeys');
const {
  code: exportPrivateKey,
} = require('../wrapped-keys-lit-actions/src/generated/common/exportPrivateKey');
const {
  code: generateEncryptedEthereumPrivateKey,
} = require('../wrapped-keys-lit-actions/src/generated/ethereum/generateEncryptedEthereumPrivateKey');
const {
  code: signMessageWithEncryptedEthereumKey,
} = require('../wrapped-keys-lit-actions/src/generated/ethereum/signMessageWithEncryptedEthereumKey');
const {
  code: signTransactionWithEncryptedEthereumKey,
} = require('../wrapped-keys-lit-actions/src/generated/ethereum/signTransactionWithEncryptedEthereumKey');
const {
  code: generateEncryptedSolanaPrivateKey,
} = require('../wrapped-keys-lit-actions/src/generated/solana/generateEncryptedSolanaPrivateKey');
const {
  code: signMessageWithEncryptedSolanaKey,
} = require('../wrapped-keys-lit-actions/src/generated/solana/signMessageWithEncryptedSolanaKey');
const {
  code: signTransactionWithEncryptedSolanaKey,
} = require('../wrapped-keys-lit-actions/src/generated/solana/signTransactionWithEncryptedSolanaKey');

async function updateConstants() {
  // Generate new CID hashes
  const litActionCIDRepository = {
    signTransaction: {
      evm: await Hash.of(signTransactionWithEncryptedEthereumKey),
      solana: await Hash.of(signTransactionWithEncryptedSolanaKey),
    },
    signMessage: {
      evm: await Hash.of(signMessageWithEncryptedEthereumKey),
      solana: await Hash.of(signMessageWithEncryptedSolanaKey),
    },
    generateEncryptedKey: {
      evm: await Hash.of(generateEncryptedEthereumPrivateKey),
      solana: await Hash.of(generateEncryptedSolanaPrivateKey),
    },
    exportPrivateKey: {
      evm: await Hash.of(exportPrivateKey),
      solana: await Hash.of(exportPrivateKey),
    },
  };
  const litActionCIDRepositoryCommon = {
    batchGenerateEncryptedKeys: await Hash.of(batchGenerateEncryptedKey),
  };

  // Write constant json files with lit action hashes
  fs.writeFileSync(
    path.join(
      __dirname,
      './src/lib/lit-actions-client/lit-action-cid-repository.json'
    ),
    JSON.stringify(litActionCIDRepository, null, 2),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(
      __dirname,
      './src/lib/lit-actions-client/lit-action-cid-repository-common.json'
    ),
    JSON.stringify(litActionCIDRepositoryCommon, null, 2),
    'utf-8'
  );
}

updateConstants().then(() => {
  console.log('Constants file updated successfully!');
});
