import { getInvalidLitActionIpfsAuthContext } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseInvalidLitActionIpfsCodeToGenerateSessionSigs
 * ✅ NETWORK=custom yarn test:local --filter=testUseInvalidLitActionIpfsCodeToGenerateSessionSigs
 */
export const testUseInvalidLitActionIpfsCodeToGenerateSessionSigs = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const authContext = getInvalidLitActionIpfsAuthContext(devEnv, alice);
    // @ts-expect-error Testing internal method
    await devEnv.litNodeClient._getSessionSigs(authContext);
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    if (e.message === 'An error related to validation has occured.') {
      console.log(
        '✅ testUseInvalidLitActionIpfsCodeToGenerateSessionSigs is expected to have an error'
      );
    } else {
      throw e;
    }
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
