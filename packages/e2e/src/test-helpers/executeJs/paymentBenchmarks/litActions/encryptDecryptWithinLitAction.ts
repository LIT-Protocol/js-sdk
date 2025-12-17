declare const Lit: any;
declare const ethers: any;

async function encryptDecryptWithinLitAction() {
    // First, encrypt an API key (simulating a stored encrypted API key)
    // In a real scenario, this would already be encrypted and stored
    const apiKeyData = JSON.stringify({ key: "example-api-key-12345" });

    const accessControlConditions = [
        {
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "",
            parameters: ["1"],
            returnValueTest: {
                comparator: "=",
                value: "1",
            },
        },
    ];

    // Encrypt the API key
    const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
        accessControlConditions,
        to_encrypt: ethers.utils.toUtf8Bytes(apiKeyData),
    });

    console.log('ciphertext', ciphertext);
    console.log('dataToEncryptHash', dataToEncryptHash);

    // Now decrypt the API key (this is the actual decrypt operation we're counting)
    const decryptedApiKey = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext: 'iRWRrnG57m8iN/o1phlEV1PToXgDEAVbhHhZuxxH9k0UCx09L3VTYojGkB7AC1XM8D340+Fy5pIKQ3ypQTpMFBaKR27IlXr2oOsPuKxQwTggA5FmHE8lYfviT0/VuT0TUUJLIVc7fKMZoqK1UKj+I+kC',
        dataToEncryptHash: '3a7a6315ce5f1c0a619a44b27450feacf20d75beb598f505c890c1f0cfd23d74',
        // ciphertext,
        // dataToEncryptHash,
        authSig: null,
        chain: "ethereum",
    });

    console.log('decryptedApiKey', decryptedApiKey);

    // // Parse the decrypted API key
    // const apiKey = JSON.parse(decryptedApiKey);

    // // Use the API key in a fetch request
    // const response = await fetch("https://api.coingecko.com/api/v3/ping", {
    //     method: "GET",
    //     headers: {
    //         "Authorization": `Bearer ${apiKey.key}`,
    //         "Content-Type": "application/json",
    //     },
    // });

    // const responseData = await response.json();

    // // Simulate runtime of 5 seconds
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    Lit.Actions.setResponse({
        response: JSON.stringify({
            success: true,
            // data: responseData,
            data: 'payment benchmark success',
            // Note: We don't expose the actual API key in the response
        }),
    });
}

// Convert the function to a string and wrap it in an IIFE
export const ENCRYPT_DECRYPT_WITHIN_LIT_ACTION = `(${encryptDecryptWithinLitAction.toString()})();`;