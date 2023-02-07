import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import {
  AUTH_SIGNATURE_BODY,
  JsonAuthSig,
  LIT_COSMOS_CHAINS,
  LIT_ERROR,
  LOCAL_STORAGE_KEYS,
} from '@lit-protocol/constants';
import { log, sortedObject, throwError } from '@lit-protocol/misc';

/** ---------- Declaration ---------- */
declare global {
  interface Window {
    keplr?: any;
    solana?: any;
  }
}

/** ---------- Local Interfaces ---------- */
interface CosmosProvider {
  provider: any;
  account: string;
  chainId: string | number;
}

// ['sig', 'derivedVia', 'signedMessage', 'address']
interface AuthSig {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
}

interface CosmosSignDoc {
  chain_id: string;
  account_number: string;
  sequence: string;
  fee: {
    gas: string;
    amount: [];
  };
  msgs: Array<{
    type: string;
    value: {
      signer: any;
      data: any;
    };
  }>;
  memo: string;
}

/** ---------- Local Helpers ---------- */
/**
 *
 * Get the COSMOS provider from the browser web3 extension
 *
 * @returns { object || never }
 */
const getProvider = (): any => {
  // -- validate
  if ('keplr' in window) {
    return window?.keplr;
  }

  // -- finally
  const message =
    'No web3 wallet was found that works with Cosmos.  Install a Cosmos wallet or choose another chain';

  const error = LIT_ERROR.NO_WALLET_EXCEPTION;

  throwError({
    message,
    error,
  });
};

/** ---------- Exports ---------- */
/**
 *
 * Get cosmos provider details
 *
 * @property { string } chain
 */
export const connectCosmosProvider = async ({
  chain,
}: {
  chain: string;
}): Promise<CosmosProvider> => {
  const chainId = LIT_COSMOS_CHAINS[chain].chainId;

  const keplr = getProvider();

  // Enabling before using the Keplr is recommended.
  // This method will ask the user whether to allow access if they haven't visited this website.
  // Also, it will request that the user unlock the wallet if the wallet is locked.
  await keplr.enable(chainId);

  const offlineSigner = keplr.getOfflineSigner(chainId);

  // You can get the address/public keys by `getAccounts` method.
  // It can return the array of address/public key.
  // But, currently, Keplr extension manages only one address/public key pair.
  // TODO: (Check if this is still the case 7 Sep 2022)
  // This line is needed to set the sender address for SigningCosmosClient.
  const accounts = await offlineSigner.getAccounts();

  return { provider: keplr, account: accounts[0].address, chainId };
};

/**
 *
 * Check if the cosmos signature is in the local storage already,
 * If not, sign and save the authenticated message
 *
 * @property { string } chain
 * @returns { AuthSig }
 */
export const checkAndSignCosmosAuthMessage = async ({
  chain,
}: {
  chain: string;
}): Promise<JsonAuthSig> => {
  const connectedCosmosProvider = await connectCosmosProvider({ chain });

  const storageKey = LOCAL_STORAGE_KEYS.AUTH_COSMOS_SIGNATURE;

  let authSig: AuthSig | any = localStorage.getItem(storageKey);

  // -- if not found in local storage
  if (!authSig) {
    log('signing auth message because sig is not in local storage');

    await signAndSaveAuthMessage(connectedCosmosProvider);

    authSig = localStorage.getItem(storageKey);
  }

  // -- if found in local storage
  authSig = JSON.parse(authSig);

  // -- validate
  if (connectedCosmosProvider.account != authSig.address) {
    log(
      'signing auth message because account is not the same as the address in the auth sig'
    );
    await signAndSaveAuthMessage(connectedCosmosProvider);
    authSig = localStorage.getItem(storageKey);
    authSig = JSON.parse(authSig);
  }

  log('authSig', authSig);

  return authSig;
};

/**
 *
 * Save and sign the authenticated message
 * @param { CosmosProvider } connectedCosmosProvider
 *
 * @returns { void }
 */
export const signAndSaveAuthMessage = async (
  connectedCosmosProvider: CosmosProvider
) => {
  const { provider, account, chainId } = connectedCosmosProvider;

  const now = new Date().toISOString();

  const body = AUTH_SIGNATURE_BODY.replace('{{timestamp}}', now);

  const signed = await provider.signArbitrary(chainId, account, body);

  //Buffer.from(body).toString("base64");
  const data = uint8arrayToString(uint8arrayFromString(body, 'utf8'), 'base64');

  const signDoc: CosmosSignDoc = {
    chain_id: '',
    account_number: '0',
    sequence: '0',
    fee: {
      gas: '0',
      amount: [],
    },
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          signer: account,
          data,
        },
      },
    ],
    memo: '',
  };

  const encodedSignedMsg = serializeSignDoc(signDoc);

  const digest = await crypto.subtle.digest('SHA-256', encodedSignedMsg);

  const digest_hex = uint8arrayToString(new Uint8Array(digest), 'base16');

  let authSig: AuthSig = {
    sig: signed.signature,
    derivedVia: 'cosmos.signArbitrary',
    signedMessage: digest_hex,
    address: account,
  };

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.AUTH_COSMOS_SIGNATURE,
    JSON.stringify(authSig)
  );
};

/**
 *
 * Turn sorted signDoc object into uint8array
 *
 * @param { CosmosSignDoc } signDoc
 * @returns { Uint8Array } serialized string in uint8array
 */
export const serializeSignDoc = (signDoc: CosmosSignDoc): Uint8Array => {
  const sorted = JSON.stringify(sortedObject(signDoc));

  return uint8arrayFromString(sorted, 'utf8');
};
