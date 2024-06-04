export const signWithEthereumEncryptedKeyLitAction = `
const DEFAULT_GAS_LIMIT = 21000;
const DEFAULT_GAS_PRICE = '50'; // in gwei

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

    // TODO!: Update to use decryptToSingleNode()
    const decryptedPrivateKey = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        chain: 'ethereum',
        authSig: null,
    });

    console.log('decryptedPrivateKey');
    console.log(decryptedPrivateKey);

    const wallet = new ethers.Wallet(decryptedPrivateKey);

    const gasPrice = unsignedTransaction.gasPrice ? unsignedTransaction.gasPrice : DEFAULT_GAS_PRICE;
    const gasLimit = unsignedTransaction.gasLimit ? unsignedTransaction.gasLimit : DEFAULT_GAS_LIMIT;

    console.log('unsignedTransaction.chain', unsignedTransaction.chain);
    console.log('pkpAddress', pkpAddress);
    const nonce = await Lit.Actions.getLatestNonce({ address: pkpAddress, chain: unsignedTransaction.chain });
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
        Lit.Actions.setResponse({ response: signedTx });
    } catch (err) {
        const errorMessage = 'Error: When signing transaction- ' + err.message;
        Lit.Actions.setResponse({ response: errorMessage });
    }
})();
`;
