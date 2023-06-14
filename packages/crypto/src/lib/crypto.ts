// @ts-nocheck

import * as blsSdk from '@lit-protocol/bls-sdk';

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

import { nacl } from '@lit-protocol/nacl';

// if 'wasmExports' is not available, we need to initialize the BLS SDK
if (!globalThis.wasmExports) {
  blsSdk.initWasmBlsSdk().then((exports) => {
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
  let init;
  let env;

  if (isBrowser()) {
    init = wasmECDSA.initWasmEcdsaSdkBrowser;
    env = 'Browser';
  } else {
    init = wasmECDSA.initWasmEcdsaSdkNodejs;
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
 * Encrypt data with a BLS public key.
 *
 * @param publicKey hex-encoded string of the BLS public key to encrypt with
 * @param data Uint8Array of the data to encrypt
 * @param identity Uint8Array of the identity parameter used during encryption
 * @returns base64 encoded string of the ciphertext
 */
export const encrypt = (
  publicKey: string,
  data: Uint8Array,
  identity: Uint8Array
): string => {
  return blsSdk.encrypt(
    publicKey,
    uint8arrayToString(data, 'base16'),
    uint8arrayToString(identity, 'base16')
  );
};

/**
 * Decrypt ciphertext using BLS signature shares.
 *
 * @param ciphertext base64-encoded string of the ciphertext to decrypt
 * @param shares hex-encoded array of the BLS signature shares
 * @returns Uint8Array of the decrypted data
 */
export const decryptWithSignatureShares = (
  ciphertext: string,
  shares: string[]
): Uint8Array => {
  // Format the signature shares
  const sigShares = shares.map((s) =>
    shares.map((s) => {
      JSON.stringify({
        ProofOfPossession: s,
      });
    })
  );

  // Decrypt
  const privateData = blsSdk.decrypt_with_signature_shares(
    ciphertext,
    sigShares
  );

  // Format
  return uint8arrayFromString(privateData, 'base64');
};

/**
 * Verify and decrypt ciphertext using BLS signature shares.
 *
 * @param publicKey hex-encoded string of the BLS public key to verify with
 * @param identity Uint8Array of the identity parameter used during encryption
 * @param ciphertext base64-encoded string of the ciphertext to decrypt
 * @param shares hex-encoded array of the BLS signature shares
 * @returns base64-encoded string of the decrypted data
 */
export const verifyAndDecryptWithSignatureShares = (
  publicKey: string,
  identity: Uint8Array,
  ciphertext: string,
  shares: string[]
): Uint8Array => {
  // Format the signature shares
  const sigShares = shares.map((s) =>
    shares.map((s) => {
      JSON.stringify({
        ProofOfPossession: s,
      });
    })
  );

  // Decrypt
  const privateData = blsSdk.verify_and_decrypt_with_signature_shares(
    publicKey,
    identity,
    ciphertext,
    sigShares
  );

  // Format
  return uint8arrayFromString(privateData, 'base64');
};

/**
 * Combine BLS signature shares.
 *
 * @param shares hex-encoded array of the BLS signature shares
 * @returns hex-encoded string of the combined signature
 */
export const combineSignatureShares = (shares: string[]): string => {
  // Format the signature shares
  const sigShares = shares.map((s) =>
    shares.map((s) => {
      JSON.stringify({
        ProofOfPossession: s,
      });
    })
  );

  return blsSdk.combine_signature_shares(sigShares);
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

  // the public key can come from any node - it obviously will be identical from each node
  // const publicKey = sigShares[0].publicKey;
  // const dataSigned = '0x' + sigShares[0].dataSigned;
  // filter out empty shares
  const validShares = sigShares.reduce((acc, val) => {
    if (val.shareHex !== '') {
      acc.push(val);
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

  // R_x & R_y values can come from any node (they will be different per node), and will generate a valid signature
  const R_x = validShares[0].localX;
  const R_y = validShares[0].localY;

  log('R_x:', R_x);
  log('R_y:', R_y);

  const shareHexes = validShares.map((s: any) => s.shareHex);
  log('shareHexes:', shareHexes);

  const shares = JSON.stringify(shareHexes);
  log('shares is', shares);

  let sig: string = '';

  try {
    sig = JSON.parse(wasmECDSA.combine_signature(R_x, R_y, shares));
  } catch (e) {
    log('Failed to combine signatures:', e);
  }

  log('signature', sig);

  return sig;
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
