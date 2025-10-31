import {
  createCustomAuthContext,
  createEncryptDecryptFlowTest,
  createEoaNativeAuthFlowTest,
  createExecuteJsTest,
  createPaymentDelegationFlowTest,
  createPaymentManagerFlowTest,
  createPkpEncryptDecryptTest,
  createPkpPermissionsManagerFlowTest,
  createPkpSignTest,
  createViemSignMessageTest,
  createViemSignTransactionTest,
  createViemSignTypedDataTest,
  createViewPKPsByAddressTest,
  createViewPKPsByAuthDataTest,
  init,
} from '@lit-protocol/e2e';
import type { AuthContext } from '@lit-protocol/e2e';
import { registerPaymentDelegationTicketSuite } from './tickets/delegation.suite';

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
  let eveCustomAuthContext: AuthContext;

  beforeAll(async () => {
    try {
      ctx = await init();

      // Create PKP and custom auth contexts using helper functions
      // alicePkpAuthContext = await createPkpAuthContext(ctx);
      eveCustomAuthContext = await createCustomAuthContext(ctx);
    } catch (e) {
      console.error('❌ Failed to initialise E2E test context', e);
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
      it('viewPKPsByAddress', () => createViewPKPsByAddressTest(ctx)());
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
        it('viewPKPsByAddress', () => createViewPKPsByAddressTest(ctx)());
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
          createViewPKPsByAuthDataTest(ctx, () => eveCustomAuthContext)());
        it('pkpEncryptDecrypt', () =>
          createPkpEncryptDecryptTest(ctx, () => ctx.aliceEoaAuthContext)());
        it('encryptDecryptFlow', () =>
          createEncryptDecryptFlowTest(ctx, () => ctx.aliceEoaAuthContext)());

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

    if (process.env['NETWORK'] !== 'naga-dev') {
      describe('paid networks only', () => {
        registerPaymentDelegationTicketSuite();
      });
    }
  });
});
