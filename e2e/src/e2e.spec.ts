import {
  createCustomAuthContext,
  createPkpAuthContext,
} from './helper/auth-contexts';
import {
  createExecuteJsTest,
  createPkpSignTest,
  createPkpEncryptDecryptTest,
  createEncryptDecryptFlowTest,
  createPkpPermissionsManagerFlowTest,
  createEoaNativeAuthFlowTest,
  createViemSignMessageTest,
  createViemSignTransactionTest,
  createViemSignTypedDataTest,
  createViewPKPsByAddressTest,
  createViewPKPsByAuthDataTest,
  createPaymentManagerFlowTest,
  createPaymentDelegationFlowTest,
} from './helper/tests';
import { init } from './init';

const RPC_OVERRIDE = process.env['LIT_YELLOWSTONE_PRIVATE_RPC_URL'];
if (RPC_OVERRIDE) {
  console.log(
    '🧪 E2E: Using RPC override (LIT_YELLOWSTONE_PRIVATE_RPC_URL):',
    RPC_OVERRIDE
  );
}

describe('all', () => {
  // Singleton baby
  let ctx: Awaited<ReturnType<typeof init>>;

  // Auth contexts for testing
  let alicePkpAuthContext: any;
  let eveCustomAuthContext: any;

  beforeAll(async () => {
    try {
      ctx = await init();

      // Create PKP and custom auth contexts using helper functions
      // alicePkpAuthContext = await createPkpAuthContext(ctx);
      eveCustomAuthContext = await createCustomAuthContext(ctx);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });

  describe('EOA Auth', () => {
    console.log('🔐 Testing using Externally Owned Account authentication');

    describe('endpoints', () => {
      it('pkpSign', () =>
        createPkpSignTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('executeJs', () =>
        createExecuteJsTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('viewPKPsByAddress', () =>
        createViewPKPsByAddressTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('viewPKPsByAuthData', () =>
        createViewPKPsByAuthDataTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('pkpEncryptDecrypt', () =>
        createPkpEncryptDecryptTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('encryptDecryptFlow', () =>
        createEncryptDecryptFlowTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('pkpPermissionsManagerFlow', () =>
        createPkpPermissionsManagerFlowTest(
          ctx,
          () => ctx.aliceEoaAuthContext
        )());
      it('paymentManagerFlow', () =>
        createPaymentManagerFlowTest(ctx, () => ctx.aliceEoaAuthContext)());
      it('paymentDelegationFlow', () =>
        createPaymentDelegationFlowTest(ctx, () => ctx.aliceEoaAuthContext)());

      describe('integrations', () => {
        describe('pkp viem account', () => {
          it('sign message', () =>
            createViemSignMessageTest(ctx, () => ctx.aliceEoaAuthContext)());
          it('sign transaction', () =>
            createViemSignTransactionTest(
              ctx,
              () => ctx.aliceEoaAuthContext
            )());
          it('sign typed data', () =>
            createViemSignTypedDataTest(ctx, () => ctx.aliceEoaAuthContext)());
        });
      });
    });

    describe('PKP Auth', () => {
      console.log('🔐 Testing using Programmable Key Pair authentication');

      describe('endpoints', () => {
        it('pkpSign', () =>
          createPkpSignTest(ctx, () => ctx.alicePkpAuthContext)());
        it('executeJs', () =>
          createExecuteJsTest(ctx, () => ctx.alicePkpAuthContext)());
        it('viewPKPsByAddress', () =>
          createViewPKPsByAddressTest(ctx, () => ctx.alicePkpAuthContext)());
        it('viewPKPsByAuthData', () =>
          createViewPKPsByAuthDataTest(ctx, () => ctx.alicePkpAuthContext)());
        it('pkpEncryptDecrypt', () =>
          createPkpEncryptDecryptTest(ctx, () => ctx.alicePkpAuthContext)());
        it('encryptDecryptFlow', () =>
          createEncryptDecryptFlowTest(ctx, () => ctx.alicePkpAuthContext)());
        it('pkpPermissionsManagerFlow', () =>
          createPkpPermissionsManagerFlowTest(
            ctx,
            () => ctx.alicePkpAuthContext
          )());
      });

      describe('integrations', () => {
        describe('pkp viem account', () => {
          it('sign message', () =>
            createViemSignMessageTest(ctx, () => ctx.alicePkpAuthContext)());
          it('sign transaction', () =>
            createViemSignTransactionTest(
              ctx,
              () => ctx.alicePkpAuthContext
            )());
          it('sign typed data', () =>
            createViemSignTypedDataTest(ctx, () => ctx.alicePkpAuthContext)());
        });
      });
    });

    describe('Custom Auth', () => {
      console.log('🔐 Testing using Custom authentication method');

      describe('endpoints', () => {
        it('pkpSign', () =>
          createPkpSignTest(
            ctx,
            () => eveCustomAuthContext,
            ctx.eveViemAccountPkp.pubkey
          )());
        it('executeJs', () =>
          createExecuteJsTest(
            ctx,
            () => eveCustomAuthContext,
            ctx.eveViemAccountPkp.pubkey
          )());
        it('viewPKPsByAddress', () => createViewPKPsByAddressTest(ctx)());
        it('viewPKPsByAuthData', () =>
          createViewPKPsByAuthDataTest(ctx, ctx.eveCustomAuthData)());
        it('pkpEncryptDecrypt', () =>
          createPkpEncryptDecryptTest(
            ctx,
            () => eveCustomAuthContext,
            ctx.eveViemAccountPkp.ethAddress
          )());
        it('encryptDecryptFlow', () =>
          createEncryptDecryptFlowTest(
            ctx,
            () => eveCustomAuthContext,
            ctx.eveViemAccountPkp.pubkey
          )());

        // Disable for now because it requires a different flow
        // it('pkpPermissionsManagerFlow', () =>
        //   createPkpPermissionsManagerFlowTest(
        //     ctx,
        //     () => eveCustomAuthContext, ctx.eveViemAccountPkp.pubkey
        //   )());
      });

      // describe('integrations', () => {
      //   describe('pkp viem account', () => {
      //     it('sign message', () =>
      //       createViemSignMessageTest(ctx, () => eveCustomAuthContext, ctx.eveViemAccountPkp.pubkey)());
      //     it('sign transaction', () =>
      //       createViemSignTransactionTest(ctx, () => eveCustomAuthContext, ctx.eveViemAccountPkp.pubkey)());
      //     it('sign typed data', () =>
      //       createViemSignTypedDataTest(ctx, () => eveCustomAuthContext, ctx.eveViemAccountPkp.pubkey)());
      //   });
      // });
    });

    describe('EOA Native', () => {
      console.log('🔐 Testing EOA native authentication and PKP minting');

      it('eoaNativeAuthFlow', () => createEoaNativeAuthFlowTest(ctx)());
    });
  });
});

describe('rpc override', () => {
  const TEST_RPC = process.env.LIT_YELLOWSTONE_PRIVATE_RPC_URL;
  // const TEST_RPC = 'https://yellowstone-override.example';

  // beforeAll(() => {
  //   process.env.LIT_YELLOWSTONE_PRIVATE_RPC_URL = TEST_RPC;
  // });

  // afterAll(() => {
  //   process.env.LIT_YELLOWSTONE_PRIVATE_RPC_URL = ORIGINAL_RPC;
  // });

  it('applies env rpc override to module and client', async () => {
    const networks = await import('@lit-protocol/networks');

    // choose module by NETWORK env (same way init.ts does)
    const network = process.env.NETWORK || 'naga-dev';
    const importNameMap: Record<string, string> = {
      'naga-dev': 'nagaDev',
      'naga-test': 'nagaTest',
      'naga-local': 'nagaLocal',
      'naga-staging': 'nagaStaging',
    };
    const importName = importNameMap[network];
    const baseModule: any = (networks as any)[importName];

    // apply override
    const mod =
      typeof baseModule.withOverrides === 'function'
        ? baseModule.withOverrides({ rpcUrl: TEST_RPC })
        : baseModule;

    // log for verification
    // base vs effective (when override is supported)
    const baseRpcUrl =
      typeof baseModule.getRpcUrl === 'function'
        ? baseModule.getRpcUrl()
        : 'n/a';
    const effRpcUrl =
      typeof mod.getRpcUrl === 'function' ? mod.getRpcUrl() : 'n/a';
    // eslint-disable-next-line no-console
    console.log('[rpc-override] TEST_RPC:', TEST_RPC);
    // eslint-disable-next-line no-console
    console.log(
      '[rpc-override] module rpc (base → effective):',
      baseRpcUrl,
      '→',
      effRpcUrl
    );
    try {
      const baseChain =
        typeof baseModule.getChainConfig === 'function'
          ? baseModule.getChainConfig()
          : null;
      const effChain =
        typeof mod.getChainConfig === 'function' ? mod.getChainConfig() : null;
      if (baseChain && effChain) {
        // eslint-disable-next-line no-console
        console.log(
          '[rpc-override] module chain id/name (base → effective):',
          `${baseChain.id}/${baseChain.name}`,
          '→',
          `${effChain.id}/${effChain.name}`
        );
        // eslint-disable-next-line no-console
        console.log(
          '[rpc-override] module rpcUrls.default.http (base → effective):',
          baseChain.rpcUrls.default.http,
          '→',
          effChain.rpcUrls.default.http
        );
        // eslint-disable-next-line no-console
        console.log(
          '[rpc-override] module rpcUrls.public.http (base → effective):',
          (baseChain.rpcUrls as any)['public']?.http,
          '→',
          (effChain.rpcUrls as any)['public']?.http
        );
      }
    } catch {}

    // module reflects override
    expect(mod.getRpcUrl()).toBe(TEST_RPC);
    const chain = mod.getChainConfig();
    expect(chain.rpcUrls.default.http[0]).toBe(TEST_RPC);
    expect((chain.rpcUrls as any)['public'].http[0]).toBe(TEST_RPC);

    // client reflects override
    const { createLitClient } = await import('@lit-protocol/lit-client');
    const client = await createLitClient({ network: mod });
    const cc = client.getChainConfig();

    // eslint-disable-next-line no-console
    console.log('[rpc-override] client rpcUrl:', cc.rpcUrl);
    // eslint-disable-next-line no-console
    console.log(
      '[rpc-override] client viem rpcUrls.default:',
      cc.viemConfig.rpcUrls.default.http
    );
    // eslint-disable-next-line no-console
    console.log(
      '[rpc-override] client viem rpcUrls.public:',
      (cc.viemConfig.rpcUrls as any)['public']?.http
    );

    expect(cc.rpcUrl).toBe(TEST_RPC);
    expect(cc.viemConfig.rpcUrls.default.http[0]).toBe(TEST_RPC);
    expect((cc.viemConfig.rpcUrls as any)['public'].http[0]).toBe(TEST_RPC);
  });
});
