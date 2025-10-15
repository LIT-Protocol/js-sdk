import { createExecuteJsDecryptAndCombineTest } from '../helper/tests/executeJs';
import { initFast } from '../init';

describe('drel1157 decryptAndCombine Lit Action', () => {
  let ctx: Awaited<ReturnType<typeof initFast>>;

  beforeAll(async () => {
    ctx = await initFast();
  });

  it('should execute the decrypt and combine Lit Action successfully', () =>
    createExecuteJsDecryptAndCombineTest(
      ctx,
      () => ctx.aliceEoaAuthContext
    )());
});
