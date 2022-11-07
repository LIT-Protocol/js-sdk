import {
    AUTH_SIGNATURE_BODY,
    EITHER_TYPE,
    ELeft,
    ERight,
    IEither,
    IProvider,
    JsonAuthSig,
    LIT_ERROR,
    LOCAL_STORAGE_KEYS,
} from '@litprotocol-dev/constants';
import { toString as uint8arrayToString } from 'uint8arrays';

import { throwError, log, getStorageItem } from '../utils';

const util = require('util');

/**
 *
 * Get the Solana provider from the browser web3 extension
 *
 * @returns { object || never }
 */
const getProvider = (): IEither => {
    let resultOrError: IEither;

    // -- validate
    if ('solana' in window) {
        resultOrError = ERight(window?.keplr);
    } else {
        // -- finally
        const message =
            'No web3 wallet was found that works with Solana.  Install a Solana wallet or choose another chain';

        resultOrError = ELeft({
            message,
            error: LIT_ERROR.NO_WALLET_EXCEPTION,
        });
    }

    return resultOrError;
};

/**
 *
 * Get Solana provider
 *
 * @returns { Promise<IProvider | undefined }
 */
export const connectSolProvider = async (): Promise<IProvider | undefined> => {
    const providerOrError: IEither = getProvider();

    if (providerOrError.type === 'ERROR') {
        throwError(providerOrError.result);
        return;
    }

    let provider: any = providerOrError.result;

    await provider.connect();
    const account = provider.publicKey.toBase58();

    return { provider, account };
};

/**
 *
 * Check and sign solana auth message
 *
 * @returns { JsonAuthSig }
 */
export const checkAndSignSolAuthMessage =
    async (): Promise<JsonAuthSig> => {
        const res = await connectSolProvider();

        if (! res ) {
            log('Failed to connect sol provider');
        }

        const provider = res?.provider;
        const account = res?.account;
        const key = LOCAL_STORAGE_KEYS.AUTH_SOL_SIGNATURE;
        let authSigOrError: IEither = getStorageItem(key);

        // let authSig = localStorage.getItem("lit-auth-sol-signature");
        let authSig: JsonAuthSig;

        // -- case: if unable to get auth from local storage
        if (authSigOrError.type === EITHER_TYPE.ERROR) {
            log('signing auth message because sig is not in local storage');

            await signAndSaveAuthMessage({ provider });

            authSigOrError.type = EITHER_TYPE.SUCCESS;
            authSigOrError.result = getStorageItem(key);
        }

        authSig = JSON.parse(authSigOrError.result);

        // -- if the wallet address isn't the same as the address from local storage
        if (account !== authSig.address) {
            log(
                'signing auth message because account is not the same as the address in the auth sig'
            );
            await signAndSaveAuthMessage({ provider });

            authSigOrError.type = EITHER_TYPE.SUCCESS;
            authSigOrError.result = getStorageItem(key);
            authSig = JSON.parse(authSigOrError.result);
        }

        log('authSig', authSig);

        return authSig;
    };

/**
 *
 * Sign and save auth signature locally (not saved to the nodes)
 *
 * @property { any } provider
 * @return { Promise<JsonAuthSig | undefined> }
 *
 */
export const signAndSaveAuthMessage = async ({
    provider,
}: {
    provider: any;
}): Promise<JsonAuthSig | undefined> => {
    const now = new Date().toISOString();
    const body = AUTH_SIGNATURE_BODY.replace('{{timestamp}}', now);

    const data = new util.TextEncoder().encode(body);
    const signed = await provider.signMessage(data, 'utf8');

    const hexSig = uint8arrayToString(signed.signature, 'base16');

    const authSig: JsonAuthSig = {
        sig: hexSig,
        derivedVia: 'solana.signMessage',
        signedMessage: body,
        address: provider.publicKey.toBase58(),
    };

    localStorage.setItem(
        LOCAL_STORAGE_KEYS.AUTH_SOL_SIGNATURE,
        JSON.stringify(authSig)
    );

    return authSig;
};
