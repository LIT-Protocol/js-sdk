import { initFast } from '../init';
import { createPregenDelegationServerReuseTest } from '../tests/signSessionKey/pregen-delegation';

describe('PKP Auth with Pre-generated Materials', () => {
  let ctx: Awaited<ReturnType<typeof initFast>>;

  beforeAll(async () => {
    ctx = await initFast();
  });

  test('Try to pregen', async () => {
    await createPregenDelegationServerReuseTest(ctx)();
  });
});
