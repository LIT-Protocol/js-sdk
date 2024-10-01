const {
  generateSolanaPrivateKey,
} = require('./internal/generateEncryptedPrivateKey');

/* global accessControlConditions, Lit */

/**
 *
 * Bundles solana/web3.js package as it's required to generate a random Solana key and only allows the provided PKP to decrypt it
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a stringified JSON object with ciphertext & dataToEncryptHash which are the result of the encryption. Also returns the publicKey of the newly generated Solana Wrapped Key.
 */
(async () => {
  const generatedKeyResultStr = await Lit.Actions.runOnce(
    { waitForResponse: true, name: 'generateSolanaPrivateKey' },
    () => JSON.stringify(generateSolanaPrivateKey({ accessControlConditions }))
  );

  Lit.Actions.setResponse({
    response: generatedKeyResultStr,
  });
})();
