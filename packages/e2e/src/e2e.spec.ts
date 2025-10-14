import {
  createCustomAuthContext,
  createPkpAuthContext,
  createPkpAuthContextWithPreGeneratedMaterials,
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
import { AuthContext } from './types';

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
      console.error('❌ Failed to initialise E2E test context');
      console.error(e);
      throw e;
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

    describe('PKP Auth with Pre-generated Materials', () => {
      console.log('🔐 Testing PKP auth with pre-generated session materials');

      let preGeneratedAuthContext: any;

      beforeAll(async () => {
        try {
          preGeneratedAuthContext =
            await createPkpAuthContextWithPreGeneratedMaterials(ctx);
        } catch (e) {
          console.error('Failed to create pre-generated auth context:', e);
          throw e;
        }
      });

      describe('endpoints', () => {
        it('pkpSign with pre-generated materials', () =>
          createPkpSignTest(ctx, () => preGeneratedAuthContext)());

        it('executeJs with pre-generated materials', () =>
          createExecuteJsTest(ctx, () => preGeneratedAuthContext)());

        it('pkpEncryptDecrypt with pre-generated materials', () =>
          createPkpEncryptDecryptTest(ctx, () => preGeneratedAuthContext)());
      });

      describe('error handling', () => {
        it('should reject when only sessionKeyPair is provided', async () => {
          const tempAuthContext = await ctx.authManager.createPkpAuthContext({
            authData: ctx.aliceViemAccountAuthData,
            pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
            authConfig: {
              resources: [['pkp-signing', '*']],
              expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
            litClient: ctx.litClient,
          });

          const sessionKeyPair = tempAuthContext.sessionKeyPair;

          await expect(
            ctx.authManager.createPkpAuthContext({
              authData: ctx.aliceViemAccountAuthData,
              pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
              authConfig: {
                resources: [['pkp-signing', '*']],
                expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
              },
              litClient: ctx.litClient,
              sessionKeyPair, // Only providing sessionKeyPair
              // delegationAuthSig is missing
            })
          ).rejects.toThrow(
            'Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided'
          );
        });

        it('should reject when only delegationAuthSig is provided', async () => {
          const tempAuthContext = await ctx.authManager.createPkpAuthContext({
            authData: ctx.aliceViemAccountAuthData,
            pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
            authConfig: {
              resources: [['pkp-signing', '*']],
              expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
            litClient: ctx.litClient,
          });

          const delegationAuthSig = await tempAuthContext.authNeededCallback();

          await expect(
            ctx.authManager.createPkpAuthContext({
              authData: ctx.aliceViemAccountAuthData,
              pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
              authConfig: {
                resources: [['pkp-signing', '*']],
                expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
              },
              litClient: ctx.litClient,
              // sessionKeyPair is missing
              delegationAuthSig, // Only providing delegationAuthSig
            })
          ).rejects.toThrow(
            'Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided'
          );
        });
      });
    });

    describe('EOA Native', () => {
      console.log('🔐 Testing EOA native authentication and PKP minting');
      it('eoaNativeAuthFlow', () => createEoaNativeAuthFlowTest(ctx)());
    });
  });
});
