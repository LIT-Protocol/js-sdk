// @ts-nocheck

import * as blsSdk from '@lit-protocol/bls-sdk';

import { LIT_ERROR, SessionKeyPair, SigShare } from '@lit-protocol/constants';

import * as wasmECDSA from '@lit-protocol/ecdsa-sdk';

import { isBrowser, log, throwError } from '@lit-protocol/misc';

import {
  uint8arrayFromString,
  uint8ArrayToBase64,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import { nacl } from '@lit-protocol/nacl';
import { SIGTYPE } from '@lit-protocol/constants';
import { CombinedECDSASignature } from '@lit-protocol/types';

// if 'wasmExports' is not available, we need to initialize the BLS SDK
if (!globalThis.wasmExports) {
  blsSdk.initWasmBlsSdk().then((exports) => {
    globalThis.wasmExports = exports;

    if (!globalThis.jestTesting) {
      log(
        `✅ [BLS SDK] wasmExports loaded. ${Object.keys(exports).length
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
        `✅ [ECDSA SDK ${env}] wasmECDSA loaded. ${Object.keys(wasmECDSA).length
        } functions available. Run 'wasmECDSA' in the console to see them.`
      );
    }
  });
}


/** ---------- Exports ---------- */

export interface BlsSignatureShare {
  ProofOfPossession: string;
}

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
    uint8arrayToString(data, 'base64'),
    uint8arrayToString(identity, 'base64')
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
  shares: BlsSignatureShare[]
): Uint8Array => {
  // Format the signature shares
  const sigShares = shares.map((s) => JSON.stringify(s));

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
  shares: BlsSignatureShare[]
): Uint8Array => {
  // Format the signature shares
  const sigShares = shares.map((s) => JSON.stringify(s));

  const base64Identity = uint8ArrayToBase64(identity);

  // Decrypt
  const privateData = blsSdk.verify_and_decrypt_with_signature_shares(
    publicKey,
    base64Identity,
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
export const combineSignatureShares = (shares: BlsSignatureShare[]): string => {
  // Format the signature shares
  const sigShares = shares.map((s) => JSON.stringify(s));

  return blsSdk.combine_signature_shares(sigShares);
};

/**
 * Verify the BLS network signature.
 *
 * @param publicKey hex-encoded string of the BLS public key to verify with.
 * @param message Uint8Array of the message to verify.
 * @param signature Uint8Array of the signature to verify.
 */
export const verifySignature = (
  publicKey: string,
  message: Uint8Array,
  signature: Uint8Array
): void => {
  blsSdk.verify_signature(
    publicKey,
    uint8arrayToString(message, 'base64'),
    uint8arrayToString(signature, 'base64')
  );
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
export const combineEcdsaShares = (
  sigShares: Array<SigShare>
): CombinedECDSASignature => {
  const type = sigShares[0].sigType;
  // the public key can come from any node - it obviously will be identical from each node
  // const publicKey = sigShares[0].publicKey;
  // const dataSigned = '0x' + sigShares[0].dataSigned;
  // filter out empty shares
  const validShares = sigShares.reduce((acc, val) => {
    if (val.signatureShare !== '') {
      const newVal = _remapKeyShareForEcdsa(val);

      if(!newVal.sig_name){
        newVal.sig_name = 'sig-created-by-lit-sdk';
      }

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

  let sig: CombinedECDSASignature | undefined;

  try {
    let res: string = '';
    switch (type) {
      case SIGTYPE.EcdsaCaitSith:
        res = wasmECDSA.combine_signature(validShares, 2);

        try {
          sig = JSON.parse(res) as CombinedECDSASignature;
        } catch (e) {
          console.log("'res' from wasmECDSA.combine_signature: ", res); // ERROR: Could not deserialize value
          throw new Error(`Failed to parse signature: ${e}`);
        }

        /*
          r and s values of the signature should be maximum of 64 bytes
          r and s values can have polarity as the first two bits, here we remove 
        */
        if (sig.r && sig.r.length > 64) {
          while (sig.r.length > 64) {
            sig.r = sig.r.slice(1);
          }
        }
        if (sig.s && sig.s.length > 64) {
          while (sig.s.length > 64) {
            sig.s = sig.s.slice(1);
          }
        }
        break;
      case SIGTYPE.ECDSCAITSITHP256:
        res = wasmECDSA.combine_signature(validShares, 3);
        log('response from combine_signature', res);
        sig = JSON.parse(res);
        break;
      // if its another sig type, it shouldnt be resolving to this method
      default:
        throw new Error(
          'Unsupported signature type present in signature shares. Please report this issue'
        );
    }
  } catch (e) {
    log('Failed to combine signatures:', e);
  }

  log('signature', sig);

  return sig;
};

export const computeHDPubKey = (
  pubkeys: string[],
  keyId: string,
  sigType: SIGTYPE
): string => {
  // TODO: hardcoded for now, need to be replaced on each DKG as the last dkg id will be the active root key set.
  try {
    switch (sigType) {
      case SIGTYPE.EcdsaCaitSith:
        return wasmECDSA.compute_public_key(keyId, pubkeys, 2);
        defualt: throw new Error('Non supported signature type');
    }
  } catch (e) {
    log('Failed to derive public key', e);
  }
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
  let newShare = {};
  for (const key of keys) {
    const new_key = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    newShare = Object.defineProperty(
      newShare,
      new_key,
      Object.getOwnPropertyDescriptor(share, key)
    );
  }

  return newShare;
};
