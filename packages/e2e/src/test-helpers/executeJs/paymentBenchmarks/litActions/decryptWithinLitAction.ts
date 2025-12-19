declare const Lit: any;
declare const jsParams: any;

/**
 * Lit Action: Decrypt within the Lit Action
 *
 * Decrypts an API key and makes a fetch request within the Lit Action.
 */
async function decryptWithinLitAction() {
  const { accessControlConditions, ciphertext, dataToEncryptHash } = jsParams;

  // Decrypt the API key
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

export const DECRYPT_WITHIN_LIT_ACTION = `(${decryptWithinLitAction.toString()})();`;
