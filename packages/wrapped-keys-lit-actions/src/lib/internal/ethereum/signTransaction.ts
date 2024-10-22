// This is weird - ethers.UnsignedTransaction is not the same as the one being used here..
// We should fix this soon, but not a hard blocker
export interface UnsignedTransaction {
  toAddress: string;
  chain: string;
  value: string;
  chainId: number;
  dataHex?: string;
  gasPrice?: string;
  gasLimit?: number;
  serializedTransaction?: any;
}

export function getValidatedUnsignedTx(
  unsignedTransaction: UnsignedTransaction
) {
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
  } catch (err: unknown) {
    throw new Error(`Invalid unsignedTransaction - ${(err as Error).message}`);
  }
}

async function getLatestNonce({
  walletAddress,
  chain,
}: {
  walletAddress: string;
  chain: string;
}) {
  try {
    const nonce = await Lit.Actions.getLatestNonce({
      address: walletAddress,
      chain: chain,
    });

    return nonce;
  } catch (err: unknown) {
    throw new Error(`Unable to get latest nonce - ${(err as Error).message}`);
  }
}

async function getEthersRPCProvider({ chain }: { chain: string }) {
  try {
    const rpcUrl = await Lit.Actions.getRpcUrl({
      chain,
    });

    return new ethers.providers.JsonRpcProvider(rpcUrl);
  } catch (err: unknown) {
    throw new Error(
      `Getting the rpc for the chain: ${chain} - ${(err as Error).message}`
    );
  }
}

async function getGasPrice({
  userProvidedGasPrice,
  provider,
}: {
  userProvidedGasPrice?: string;
  provider: ethers['providers']['JsonRpcProvider'];
}) {
  try {
    if (userProvidedGasPrice) {
      return ethers.utils.parseUnits(userProvidedGasPrice, 'gwei');
    } else {
      return await provider.getGasPrice();
    }
  } catch (err: unknown) {
    throw new Error(`When getting gas price - ${(err as Error).message}`);
  }
}

async function getGasLimit({
  provider,
  userProvidedGasLimit,
  validatedTx,
}: {
  provider: ethers['providers']['JsonRpcProvider'];
  userProvidedGasLimit?: number;
  validatedTx: any;
}) {
  if (userProvidedGasLimit) {
    return userProvidedGasLimit;
  } else {
    try {
      return await provider.estimateGas(validatedTx);
    } catch (err: unknown) {
      throw new Error(`When estimating gas - ${(err as Error).message}`);
    }
  }
}

async function signTransaction({
  validatedTx,
  wallet,
}: {
  validatedTx: any;
  wallet: any;
}) {
  try {
    return await wallet.signTransaction(validatedTx);
  } catch (err: unknown) {
    throw new Error(`When signing transaction - ${(err as Error).message}`);
  }
}

async function broadcastTransaction({
  provider,
  signedTx,
}: {
  provider: ethers['providers']['JsonRpcProvider'];
  signedTx: string;
}) {
  try {
    return await provider.sendTransaction(signedTx);
  } catch (err: unknown) {
    throw new Error(`When sending transaction - ${(err as Error).message}`);
  }
}

export async function signTransactionEthereumKey({
  broadcast,
  privateKey,
  validatedTx,
  unsignedTransaction,
}: {
  broadcast: boolean;
  privateKey: string;
  validatedTx: any;
  unsignedTransaction: UnsignedTransaction;
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
