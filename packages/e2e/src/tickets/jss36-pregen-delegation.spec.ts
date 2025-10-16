import { initFast } from '../init';
import { createPregenDelegationServerReuseTest } from '../tests/signSessionKey/pregen-delegation';

describe('PKP Auth with Pre-generated Materials', () => {
  let ctx: Awaited<ReturnType<typeof initFast>>;

  beforeAll(async () => {
    ctx = await initFast();
  });

  test('Try to pregen', async () => {
    await createPregenDelegationServerReuseTest({
      authManager: ctx.authManager,
      authData: ctx.aliceViemAccountAuthData,
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      clientLitClient: ctx.litClient,
      fallbackLitClient: ctx.litClient,
      resolvedNetwork: ctx.resolvedNetwork,
    })();
  });
});
