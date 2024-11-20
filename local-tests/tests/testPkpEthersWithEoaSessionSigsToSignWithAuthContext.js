import { LitActionResource, LitPKPResource, createSiweMessageWithRecaps, generateAuthSig, } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignWithAuthContext
 * ✅ NETWORK=datil-test yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignWithAuthContext
 * ✅ NETWORK=custom yarn test:local --filter=testPkpEthersWithEoaSessionSigsToSignWithAuthContext
 */
export const testPkpEthersWithEoaSessionSigsToSignWithAuthContext = async (devEnv) => {
    const alice = await devEnv.createRandomPerson();
    const pkpEthersWallet = new PKPEthersWallet({
        pkpPubKey: alice.pkp.publicKey,
        litNodeClient: devEnv.litNodeClient,
        authContext: {
            client: devEnv.litNodeClient,
            getSessionSigsProps: {
                authNeededCallback: async function (params) {
                    const toSign = await createSiweMessageWithRecaps({
                        uri: params.uri,
                        expiration: params.expiration,
                        resources: params.resourceAbilityRequests,
                        walletAddress: alice.wallet.address,
                        nonce: await devEnv.litNodeClient.getLatestBlockhash(),
                        litNodeClient: devEnv.litNodeClient,
                    });
                    const authSig = await generateAuthSig({
                        signer: alice.wallet,
                        toSign,
                    });
                    return authSig;
                },
                resourceAbilityRequests: [
                    {
                        resource: new LitPKPResource('*'),
                        ability: LIT_ABILITY.PKPSigning,
                    },
                    {
                        resource: new LitActionResource('*'),
                        ability: LIT_ABILITY.LitActionExecution,
                    },
                ],
            },
        },
    });
    await pkpEthersWallet.init();
    try {
        const signature = await pkpEthersWallet.signMessage(alice.loveLetter);
        console.log('✅ signature:', signature);
    }
    catch (e) {
        throw new Error('❌ Error: ' + e.message);
    }
    finally {
        devEnv.releasePrivateKeyFromUser(alice);
    }
};
//# sourceMappingURL=testPkpEthersWithEoaSessionSigsToSignWithAuthContext.js.map