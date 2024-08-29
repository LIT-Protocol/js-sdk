const { removeSaltFromDecryptedKey } = require('../../utils');

/**
 *
 * Signs a transaction with the Ethers wallet whose private key is decrypted inside the Lit Action.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam unsignedTransaction - The unsigned message to be signed by the Wrapped Key
 * @jsParam broadcast - Flag used to determine whether to just sign the message or also to broadcast it using the node's RPC. Note, if the RPC doesn't exist for the chain then the Lit Action will throw an unsupported error.
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns the transaction hash if broadcast is set as true else returns only the signed transaction. Or returns errors if any.
 */
(async () => {
  if (!unsignedTransaction.toAddress) {
    Lit.Actions.setResponse({
      response: 'Error: Missing required field: toAddress',
    });
    return;
  }

  if (!unsignedTransaction.chain) {
    Lit.Actions.setResponse({
      response: 'Error: Missing required field: chain',
    });
    return;
  }

  if (!unsignedTransaction.value) {
    Lit.Actions.setResponse({
      response: 'Error: Missing required field: value',
    });
    return;
  }

  if (!unsignedTransaction.chainId) {
    Lit.Actions.setResponse({
      response: 'Error: Missing required field: chainId',
    });
    return;
  }

  let decryptedPrivateKey;
  try {
    decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err) {
    const errorMessage =
      'Error: When decrypting to a single node- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
    return;
  }

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  let privateKey;
  try {
    privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);
  } catch (err) {
    Lit.Actions.setResponse({ response: err.message });
    return;
  }
  const wallet = new ethers.Wallet(privateKey);

  let nonce;
  try {
    nonce = await Lit.Actions.getLatestNonce({
      address: wallet.address,
      chain: unsignedTransaction.chain,
    });
  } catch (err) {
    const errorMessage = 'Error: Unable to get the nonce- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
    return;
  }

  const tx = {
    to: unsignedTransaction.toAddress,
    from: wallet.address,
    value: ethers.utils.hexlify(
      ethers.utils.parseEther(unsignedTransaction.value)
    ),
    chainId: unsignedTransaction.chainId,
    data: unsignedTransaction.dataHex,
    nonce,
  };

  let provider;
  try {
    const rpcUrl = await Lit.Actions.getRpcUrl({
      chain: unsignedTransaction.chain,
    });
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  } catch (err) {
    const errorMessage =
      `Error: Getting the rpc for the chain: ${unsignedTransaction.chain}- ` +
      err.message;
    Lit.Actions.setResponse({ response: errorMessage });
    return;
  }

  if (unsignedTransaction.gasPrice) {
    tx.gasPrice = ethers.utils.parseUnits(unsignedTransaction.gasPrice, 'gwei');
  } else {
    try {
      tx.gasPrice = await provider.getGasPrice();
    } catch (err) {
      const errorMessage = 'Error: When getting gas price- ' + err.message;
      Lit.Actions.setResponse({ response: errorMessage });
      return;
    }
  }

  if (unsignedTransaction.gasLimit) {
    tx.gasLimit = unsignedTransaction.gasLimit;
  } else {
    try {
      tx.gasLimit = await provider.estimateGas(tx);
    } catch (err) {
      const errorMessage = 'Error: When estimating gas- ' + err.message;
      Lit.Actions.setResponse({ response: errorMessage });
      return;
    }
  }

  try {
    const signedTx = await wallet.signTransaction(tx);

    if (broadcast) {
      const transactionResponse = await provider.sendTransaction(signedTx);

      Lit.Actions.setResponse({ response: transactionResponse.hash });
    } else {
      Lit.Actions.setResponse({ response: signedTx });
    }
  } catch (err) {
    const errorMessage = 'Error: When signing transaction- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
  }
})();
