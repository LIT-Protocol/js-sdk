// @ts-nocheck

import { wasmBlsSdkHelpers, initWasmBlsSdk } from '@lit-protocol/bls-sdk';

import {
  LIT_ERROR,
  SessionKeyPair,
  SigShare,
  SYMM_KEY_ALGO_PARAMS,
} from '@lit-protocol/constants';

import * as wasmECDSA from '@lit-protocol/ecdsa-sdk';

import { isBrowser, log, throwError } from '@lit-protocol/misc';

import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

// import nacl from 'tweetnacl';
import { nacl } from '@lit-protocol/nacl';
import { SIGTYPE } from '@lit-protocol/constants';

// if 'wasmExports' is not available, we need to initialize the BLS SDK
if (!globalThis.wasmExports) {
  initWasmBlsSdk().then((exports) => {
    globalThis.wasmExports = exports;

    if (!globalThis.jestTesting) {
      log(
        `✅ [BLS SDK] wasmExports loaded. ${
          Object.keys(exports).length
        } functions available. Run 'wasmExports' in the console to see them.`
      );
    }
  });
}

if (!globalThis.wasmECDSA) {
  let init = wasmECDSA.initWasmEcdsaSdk;
  let env;

  if (isBrowser()) { 
    env = 'Browser';
  } else {
    env = 'NodeJS';
  }

  init().then((sdk: any) => {
    globalThis.wasmECDSA = sdk;

    if (!globalThis.jestTesting) {
      log(
        `✅ [ECDSA SDK ${env}] wasmECDSA loaded. ${
          Object.keys(wasmECDSA).length
        } functions available. Run 'wasmECDSA' in the console to see them.`
      );
    }
  });
}
/** ---------- Exports ---------- */

/**
 *
 * Generate a new random symmetric key using WebCrypto subtle API.  You should only use this if you're handling your own key generation and management with Lit.  Typically, Lit handles this internally for you.
 *
 * @returns { Promise<CryptoKey> } A promise that resolves to the generated key
 */
export const generateSymmetricKey = async (): Promise<CryptoKey> => {
  const symmKey = await crypto.subtle.generateKey(SYMM_KEY_ALGO_PARAMS, true, [
    'encrypt',
    'decrypt',
  ]);

  return symmKey;
};

/**
 *
 * Encrypt a blob with a symmetric key
 *
 * @param { CryptoKey } symmKey The symmetric key
 * @param { BufferSource | Uint8Array } data The blob to encrypt
 *
 * @returns { Promise<Blob> } The encrypted blob
 */
export const encryptWithSymmetricKey = async (
  symmKey: CryptoKey,
  data: BufferSource | Uint8Array
): Promise<Blob> => {
  // encrypt the zip with symmetric key
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedZipData = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    symmKey,
    data
  );

  const encryptedZipBlob = new Blob([iv, new Uint8Array(encryptedZipData)], {
    type: 'application/octet-stream',
  });

  return encryptedZipBlob;
};

/**
 *
 * Import a symmetric key from a Uint8Array to a webcrypto key.  You should only use this if you're handling your own key generation and management with Lit.  Typically, Lit handles this internally for you.
 *
 * @param { Uint8Array } symmKey The symmetric key to import
 *
 * @returns { Promise<CryptoKey> } A promise that resolves to the imported key
 */
export const importSymmetricKey = async (
  symmKey: SymmetricKey
): Promise<CryptoKey> => {
  const importedSymmKey = await crypto.subtle.importKey(
    'raw',
    symmKey,
    SYMM_KEY_ALGO_PARAMS,
    true,
    ['encrypt', 'decrypt']
  );

  return importedSymmKey;
};

/**
 *
 * Decrypt an encrypted blob with a symmetric key.  Uses AES-CBC via SubtleCrypto
 *
 * @param { Blob } encryptedBlob The encrypted blob that should be decrypted
 * @param { CryptoKey } symmKey The symmetric key
 *
 * @returns { Uint8Array } The decrypted blob
 */
export const decryptWithSymmetricKey = async (
  encryptedBlob: Blob,
  symmKey: CryptoKey
): Promise<Uint8Array> => {
  const recoveredIv = await encryptedBlob.slice(0, 16).arrayBuffer();
  const encryptedZipArrayBuffer = await encryptedBlob.slice(16).arrayBuffer();
  const decryptedZip = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: recoveredIv,
    },
    symmKey,
    encryptedZipArrayBuffer
  );

  return decryptedZip as Uint8Array;
};

/**
 *
 * Combine BLS Shares
 *
 * @param { Array<SigShare> } sigSharesWithEverything
 * @param { string } networkPubKeySet
 *
 * @returns { any }
 *
 */
export const combineBlsShares = (
  sigSharesWithEverything: Array<SigShare>,
  networkPubKeySet: string
): any => {
  const pkSetAsBytes = uint8arrayFromString(networkPubKeySet, 'base16');

  log('pkSetAsBytes', pkSetAsBytes);

  const sigShares = sigSharesWithEverything.map((s: any) => ({
    shareHex: s.shareHex,
    shareIndex: s.shareIndex,
  }));

  const combinedSignatures = wasmBlsSdkHelpers.combine_signatures(
    pkSetAsBytes,
    sigShares
  );

  const signature = uint8arrayToString(combinedSignatures, 'base16');

  log('signature is ', signature);

  return { signature };
};

/**
 *
 * Combine ECDSA Shares
 *
 * @param { SigShares | Array<SigShare> } sigShares
 *
 * @returns { any }
 *
 */
export const combineEcdsaShares = (sigShares: Array<SigShare>): any => {
  log('sigShares:', sigShares);
  let type = sigShares[0].sigType;
  // the public key can come from any node - it obviously will be identical from each node
  // const publicKey = sigShares[0].publicKey;
  // const dataSigned = '0x' + sigShares[0].dataSigned;
  // filter out empty shares
  let validShares = sigShares.reduce((acc, val) => {
    if (val.shareHex !== '') {
      const newVal = _remapKeyShareForEcdsa(val);
      acc.push(JSON.stringify(newVal));
    }
    return acc;
  }, []);

  log('Valid Shares:', validShares);

  // if there are no valid shares, throw an error
  if (validShares.length === 0) {
    return throwError({
      message: 'No valid shares to combine',
      errorKind: LIT_ERROR.NO_VALID_SHARES.kind,
      errorCode: LIT_ERROR.NO_VALID_SHARES.name,
    });
  }

  let sig: string = '';

  try {
    let res: string = '';
    switch(type) {
      case SIGTYPE.EcdsaCAITSITHK256:
        res = wasmECDSA.combine_signature(validShares, 3);
        sig = JSON.parse(res);
      break;
      case SIGTYPE.ECDSCAITSITHP256:
        res = wasmECDSA.combine_signature(validShares, 4);
        sig = JSON.parse(res);
      break;
      // if its another sig type, it shouldnt be resolving to this method
      default:
        throw new Error("Unsupported signature type present in signature shares. Please report this issue");        
    }
  } catch (e) {
    log('Failed to combine signatures:', e);
  }

  log('signature', sig);

  return sig;
};

/**
 * //TODO: Fix 'any' types
 * Combine BLS Decryption Shares
 *
 * @param { Array<any> } decryptionShares
 * @param { string } networkPubKeySet
 * @param { string } toDecrypt
 * @param { any } provider
 *
 * @returns { any }
 *
 */
export const combineBlsDecryptionShares = (
  decryptionShares: Array<any>,
  networkPubKeySet: string,
  toDecrypt: string
): any => {
  // -- sort the decryption shares by share index.  this is important when combining the shares.
  decryptionShares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

  // set decryption shares bytes in wasm
  decryptionShares.forEach((s: any, idx: any) => {
    wasmExports.set_share_indexes(idx, s.shareIndex);
    const shareAsBytes = uint8arrayFromString(s.decryptionShare, 'base16');
    for (let i = 0; i < shareAsBytes.length; i++) {
      wasmExports.set_decryption_shares_byte(i, idx, shareAsBytes[i]);
    }
  });

  // -- set the public key set bytes in wasm
  const pkSetAsBytes = uint8arrayFromString(networkPubKeySet, 'base16');
  wasmBlsSdkHelpers.set_mc_bytes(pkSetAsBytes);

  // -- set the ciphertext bytes
  const ciphertextAsBytes = uint8arrayFromString(toDecrypt, 'base16');
  for (let i = 0; i < ciphertextAsBytes.length; i++) {
    wasmExports.set_ct_byte(i, ciphertextAsBytes[i]);
  }

  // ========== Result ==========
  const decrypted = wasmBlsSdkHelpers.combine_decryption_shares(
    decryptionShares.length,
    pkSetAsBytes.length,
    ciphertextAsBytes.length
  );

  return decrypted;
};

/**
 *
 * Generate a session key pair
 *
 * @returns { SessionKeyPair } sessionKeyPair
 */
export const generateSessionKeyPair = (): SessionKeyPair => {
  const keyPair = nacl.sign.keyPair();

  const sessionKeyPair: SessionKeyPair = {
    publicKey: uint8arrayToString(keyPair.publicKey, 'base16'),
    secretKey: uint8arrayToString(keyPair.secretKey, 'base16'),
  };

  return sessionKeyPair;
};


const _remapKeyShareForEcdsa = (share: SigShare): any[] => {
    const keys = Object.keys(share);
    const newShare = {};
    for (const key of keys) {
      const new_key = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      newShare = Object.defineProperty(newShare, new_key, Object.getOwnPropertyDescriptor(share, key));
    }

    return newShare;
}