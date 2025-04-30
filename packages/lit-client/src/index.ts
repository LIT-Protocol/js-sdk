// Export our top-level consumer API and types for consumers of the entire lit-client package
// export `getLitClient({network, authManager, options? })` => { ...api }

import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import type {
  AuthManagerConfigUnion,
  PkpAuthManagerConfig,
  EoaAuthManagerConfig,
} from '@lit-protocol/auth';

interface LitClientConfig {
  network: 'naga-dev';
  // authContext: LitAuth.GetAuthContext;
}

// const authManager = () => {
//   const sessionKeyPair = LitAuth.generateSessionKeyPair();
// };

export const getLitClient = (params: LitClientConfig) => {
  console.log(params);
};

// @ts-ignore
if (import.meta.main) {
  async function createMyLitService() {
    // -- prepare auth context
    // const anvilPrivateKey =
    //   '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
    // const ethersWallet = new ethers.Wallet(
    //   '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
    // );
    // const MetamaskAuthenticator =
    //   new LitAuth.authenticators.MetamaskAuthenticator({
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

    const authManager = await LitAuth.getAuthManager({
      storage: LitAuth.storagePlugins.localStorageNode({
        appName: 'my-app',
        networkName: 'naga-dev',
        storagePath: './lit-auth-storage',
      }),
      auth: {
        contextGetter: LitAuth.getPkpAuthContext,
        authenticator: new LitAuth.authenticators.MetamaskAuthenticator({
          nonce: _nonce,
        }),
        authentication: {
          pkpPublicKey:
            '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
        },
        authorisation: {
          resources: createResourceBuilder().addPKPSigningRequest('*').requests,
        },
        connection: {
          nodeUrls: _nodeUrls,
          nonce: _nonce,
          currentEpoch: _currentEpoch,
        },
        nodeSignSessionKey: _signSessionKey,
      },
    });

    const authContext = await LitAuth.getPkpAuthContext({
      authentication: {
        pkpPublicKey:
          '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',

        // an authenticator outside of this should handle the authMethods
        authMethods: [
          {
            authMethodType: 1,
            accessToken: '123',
          },
        ],
      },
      authorisation: {
        resources: createResourceBuilder().addPKPSigningRequest('*').requests,
        // -- (optional) default is null
        // capabilityAuthSigs: [],
      },
      // -- (optional) default is 15 minutes
      // sessionControl: {
      //   expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      // },

      // -- (optional) default is empty string
      // metadata: {
      //   statement: 'test',
      // },
      connection: {
        nodeUrls: _nodeUrls,
        nonce: _nonce,
        currentEpoch: _currentEpoch,
      },
      nodeSignSessionKey: _signSessionKey,
    });

    console.log('authContext:', JSON.stringify(authContext, null, 2));
  }

  const litService = createMyLitService();

  // const authManager = await LitAuth.getAuthManager({
  //   storage: myUnEncryptedLocalStorage({
  //     appName: 'my-app',
  //     networkName: 'naga-dev',
  //     storagePath: './lit-auth-storage',
  //   }),
  //   auth: {
  //     contextGetter: LitAuth.getPkpAuthContext,
  //     config: {
  //       identity: {
  //         sessionKeyPair: LitAuth.generateSessionKeyPair(),
  //         pkpPublicKey:
  //           '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
  //         authMethods: [
  //           {
  //             authMethodType: 1,
  //             accessToken: '123',and
  //           },
  //         ],
  //       },
  //       authMaterial: {
  //         resources: [],
  //         expiration: '1000',
  //       },
  //       deps: {
  //         litNodeClient: new LitNodeClient({
  //           litNetwork: 'naga-dev',
  //         }),
  //       },
  //     },
  //   },
  // });

  // console.log(authManager);

  // const authContext = LitAuth.getPkpAuthContext({
  //   identity: {
  //     sessionKeyPair: LitAuth.generateSessionKeyPair(),
  //     pkpPublicKey:
  //       '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
  //     authMethods: [
  //       {
  //         authMethodType: 1,
  //         accessToken: '123',
  //       },
  //     ],
  //   },
  //   authMaterial: {
  //     resources: [],
  //     expiration: '1000',
  //   },
  //   deps: {
  //     litNodeClient: new LitNodeClient({
  //       litNetwork: 'naga-dev',
  //     }),
  //   },
  // });
  // const litClient = getLitClient({
  //   network: 'naga-dev',
  //   authContext,
  // });

  // console.log(litClient);
}
