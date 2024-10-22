import { encryptPrivateKey } from '../../internal/common/encryptKey';
import { generateEthereumPrivateKey } from '../../internal/ethereum/generatePrivateKey';
import { signMessageEthereumKey } from '../../internal/ethereum/signMessage';
import {
  getValidatedUnsignedTx,
  signTransactionEthereumKey,
} from '../../internal/ethereum/signTransaction';
import { generateSolanaPrivateKey } from '../../internal/solana/generatePrivateKey';
import { signMessageSolanaKey } from '../../internal/solana/signMessage';
import {
  signTransactionSolanaKey,
  type UnsignedTransaction as UnsignedTransactionSolana,
} from '../../internal/solana/signTransaction';

import type { UnsignedTransaction as UnsignedTransactionEthereum } from '../../internal/ethereum/signTransaction';

interface BaseAction {
  generateKeyParams: {
    memo: string;
  };
  signMessageParams?: {
    messageToSign?: string;
  };
}

interface ActionSolana extends BaseAction {
  network: 'solana';
  signTransactionParams?: {
    unsignedTransaction: UnsignedTransactionSolana;
    broadcast: boolean;
  };
}

interface ActionEthereum extends BaseAction {
  network: 'evm';
  signTransactionParams?: {
    unsignedTransaction: UnsignedTransactionEthereum;
    broadcast: boolean;
  };
}

type Action = ActionSolana | ActionEthereum;

export interface BatchGenerateEncryptedKeysParams {
  actions: Action[];
  accessControlConditions: string;
}

async function processEthereumAction({
  action,
  accessControlConditions,
}: {
  action: ActionEthereum;
  accessControlConditions: string;
}) {
  const { network, generateKeyParams } = action;
  const messageToSign = action.signMessageParams?.messageToSign;
  const unsignedTransaction = action.signTransactionParams?.unsignedTransaction;

  const ethereumKey = generateEthereumPrivateKey();

  const [generatedPrivateKey, messageSignature, transactionSignature] =
    await Promise.all([
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

      unsignedTransaction
        ? signTransactionEthereumKey({
            unsignedTransaction,
            broadcast: action.signTransactionParams?.broadcast || false,
            privateKey: ethereumKey.privateKey,
            validatedTx: getValidatedUnsignedTx(unsignedTransaction),
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
    ...(transactionSignature
      ? { signTransaction: { signature: transactionSignature } }
      : {}),
  };
}

async function processSolanaAction({
  action,
  accessControlConditions,
}: {
  action: ActionSolana;
  accessControlConditions: string;
}) {
  const { network, generateKeyParams } = action;

  const messageToSign = action.signMessageParams?.messageToSign;
  const unsignedTransaction = action.signTransactionParams?.unsignedTransaction;

  const solanaKey = generateSolanaPrivateKey();

  const [generatedPrivateKey, messageSignature, transactionSignature] =
    await Promise.all([
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
      unsignedTransaction
        ? signTransactionSolanaKey({
            broadcast: action.signTransactionParams?.broadcast || false,
            unsignedTransaction,
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
    ...(transactionSignature
      ? { signTransaction: { signature: transactionSignature } }
      : {}),
  };
}

async function processActions({
  actions,
  accessControlConditions,
}: BatchGenerateEncryptedKeysParams) {
  return Promise.all(
    actions.map(async (action, ndx) => {
      const { network } = action;

      if (network === 'evm') {
        return await processEthereumAction({
          action,
          accessControlConditions,
        });
      } else if (network === 'solana') {
        return await processSolanaAction({
          action,
          accessControlConditions,
        });
      } else {
        // Just in case :tm:
        throw new Error(`Invalid network for action[${ndx}]: ${network}`);
      }
    })
  );
}

function validateParams(actions: Action[]) {
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

export async function batchGenerateEncryptedKeys({
  actions,
  accessControlConditions,
}: BatchGenerateEncryptedKeysParams) {
  validateParams(actions);

  return processActions({
    actions,
    accessControlConditions,
  });
}
