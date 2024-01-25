import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import { LitContracts } from '@lit-protocol/contracts-sdk';

// NETWORK=habanero E2E_CACHE=true MINT_NEW=false DEBUG=true yarn test:e2e:node --filter=test-recap-should
// NOTE: you need to hash data before you send it in.
// If you send something that isn't 32 bytes, the nodes will return an error.
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

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
  // ==================== Test Logic ====================
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  const walletNoRLI = new ethers.Wallet(
    '0x89faea1d1a74d9de8a807771d17c7cce20cce496244b5f8350330742ba37d099',
    provider
  );

  const authSig = await getAuthSig(walletNoRLI, client);
  console.log('authSig:', authSig);

  let contractClient = new LitContracts({
    signer: walletNoRLI,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  let pkpMintRes = await contractClient.pkpNftContractUtils.write.mint();

  const pkpInfo = pkpMintRes.pkp;

  try {
    await client.executeJs({
      authSig: authSig,
      code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
      authMethods: [],
      jsParams: {
        dataToSign: TO_SIGN,
        publicKey: pkpInfo.publicKey,
      },
    });
  } catch (e) {
    console.log('e:', e.errorCode);

    if (e.errorCode === 'rate_limit_exceeded') {
      return success('should fail when no RLI');
    }

    return fail('should fail when no RLI');
  }

  return fail(
    'shouldnt reach here at fresh state, but if nodes have recoded your state then this test will fail'
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
