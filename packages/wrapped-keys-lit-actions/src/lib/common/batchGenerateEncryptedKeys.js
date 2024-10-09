const { encryptPrivateKey } = require('./internal/encryptKey');
const {
  generateEthereumPrivateKey,
} = require('../ethereum/internal/generatePrivateKey');
const { signMessageEthereumKey } = require('../ethereum/internal/signMessage');
const {
  generateSolanaPrivateKey,
} = require('../solana/internal/generatePrivateKey');
const { signMessageSolanaKey } = require('../solana/internal/signMessage');

/* global accessControlConditions, actions, Lit*/

async function processEthereumAction(action) {
  const { network, generateKeyParams } = action;
  const messageToSign = action.signMessageParams?.messageToSign;

  const ethereumKey = generateEthereumPrivateKey();

  const [generatedPrivateKey, messageSignature] = await Promise.all([
    encryptPrivateKey({
      accessControlConditions,
      publicKey: ethereumKey.publicKey,
      privateKey: ethereumKey.privateKey,
    }),
    messageToSign
      ? signMessageEthereumKey({
          messageToSign: messageToSign,
          privateKey: ethereumKey.privateKey,
        })
      : Promise.resolve(),
  ]);

  return {
    network,
    generateEncryptedPrivateKey: {
      ...generatedPrivateKey,
      memo: generateKeyParams.memo,
    },
    ...(messageSignature
      ? { signMessage: { signature: messageSignature } }
      : {}),
  };
}

async function processSolanaAction(action) {
  const { network, generateKeyParams } = action;

  const messageToSign = action.signMessageParams?.messageToSign;

  const solanaKey = generateSolanaPrivateKey();

  const [generatedPrivateKey, messageSignature] = await Promise.all([
    encryptPrivateKey({
      accessControlConditions,
      publicKey: solanaKey.publicKey,
      privateKey: solanaKey.privateKey,
    }),
    messageToSign
      ? signMessageSolanaKey({
          messageToSign: messageToSign,
          privateKey: solanaKey.privateKey,
        })
      : Promise.resolve(),
  ]);

  return {
    network,
    generateEncryptedPrivateKey: {
      ...generatedPrivateKey,
      memo: generateKeyParams.memo,
    },
    ...(messageSignature
      ? { signMessage: { signature: messageSignature } }
      : {}),
  };
}

async function processActions(actions) {
  return Promise.all(
    actions.map(async (action, ndx) => {
      const { network } = action;

      if (network === 'evm') {
        return await processEthereumAction(action, ndx);
      } else if (network === 'solana') {
        return await processSolanaAction(action, ndx);
      } else {
        // Just in case :tm:
        throw new Error(`Invalid network for action[${ndx}]: ${network}`);
      }
    })
  );
}

function validateParams(actions) {
  if (!actions) {
    throw new Error('Missing required field: actions');
  }

  if (!actions.length) {
    throw new Error('No actions provided (empty array?)');
  }

  actions.forEach((action, ndx) => {
    if (!['evm', 'solana'].includes(action.network)) {
      throw new Error(
        `Invalid field: actions[${ndx}].network: ${action.network}`
      );
    }

    if (!action.generateKeyParams) {
      throw new Error(
        `Missing required field: actions[${ndx}].generateKeyParams`
      );
    }

    if (!action.generateKeyParams?.memo) {
      throw new Error(
        `Missing required field: actions[${ndx}].generateKeyParams.memo`
      );
    }

    if (action.signMessageParams && !action.signMessageParams?.messageToSign) {
      throw new Error(
        `Missing required field: actions[${ndx}].signMessageParams.messageToSign`
      );
    }
  });
}

(async () => {
  try {
    validateParams(actions);

    const batchGeneratePrivateKeysActionResult = await processActions(actions);

    Lit.Actions.setResponse({
      response: JSON.stringify(batchGeneratePrivateKeysActionResult),
    });

    // 1. Generate both EVM and solana private keys
    // 2. Run appropriate signMessage for each key _and_ encrypt the keys for persistence to wrapped-keys backend
    // 3. Return results for both signMessage ops and both encrypted key payloads for persistence
  } catch (err) {
    Lit.Actions.setResponse({ response: `Error: ${err.message}` });
  }
})();
