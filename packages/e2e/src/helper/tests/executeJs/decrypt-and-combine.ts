import { AuthContext, LitClientInstance } from '../../../types';

type ExecuteJsContext = {
  litClient: LitClientInstance;
  aliceEoaAuthContext: AuthContext;
};

export const decryptAndCombineLitAction = `
(async () => {
  const results = {
    step1_getCurrentCid: null,
    step2_generateEntropy: null,
    step3_encrypt: null,
    step4_decrypt: null,
    step5_verify: null,
  };

  try {
    // Step 1: Get current action IPFS CID
    const currentCid = Lit.Auth.actionIpfsIdStack[0];
    results.step1_getCurrentCid = {
      success: true,
      cid: currentCid,
    };

    // Step 2: Generate entropy (32 random bytes)
    const entropyHex = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "generateEntropy" },
      async () => {
        return ethers.utils.hexlify(ethers.utils.randomBytes(32));
      }
    );
    const entropy = ethers.utils.arrayify(entropyHex);
    results.step2_generateEntropy = {
      success: true,
      entropyPreview: entropyHex.substring(0, 20) + "...",
      entropyLength: entropy.length,
    };

    // Step 3: Encrypt with access control locked to current IPFS CID
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

    let encryptResult = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "encrypt" },
      async () => {
        return JSON.stringify(
          await Lit.Actions.encrypt({
            accessControlConditions,
            to_encrypt: ethers.utils.toUtf8Bytes(entropyHex),
          })
        );
      }
    );
    encryptResult = JSON.parse(encryptResult);

    // Convert ciphertext to base64 for transmission
    let ciphertextStr;
    if (encryptResult.ciphertext instanceof Uint8Array) {
      const binaryStr = Array.from(encryptResult.ciphertext)
        .map((byte) => String.fromCharCode(byte))
        .join("");
      ciphertextStr = btoa(binaryStr);
    } else {
      ciphertextStr = encryptResult.ciphertext;
    }

    // Convert dataToEncryptHash to hex
    let dataHashStr;
    if (encryptResult.dataToEncryptHash instanceof Uint8Array) {
      dataHashStr = ethers.utils.hexlify(encryptResult.dataToEncryptHash);
    } else {
      dataHashStr = encryptResult.dataToEncryptHash;
    }

    results.step3_encrypt = {
      success: true,
      ciphertextLength: ciphertextStr.length,
      ciphertextPreview: ciphertextStr.substring(0, 30) + "...",
      dataToEncryptHash: dataHashStr,
    };

    // Step 4: Decrypt using decryptAndCombine
    const decryptResult = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext: encryptResult.ciphertext,
      dataToEncryptHash: encryptResult.dataToEncryptHash,
      authSig: null,
      chain: "ethereum",
    });

    // Convert decrypted result to hex for comparison
    let decryptedHex;
    if (decryptResult instanceof Uint8Array) {
      decryptedHex = ethers.utils.hexlify(decryptResult);
    } else if (typeof decryptResult === "string") {
      decryptedHex = decryptResult;
    } else {
      decryptedHex = "unknown format";
    }

    results.step4_decrypt = {
      success: true,
      decryptedDataPreview: decryptedHex.substring(0, 20) + "...",
      decryptedLength: decryptResult.length,
    };

    // Step 5: Verify original matches decrypted
    const matches = entropyHex === decryptedHex;
    results.step5_verify = {
      success: true,
      matches,
      originalPreview: entropyHex.substring(0, 20) + "...",
      decryptedPreview: decryptedHex.substring(0, 20) + "...",
    };

    Lit.Actions.setResponse({
      response: JSON.stringify(
        {
          success: true,
          currentCid,
          results,
        },
        null,
        2
      ),
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: JSON.stringify(
        {
          success: false,
          error: error.message,
          results,
        },
        null,
        2
      ),
    });
  }
})();`;

export const createExecuteJsDecryptAndCombineTest = (
  ctx: ExecuteJsContext,
  getAuthContext: () => AuthContext = () => ctx.aliceEoaAuthContext
) => {
  return async () => {
    const result = await ctx.litClient.executeJs({
      code: decryptAndCombineLitAction,
      authContext: getAuthContext(),
      jsParams: {},
    });

    if (typeof result.response !== 'string') {
      throw new Error('Expected executeJs response to be a string payload');
    }

    const parsed = JSON.parse(result.response);

    expect(parsed.success).toBe(true);
    expect(parsed.currentCid).toBeDefined();
    expect(parsed.results?.step1_getCurrentCid?.success).toBe(true);
    expect(parsed.results?.step2_generateEntropy?.entropyLength).toBe(32);
    expect(parsed.results?.step3_encrypt?.success).toBe(true);
    expect(parsed.results?.step4_decrypt?.success).toBe(true);
    expect(parsed.results?.step5_verify?.matches).toBe(true);
  };
};
