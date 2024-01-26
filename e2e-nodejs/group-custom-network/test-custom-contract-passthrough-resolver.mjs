import { fail, success, testThis } from '../../tools/scripts/utils.mjs';
import path from 'path';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { resolverAbi } from './resolver.data.js';

export async function main() {
  const contractContext = {
    resolverAddress: '0x9F0Ede26261451C5E784DC799D71ECf766EB7562',
    abi: resolverAbi,
    enviorment: 0,
  };

  const DATA_TO_SIGN = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode('Hello world')
    )
  );

  const client = new LitNodeClient({
    // litNetwork: 'cayenne',
    litNetwork: 'custom',
    bootstrapUrls: [],
    debug: globalThis.LitCI.debug,
    contractContext: contractContext,
  });
  await client.connect();

  let contractClient = new LitContracts({
    signer: globalThis.LitCI.wallet,
    debug: globalThis.LitCI.debug,
    network: 'custom',
    customContext: contractContext,
  });

  await contractClient.connect();
  let mintRes = await contractClient.pkpNftContractUtils.write.mint();

  const signRes = await client.executeJs({
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
        });
    })();`,
    authMethods: [],
    jsParams: {
      dataToSign: DATA_TO_SIGN,
      publicKey: mintRes.pkp.publicKey,
    },
  });

  if (litNodeClient.config.bootstrapUrls.length > 1) {
    fail('Should have more than 0 urls bootstrapped');
  }

  return success(
    `Can connect to custom network current urls from contract resolver: ${litNodeClient.config.bootstrapUrls.length}`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
