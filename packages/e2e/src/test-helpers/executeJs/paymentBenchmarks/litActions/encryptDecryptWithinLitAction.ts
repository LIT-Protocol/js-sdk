export const ENCRYPT_DECRYPT_WITHIN_LIT_ACTION = `
const go = async () => {
  // First, encrypt an API key (simulating a stored encrypted API key)
  // In a real scenario, this would already be encrypted and stored
  const apiKeyData = JSON.stringify({ key: "example-api-key-12345" });
  const currentCid = Lit.Auth.actionIpfsIdStack[0];

  // const accessControlConditions = [
  //   {
  //     contractAddress: "",
  //     standardContractType: "",
  //     chain: "ethereum",
  //     method: "",
  //     parameters: [":currentActionIpfsId"],
  //     returnValueTest: {
  //       comparator: "=",
  //       value: currentCid,
  //     },
  //   },
  // ];

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
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: "ethereum",
  });

  // Parse the decrypted API key
  const apiKey = JSON.parse(decryptedApiKey);

  // Use the API key in a fetch request
  const response = await fetch("https://api.coingecko.com/api/v3/ping", {
    method: "GET",
    headers: {
      "Authorization": \`Bearer \${apiKey.key}\`,
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();

  Simulate runtime of 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  Lit.Actions.setResponse({
    response: JSON.stringify({
      success: true,
      data: responseData,
      // Note: We don't expose the actual API key in the response
    }),
  });
};

go();
`;