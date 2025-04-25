import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { setLoggerOptions } from '@lit-protocol/logger';
import { prepareEoaAuthContext } from './authContexts/prepareEoaAuthContext';
import { preparePkpAuthContext } from './authContexts/preparePkpAuthContext';

const logger = setLoggerOptions({
  name: 'AuthManagerFunctions',
  level: 'debug',
});

/**
 * If you are using EOA (Externally Owned Account) authentication, you will want to choose the `fromEOA` method.
 * If you are using Lit Native Auth Methods (eg. Google, Discord, WebAuthn, Stytch, etc.) you will want to choose the `fromPKP` method.
 */
export const getAuthContext = {
  fromEOA: prepareEoaAuthContext,
  fromPKP: preparePkpAuthContext,
};

if (import.meta.main) {
  (async () => {
    // -- imports
    const { ethers } = await import('ethers');
    const { privateKeyToAccount } = await import('viem/accounts');
    const litNodeClient = new LitNodeClient({
      litNetwork: 'naga-dev',
      debug: false,
    });

    await litNodeClient.connect();

    const anvilPrivateKey =
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

    const ethersWallet = new ethers.Wallet(anvilPrivateKey);
    const viemAccount = privateKeyToAccount(anvilPrivateKey);

    const authContext = await getAuthContext.fromEOA({
      litNodeClient: litNodeClient,
      identity: {
        signer: ethersWallet,
        signerAddress: viemAccount.address,
        pkpPublicKey:
          '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
      },
      resources: createResourceBuilder().addPKPSigningRequest('*').requests,
    });

    console.log('authContext', authContext);
    process.exit();
  })();
}
