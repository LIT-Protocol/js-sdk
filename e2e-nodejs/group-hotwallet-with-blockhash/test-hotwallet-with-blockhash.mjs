import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';

import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import ethers from "ethers";
import siwe from "siwe";

export async function main() {
  // ==================== Setup ====================

  const privKey = "3dfb4f70b15b6fccc786347aaea445f439a7f10fd10c55dd50cafc3d5a0abac1";
  const privKeyBuffer = uint8arrayFromString(privKey, "base16");
  const wallet = new ethers.Wallet(privKeyBuffer);

  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement = "This is a test statement. You can put anything you want here.";

  const TEST_BLOCKHASH = "0xfe88c94d860f01a17f961bf4bdfb6e0c6cd10d3fda5cc861e805ca1240c58553";

  // ==================== Test Logic ====================

  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "cayenne",
  });
  await litNodeClient.connect();
  let nonce = litNodeClient.getLatestBlockhash();

  if (!nonce) {
    console.log("Latest blockhash is undefined as the corr node changes hasn't been deployed");
    nonce =  TEST_BLOCKHASH;
  }

  const siweMessage = new siwe.SiweMessage({
    domain,
    address: wallet.address,
    statement,
    uri: origin,
    version: "1",
    chainId: "1",
    nonce,
  });

  const messageToSign = siweMessage.prepareMessage();
  const signature = await wallet.signMessage(messageToSign);

  // ==================== Post-Validation ====================

  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);

  const authSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: recoveredAddress,
  };

  console.log(authSig);

  if (!authSig.signedMessage.includes(TEST_BLOCKHASH)) {
    return fail("authSig doesn't contain the blockhash");
  }

  // ==================== Success ====================

  return success('Can create an authSig with the latest blockhash as its nonce');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
