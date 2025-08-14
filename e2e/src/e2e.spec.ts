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

describe('all', () => {
  // Singleton baby
  let ctx: Awaited<ReturnType<typeof init>>;

  // Auth contexts for testing
  let alicePkpAuthContext: any;
  let aliceCustomAuthContext: any;

  beforeAll(async () => {
    try {
      ctx = await init();

      // Create PKP and custom auth contexts using helper functions
      // alicePkpAuthContext = await createPkpAuthContext(ctx);
      aliceCustomAuthContext = await createCustomAuthContext(ctx);
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
    });

    describe('integrations', () => {
      describe('pkp viem account', () => {
        it('sign message', () =>
          createViemSignMessageTest(ctx, () => ctx.aliceEoaAuthContext)());
        it('sign transaction', () =>
          createViemSignTransactionTest(ctx, () => ctx.aliceEoaAuthContext)());
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
          createViemSignTransactionTest(ctx, () => ctx.alicePkpAuthContext)());
        it('sign typed data', () =>
          createViemSignTypedDataTest(ctx, () => ctx.alicePkpAuthContext)());
      });
    });
  });

  describe('Custom Auth', () => {
    console.log('🔐 Testing using Custom authentication method');

    describe('endpoints', () => {
      it('pkpSign', () =>
        createPkpSignTest(ctx, () => aliceCustomAuthContext)());
      it('executeJs', () =>
        createExecuteJsTest(ctx, () => aliceCustomAuthContext)());
      it('viewPKPsByAddress', () =>
        createViewPKPsByAddressTest(ctx, () => aliceCustomAuthContext)());
      it('viewPKPsByAuthData', () =>
        createViewPKPsByAuthDataTest(ctx, () => aliceCustomAuthContext)());
      it('pkpEncryptDecrypt', () =>
        createPkpEncryptDecryptTest(ctx, () => aliceCustomAuthContext)());
      it('encryptDecryptFlow', () =>
        createEncryptDecryptFlowTest(ctx, () => aliceCustomAuthContext)());
      it('pkpPermissionsManagerFlow', () =>
        createPkpPermissionsManagerFlowTest(
          ctx,
          () => aliceCustomAuthContext
        )());
    });

    describe('integrations', () => {
      describe('pkp viem account', () => {
        it('sign message', () =>
          createViemSignMessageTest(ctx, () => aliceCustomAuthContext)());
        it('sign transaction', () =>
          createViemSignTransactionTest(ctx, () => aliceCustomAuthContext)());
        it('sign typed data', () =>
          createViemSignTypedDataTest(ctx, () => aliceCustomAuthContext)());
      });
    });
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
