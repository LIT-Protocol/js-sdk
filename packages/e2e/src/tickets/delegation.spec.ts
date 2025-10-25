import { createEnvVars } from '../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';

describe('payment delegation test', () => {
  let envVars: ReturnType<typeof createEnvVars>;
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let alice: CreateTestAccountResult;
  let bobAccount: CreateTestAccountResult;

  beforeAll(async () => {
    envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);
  });

  it("should allow Bob to use Alice's sponsorship to pay for PKP execution", async () => {
    // 1. First, create Bob
    bobAccount = await createTestAccount(testEnv, {
      label: 'Bob',
      fundAccount: true,
      fundLedger: false,
      hasPKP: true,
      fundPKP: false,
      fundPKPLedger: false,
    });

    if (!bobAccount.pkp?.ethAddress) {
      throw new Error("Bob's PKP does not have an ethAddress");
    }

    // 2. Next, create Alice, who will sponsor Bob
    alice = await createTestAccount(testEnv, {
      label: 'Alice',
      fundAccount: true,
      fundLedger: false,
      hasPKP: true,
      fundPKP: true,
      fundPKPLedger: true,
      sponsor: {
        restrictions: {
          totalMaxPriceInEth: '0.05',
          requestsPerPeriod: '100',
          periodSeconds: '5',
        },
        userAddresses: [bobAccount.pkp.ethAddress],
      },
    });

    // 3. Now, Bob tries to execute JS using Alice's sponsorship
    const res = await testEnv.litClient.chain.ethereum.pkpSign({
      authContext: bobAccount.eoaAuthContext!,
      pubKey: bobAccount.pkp?.pubkey!,
      toSign: 'Hello, world!',
    });

    console.log('res:', res);
  });
});
