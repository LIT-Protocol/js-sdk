import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getLitClient } from '.';
import { ethers } from 'ethers';
import { privateKeyToAccount } from 'viem/accounts';
import { hexToBytes } from 'viem';

async function createMyLitService() {
  // -- prepare auth context
  // const anvilPrivateKey =
  //   '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
  // const ethersWallet = new ethers.Wallet(
  //   '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  // );
  // const EOAAuthenticator =
  //   new LitAuth.authenticators.EOAAuthenticator({
  //   });

  // --- all the litNodeClient dependencies we want to remove soon
  const litNodeClient = new LitNodeClient({
    litNetwork: 'naga-dev',
  });

  await litNodeClient.connect();
  const _nodeUrls = await litNodeClient.getMaxPricesForNodeProduct({
    product: 'LIT_ACTION',
  });
  const _nonce = await litNodeClient.getLatestBlockhash();
  const _currentEpoch = litNodeClient.currentEpochNumber!;
  const _signSessionKey = litNodeClient.v2.signPKPSessionKey;
  // --- end of litNodeClient dependencies we want to remove soon

  const myViemSigner = () => {
    const anvilPrivateKey =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

    const account = privateKeyToAccount(anvilPrivateKey);

    return {
      signMessage: async (message: string) => account.signMessage({ message }),
      getAddress: async () => account.address,
    };
  };

  const ethersSigner = new ethers.Wallet(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  );

  const authManager = LitAuth.getAuthManager({
    storage: LitAuth.storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
    auth: {
      contextGetter: LitAuth.getPkpAuthContext,
      authenticators: [
        {
          method: LitAuth.authenticators.EOAAuthenticator,
          options: {
            signer: myViemSigner(),
          },
        },
      ],
      authentication: {
        pkpPublicKey:
          '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      },
      authorisation: {
        resources: createResourceBuilder()
          .addPKPSigningRequest('*')
          .getResources(),
      },
      // -- (optional) default is 15 minutes
      // sessionControl: {
      //   expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      // },
      // -- (optional) default is empty string
      // metadata: {
      //   statement: 'test',
      // },
    },
    connection: {
      // get this from network/chain client
      nodeUrls: _nodeUrls,
      // get this from network/chain client
      currentEpoch: _currentEpoch,

      // get this from lit client
      nonce: _nonce,
    },
    nodeAction: _signSessionKey,
  });

  // Call the returned function to get the context
  const authContext = await authManager.getAuthContext();

  console.log('authContext:', authContext);
  // const authMethod = await authManager.getAuthMethod();

  // const litClient = getLitClient({
  //   network: 'naga-dev',
  //   authManager,
  // });

  // return litClient;
}

const litService = createMyLitService();
