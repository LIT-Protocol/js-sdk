/* global ethers, Lit */

export function getValidatedUnsignedTx(unsignedTransaction) {
  try {
    if (!unsignedTransaction.toAddress) {
      throw new Error('Missing required field: toAddress');
    }

    if (!unsignedTransaction.chain) {
      throw new Error('Missing required field: chain');
    }

    if (!unsignedTransaction.value) {
      throw new Error('Missing required field: value');
    }

    if (!unsignedTransaction.chainId) {
      throw new Error('Missing required field: chainId');
    }

    return {
      to: unsignedTransaction.toAddress,
      value: ethers.utils.hexlify(
        ethers.utils.parseEther(unsignedTransaction.value)
      ),
      chainId: unsignedTransaction.chainId,
      data: unsignedTransaction.dataHex,
    };
  } catch (err) {
    throw new Error(`Invalid unsignedTransaction - ${err.message}`);
  }
}

async function getLatestNonce({ walletAddress, chain }) {
  try {
    const nonce = await Lit.Actions.getLatestNonce({
      address: walletAddress,
      chain: chain,
    });

    return nonce;
  } catch (err) {
    throw new Error(`Unable to get latest nonce - ${err.message}`);
  }
}

async function getEthersRPCProvider({ chain }) {
  try {
    const rpcUrl = await Lit.Actions.getRpcUrl({
      chain,
    });

    return new ethers.providers.JsonRpcProvider(rpcUrl);
  } catch (err) {
    throw new Error(`Getting the rpc for the chain: ${chain} - ${err.message}`);
  }
}

async function getGasPrice({ userProvidedGasPrice, provider }) {
  try {
    if (userProvidedGasPrice) {
      return ethers.utils.parseUnits(userProvidedGasPrice, 'gwei');
    } else {
      return await provider.getGasPrice();
    }
  } catch (err) {
    throw new Error(`When getting gas price - ${err.message}`);
  }
}

async function getGasLimit({ provider, userProvidedGasLimit, validatedTx }) {
  if (userProvidedGasLimit) {
    return userProvidedGasLimit;
  } else {
    try {
      return await provider.estimateGas(validatedTx);
    } catch (err) {
      throw new Error(`When estimating gas - ${err.message}`);
    }
  }
}

async function signTransaction({ validatedTx, wallet }) {
  try {
    return await wallet.signTransaction(validatedTx);
  } catch (err) {
    throw new Error(`When signing transaction - ${err.message}`);
  }
}

async function broadcastTransaction({ provider, signedTx }) {
  try {
    return await provider.sendTransaction(signedTx);
  } catch (err) {
    throw new Error(`When sending transaction - ${err.message}`);
  }
}

export async function signTransactionEthereumKey({
  broadcast,
  privateKey,
  validatedTx,
  unsignedTransaction,
}) {
  const wallet = new ethers.Wallet(privateKey);

  validatedTx.from = wallet.address;

  const [nonce, provider] = await Promise.all([
    getLatestNonce({
      walletAddress: wallet.address,
      chain: unsignedTransaction.chain,
    }),
    getEthersRPCProvider({
      chain: unsignedTransaction.chain,
    }),
  ]);

  validatedTx.nonce = nonce;

  validatedTx.gasPrice = await getGasPrice({
    provider,
    userProvidedGasPrice: unsignedTransaction.gasPrice,
  });

  validatedTx.gasLimit = await getGasLimit({
    provider,
    validatedTx,
    userProvidedGasLimit: unsignedTransaction.gasLimit,
  });

  const signedTx = await signTransaction({ validatedTx, wallet });

  if (!broadcast) {
    return signedTx;
  }

  const txResponse = await broadcastTransaction({ provider, signedTx });
  return txResponse.hash;
}
