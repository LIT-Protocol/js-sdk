// Test command:
// PRIVATE_KEY=xxx bun run ./issues/feature/lit-2831-slack-genius-team-unable-to-set-session-sig-expiry-beyond-5.ts
import { LitAbility, LitPKPResource } from '@lit-protocol/auth-helpers';
import { AuthMethodScope, LitNetwork } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ethers } from 'ethers';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LocalStorage } from 'node-localstorage';

// ========== Configuration ==========
const LOG_PREFIX = `[lit-2831]`;
const PRIVATE_KEY = process.env['PRIVATE_KEY'];
const RPC_URL = 'https://chain-rpc.litprotocol.com/http';
const LIT_NETWORK = LitNetwork.Cayenne;
const LIT_CLIENTS_DEBUG = false;

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY env variable is required');
}

const wallet = new ethers.Wallet(
  PRIVATE_KEY,
  new ethers.providers.JsonRpcProvider(RPC_URL)
);

const _log = (...params: any[]) =>
  console.log(
    `\x1b[33m%s\x1b[0m`,
    LOG_PREFIX,
    ...params.map((p) => (typeof p === 'object' ? JSON.stringify(p) : p))
  );

// ========== Start ==========
(async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK,
    debug: LIT_CLIENTS_DEBUG,
    storageProvider: {
      provider: new LocalStorage('./storage.test.db'),
    },
  });

  await litNodeClient.connect();

  _log('Connected to Lit Node');

  const expiration = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
  ).toISOString();
  const expectedDaysToExpireFromNow =
    (new Date(expiration).getTime() -
      new Date(new Date().toISOString()).getTime()) /
    (1000 * 60 * 60) /
    24;

  _log('expiration:', expiration);
  _log('expectedDaysToExpireFromNow:', expectedDaysToExpireFromNow);

  const litAuthProvider = LitAuthClient.getEthWalletProvider({
    litNodeClient,
  });

  const authMethod = await litAuthProvider.authenticate(wallet);

  _log('authMethod:', authMethod);

  const litContractsClient = new LitContracts({
    signer: wallet,
    network: LIT_NETWORK,
  });

  await litContractsClient.connect();

  const mintReceipt = await litContractsClient.mintWithAuth({
    authMethod: authMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  const { pkp: authMethodOwnedPkp } = mintReceipt;

  _log('authMethodOwnedPkp:', authMethodOwnedPkp);

  const sessionSigs = await litNodeClient.getSessionSigs({
    pkpPublicKey: `0x${authMethodOwnedPkp.publicKey}`,
    expiration: expiration,
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
    ],
    authNeededCallback: async (params) => {
      return (
        await litNodeClient.signSessionKey({
          statement: 'Some custom statement.',
          authMethods: [authMethod],
          pkpPublicKey: authMethodOwnedPkp.publicKey,
          expiration: params.expiration,
          resources: params.resources,
          chainId: 1,
          resourceAbilityRequests: params.resourceAbilityRequests,
        })
      ).authSig;
    },
  });

  const oneOfTheSessionSig = sessionSigs[litNodeClient.config.bootstrapUrls[0]];
  _log('oneOfTheSessionSig:', oneOfTheSessionSig);

  const expirationTime = oneOfTheSessionSig.signedMessage.match(
    /Expiration Time: ([^\n]*?Z)/
  )[1];
  const expirationTimeDate = new Date(expirationTime);
  const daysToExpiredFromNowFromSessionSig = Math.round(
    (expirationTimeDate.getTime() -
      new Date(new Date().toISOString()).getTime()) /
      (1000 * 60 * 60) /
      24
  );

  _log(
    'daysToExpiredFromNowFromSessionSig:',
    daysToExpiredFromNowFromSessionSig
  );
  _log('expectedDaysToExpireFromNow:', expectedDaysToExpireFromNow);

  // -- assert
  if (daysToExpiredFromNowFromSessionSig !== expectedDaysToExpireFromNow) {
    throw new Error(
      `daysToExpiredFromNowFromSessionSig(${daysToExpiredFromNowFromSessionSig}) !== expectedDaysToExpireFromNow(${expectedDaysToExpireFromNow})`
    );
  }

  _log('✅ daysToExpiredFromNowFromSessionSig === daysToExpiredFromNow');

  const res = await litNodeClient.pkpSign({
    toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
    pubKey: authMethodOwnedPkp.publicKey,
    sessionSigs: sessionSigs,
  });

  _log('✅ res:', res);

  process.exit();
})();
