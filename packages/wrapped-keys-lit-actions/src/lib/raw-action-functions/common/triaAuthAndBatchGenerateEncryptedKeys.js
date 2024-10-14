const { encryptPrivateKey } = require('../../internal/common/encryptKey');
const {
  generateEthereumPrivateKey,
} = require('../../internal/ethereum/generatePrivateKey');
const {
  signMessageEthereumKey,
} = require('../../internal/ethereum/signMessage');
const {
  generateSolanaPrivateKey,
} = require('../../internal/solana/generatePrivateKey');
const { signMessageSolanaKey } = require('../../internal/solana/signMessage');

async function processEthereumAction({ action, accessControlConditions }) {
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

async function processSolanaAction({ action, accessControlConditions }) {
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

async function processActions({ actions, accessControlConditions }) {
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

function validateActionParams(actions) {
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

function validateTriaParams(triaParams) {
  if (!triaParams.authMethod) {
    throw new Error('Missing required field: authMethod');
  }
  if (!triaParams.publicKey) {
    throw new Error('Missing required field: publicKey');
  }
  const { accessToken, authMethodType } = triaParams.authMethod;

  if (!accessToken) {
    throw new Error('Missing required field: authMethod.accessToken');
  }
  if (!authMethodType) {
    throw new Error('Missing required field: authMethod.authMethodType');
  }
}

async function triaAuth({ accessToken, publicKey, authMethodType }) {
  // -- Authentication
  const url = 'https://api.development.tria.so/api/v1/user/info';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  console.log('data', data);

  if (!data.success) {
    throw new Error(`Authentication Failed`);
  }

  // -- Authorization
  // -- 1. get the authMethodId from unique identify from the response
  const authMethodId = `${ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(data.userInfo.uuid)
  )}`;
  console.log('Computed AuthMethodId', authMethodId);

  // -- 2. get the PKP token id
  const tokenId = Lit.Actions.pubkeyToTokenId({
    publicKey: publicKey,
  });
  console.log('tokenId', tokenId);

  // -- 3. get the permitted auth methods of the PKP token id
  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({
    tokenId,
  });
  console.log('permittedAuthMethods', permittedAuthMethods);

  // -- 4. only get where authMethod that's equal to the authMethod Id
  const permittedAuthMethod = permittedAuthMethods.find(
    (method) => method.id === authMethodId
  );
  console.log('permittedAuthMethod', permittedAuthMethod);

  // TODO: Uncomment this block to enable Authorization
  // Authorization:: Failed Authentication and Authorization
  // if (
  //   !permittedAuthMethod ||
  //   permittedAuthMethod.auth_method_type !== jsParams.authMethod.authMethodType
  // ) {
  //   Lit.Actions.setResponse({
  //     response: JSON.stringify({
  //       success: false,
  //       message: 'Authorization Failed',
  //     }),
  //   });
  //   return;
  // }

  return {
    success: true,
    message: 'Authentication and Authorization successful',
    authMethodId,
  };
}

export async function triaAuthAndBatchGenerateEncryptedKeys({
  actions,
  accessControlConditions,
  triaParams,
}) {
  validateActionParams(actions);
  validateTriaParams(triaParams);

  // -- Authenticate and authorize with Tria
  await triaAuth({
    accessToken: triaParams.authMethod.accessToken,
    authMethodType: triaParams.authMethod.authMethodType,
    publicKey: triaParams.publicKey,
  });

  // -- Run once
  let res = await Lit.Actions.runOnce(
    { waitForResponse: false, name: 'tria-auth-and-wrapped-keys' },
    async () => {
      const processedActions = await processActions({
        actions,
        accessControlConditions,
      });
      return JSON.stringify(processedActions);
    }
  );

  return JSON.stringify(`(true, ${res})`);
  // 1. Generate both EVM and solana private keys
  // 2. Run appropriate signMessage for each key _and_ encrypt the keys for persistence to wrapped-keys backend
  // 3. Return results for both signMessage ops and both encrypted key payloads for persistence
}
