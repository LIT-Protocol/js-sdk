import { DevEnv } from 'local-tests/setup/env-setup';
import { getInvalidLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';

/**
 * Test Commands:
 * ❌ NOT AVAILABLE IN CAYENNE
 * ❌ NOT AVAILABLE IN HABANERO
 * ✅ yarn test:local --filter=testUseInvalidLitActionCodeToGenerateSessionSigs --network=localchain --version=v1
 */
export const testUseInvalidLitActionCodeToGenerateSessionSigs = async (
  devEnv: DevEnv
) => {
  try {
    await getInvalidLitActionSessionSigs(devEnv);
  } catch (e: any) {
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
