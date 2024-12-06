import { api } from '@lit-protocol/wrapped-keys';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';
const { importPrivateKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testFailImportWrappedKeysWithEoaSessionSig
 * ✅ NETWORK=datil-test yarn test:local --filter=testFailImportWrappedKeysWithEoaSessionSig
 * ✅ NETWORK=custom yarn test:local --filter=testFailImportWrappedKeysWithEoaSessionSig
 */
export const testFailImportWrappedKeysWithEoaSessionSig = async (devEnv) => {
    const alice = await devEnv.createRandomPerson();
    try {
        const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
        // console.log(eoaSessionSigs);
        const privateKey = randomSolanaPrivateKey();
        try {
            await importPrivateKey({
                pkpSessionSigs: eoaSessionSigs,
                privateKey,
                litNodeClient: devEnv.litNodeClient,
                publicKey: '0xdeadbeef',
                keyType: 'K256',
                memo: 'Test key',
            });
        }
        catch (e) {
            if (e.message.includes('SessionSig is not from a PKP')) {
                console.log('✅ THIS IS EXPECTED: ', e);
                console.log(e.message);
                console.log('✅ testFailImportWrappedKeysWithEoaSessionSig is expected to have an error');
            }
            else {
                throw e;
            }
        }
        console.log('✅ testFailImportWrappedKeysWithEoaSessionSig');
    }
    finally {
        devEnv.releasePrivateKeyFromUser(alice);
    }
};
//# sourceMappingURL=testFailImportWrappedKeysWithEoaSessionSig.js.map