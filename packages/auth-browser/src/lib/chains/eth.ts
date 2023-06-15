import {
  ELeft,
  ERight,
  IEither,
  EITHER_TYPE,
  LIT_CHAINS,
  LIT_ERROR,
  LOCAL_STORAGE_KEYS,
} from '@lit-protocol/constants';

import { AuthSig, AuthCallbackParams } from '@lit-protocol/types';

import { ethers } from 'ethers';
// import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { toUtf8Bytes } from '@ethersproject/strings';
import { hexlify } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';

import WalletConnectProviderPkg from '@walletconnect/ethereum-provider';

// @ts-ignore
import LitConnectModal from 'lit-connect-modal';

import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';

import { SiweMessage } from 'lit-siwe';
import { getAddress } from 'ethers/lib/utils';

// @ts-ignore: If importing 'nacl' directly, the built files will use .default instead
import * as naclUtil from 'tweetnacl-util';

// @ts-ignore: If importing 'nacl' directly, the built files will use .default instead
import * as nacl from 'tweetnacl';

import { Buffer as BufferPolyfill } from 'buffer';

import {
  isBrowser,
  isNode,
  log,
  numberToHex,
  throwError,
} from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = BufferPolyfill;
}

if (isBrowser()) {
  // @ts-ignore
  globalThis.WalletConnectProviderPkg = WalletConnectProviderPkg;
  log('WalletConnectProviderPkg:', WalletConnectProviderPkg);
}

// log("naclUtil:", naclUtil);
// log("nacl:", nacl);

// -- fix import issues
// let _nacl = nacl === undefined ? nacl['default'] : nacl;
// let _naclUtil = naclUtil === undefined ? naclUtil['default'] : naclUtil;

// log("_nacl:", _nacl);
// log("_naclUtil:", _naclUtil);

/** ---------- Local Interfaces ---------- */
interface ConnectWeb3 {
  chainId: number;
}

interface ConnectWeb3Result {
  web3: Web3Provider | any;
  account: string | any;
}

interface RPCUrls {
  [chainId: number]: string | String;
}

interface Web3ProviderOptions {
  walletconnect: {
    package: any;
    options: {
      infuraId?: string;
      rpc: RPCUrls;
      chainId: number;
    };
  };
}

interface signAndSaveAuthParams {
  web3: Web3Provider;
  account: string;
  chainId: number;
  resources: any;
  expiration: string;
  uri?: string;
}

interface IABI {
  inputs: any[];
  name: string;
  outputs: Array<{
    internalType: string;
    name: string;
    type: string;
  }>;
  stateMutability: string;
  type: string;
}

interface IABIEncode {
  abi: Array<IABI>;
  functionName: string;
  functionParams: [];
}

interface IABIDecode {
  abi: Array<IABI>;
  functionName: string;
  data: any;
}

interface SignMessageParams {
  body: string;
  web3: Web3Provider;
  account: string;
}

interface SignedMessage {
  signature: string;
  address: string;
}

enum WALLET_ERROR {
  REQUESTED_CHAIN_HAS_NOT_BEEN_ADDED = 4902,
  NO_SUCH_METHOD = -32601,
}

/** ---------- Local Helpers ---------- */

/**
 *
 * Convert chain hex id to chain name
 *
 * @param { string } chainHexId
 * @returns { void | string }
 */
export const chainHexIdToChainName = (chainHexId: string): void | string => {
  // -- setup
  const keys = Object.keys(LIT_CHAINS);
  const entries = Object.entries(LIT_CHAINS);
  const hexIds = Object.values(LIT_CHAINS).map(
    (chain: any) => '0x' + chain.chainId.toString(16)
  );

  // -- validate:: must begin with 0x
  if (!chainHexId.startsWith('0x')) {
    throwError({
      message: `${chainHexId} should begin with "0x"`,
      errorKind: LIT_ERROR.WRONG_PARAM_FORMAT.kind,
      errorCode: LIT_ERROR.WRONG_PARAM_FORMAT.name,
    });
  }

  // -- validate:: hex id must be listed in constants
  if (!hexIds.includes(chainHexId)) {
    throwError({
      message: `${chainHexId} cannot be found in LIT_CHAINS`,
      errorKind: LIT_ERROR.UNSUPPORTED_CHAIN_EXCEPTION.kind,
      errorCode: LIT_ERROR.UNSUPPORTED_CHAIN_EXCEPTION.name,
    });
  }

  // -- search
  const chainName =
    entries.find(
      (data: any) => '0x' + data[1].chainId.toString(16) === chainHexId
    ) || null;

  // -- success case
  if (chainName) {
    return chainName[0];
  }

  // -- fail case
  throwError({
    message: `Failed to convert ${chainHexId}`,
    errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
    errorCode: LIT_ERROR.UNKNOWN_ERROR.name,
  });
};

/**
 * Get chain id of the current network
 * @param { string } chain
 * @param { Web3Provider } web3
 * @returns { Promise<IEither> }
 */
export const getChainId = async (
  chain: string,
  web3: Web3Provider
): Promise<IEither<number>> => {
  let resultOrError: IEither<number>;

  try {
    const resp = await web3.getNetwork();
    resultOrError = ERight(resp.chainId);
  } catch (e) {
    // couldn't get chainId.  throw the incorrect network error
    log('getNetwork threw an exception', e);

    resultOrError = ELeft({
      message: `Incorrect network selected.  Please switch to the ${chain} network in your wallet and try again.`,
      errorKind: LIT_ERROR.WRONG_NETWORK_EXCEPTION.kind,
      errorCode: LIT_ERROR.WRONG_NETWORK_EXCEPTION.name,
    });
  }

  return resultOrError;
};

/**
 * Check if the Expiration Time in the signedMessage string is expired.
 * @param { string } signedMessage - The signed message containing the Expiration Time.
 * @returns true if expired, false otherwise.
 */
export function isSignedMessageExpired(signedMessage: string) {
  // Extract the Expiration Time from the signed message.
  const dateStr = signedMessage
    .split('\n')[9]
    ?.replace('Expiration Time: ', '');
  const expirationTime = new Date(dateStr);
  const currentTime = new Date();

  // Compare the Expiration Time with the current time.
  return currentTime > expirationTime;
}

/**
 *
 * Check if the message must resign
 *
 * @param { AuthSig } authSig
 * @param { any } resources
 *
 * @returns { boolean }
 */
export const getMustResign = (authSig: AuthSig, resources: any): boolean => {
  let mustResign!: boolean;

  // if it's not expired, then we don't need to resign
  if (!isSignedMessageExpired(authSig.signedMessage)) {
    return false;
  }

  try {
    const parsedSiwe = new SiweMessage(authSig.signedMessage);
    log('parsedSiwe.resources', parsedSiwe.resources);

    if (JSON.stringify(parsedSiwe.resources) !== JSON.stringify(resources)) {
      log(
        'signing auth message because resources differ from the resources in the auth sig'
      );
      mustResign = true;
    }

    if (parsedSiwe.address !== getAddress(parsedSiwe.address)) {
      log(
        'signing auth message because parsedSig.address is not equal to the same address but checksummed.  This usually means the user had a non-checksummed address saved and so they need to re-sign.'
      );
      mustResign = true;
    }
  } catch (e) {
    log('error parsing siwe sig.  making the user sign again: ', e);
    mustResign = true;
  }

  return mustResign;
};

/**
 * 
 * Get RPC Urls in the correct format
 * need to make it look like this:
   ---
   rpc: {
        1: "https://mainnet.mycustomnode.com",
        3: "https://ropsten.mycustomnode.com",
        100: "https://dai.poa.network",
        // ...
    },
   ---
 * 
 * @returns
 */
export const getRPCUrls = (): RPCUrls => {
  let rpcUrls: RPCUrls = {};

  const keys: Array<string> = Object.keys(LIT_CHAINS);

  for (let i = 0; i < keys.length; i++) {
    const chainName = keys[i];
    const chainId = LIT_CHAINS[chainName].chainId;
    const rpcUrl = LIT_CHAINS[chainName].rpcUrls[0];
    rpcUrls[chainId] = rpcUrl;
  }

  return rpcUrls;
};

/** ---------- Exports ---------- */
/**
 * @deprecated
 * (ABI) Encode call data
 *
 * @param { IABIEncode }
 * @returns { string }
 */
export const encodeCallData = ({
  abi,
  functionName,
  functionParams,
}: IABIEncode): string => {
  throw new Error('encodeCallData has been removed.');
};

/**
 * @deprecated
 * (ABI) Decode call data
 * TODO: fix "any"
 *
 * @param { IABIDecode }
 * @returns { string }
 */
export const decodeCallResult = ({
  abi,
  functionName,
  data,
}: IABIDecode): { answer: string } | any => {
  const _interface = new ethers.utils.Interface(abi);

  const decoded = _interface.decodeFunctionResult(functionName, data);

  return decoded;
};

/**
 * @browserOnly
 * Connect to web 3
 *
 * @param { ConnectWeb3 }
 *
 * @return { Promise<ConnectWeb3Result> } web3, account
 */
export const connectWeb3 = async ({
  chainId = 1,
}: ConnectWeb3): Promise<ConnectWeb3Result> => {
  // -- check if it's nodejs
  if (isNode()) {
    log('connectWeb3 is not supported in nodejs.');
    return { web3: null, account: null };
  }

  const rpcUrls: RPCUrls = getRPCUrls();

  const providerOptions: Web3ProviderOptions = {
    walletconnect: {
      package: WalletConnectProviderPkg, // required
      options: {
        // infuraId: "cd614bfa5c2f4703b7ab0ec0547d9f81",
        rpc: rpcUrls,
        chainId: chainId,
      },
    },
  };

  log('getting provider via lit connect modal');

  const dialog = new LitConnectModal({
    providerOptions,
  });

  const provider = await dialog.getWalletProvider();

  log('got provider', provider);
  const web3 = new Web3Provider(provider);

  // trigger metamask popup
  try {
    log(
      '@deprecated soon to be removed. - trying to enable provider.  this will trigger the metamask popup.'
    );
    await provider.enable();
  } catch (e) {
    log(
      "error enabling provider but swallowed it because it's not important.  most wallets use a different function now to enable the wallet so you can ignore this error, because those other methods will be tried.",
      e
    );
  }

  log('listing accounts');
  const accounts = await web3.listAccounts();

  log('accounts', accounts);
  const account = accounts[0].toLowerCase();

  return { web3, account };
};

/**
 * @browserOnly
 * Delete any saved AuthSigs from local storage. Takes no params and returns
 * nothing. This will also clear out the WalletConnect cache in local storage.
 * We often run this function as a result of the user pressing a "Logout" button.
 *
 * @return { void }
 */
export const disconnectWeb3 = (): void => {
  if (isNode()) {
    log('disconnectWeb3 is not supported in nodejs.');
    return;
  }

  const storage = LOCAL_STORAGE_KEYS;

  localStorage.removeItem(storage.WALLET_CONNECT);
  localStorage.removeItem(storage.AUTH_SIGNATURE);
  localStorage.removeItem(storage.AUTH_SOL_SIGNATURE);
  localStorage.removeItem(storage.AUTH_COSMOS_SIGNATURE);
  localStorage.removeItem(storage.WEB3_PROVIDER);
};

/**
 * @browserOnly
 * Check and sign EVM auth message
 *
 * @param { CheckAndSignAuthParams }
 * @returns
 */
export const checkAndSignEVMAuthMessage = async ({
  chain,
  resources,
  switchChain,
  expiration,
  uri,
}: AuthCallbackParams): Promise<AuthSig> => {
  // -- check if it's nodejs
  if (isNode()) {
    log(
      'checkAndSignEVMAuthMessage is not supported in nodejs.  You can create a SIWE on your own using the SIWE package.'
    );
    return {
      sig: '',
      derivedVia: '',
      signedMessage: '',
      address: '',
    } as AuthSig;
  }

  // --- scoped methods ---
  const _throwIncorrectNetworkError = (error: any) => {
    if (error.code === WALLET_ERROR.NO_SUCH_METHOD) {
      throwError({
        message: `Incorrect network selected.  Please switch to the ${chain} network in your wallet and try again.`,
        errorKind: LIT_ERROR.WRONG_NETWORK_EXCEPTION.kind,
        errorCode: LIT_ERROR.WRONG_NETWORK_EXCEPTION.name,
      });
    } else {
      throw error;
    }
  };

  // -- 1. prepare
  const selectedChain = LIT_CHAINS[chain];
  const expirationString = expiration ?? getDefaultExpiration();

  const { web3, account } = await connectWeb3({
    chainId: selectedChain.chainId,
  });

  log(`got web3 and account: ${account}`);

  // -- 2. prepare all required variables
  const currentChainIdOrError = await getChainId(chain, web3);
  const selectedChainId: number = selectedChain.chainId;
  const selectedChainIdHex: string = numberToHex(selectedChainId);
  const authSigOrError = getStorageItem(LOCAL_STORAGE_KEYS.AUTH_SIGNATURE);

  log('currentChainIdOrError:', currentChainIdOrError);
  log('selectedChainId:', selectedChainId);
  log('selectedChainIdHex:', selectedChainIdHex);
  log('authSigOrError:', authSigOrError);

  // -- 3. check all variables before executing business logic
  if (currentChainIdOrError.type === EITHER_TYPE.ERROR) {
    return throwError(currentChainIdOrError.result as any);
  }

  log('chainId from web3', currentChainIdOrError);
  log(
    `checkAndSignAuthMessage with chainId ${currentChainIdOrError} and chain set to ${chain} and selectedChain is `,
    selectedChain
  );

  // -- 4. case: (current chain id is NOT equal to selected chain) AND is set to switch chain
  if (currentChainIdOrError.result !== selectedChainId && switchChain) {
    // -- validate the provider type
    // if (web3.provider instanceof walletProvider) {
    //   return throwError({
    //     message: `Incorrect network selected.  Please switch to the ${chain} network in your wallet and try again.`,
    //     error: LIT_ERROR.WRONG_NETWORK_EXCEPTION,
    //   });
    // }

    const provider = web3.provider as any;

    // -- (case) if able to switch chain id
    try {
      log('trying to switch to chainId', selectedChainIdHex);

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: selectedChainIdHex }],
      });

      // -- (case) if unable to switch chain
    } catch (switchError: any) {
      log('error switching to chainId', switchError);

      // -- (error case)
      if (
        switchError.code === WALLET_ERROR.REQUESTED_CHAIN_HAS_NOT_BEEN_ADDED
      ) {
        try {
          const data = [
            {
              chainId: selectedChainIdHex,
              chainName: selectedChain.name,
              nativeCurrency: {
                name: selectedChain.name,
                symbol: selectedChain.symbol,
                decimals: selectedChain.decimals,
              },
              rpcUrls: selectedChain.rpcUrls,
              blockExplorerUrls: selectedChain.blockExplorerUrls,
            },
          ];

          await provider.request({
            method: 'wallet_addEthereumChain',
            params: data,
          });
        } catch (addError: any) {
          _throwIncorrectNetworkError(addError);
        }
      } else {
        _throwIncorrectNetworkError(switchError);
      }
    }

    // we may have switched the chain to the selected chain.  set the chainId accordingly
    currentChainIdOrError.result = selectedChain.chainId;
  }

  // -- 5. case: Lit auth signature is NOT in the local storage
  log('checking if sig is in local storage');

  if (authSigOrError.type === EITHER_TYPE.ERROR) {
    log('signing auth message because sig is not in local storage');

    try {
      // @ts-ignore
      authSigOrError.result = await _signAndGetAuth({
        web3,
        account,
        chainId: selectedChain.chainId,
        resources,
        expiration: expirationString,
        uri,
      });
    } catch (e: any) {
      log(e);
      return throwError({
        message: e.message,
        errorKind: LIT_ERROR.UNKNOWN_ERROR.kind,
        errorCode: LIT_ERROR.UNKNOWN_ERROR.name,
      });
    }
    authSigOrError.type = EITHER_TYPE.SUCCESS;
    log('5. authSigOrError:', authSigOrError);
  }

  // -- 6. case: Lit auth signature IS in the local storage
  // @ts-ignore
  let authSig: AuthSig = authSigOrError.result;
  if (typeof authSig === 'string') {
    authSig = JSON.parse(authSig);
  }
  log('6. authSig:', authSig);

  // -- 7. case: when we are NOT on the right wallet address
  if (account.toLowerCase() !== authSig.address.toLowerCase()) {
    log(
      'signing auth message because account is not the same as the address in the auth sig'
    );
    authSig = await _signAndGetAuth({
      web3,
      account,
      chainId: selectedChain.chainId,
      resources,
      expiration: expirationString,
      uri,
    });
    log('7. authSig:', authSig);

    // -- 8. case: we are on the right wallet, but need to check the resources of the sig and re-sign if they don't match
  } else {
    let mustResign: boolean = getMustResign(authSig, resources);

    if (mustResign) {
      authSig = await _signAndGetAuth({
        web3,
        account,
        chainId: selectedChain.chainId,
        resources,
        expiration: expirationString,
        uri,
      });
    }
    log('8. mustResign:', mustResign);
  }

  return authSig;
};

const getDefaultExpiration = () => {
  return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
};

const _signAndGetAuth = async ({
  web3,
  account,
  chainId,
  resources,
  expiration,
  uri,
}: signAndSaveAuthParams): Promise<AuthSig> => {
  await signAndSaveAuthMessage({
    web3,
    account,
    chainId,
    resources,
    expiration,
    uri,
  });

  let authSigOrError = getStorageItem(LOCAL_STORAGE_KEYS.AUTH_SIGNATURE);

  if (authSigOrError.type === 'ERROR') {
    throwError({
      message: 'Failed to get authSig from local storage',
      errorKind: LIT_ERROR.LOCAL_STORAGE_ITEM_NOT_FOUND_EXCEPTION.kind,
      errorCode: LIT_ERROR.LOCAL_STORAGE_ITEM_NOT_FOUND_EXCEPTION.name,
    });
  }

  let authSig: AuthSig =
    typeof authSigOrError.result === 'string'
      ? JSON.parse(authSigOrError.result)
      : authSigOrError.result;

  return authSig;
};

/**
 * @browserOnly
 * Sign the auth message with the user's wallet, and store it in localStorage.
 * Called by checkAndSignAuthMessage if the user does not have a signature stored.
 *
 * @param { signAndSaveAuthParams }}
 * @returns { AuthSig }
 */
export const signAndSaveAuthMessage = async ({
  web3,
  account,
  chainId,
  resources,
  expiration,
  uri,
}: signAndSaveAuthParams): Promise<AuthSig> => {
  // check if it's nodejs
  if (isNode()) {
    log('checkAndSignEVMAuthMessage is not supported in nodejs.');
    return {
      sig: '',
      derivedVia: '',
      signedMessage: '',
      address: '',
    };
  }

  // -- 1. prepare 'sign-in with ethereum' message
  const preparedMessage: Partial<SiweMessage> = {
    domain: globalThis.location.host,
    address: getAddress(account), // convert to EIP-55 format or else SIWE complains
    version: '1',
    chainId,
    expirationTime: expiration,
  };

  if (resources && resources.length > 0) {
    preparedMessage.resources = resources;
  }

  if (uri) {
    preparedMessage.uri = uri;
  } else {
    preparedMessage.uri = globalThis.location.href;
  }

  const message: SiweMessage = new SiweMessage(preparedMessage);
  const body: string = message.prepareMessage();

  // -- 2. sign the message
  let signedResult: SignedMessage = await signMessage({
    body,
    web3,
    account,
  });

  // -- 3. prepare auth message
  let authSig: AuthSig = {
    sig: signedResult.signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: body,
    address: signedResult.address,
  };

  // -- 4. store auth and a keypair in localstorage for communication with sgx
  if (isBrowser()) {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.AUTH_SIGNATURE,
      JSON.stringify(authSig)
    );
  }
  const commsKeyPair = nacl.box.keyPair();

  if (isBrowser()) {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.KEY_PAIR,
      JSON.stringify({
        publicKey: naclUtil.encodeBase64(commsKeyPair.publicKey),
        secretKey: naclUtil.encodeBase64(commsKeyPair.secretKey),
      })
    );
  }

  log(`generated and saved ${LOCAL_STORAGE_KEYS.KEY_PAIR}`);
  return authSig;
};

/**
 * @browserOnly
 * Sign Messags
 *
 * @param { SignMessageParams }
 *
 * @returns { Promise<SignedMessage> }
 */
export const signMessage = async ({
  body,
  web3,
  account,
}: SignMessageParams): Promise<SignedMessage> => {
  // check if it's nodejs
  if (isNode()) {
    log('signMessage is not supported in nodejs.');
    return {
      signature: '',
      address: '',
    };
  }

  // -- validate
  if (!web3 || !account) {
    log(`web3: ${web3} OR ${account} not found. Connecting web3..`);
    let res = await connectWeb3({ chainId: 1 });
    web3 = res.web3;
    account = res.account;
  }

  log('pausing...');
  await new Promise((resolve: any) => setTimeout(resolve, 500));
  log('signing with ', account);

  const signature = await signMessageAsync(web3.getSigner(), account, body);

  const address = verifyMessage(body, signature).toLowerCase();

  log('Signature: ', signature);
  log('recovered address: ', address);

  if (address !== account) {
    const msg = `ruh roh, the user signed with a different address (${address}) then they\'re using with web3 (${account}).  this will lead to confusion.`;
    log(msg);
    alert(
      'something seems to be wrong with your wallets message signing.  maybe restart your browser or your wallet.  your recovered sig address does not match your web3 account address'
    );
    throw new Error(msg);
  }
  return { signature, address };
};

/**
 * @browserOnly
 * wrapper around signMessage that tries personal_sign first.  this is to fix a
 * bug with walletconnect where just using signMessage was failing
 *
 * @param { any | JsonRpcProvider} signer
 * @param { string } address
 * @param { string } message
 *
 * @returns { Promise<any | JsonRpcSigner> }
 */
export const signMessageAsync = async (
  signer: any | JsonRpcSigner,
  address: string,
  message: string
): Promise<any | JsonRpcSigner> => {
  // check if it's nodejs
  if (isNode()) {
    log('signMessageAsync is not supported in nodejs.');
    return null;
  }

  const messageBytes = toUtf8Bytes(message);

  if (signer instanceof JsonRpcSigner) {
    try {
      log('Signing with personal_sign');
      const signature = await signer.provider.send('personal_sign', [
        hexlify(messageBytes),
        address.toLowerCase(),
      ]);
      return signature;
    } catch (e: any) {
      log(
        'Signing with personal_sign failed, trying signMessage as a fallback'
      );
      if (e.message.includes('personal_sign')) {
        return await signer.signMessage(messageBytes);
      }
      throw e;
    }
  } else {
    log('signing with signMessage');
    return await signer.signMessage(messageBytes);
  }
};

/**
 *
 * Get the number of decimal places in a token
 *
 * @property { string } contractAddress The token contract address
 * @property { string } chain The chain on which the token is deployed
 *
 * @returns { number } The number of decimal places in the token
 */
// export const decimalPlaces = async ({
//     contractAddress,
//     chain,
// }: {
//     contractAddress: string;
//     chain: Chain;
// }): Promise<number> => {
//     const rpcUrl = LIT_CHAINS[chain].rpcUrls[0] as string;

//     const web3 = new JsonRpcProvider(rpcUrl);

//     const contract = new Contract(
//         contractAddress,
//         (ABI_ERC20 as any).abi,
//         web3
//     );

//     return await contract['decimals']();
// };
