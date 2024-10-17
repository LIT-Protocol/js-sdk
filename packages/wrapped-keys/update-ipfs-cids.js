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
  const constantsPath = path.join(
    __dirname,
    './src/lib/lit-actions-client/constants.ts'
  );
  let constantsContent = fs.readFileSync(constantsPath, 'utf-8');

  const newCIDs = {
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
    batchGenerateEncryptedKeys: await Hash.of(batchGenerateEncryptedKey),
  };

  Object.entries(newCIDs).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, cid]) => {
        const regex = new RegExp(
          `(${key}:\\s*Object\\.freeze\\(\\{[^}]*${subKey}:\\s*')([a-zA-Z0-9]+)(')`,
          'g'
        );
        constantsContent = constantsContent.replace(regex, `$1${cid}$3`);
      });
    } else {
      const regex = new RegExp(`(${key}:\\s*')([a-zA-Z0-9]+)(')`, 'g');
      constantsContent = constantsContent.replace(regex, `$1${value}$3`);
    }
  });

  fs.writeFileSync(constantsPath, constantsContent, 'utf-8');
}

updateConstants()
  .then(() => {
    console.log('Constants file updated successfully!');
  })
  .catch((err) => {
    console.error('Error updating constants:', err);
  });
