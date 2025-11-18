import type { LitActionExample } from "../types";

const code = String.raw`(async () => {
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
    // const entropy = ethers.utils.randomBytes(32);
    // const entropyHex = ethers.utils.hexlify(entropy);
    const entropyHex = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "generateEntropy" },
      async () => {
        return ethers.utils.hexlify(ethers.utils.randomBytes(32));
      }
    );
    const entropy = ethers.utils.arrayify(entropyHex);
    results.step2_generateEntropy = {
      success: true,
      entropy: entropyHex,
      entropyLength: entropy.length,
    };

    // Step 3: Encrypt with access control locked to current IPFS CID
    // When method is empty, it uses check_condition_via_signature which does string comparison
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
    console.log("encryptResult", encryptResult);

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
      ciphertext: ciphertextStr,
      dataToEncryptHash: dataHashStr,
    };

    // Step 4: Decrypt using decryptAndCombine
    // Note: In production, you'd fetch ciphertext + dataToEncryptHash from the smart contract
    // Here we're using the original encrypt result formats (not the converted strings)
    const decryptResult = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext: encryptResult.ciphertext, // Use original format
      dataToEncryptHash: encryptResult.dataToEncryptHash, // Use original format
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
      decryptedData: decryptedHex,
      decryptedLength: decryptResult.length,
    };

    // Step 5: Verify original matches decrypted
    const matches = entropyHex === decryptedHex;
    results.step5_verify = {
      success: true,
      matches,
      original: entropyHex,
      decrypted: decryptedHex,
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

export default {
  id: "decrypt-and-combine",
  title: "Encrypt, Decrypt, and Verify",
  description:
    "Encrypt data tied to the current action CID, decrypt it with decryptAndCombine, and verify the round trip.",
  order: 30,
  code,
} satisfies LitActionExample;
