import { getInvalidLitActionAuthContext } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
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
    const authContext = getInvalidLitActionAuthContext(devEnv, alice);
    // @ts-expect-error Testing internal method
    await devEnv.litNodeClient._getSessionSigs(authContext);
  } catch (e: any) {
    if (
      e.message.includes(
        'There was an error getting the signing shares from the nodes'
      )
    ) {
      console.log('❌ This error is expected', e);
      console.log('✅ testUseInvalidLitActionCodeToGenerateSessionSigs passed');
    } else {
      throw e;
    }
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
