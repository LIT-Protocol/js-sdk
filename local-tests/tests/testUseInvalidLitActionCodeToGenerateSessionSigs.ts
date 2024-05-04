import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getInvalidLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseInvalidLitActionCodeToGenerateSessionSigs
 * ❌ NOT AVAILABLE IN MANZANO
 * ✅ NETWORK=localchain yarn test:local --filter=testUseInvalidLitActionCodeToGenerateSessionSigs
 */
export const testUseInvalidLitActionCodeToGenerateSessionSigs = async (
  devEnv: TinnyEnvironment
) => {
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);

  const alice = await devEnv.createRandomPerson();

  try {
    await getInvalidLitActionSessionSigs(devEnv, alice);
  } catch (e: any) {
    console.log('❌ This error is expected', e);
    if (
      e.message ===
      'There was an error getting the signing shares from the nodes'
    ) {
      console.log('✅ testUseInvalidLitActionCodeToGenerateSessionSigs passed');
    } else {
      throw e;
    }
  }
};
