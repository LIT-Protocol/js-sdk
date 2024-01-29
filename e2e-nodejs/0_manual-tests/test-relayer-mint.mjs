import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LocalStorage } from 'node-localstorage';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { AuthMethodScope } from '@lit-protocol/constants';

async function getAuthSig(wallet, litNodeClient) {
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';

  const address = await wallet.getAddress();

  const nonce = await litNodeClient.getLatestBlockhash();

  const siweMessage = new siwe.SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    expirationTime: new Date(Date.now() + 60_000 * 60).toISOString(),
  });

  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  return authSig;
}

export async function main() {
  // ==================== Setup ====================

  if (!process.env.NETWORK) {
    return fail(`NETWORK env var not set.`);
  }

  if (!['cayenne', 'habanero', 'manzano'].includes(process.env.NETWORK)) {
    return fail(
      `Invalid NETWORK env var set. It has to be either 'manzano', 'habanero', or 'cayenne'`
    );
  }

  // -- setting up lit node client
  const litNodeClient = new LitNodeClient({
    litNetwork: process.env.NETWORK,
    debug: true,
    checkNodeAttestation: true,
    storageProvider: {
      provider: new LocalStorage('./storage.test.db'),
    },
  });

  await litNodeClient.connect();

  // -- controller wallet
  const wallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  // -- setting up lit auth client, which uses
  // the lit node client so that it knows which network to use
  const litAuthClient = new LitAuthClient({
    litNodeClient,
    litRelayConfig: {
      relayApiKey: '...',
    },
    debug: true,
  });

  console.log(
    'litAuthClient.litNodeClient.config:',
    litAuthClient.litNodeClient.config
  );

  // -- setting up auth provider
  const authSig = await getAuthSig(wallet, litNodeClient);

  const authMethod = {
    authMethodType: 1,
    accessToken: JSON.stringify(authSig),
  };

  console.log('authMethod', authMethod);

  // ==================== Test Logic ====================
  let res = await litAuthClient.mintPKPWithAuthMethods([authMethod], {
    pkpPermissionScopes: [[AuthMethodScope.SignAnything]],
    sendPkpToitself: true,
    addPkpEthAddressAsPermittedAddress: true,
  });

  if (!res) {
    return fail(`Res is empty, expected a response from the relayer`);
  }

  // ==================== Post-Validation ====================
  return success(`Minted PKP via the relayer with auth methods`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
