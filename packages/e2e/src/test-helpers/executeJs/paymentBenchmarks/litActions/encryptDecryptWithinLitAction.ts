declare const Lit: any;
declare const ethers: any;

/**
 * Lit Action: Encrypt and Decrypt within the Lit Action
 *
 * Encrypts an API key and decrypts it within the Lit Action.
 */
async function encryptDecryptWithinLitAction() {
    // First, encrypt an API key (simulating a stored encrypted API key)
    // In a real scenario, this would already be encrypted and stored
    const apiKeyData = JSON.stringify({ key: "example-api-key-12345" });
    const currentCid = Lit.Auth.actionIpfsIdStack[0];

    const accessControlConditions = [
        {
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "",
            parameters: [":currentActionIpfsId"],
            returnValueTest: {
                comparator: "=",
                value: currentCid,
            },
        },
    ];

    // Encrypt the API key (using runOnce to ensure it only runs on one node)
    const encryptResult = await Lit.Actions.runOnce(
        { waitForResponse: true, name: "encryptApiKey" },
        async () => {
            const result = await Lit.Actions.encrypt({
                accessControlConditions,
                to_encrypt: ethers.utils.toUtf8Bytes(apiKeyData),
            });
            return JSON.stringify(result);
        }
    );
    const { ciphertext, dataToEncryptHash } = JSON.parse(encryptResult);

    // Now decrypt the API key (this is the actual decrypt operation we're counting)
    const decryptedApiKey = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        authSig: null,
        chain: "ethereum",
    });

    // Parse the decrypted API key
    const apiKey = JSON.parse(decryptedApiKey);

    // Use the API key in a fetch request (using Coinbase public API)
    const response = await fetch("https://api.coinbase.com/v2/time", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${apiKey.key}`,
        },
    });

    const responseData = await response.json();

    // Simulate runtime of 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    Lit.Actions.setResponse({
        response: JSON.stringify({
            success: true,
            data: responseData,
            // Note: We don't expose the actual API key in the response
        }),
    });
}

// Convert the function to a string and wrap it in an IIFE
export const ENCRYPT_DECRYPT_WITHIN_LIT_ACTION = `(${encryptDecryptWithinLitAction.toString()})();`;