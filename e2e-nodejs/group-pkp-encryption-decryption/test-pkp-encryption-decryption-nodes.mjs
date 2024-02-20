import path from 'path';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import * as siwe from 'siwe';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';

export async function main() {
  // ========== PKP WALLET SETUP ===========
  // Getting the session signatures that will control the PKP
  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      statement: params.statement,
      authMethods: [
        {
          authMethodType: 1,
          accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
        },
      ],
      pkpPublicKey: `0x${globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey}`,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,
    });
    return response.authSig;
  };
  const resourceAbilities = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ];

  const pkpWallet = new PKPEthersWallet({
    pkpPubKey: globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network,
    authContext: {
      client,
      getSessionSigsProps: {
        chain: 'ethereum',
        // expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
        resourceAbilityRequests: resourceAbilities,
        authNeededCallback,
      },
    },
  });

  // Using the PKP to get an authentication signature for it
  const statement =
    'This is a test statement. You can put anything you want here.';
  const siweMessage = new siwe.SiweMessage({
    domain: 'localhost',
    address: pkpWallet.address,
    statement,
    uri: 'https://localhost/login',
    version: '1',
    chainId: 1,
    nonce: litNodeClient.getLatestBlockhash(),
    expirationTime: new Date(Date.now() + 60_000 * 60).toISOString(),
  });
  const messageToSign = siweMessage.prepareMessage();
  const signature = await pkpWallet.signMessage(messageToSign);
  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: pkpWallet.address,
  };

  // ==================== Test Setup ====================
  const chain = 'ethereum';

  // Control the address of the user that will be able to encrypt/decrypt the message
  // In this case, the PKP is the user
  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: pkpWallet.address,
      },
    },
  ];
  const message = 'Hello world';

  // ==================== Test Logic ====================
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      authSig,
      chain,
      dataToEncrypt: message,
    },
    client
  );
  const decryptedMessage = await LitJsSdk.decryptToString(
    {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig,
      chain,
    },
    client
  );

  // ==================== Post-Validation ====================
  if (message !== decryptedMessage) {
    return fail(
      `decryptedMessage should be ${message} but received ${decryptedMessage}`
    );
  }

  // ==================== Success ====================
  return success(
    'Message was encrypted and then decrypted using the pkp successfully'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
