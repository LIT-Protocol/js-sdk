import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getLitClient } from '.';
import { ethers } from 'ethers';
import { privateKeyToAccount } from 'viem/accounts';
import { hexToBytes } from 'viem';
import {
  AuthConfig,
  AuthConfigSchema,
} from 'packages/auth/src/lib/auth-manager';

async function createMyLitService() {
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

  const getLitClient = ({ network }: { network: 'naga-dev' }) => {
    return {
      getLatestBlockhash: litNodeClient.getLatestBlockhash,
      getCurrentEpoch: async () => litNodeClient.currentEpochNumber ?? 0,
      getSignSessionKey: litNodeClient.v2.signPKPSessionKey,
      getMaxPricesForNodeProduct: litNodeClient.getMaxPricesForNodeProduct,
    };
  };

  // --- end of litNodeClient dependencies we want to remove soon

  const ethersSigner = new ethers.Wallet(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  );

  // get rid of statefulness
  // never couple to 1 pkp, always design for lookup
  const authManager = LitAuth.getAuthManager({
    storage: LitAuth.storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  const myAuthConfig: AuthConfig = {
    expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 miniutes
    statement: 'test',
    domain: 'example.com',
    capabilityAuthSigs: [],
    resources: createResourceBuilder().addPKPSigningRequest('*').getResources(),
  };

  const litClient = getLitClient({ network: 'naga-dev' });

  // There's actually two eth authetnicators
  // - Ethers
  // - web3 wallet (metamask)
  // Call the returned function to get the context
  // pass the lit client inside here
  // uri: location.href
  // lit:session: uri <-- add it
  const eoaAuthContext = await authManager.getEoaAuthContext({
    config: {
      signer: ethersSigner,
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  // -- EOA Auth Context
  const pkpEoaAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.EOAAuthenticator,
    config: {
      signer: ethersSigner,
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpEoaAuthContext:', pkpEoaAuthContext);

  // -- PKP Google Auth Context
  const pkpGoogleAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.GoogleAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      // baseUrl: 'https://login.litgateway.com',
      // redirectUri: window.location.origin,
      // clientId: '123',
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpGoogleAuthContext:', pkpGoogleAuthContext);

  // -- PKP Discord Auth Context
  const pkpDiscordAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.DiscordAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      // method: 'register',
      // baseUrl: 'https://login.litgateway.com',
      // redirectUri: window.location.origin,
      // clientId: '1052874239658692668',
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpDiscordAuthContext:', pkpDiscordAuthContext);

  // -- WebAuthn Auth Context

  // 1. we first need to associate a webauthn authenticator with the user

  // before getting auth context
  // // we TRY to parse the url
  // const pkpAuthContext = await authManager.getPkpAuthContext({
  // pkpAddress
  // authenticator: just one <-- This is the authtncator i want you to use.
  // authConfig: {}
  // litClient (nonce or whatever the fuck)
  // });

  // authManager.didtheuserjustloggedin();
  // if true
  // parse the login params,
  // if false
  //

  // const authMethod = await authManager.getAuthMethod();

  // receive authMaterial instead
  // const litClient = getLitClient({
  //   network: 'naga-dev',
  //   // authManager, ❌
  // });

  // litClient.encrypt({
  //   // authContext:
  // });

  // return litClient;

  // as a user,
  // authManager
  // litClient

  // authContext to do shit with the litClient
}

const litService = createMyLitService();
