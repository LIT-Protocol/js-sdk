export const signWithEthereumEncryptedKeyLitAction = `
const DEFAULT_GAS_LIMIT = 21000;
const DEFAULT_GAS_PRICE = '50'; // in gwei
const LIT_PREFIX = 'lit_';

(async () => {
    // TODO!: Remove ALL the console.log statements
    console.log('unsignedTransaction');
    console.log(unsignedTransaction);

    if (!unsignedTransaction.toAddress) {
        Lit.Actions.setResponse({ response: 'Error: Missing required field: toAddress' });
        return;
    }

    if (!unsignedTransaction.chain) {
        Lit.Actions.setResponse({ response: 'Error: Missing required field: chain' });
        return;
    }

    if (!unsignedTransaction.value) {
        Lit.Actions.setResponse({ response: 'Error: Missing required field: value' });
        return;
    }

    if (!unsignedTransaction.chainId) {
        Lit.Actions.setResponse({ response: 'Error: Missing required field: chainId' });
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

    if (!decryptedPrivateKey) { // Exit the nodes which don't have the decryptedData
        return;
    }

    const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX) ? decryptedPrivateKey.slice(LIT_PREFIX.length) : decryptedPrivateKey;
    const wallet = new ethers.Wallet(privateKey);

    const gasPrice = unsignedTransaction.gasPrice ? unsignedTransaction.gasPrice : DEFAULT_GAS_PRICE;
    const gasLimit = unsignedTransaction.gasLimit ? unsignedTransaction.gasLimit : DEFAULT_GAS_LIMIT;

    console.log('unsignedTransaction.chain', unsignedTransaction.chain);
    console.log('pkpAddress', pkpAddress);
    const nonce = await Lit.Actions.getLatestNonce({ address: wallet.address, chain: unsignedTransaction.chain });
    console.log('nonce');
    console.log(nonce);

    const tx = {
        to: unsignedTransaction.toAddress,
        value: ethers.utils.parseEther(unsignedTransaction.value),
        chainId: unsignedTransaction.chainId,
        gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei'),
        gasLimit,
        data: unsignedTransaction.dataHex,
        nonce,
    };

    console.log('tx');
    console.log(tx);

    try {
        const signedTx = await wallet.signTransaction(tx);

        if (broadcast) {
            const rpcUrl = await Lit.Actions.getRpcUrl({ chain: unsignedTransaction.chain });
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

            const transactionResponse = await provider.sendTransaction(signedTx);
            const receipt = await transactionResponse.wait(); // TODO!: This can timeout. Catch the timeout error and throw a separate message for it

            Lit.Actions.setResponse({ response: transactionResponse.hash });
        } else {
            Lit.Actions.setResponse({ response: signedTx });
        }
    } catch (err) {
        const errorMessage = 'Error: When signing transaction- ' + err.message;
        Lit.Actions.setResponse({ response: errorMessage });
    }
})();
`;
