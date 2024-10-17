import { encryptPrivateKey } from '../../internal/common/encryptKey';
import { generateEthereumPrivateKey } from '../../internal/ethereum/generatePrivateKey';
import { signMessageEthereumKey } from '../../internal/ethereum/signMessage';
import { generateSolanaPrivateKey } from '../../internal/solana/generatePrivateKey';
import { signMessageSolanaKey } from '../../internal/solana/signMessage';

interface Action {
  network: 'evm' | 'solana';
  generateKeyParams: {
    memo: string;
  };
  signMessageParams?: {
    messageToSign?: string;
  };
}

async function processEthereumAction({
  action,
  accessControlConditions,
}: {
  action: Action;
  accessControlConditions: any;
}) {
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

async function processSolanaAction({
  action,
  accessControlConditions,
}: {
  action: Action;
  accessControlConditions: any;
}) {
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

async function processActions({
  actions,
  accessControlConditions,
}: {
  actions: Action[];
  accessControlConditions: any;
}) {
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
}: {
  actions: Action[];
  accessControlConditions: any;
}) {
  validateParams(actions);

  return processActions({
    actions,
    accessControlConditions,
  });
}
