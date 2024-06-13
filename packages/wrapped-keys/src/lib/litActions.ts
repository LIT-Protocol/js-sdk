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

export const signTransactionWithEthereumEncryptedKeyLitAction = `
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

export const signingTimeoutEncryptedKeyLitAction = `
(async () => {
    new Promise(resolve => setTimeout(resolve, 40000)); // Sleep for 40 seconds
})();
`;
