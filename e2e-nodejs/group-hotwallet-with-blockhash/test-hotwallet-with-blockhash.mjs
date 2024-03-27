import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';

import * as LitJsSdk from '@lit-protocol/lit-node-client';
import {
  LitAccessControlConditionResource,
  LitAbility,
} from '@lit-protocol/auth-helpers';
import { fromString as uint8arrayFromString } from 'uint8arrays/from-string';
import ethers from 'ethers';
import { SiweMessage } from 'siwe';

async function hashBytes({ bytes }) {
  const hashOfBytes = await crypto.subtle.digest('SHA-256', bytes);
  const hashOfBytesStr = LitJsSdk.uint8arrayToString(
    new Uint8Array(hashOfBytes),
    'base16'
  );
  return hashOfBytesStr;
}

function checkNonceInEachSessionSig(sessionSig, nonce) {
  return Object.keys(sessionSig).every((key) => {
    const signedMessage = sessionSig[key].signedMessage;
    return signedMessage.includes(nonce);
  });
}

export async function main() {
  // ==================== Setup ====================

  const privKey =
    '3dfb4f70b15b6fccc786347aaea445f439a7f10fd10c55dd50cafc3d5a0abac1';
  const privKeyBuffer = uint8arrayFromString(privKey, 'base16');
  const wallet = new ethers.Wallet(privKeyBuffer);

  const chain = 'ethereum';
  const domain = 'localhost';
  const statement =
    'This is a test statement. You can put anything you want here.';

  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '0',
      },
    },
  ];

  // ==================== Test Logic ====================

  const litNodeClient = new LitJsSdk.LitNodeClient({
    // litNetwork: 'cayenne',
    litNetwork: globalThis.LitCI.network,
    debug: globalThis.LitCI.debug,
  });
  await litNodeClient.connect();

  let nonce = await litNodeClient.getLatestBlockhash();
  console.log('Eth blockhash nonce- ', nonce);

  if (!nonce) {
    fail('Latest Eth blockhash is undefined');
  }

  const authNeededCallback = async ({ resources, expiration, uri }) => {
    const message = new SiweMessage({
      domain,
      address: wallet.address,
      statement,
      uri,
      version: '1',
      chainId: '1',
      expirationTime: expiration,
      resources,
      nonce,
    });

    const toSign = message.prepareMessage();
    const signature = await wallet.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: wallet.address,
    };

    return authSig;
  };

  const hashedEncryptedSymmetricKeyStr = await hashBytes({
    bytes: new Uint8Array(accessControlConditions),
  });

  const litResource = new LitAccessControlConditionResource(
    hashedEncryptedSymmetricKeyStr
  );

  // ==================== Post-Validation ====================

  // NOTE: `getSessionSigs` will fail if the nonce is not a valid Eth blockhash
  const sessionSigs = await litNodeClient.getSessionSigs({
    chain,
    resourceAbilityRequests: [
      {
        resource: litResource,
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback,
  });

  console.log(sessionSigs);

  if (!checkNonceInEachSessionSig(sessionSigs, nonce)) {
    return fail("sessionSig doesn't contain the blockhash");
  }

  // ==================== Success ====================

  return success(
    'Can create an authSig with the latest blockhash as its nonce'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
