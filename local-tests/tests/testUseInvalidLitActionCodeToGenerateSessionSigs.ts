import { LIT_NETWORK } from '@lit-protocol/constants';
import { getInvalidLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseInvalidLitActionCodeToGenerateSessionSigs
 * ✅ NETWORK=custom yarn test:local --filter=testUseInvalidLitActionCodeToGenerateSessionSigs
 */
export const testUseInvalidLitActionCodeToGenerateSessionSigs = async (
  devEnv: TinnyEnvironment
) => {
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
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
