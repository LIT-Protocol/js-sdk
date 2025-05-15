import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { AuthConfig } from 'packages/auth/src/lib/AuthManager/auth-manager';
import { getLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';
import { Hex } from 'viem';

async function createMyLitService() {
  const myAccount = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

  // 1. Pick the network you want to connect to:
  const { nagaDev } = await import('@lit-protocol/networks');

  // --- end of litNodeClient dependencies we want to remove soon

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
    statement: '🔥THIS IS A TEST STATEMENT🔥',
    domain: 'example.com/🔥',
    capabilityAuthSigs: [],
    resources: createResourceBuilder().addPKPSigningRequest('*').getResources(),
  };

  const litClient = await getLitClient({ network: nagaDev });

  // There's actually two eth authetnicators
  // - Ethers
  // - web3 wallet (metamask)
  // Call the returned function to get the context
  // pass the lit client inside here
  // uri: location.href
  // lit:session: uri <-- add it

  // ---------------------------- EOA Auth Context Example ----------------------------
  const eoaAuthContext = await authManager.getEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('eoaAuthContext:', eoaAuthContext);

  process.exit();

  // ---------------------------- PKP EOA Auth Context Example ----------------------------
  const pkpEoaAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.EOAAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      signer: myEthersSigner,
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpEoaAuthContext:', pkpEoaAuthContext);

  // ---------------------------- PKP Google Auth Context Example ----------------------------
  const pkpGoogleAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.GoogleAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      // -- optional params
      baseUrl: 'https://login.litgateway.com',
      redirectUri: window.location.origin,
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpGoogleAuthContext:', pkpGoogleAuthContext);

  // ---------------------------- PKP Discord Auth Context Example ----------------------------
  const pkpDiscordAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.DiscordAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',

      // -- optional params
      baseUrl: 'https://login.litgateway.com',
      redirectUri: window.location.origin,
      clientId: '1052874239658692668',
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpDiscordAuthContext:', pkpDiscordAuthContext);

  // ---------------------------- PKP WebAuthn Auth Context Example ----------------------------

  // There are two ways, register and getAuthMethod or authenticate and getAuthMethod
  const webAuthnAuthContextViaRegister = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.WebAuthnAuthenticator,
    config: {
      method: 'register',
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      relay: {} as any,
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log(
    'webAuthnAuthContextViaRegister:',
    webAuthnAuthContextViaRegister
  );

  const webAuthnAuthContextViaAuthenticate =
    await authManager.getPkpAuthContext({
      authenticator: LitAuth.authenticators.WebAuthnAuthenticator,
      config: {
        method: 'authenticate',
        pkpPublicKey:
          '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
        relay: {} as any,
      },
      authConfig: myAuthConfig,
      litClient: litClient,
    });

  console.log(
    'webAuthnAuthContextViaAuthenticate:',
    webAuthnAuthContextViaAuthenticate
  );

  // ---------------------------- PKP Stytch OTP Auth Context Example ----------------------------
  // Assume user has completed Stytch OTP flow and obtained an accessToken
  const stytchAccessToken = 'your-stytch-otp-verified-token'; // Replace with actual token
  const stytchAppId = 'your-stytch-project-id'; // Replace with actual App ID

  const pkpStytchOtpAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.StytchOtpAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      appId: stytchAppId,
      accessToken: stytchAccessToken,
      provider: 'https://stytch.com/session',
      // userId: 'optional-stytch-user-id' // optional
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log('pkpStytchOtpAuthContext:', pkpStytchOtpAuthContext);

  // ---------------------------- PKP Stytch Auth Factor OTP Auth Context Example ----------------------------
  // Assume user has completed Stytch OTP flow for a specific factor (e.g., email)
  const stytchFactorAccessToken = 'your-stytch-otp-verified-token-for-factor'; // Replace with actual token

  const pkpStytchEmailFactorAuthContext = await authManager.getPkpAuthContext({
    authenticator: LitAuth.authenticators.StytchAuthFactorOtpAuthenticator,
    config: {
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      accessToken: stytchFactorAccessToken,
      factor: 'email', // Specify the factor used (email, sms, whatsApp, totp)
    },
    authConfig: myAuthConfig,
    litClient: litClient,
  });

  console.log(
    'pkpStytchEmailFactorAuthContext:',
    pkpStytchEmailFactorAuthContext
  );
}

const litService = createMyLitService();
