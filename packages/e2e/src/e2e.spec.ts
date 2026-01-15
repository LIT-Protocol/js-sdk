import { createEnvVars } from './helper/createEnvVars';
import { createTestEnv } from './helper/createTestEnv';
import { getNetworkConfig } from './helper/network';
import type { ResolvedNetwork } from './helper/network';
import type { AuthContext } from './types';

/**
 * How to run:
 * - Full revamped suite (canonical):
 *   `NETWORK=naga-dev pnpm run test:e2e`
 *
 * - Just this file:
 *   `NETWORK=naga-dev pnpm exec dotenvx run --env-file=.env -- jest --runInBand --config ./jest.e2e.config.ts --cacheDirectory .jest-cache --runTestsByPath packages/e2e/src/e2e.spec.ts`
 *
 * - Single test / suite (use Jest name filtering):
 *   `NETWORK=naga-dev pnpm exec dotenvx run --env-file=.env -- jest --runInBand --config ./jest.e2e.config.ts --cacheDirectory .jest-cache --runTestsByPath packages/e2e/src/e2e.spec.ts --testNamePattern "EOA auth.*pkpSign"`
 *
 * - Alternative local workflow:
 *   add `.only` to a `describe` or `it` block temporarily.
 */
import {
  createTestAccount,
  CreateTestAccountResult,
} from './helper/createTestAccount';
import { registerEndpointSuite } from './suites/endpoints.suite';
import { registerViemSuite } from './suites/viem.suite';
import { registerPkpPreGeneratedMaterialsSuite } from './suites/pkp-pre-generated-materials.suite';
import { registerEoaNativeSuite } from './suites/eoa-native.suite';
import { registerWrappedKeysSuite } from './suites/wrapped-keys.suite';
import { registerCustomAuthSuite } from './suites/custom-auth.suite';
import { registerPaymentDelegationTicketSuite } from './tickets/delegation.suite';

const SELECTED_NETWORK = process.env['NETWORK'];
const IS_PAID_NETWORK = SELECTED_NETWORK !== 'naga-dev';
const describeIfPaid = IS_PAID_NETWORK ? describe : describe.skip;

describe('revamped e2e suite', () => {
  let envVars: ReturnType<typeof createEnvVars>;
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let resolvedNetwork: ResolvedNetwork;
  let alice: CreateTestAccountResult;
  let bob: CreateTestAccountResult;

  beforeAll(async () => {
    envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);
    const { name, importName, type } = getNetworkConfig(envVars.network);
    resolvedNetwork = {
      name,
      importName,
      type,
      networkModule: testEnv.networkModule,
    };

    alice = await createTestAccount(testEnv, {
      label: 'Alice',
      fundAccount: true,
      hasEoaAuthContext: true,
      fundLedger: true,
      hasPKP: true,
      fundPKP: true,
      hasPKPAuthContext: true,
      fundPKPLedger: true,
    });

    bob = await createTestAccount(testEnv, {
      label: 'Bob',
      fundAccount: true,
      hasEoaAuthContext: true,
      fundLedger: true,
      hasPKP: false,
      fundPKP: false,
      fundPKPLedger: false,
      hasPKPAuthContext: false,
    });
  });

  const authModes = [
    {
      label: 'EOA',
      getAuthContext: () => alice.eoaAuthContext!,
      includePaymentFlows: true,
      getAccsAddress: (_authContext: AuthContext) => alice.account.address,
    },
    {
      label: 'PKP',
      getAuthContext: () => alice.pkpAuthContext!,
      includePaymentFlows: false,
    },
  ] satisfies Array<{
    label: string;
    getAuthContext: () => AuthContext;
    includePaymentFlows: boolean;
    getAccsAddress?: (authContext: AuthContext) => string;
  }>;

  authModes.forEach((mode) => {
    describe(`${mode.label} auth`, () => {
      const getTestEnv = () => testEnv;
      const getAliceAccount = () => alice;
      const getBobAccount = () => bob;
      const getPkpPublicKey = () => {
        if (!alice.pkp) {
          throw new Error('Alice is missing a PKP');
        }
        return alice.pkp.pubkey;
      };
      const getPkpEthAddress = () => {
        if (!alice.pkp) {
          throw new Error('Alice is missing a PKP');
        }
        return alice.pkp.ethAddress as `0x${string}`;
      };

      registerEndpointSuite(getTestEnv, mode.getAuthContext, {
        getPkpPublicKey,
        getPkpEthAddress,
        getAliceAccount,
        getBobAccount,
        includePaymentFlows: mode.includePaymentFlows,
        getAccsAddress: mode.getAccsAddress,
      });

      registerViemSuite(getTestEnv, mode.getAuthContext, getPkpPublicKey);
    });
  });

  registerPkpPreGeneratedMaterialsSuite(
    () => testEnv,
    () => alice,
    () => resolvedNetwork
  );

  registerEoaNativeSuite(() => testEnv, () => alice);

  registerWrappedKeysSuite();

  registerCustomAuthSuite(() => testEnv, () => bob);
});

describeIfPaid('Paid networks tests', () => {
  registerPaymentDelegationTicketSuite();
});
