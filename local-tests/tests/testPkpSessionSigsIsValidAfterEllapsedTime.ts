import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log, validateSessionSigs } from '@lit-protocol/misc';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToPkpSign
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToPkpSign
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToPkpSign
 */
export const testPkpSessionSigsIsValidAfterEllapsedTime = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  let pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    new Date(Date.now() + 1000).toISOString()
  );
  await new Promise((res, rej) => {
    setTimeout(res, 2000);
  });

  let res = validateSessionSigs(pkpSessionSigs);

  if (res.isValid) {
    throw new Error(
      'Session signature validation should fail with expiration ellapsed'
    );
  }
  console.log(res);
  try {
    const res = await devEnv.litNodeClient.pkpSign({
      toSign: alice.loveLetter,
      pubKey: alice.authMethodOwnedPkp.publicKey,
      sessionSigs: pkpSessionSigs,
    });
  } catch (e) {
    console.log(
      '✅ Session validation failed as expected: error is ',
      e.message
    );
  }

  devEnv.releasePrivateKeyFromUser(alice);
};
