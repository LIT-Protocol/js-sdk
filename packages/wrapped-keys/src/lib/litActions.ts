// @ts-nocheck

export const generatePrivateKeyLitAction = `
const LIT_PREFIX = 'lit_';

(async () => {
    const resp = await Lit.Actions.runOnce(
        { waitForResponse: true, name: 'encryptedPrivateKey' },
        async () => {
            const wallet = ethers.Wallet.createRandom();
            const privateKey = LIT_PREFIX + wallet.privateKey.toString();
            let utf8Encode = new TextEncoder();
            const to_encrypt = utf8Encode.encode(privateKey);

            const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
                accessControlConditions,
                to_encrypt,
            });
            return JSON.stringify({ ciphertext, dataToEncryptHash, publicKey: wallet.publicKey });
        }
    );

    // // TODO: Remove the below which is only for demonstrating the error
    // const { ciphertext, dataToEncryptHash } = JSON.parse(resp);
    // const decrypted = await Lit.Actions.decryptAndCombine({
    //     accessControlConditions,
    //     ciphertext,
    //     dataToEncryptHash,
    //     authSig: null,
    //     chain: 'ethereum',
    // });

    // // TODO: Remove the below which is only for demonstrating the error
    // console.log('accessControlConditions: ', accessControlConditions);
    // console.log('ciphertext: ', ciphertext);
    // console.log('dataToEncryptHash: ', dataToEncryptHash);
    // console.log('decrypted: ', decrypted);

    Lit.Actions.setResponse({
        response: resp,
    });
})();
`;

const _signTransactionWithEthereumEncryptedKeyLitAction = (async () => {
  const LIT_PREFIX = 'lit_';

  // TODO!: Remove ALL the console.log statements
  console.log('unsignedTransaction');
  console.log(unsignedTransaction);

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

  const decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    chain: 'ethereum',
    authSig: null,
  });

  console.log('decryptedPrivateKey');
  console.log(decryptedPrivateKey);

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX)
    ? decryptedPrivateKey.slice(LIT_PREFIX.length)
    : decryptedPrivateKey;
  const wallet = new ethers.Wallet(privateKey);

  console.log('unsignedTransaction.chain', unsignedTransaction.chain);
  console.log('pkpAddress', pkpAddress);
  const nonce = await Lit.Actions.getLatestNonce({
    address: wallet.address,
    chain: unsignedTransaction.chain,
  });
  console.log('nonce');
  console.log(nonce);

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

  if (unsignedTransaction.gasPrice) {
    tx.gasPrice = ethers.utils.parseUnits(unsignedTransaction.gasPrice, 'gwei');
  } else {
    tx.gasPrice = await Lit.Actions.runOnce(
      { waitForResponse: true, name: 'gasPrice' },
      async () => {
        const rpcUrl = await Lit.Actions.getRpcUrl({
          chain: unsignedTransaction.chain,
        });
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

        try {
          const gasPrice = await provider.getGasPrice();
          return ethers.utils.hexlify(gasPrice);
        } catch (err) {
          const errorMessage = 'Error: When getting gas price- ' + err.message;
          Lit.Actions.setResponse({ response: errorMessage });
          return;
        }
      }
    );
  }

  if (unsignedTransaction.gasLimit) {
    tx.gasLimit = unsignedTransaction.gasLimit;
  } else {
    tx.gasLimit = await Lit.Actions.runOnce(
      { waitForResponse: true, name: 'gasLimit' },
      async () => {
        const rpcUrl = await Lit.Actions.getRpcUrl({
          chain: unsignedTransaction.chain,
        });
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

        try {
          const gasLimit = await provider.estimateGas(tx);
          return ethers.utils.hexlify(gasLimit);
        } catch (err) {
          const errorMessage = 'Error: When estimating gas- ' + err.message;
          Lit.Actions.setResponse({ response: errorMessage });
          return;
        }
      }
    );
  }

  console.log('tx');
  console.log(tx);

  try {
    const signedTx = await wallet.signTransaction(tx);

    if (broadcast) {
      const rpcUrl = await Lit.Actions.getRpcUrl({
        chain: unsignedTransaction.chain,
      });
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      const transactionResponse = await provider.sendTransaction(signedTx);

      Lit.Actions.setResponse({ response: transactionResponse.hash });
    } else {
      Lit.Actions.setResponse({ response: signedTx });
    }
  } catch (err) {
    const errorMessage = 'Error: When signing transaction- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
  }
}).toString();

export const signTransactionWithEthereumEncryptedKeyLitAction = `(${_signTransactionWithEthereumEncryptedKeyLitAction})();`;

export const signMessageWithEthereumEncryptedKeyLitAction = `
const LIT_PREFIX = 'lit_';

(async () => {
    // TODO!: Remove ALL the console.log statements
    console.log('unsignedMessage');
    console.log(unsignedMessage);

    const decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        chain: 'ethereum',
        authSig: null,
    });

    console.log('decryptedPrivateKey');
    console.log(decryptedPrivateKey);

    if (!decryptedPrivateKey) { // Exit the nodes which don't have the decryptedData
        return;
    }

    const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX) ? decryptedPrivateKey.slice(LIT_PREFIX.length) : decryptedPrivateKey;
    const wallet = new ethers.Wallet(privateKey);

    try {
        const signature = await wallet.signMessage(unsignedMessage);
        console.log('signature');
        console.log(signature);

        const recoveredAddress = ethers.utils.verifyMessage(unsignedMessage, signature);
        console.log('recoveredAddress');
        console.log(recoveredAddress);

        if (recoveredAddress !== wallet.address) {
            Lit.Actions.setResponse({ response: "Error: Recovered address doesn't match the wallet address" });
            return;
        }

        Lit.Actions.setResponse({ response: signature });
    } catch (err) {
        const errorMessage = 'Error: When signing message- ' + err.message;
        Lit.Actions.setResponse({ response: errorMessage });
    }
})();
`;

// export const signingTimeoutEncryptedKeyLitAction = `
// (async () => {
//     new Promise(resolve => setTimeout(resolve, 40000)); // Sleep for 40 seconds
// })();
// `;
