import { isBrowser, throwError } from '@lit-protocol/misc';

import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

import {
  EcdsaVariant,
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  blsVerify,
  ecdsaCombine,
  ecdsaDeriveKey,
  ecdsaVerify,
  init,
  sevSnpGetVcekUrl,
  sevSnpVerify,
} from '@lit-protocol/wasm';

import { LIT_ERROR, SIGTYPE } from '@lit-protocol/constants';
import { nacl } from '@lit-protocol/nacl';
import {
  CombinedECDSASignature,
  NodeAttestation,
  SessionKeyPair,
  SigShare,
} from '@lit-protocol/types';
import { splitSignature } from 'ethers/lib/utils';

try {
  init();
} catch (e) {
  throwError({
    message: 'Wasm module failed to load',
    errorKind: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
    errorCode: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.code,
  });
}

/** ---------- Exports ---------- */

export interface BlsSignatureShare {
  ProofOfPossession: string;
}

/**
 * Encrypt data with a BLS public key.
 *
 * @param publicKeyHex hex-encoded string of the BLS public key to encrypt with
 * @param message Uint8Array of the data to encrypt
 * @param identity Uint8Array of the identity parameter used during encryption
 * @returns base64 encoded string of the ciphertext
 */
export const encrypt = (
  publicKeyHex: string,
  message: Uint8Array,
  identity: Uint8Array
): string => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');

  // TODO(cairomassimo): determine G1/G2 based on the public key size
  switch (publicKeyHex.replace('0x', '').length) {
    case 94:
      return Buffer.from(
        blsEncrypt('Bls12381G2', publicKey, message, identity)
      ).toString('hex');
    case 192:
      return Buffer.from(
        blsEncrypt('Bls12381G1', publicKey, message, identity)
      ).toString('hex');
    default:
      return '';
  }
};

/**
 * Decrypt ciphertext using BLS signature shares.
 *
 * @param ciphertextBase64 base64-encoded string of the ciphertext to decrypt
 * @param shares hex-encoded array of the BLS signature shares
 * @returns Uint8Array of the decrypted data
 */
export const decryptWithSignatureShares = (
  ciphertextBase64: string,
  shares: BlsSignatureShare[]
): Uint8Array => {
  const signature = doCombineSignatureShares(shares);

  return doDecrypt(ciphertextBase64, signature);
};

/**
 * Verify and decrypt ciphertext using BLS signature shares.
 *
 * @param publicKeyHex hex-encoded string of the BLS public key to verify with
 * @param identity Uint8Array of the identity parameter used during encryption
 * @param ciphertextBase64 base64-encoded string of the ciphertext to decrypt
 * @param shares hex-encoded array of the BLS signature shares
 * @returns base64-encoded string of the decrypted data
 */
export const verifyAndDecryptWithSignatureShares = (
  publicKeyHex: string,
  identity: Uint8Array,
  ciphertextBase64: string,
  shares: BlsSignatureShare[]
): Uint8Array => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');
  const signature = doCombineSignatureShares(shares);
  blsVerify('Bls12381G2', publicKey, identity, signature);

  return doDecrypt(ciphertextBase64, signature);
};

/**
 * Combine BLS signature shares.
 *
 * @param shares hex-encoded array of the BLS signature shares
 * @returns hex-encoded string of the combined signature
 */
export const combineSignatureShares = (shares: BlsSignatureShare[]): string => {
  const signature = doCombineSignatureShares(shares);

  return Buffer.from(signature).toString('hex');
};

/**
 * Verify the BLS network signature.
 *
 * @param publicKeyHex hex-encoded string of the BLS public key to verify with.
 * @param message Uint8Array of the message to verify.
 * @param signature Uint8Array of the signature to verify.
 */
export const verifySignature = (
  publicKeyHex: string,
  message: Uint8Array,
  signature: Uint8Array
): void => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');

  blsVerify('Bls12381G2', publicKey, message, signature);
};

// export interface EcdsaSignatureShare {
//   sigType: SIGTYPE;
//   signatureShare: string;
//   shareIndex: number; // ignored
//   publicKey: string;
//   dataSigned: string;
//   bigR: string;
//   sigName: string; // ignored
// }

const ecdsaSigntureTypeMap: Partial<Record<SIGTYPE, EcdsaVariant>> = {
  [SIGTYPE.EcdsaCaitSith]: 'K256',
  [SIGTYPE.EcdsaK256]: 'K256',
  [SIGTYPE.EcdsaCAITSITHP256]: 'P256',
};

/**
 *
 * Combine ECDSA Shares
 *
 * @param { Array<SigShare> } sigShares
 *
 * @returns { any }
 *
 */
export const combineEcdsaShares = (
  sigShares: Array<SigShare>
): CombinedECDSASignature => {
  const validShares = sigShares.filter((share) => share.signatureShare);

  const anyValidShare = validShares[0];

  if (!anyValidShare) {
    return throwError({
      message: 'No valid shares to combine',
      errorKind: LIT_ERROR.NO_VALID_SHARES.kind,
      errorCode: LIT_ERROR.NO_VALID_SHARES.name,
    });
  }

  const variant = ecdsaSigntureTypeMap[anyValidShare.sigType as SIGTYPE];
  if (!variant) {
    throw new Error(
      'Unsupported signature type present in signature shares. Please report this issue'
    );
  }

  const presignature = Buffer.from(anyValidShare.bigR!, 'hex');

  const signatureShares = validShares.map((share) =>
    Buffer.from(share.signatureShare, 'hex')
  );

  const [r, s, v] = ecdsaCombine(variant, presignature, signatureShares);

  const publicKey = Buffer.from(anyValidShare.publicKey, 'hex');
  const messageHash = Buffer.from(anyValidShare.dataSigned, 'hex');

  ecdsaVerify(variant, messageHash, publicKey, [r, s, v]);

  const signature = splitSignature(Buffer.concat([r, s, Buffer.from([v])]));

  return {
    r: signature.r.slice('0x'.length),
    s: signature.s.slice('0x'.length),
    recid: signature.recoveryParam,
  };
};

export const computeHDPubKey = (
  publicKeysHex: string[],
  keyIdHex: string,
  sigType: SIGTYPE
): string => {
  const variant = ecdsaSigntureTypeMap[sigType];
  if (!variant) {
    throw new Error(
      'Unsupported signature type present in signature shares. Please report this issue'
    );
  }

  const derivedKey = ecdsaDeriveKey(
    variant,
    Buffer.from(keyIdHex, 'hex'),
    publicKeysHex.map((hex) => Buffer.from(hex, 'hex'))
  );

  return Buffer.from(derivedKey).toString('hex');
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

function doDecrypt(ciphertextBase64: string, signature: Uint8Array) {
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  return blsDecrypt('Bls12381G2', ciphertext, signature);
}

function doCombineSignatureShares(shares: BlsSignatureShare[]) {
  const sigShares = shares.map((s) => Buffer.from(s.ProofOfPossession, 'hex'));
  const signature = blsCombine('Bls12381G2', sigShares);
  return signature;
}

async function getAmdCert(url: string) {
  // unfortunately, until AMD enables CORS, we have to use a proxy when in the browser
  // This project is hosted on heroku and uses this codebase: https://github.com/LIT-Protocol/cors-proxy-amd
  if (isBrowser()) {
    // CORS proxy url
    url = `https://cors.litgateway.com/${url}`;
  }
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 *
 * Check the attestation against AMD certs
 *
 * @param { NodeAttestation } attestation The actual attestation object, which includes the signature and report
 * @param { string } challenge The challenge we sent
 * @param { string } url The URL we talked to
 *
 * @returns { Promise<undefined> } A promise that throws if the attestation is invalid
 */
export const checkSevSnpAttestation = async (
  attestation: NodeAttestation,
  challengeHex: string,
  url: string
) => {
  const noonce = Buffer.from(attestation.noonce, 'base64');
  const challenge = Buffer.from(challengeHex, 'hex');
  const data = Object.fromEntries(
    Object.entries(attestation.data).map(([k, v]) => [
      k,
      Buffer.from(v, 'base64'),
    ])
  );
  const signatures = attestation.signatures.map((s) =>
    Buffer.from(s, 'base64')
  );
  const report = Buffer.from(attestation.report, 'base64');

  if (!noonce.equals(challenge)) {
    throw new Error(
      `Attestation noonce ${noonce} does not match challenge ${challenge}`
    );
  }

  const parsedUrl = new URL(url);
  const ipWeTalkedTo = parsedUrl.hostname;
  let portWeTalkedTo = parsedUrl.port;
  if (portWeTalkedTo === '') {
    // if we're on HTTP or HTTPS, the port will be empty
    if (url.startsWith('https://')) {
      portWeTalkedTo = '443';
    } else if (url.startsWith('http://')) {
      portWeTalkedTo = '80';
    } else {
      throw new Error(`Unknown port in URL ${url}`);
    }
  }

  const ipAndAddrFromReport = data['EXTERNAL_ADDR'].toString('utf8');
  const ipFromReport = ipAndAddrFromReport.split(':')[0];
  const portFromReport = ipAndAddrFromReport.split(':')[1];

  if (ipWeTalkedTo !== ipFromReport) {
    throw new Error(
      `Attestation external address ${ipFromReport} does not match IP we talked to ${ipWeTalkedTo}`
    );
  }
  if (portWeTalkedTo !== portFromReport) {
    throw new Error(
      `Attestation external port ${portFromReport} does not match port we talked to ${portWeTalkedTo}`
    );
  }

  // get the VCEK certificate
  let vcekCert;
  const vcekUrl = sevSnpGetVcekUrl(report);
  // if browser, use local storage
  if (isBrowser()) {
    vcekCert = localStorage.getItem(vcekUrl);
    if (vcekCert) {
      vcekCert = uint8arrayFromString(vcekCert, 'base64');
    } else {
      vcekCert = await getAmdCert(vcekUrl);
      localStorage.setItem(vcekUrl, uint8arrayToString(vcekCert, 'base64'));
    }
  } else {
    const cache = ((
      globalThis as unknown as { amdCertStore: Record<string, Uint8Array> }
    ).amdCertStore ??= {});
    cache[vcekUrl] ??= await getAmdCert(vcekUrl);
    vcekCert = cache[vcekUrl];
  }

  if (!vcekCert || vcekCert.length === 0 || vcekCert.length < 256) {
    throw new Error('Unable to retrieve VCEK certificate from AMD');
  }

  // pass base64 encoded report to wasm wrapper
  return sevSnpVerify(report, data, signatures, challenge, vcekCert);
};
