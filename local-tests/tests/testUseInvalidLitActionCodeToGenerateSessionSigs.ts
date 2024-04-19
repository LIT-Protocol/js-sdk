import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { DevEnv, LIT_TESTNET } from 'local-tests/setup/env-setup';
import { getInvalidLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';

/**
 * Test Commands:
 * ❌ NOT AVAILABLE IN CAYENNE
 * ❌ NOT AVAILABLE IN HABANERO
 * ✅ NETWORK=localchain yarn test:local --filter=testUseInvalidLitActionCodeToGenerateSessionSigs
 */
export const testUseInvalidLitActionCodeToGenerateSessionSigs = async (
  devEnv: DevEnv
) => {
  devEnv.setPkpSignVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

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
