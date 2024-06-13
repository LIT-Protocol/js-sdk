// @ts-nocheck

const litAction = (async () => {
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

  // TODO!: Update to use decryptToSingleNode()
  const decryptedPrivateKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    chain: 'ethereum',
    authSig: null,
  });

  const wallet = new ethers.Wallet(decryptedPrivateKey);

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
    tx.gasLimit = ethers.utils.hexlify(unsignedTransaction.gasLimit);
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

  const signedTx = await Lit.Actions.runOnce(
    { waitForResponse: true, name: 'signedTx' },
    async () => {
      try {
        return wallet.signTransaction(tx);
      } catch (error) {
        const errorMessage = 'Error: When signing transaction- ' + err.message;
        Lit.Actions.setResponse({ response: errorMessage });
        return;
      }
    }
  );

  if (broadcast) {
    const resp = await Lit.Actions.runOnce(
      { waitForResponse: true, name: 'broadcastTx' },
      async () => {
        try {
          const rpcUrl = await Lit.Actions.getRpcUrl({
            chain: unsignedTransaction.chain,
          });
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

          const transactionResponse = await provider.sendTransaction(signedTx);
          const receipt = await transactionResponse.wait();

          return JSON.stringify({ txHash: transactionResponse.hash, rpcUrl });
        } catch (error) {
          const errorMessage =
            'Error: When broadcasting transaction- ' + err.message;
          Lit.Actions.setResponse({ response: errorMessage });
          return;
        }
      }
    );

    const { txHash, rpcUrl } = JSON.parse(resp);
    console.log(rpcUrl);
    Lit.Actions.setResponse({ response: txHash });
  } else {
    Lit.Actions.setResponse({ response: signedTx });
  }
}).toString();

export const signWithEthereumEncryptedKeyLitAction = `(${litAction})();`;
