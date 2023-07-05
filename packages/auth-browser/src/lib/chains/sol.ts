import {
  AUTH_SIGNATURE_BODY,
  EITHER_TYPE,
  ELeft,
  ERight,
  IEither,
  LIT_ERROR,
  LOCAL_STORAGE_KEYS,
} from '@lit-protocol/constants';

import { IProvider, AuthSig } from '@lit-protocol/types';
import { log, throwError } from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';
// import { toString as uint8arrayToString } from 'uint8arrays';

import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

/**
 *
 * Get the Solana provider from the browser web3 extension
 *
 * @returns { object || never }
 */
const getProvider = (): IEither => {
  let resultOrError: IEither;

  // -- validate
  // The Backpack wallet does not inject a solana object into the window, so we need to check for the backpack object as well.
  if ('solana' in window || 'backpack' in window) {
    // only check for the solana object on the window, as keplr does not have the same client interface injected into the window.
    // @ts-ignore
    resultOrError = ERight(window?.solana ?? window?.backpack);
  } else {
    // -- finally
    const message =
      'No web3 wallet was found that works with Solana.  Install a Solana wallet or choose another chain';

    resultOrError = ELeft({
      message,
      errorKind: LIT_ERROR.NO_WALLET_EXCEPTION.kind,
      errorCode: LIT_ERROR.NO_WALLET_EXCEPTION.name,
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

  // No need to reconnect if already connected, some wallets such as Backpack throws an error when doing so.
  if (!provider.isConnected) {
    await provider.connect();
  }

  const account = provider.publicKey.toBase58();

  return { provider, account };
};

/**
 *
 * Check and sign solana auth message
 *
 * @returns { AuthSig }
 */
export const checkAndSignSolAuthMessage = async (): Promise<AuthSig> => {
  const res = await connectSolProvider();

  if (!res) {
    log('Failed to connect sol provider');
  }

  const provider = res?.provider;
  const account = res?.account;
  const key = LOCAL_STORAGE_KEYS.AUTH_SOL_SIGNATURE;

  let authSigOrError: IEither = getStorageItem(key);

  // let authSig = localStorage.getItem("lit-auth-sol-signature");
  let authSig: AuthSig;

  // -- case: if unable to get auth from local storage
  if (authSigOrError.type === EITHER_TYPE.ERROR) {
    log('signing auth message because sig is not in local storage');

    await signAndSaveAuthMessage({ provider });

    authSigOrError.type = EITHER_TYPE.SUCCESS;
    authSigOrError.result = getStorageItem(key);
  }

  //   @ts-ignore
  window.test = authSigOrError;

  try {
    // when it's not in local storage, it's a string
    authSig = JSON.parse(authSigOrError.result.result);
  } catch (e) {
    // when it's in local storage, it's an object
    authSig = JSON.parse(authSigOrError.result);
  }

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
 * @return { Promise<AuthSig | undefined> }
 *
 */
export const signAndSaveAuthMessage = async ({
  provider,
}: {
  provider: any;
}): Promise<AuthSig | undefined> => {
  const now = new Date().toISOString();
  const body = AUTH_SIGNATURE_BODY.replace('{{timestamp}}', now);

  //   turn body into Uint8Array
  const data = uint8arrayFromString(body, 'utf8');

  //   const data = naclUtil.encode(body);
  let payload: { signature: Uint8Array };
  let derivedVia = 'solana.signMessage';

  // Backpack wallet expects and returns a different payload from signMessage()
  if (provider?.isBackpack) {
    const result = await provider.signMessage(data);
    payload = { signature: result };
    derivedVia = 'backpack.signMessage';
  } else {
    payload = await provider.signMessage(data, 'utf8');
  }

  const hexSig = uint8arrayToString(payload.signature, 'base16');

  const authSig: AuthSig = {
    sig: hexSig,
    derivedVia,
    signedMessage: body,
    address: provider.publicKey.toBase58(),
  };

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.AUTH_SOL_SIGNATURE,
    JSON.stringify(authSig)
  );

  return authSig;
};
