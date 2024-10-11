const { encryptPrivateKey } = require('./../internal/encryptKey');
const {
  generateEthereumPrivateKey,
} = require('../../ethereum/internal/generatePrivateKey');
const {
  signMessageEthereumKey,
} = require('../../ethereum/internal/signMessage');
const {
  generateSolanaPrivateKey,
} = require('../../solana/internal/generatePrivateKey');
const { signMessageSolanaKey } = require('../../solana/internal/signMessage');

/* "TRIA" global accessControlConditions, actions, Lit*/
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

/**
 * - jsParams: Expected data type: Object (e.g., "{ authMethod: { accessToken: '...', authMethodType: '...' }, publicKey: '...', actions: [...] }")
 *
 * This parameter is an object containing the following properties:
 * - authMethod
 * - publicKey
 * - actions: Array of action objects, each containing network and key generation params.
 *
 */
function validateJsParams(jsParams) {
  if (!jsParams.authMethod) {
    throw new Error('Missing required field: authMethod');
  }
  if (!jsParams.publicKey) {
    throw new Error('Missing required field: publicKey');
  }
  if (!jsParams.accessControlConditions) {
    throw new Error('Missing required field: accessControlConditions');
  }
  const { accessToken, authMethodType } = jsParams.authMethod;

  if (!accessToken) {
    throw new Error('Missing required field: authMethod.accessToken');
  }
  if (!authMethodType) {
    throw new Error('Missing required field: authMethod.authMethodType');
  }

  if (!jsParams.actions) {
    throw new Error('Missing required field: actions');
  }

  if (!jsParams.actions.length) {
    throw new Error('No actions provided (empty array?)');
  }

  jsParams.actions.forEach((action, ndx) => {
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

// (async () => {
//   try {
//     validateParams(actions);

//     const batchGeneratePrivateKeysActionResult = await processActions(actions);

//     Lit.Actions.setResponse({
//       response: JSON.stringify(batchGeneratePrivateKeysActionResult),
//     });

//     // 1. Generate both EVM and solana private keys
//     // 2. Run appropriate signMessage for each key _and_ encrypt the keys for persistence to wrapped-keys backend
//     // 3. Return results for both signMessage ops and both encrypted key payloads for persistence
//   } catch (err) {
//     Lit.Actions.setResponse({ response: `Error: ${err.message}` });
//   }
// })();

const go = async () => {
  // ========== Tria's Logic ==========
  // Lit Action:: Prepare jsParams
  const jsParams = {
    authMethod: {
      accessToken: authMethod.accessToken,
      authMethodType: authMethod.authMethodType,
    },
    publicKey: publicKey,
    actions: actions,
    accessControlConditions: accessControlConditions,
  };

  validateJsParams(jsParams);

  // ========== Tria's Logic ==========

  // Authentication
  const url = 'https://api.development.tria.so/api/v1/user/info';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jsParams.authMethod.accessToken}`,
    },
  });
  const data = await response.json();
  console.log('data', data);

  if (!data.success) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        success: false,
        message: 'Authentication Failed',
      }),
    });
    return;
  }

  // Authorization:: Prepare params
  // -- 1. get the authMethodId from unique identify from the response
  const authMethodId = `${ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(data.userInfo.uuid)
  )}`;
  console.log('Computed AuthMethodId', authMethodId);

  // -- 2. get the PKP token id
  const tokenId = Lit.Actions.pubkeyToTokenId({
    publicKey: jsParams.publicKey,
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

  // LitActions.setResponse({
  //   response: `(true, ${JSON.stringify({
  //     returnedData: data,
  //     logs: {
  //       authMethodId,
  //       tokenId,
  //       permittedAuthMethods,
  //       permittedAuthMethod,
  //       actions: jsParams.actions,
  //       batchGeneratePrivateKeysActionResult,
  //     },
  //   })})`,
  // });

  try {
    const batchGeneratePrivateKeysActionResult = await processActions(
      jsParams.actions
    );

    Lit.Actions.setResponse({
      response: JSON.stringify(
        `(true, ${JSON.stringify(batchGeneratePrivateKeysActionResult)})`
      ),
    });

    // 1. Generate both EVM and solana private keys
    // 2. Run appropriate signMessage for each key _and_ encrypt the keys for persistence to wrapped-keys backend
    // 3. Return results for both signMessage ops and both encrypted key payloads for persistence
  } catch (err) {
    Lit.Actions.setResponse({ response: `Error: ${err.message}` });
  }
};

go();
