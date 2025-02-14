import { bls12_381 } from '@noble/curves/bls12-381';
import { ed25519, RistrettoPoint } from '@noble/curves/ed25519';
import { ed448 } from '@noble/curves/ed448';
import { jubjub } from '@noble/curves/jubjub';
import { p256 } from '@noble/curves/p256';
import { p384 } from '@noble/curves/p384';
import { schnorr as schnorrK256, secp256k1 } from '@noble/curves/secp256k1';
import { blake2b } from '@noble/hashes/blake2b';
import { sha256 } from '@noble/hashes/sha256';
import { shake256 } from '@noble/hashes/sha3';
import { sha384, sha512 } from '@noble/hashes/sha512';

import {
  CurveTypeNotFoundError,
  InvalidParamType,
  NetworkError,
  NoValidShares,
  UnknownError,
} from '@lit-protocol/constants';
import {
  applyTransformations,
  cleanArrayValues,
  cleanStringValues,
  convertKeysToCamelCase,
  convertNumberArraysToUint8Arrays,
  hexifyStringValues,
  log,
} from '@lit-protocol/misc';
import { nacl } from '@lit-protocol/nacl';
import {
  CleanLitNodeSignature,
  CombinedLitNodeSignature,
  LitActionSignedData,
  NodeAttestation,
  PKPSignEndpointResponse,
  SessionKeyPair,
  SigType,
} from '@lit-protocol/types';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';
import {
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  BlsSignatureShareJsonString,
  blsVerify,
  ecdsaDeriveKey,
  sevSnpGetVcekUrl,
  sevSnpVerify,
  unifiedCombineAndVerify,
} from '@lit-protocol/wasm';

/** ---------- Exports ---------- */
const LIT_CORS_PROXY = `https://cors.litgateway.com`;

export interface BlsSignatureShare {
  ProofOfPossession: {
    identifier: string;
    value: string;
  };
}

/**
 * Encrypt data with a BLS public key.
 * We are using G1 for encryption and G2 for signatures
 *
 * @param publicKeyHex hex-encoded string of the BLS public key to encrypt with
 * @param message Uint8Array of the data to encrypt
 * @param identity Uint8Array of the identity parameter used during encryption
 * @returns base64 encoded string of the ciphertext
 */
export const encrypt = async (
  publicKeyHex: string,
  message: Uint8Array,
  identity: Uint8Array
): Promise<string> => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');

  /**
   * Our system uses BLS12-381 on the G1 curve for encryption.
   * However, on the SDK side (this function), we expect the public key
   * to use the G2 curve for signature purposes, hence the switch on public key length.
   *
   * The G2 curve, `Bls12381G2`, is typically associated with signature generation/verification,
   * while G1 is associated with encryption. Here, the length of the public key determines how
   * we handle the encryption and the format of the returned encrypted message.
   */
  if (publicKeyHex.replace('0x', '').length !== 96) {
    throw new InvalidParamType(
      {
        info: {
          publicKeyHex,
        },
      },
      `Invalid public key length. Expecting 96 characters, got ${
        publicKeyHex.replace('0x', '').length
      } instead.`
    );
  }
  return Buffer.from(await blsEncrypt(publicKey, message, identity)).toString(
    'base64'
  );
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
export const verifyAndDecryptWithSignatureShares = async (
  publicKeyHex: string,
  identity: Uint8Array,
  ciphertextBase64: string,
  shares: BlsSignatureShare[]
): Promise<Uint8Array> => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');
  const signature = await combineSignatureShares(shares);

  await blsVerify(publicKey, identity, signature);

  const sigShares = toJSONShares(shares);

  return doDecrypt(ciphertextBase64, sigShares);
};

const toJSONShares = (
  shares: BlsSignatureShare[]
): BlsSignatureShareJsonString[] => {
  return shares.map((s) => {
    return JSON.stringify(s);
  }) as BlsSignatureShareJsonString[];
};

/**
 * Combine BLS signature shares.
 *
 * @param shares hex-encoded array of the BLS signature shares
 * @returns hex-encoded string of the combined signature
 */
export const combineSignatureShares = async (
  shares: BlsSignatureShare[]
): Promise<string> => {
  const sigShares = toJSONShares(shares);

  const signature = await blsCombine(sigShares);

  if (signature.length !== 192) {
    throw new Error(
      `Signature length is not 192. Got ${signature.length} instead.`
    );
  }

  return signature;
};

/**
 * Verify the BLS network signature.
 *
 * @param publicKeyHex hex-encoded string of the BLS public key to verify with.
 * @param message Uint8Array of the message to verify.
 * @param signature Uint8Array of the signature to verify.
 */
export const verifySignature = async (
  publicKeyHex: string,
  message: Uint8Array,
  signature: string
): Promise<void> => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');

  await blsVerify(publicKey, message, signature);
};

const parseCombinedSignature = (
  combinedSignature: CombinedLitNodeSignature
): CleanLitNodeSignature => {
  const transformations = [
    convertKeysToCamelCase,
    cleanArrayValues,
    convertNumberArraysToUint8Arrays,
    cleanStringValues,
    hexifyStringValues,
  ];
  return applyTransformations(
    combinedSignature as unknown as Record<string, unknown>,
    transformations
  ) as unknown as CleanLitNodeSignature;
};

/**
 * Combine and verify Lit execute js node shares
 *
 * @param { LitActionSignedData[] } litActionResponseData
 *
 * @returns { CleanLitNodeSignature } signature
 *
 * @throws { NoValidShares }
 *
 */
export const combineExecuteJsNodeShares = async (
  litActionResponseData: LitActionSignedData[]
): Promise<CleanLitNodeSignature> => {
  try {
    const combinerShares = litActionResponseData.map((s) => s.signatureShare);
    const unifiedSignature = await unifiedCombineAndVerify(combinerShares);
    const combinedSignature = JSON.parse(
      unifiedSignature
    ) as CombinedLitNodeSignature;

    return parseCombinedSignature(combinedSignature);
  } catch (e) {
    throw new NoValidShares(
      {
        info: {
          shares: litActionResponseData,
        },
        cause: e,
      },
      'No valid lit action shares to combine'
    );
  }
};

/**
 * Combine and verify Lit pkp sign node shares
 *
 * @param { PKPSignEndpointResponse[] } nodesSignResponseData
 *
 * @returns { CleanLitNodeSignature } signature
 *
 * @throws { NoValidShares }
 *
 */
export const combinePKPSignNodeShares = async (
  nodesSignResponseData: PKPSignEndpointResponse[]
): Promise<CleanLitNodeSignature> => {
  try {
    const validShares = nodesSignResponseData.filter((share) => share.success);

    const combinerShares = validShares.map((s) =>
      JSON.stringify(s.signatureShare)
    );
    const unifiedSignature = await unifiedCombineAndVerify(combinerShares);
    const combinedSignature = JSON.parse(
      unifiedSignature
    ) as CombinedLitNodeSignature;

    return parseCombinedSignature(combinedSignature);
  } catch (e) {
    throw new NoValidShares(
      {
        info: {
          shares: nodesSignResponseData,
        },
        cause: e,
      },
      'No valid pkp sign shares to combine'
    );
  }
};

export const computeHDPubKey = async (
  pubkeys: string[],
  keyId: string
): Promise<string> => {
  // a bit of preprocessing to remove characters which will cause our wasm module to reject the values.
  pubkeys = pubkeys.map((value: string) => {
    return value.replace('0x', '');
  });
  keyId = keyId.replace('0x', '');
  const preComputedPubkey = await ecdsaDeriveKey(
    Buffer.from(keyId, 'hex'),
    pubkeys.map((hex: string) => Buffer.from(hex, 'hex'))
  );
  return Buffer.from(preComputedPubkey).toString('hex');
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

async function doDecrypt(
  ciphertextBase64: string,
  shares: BlsSignatureShareJsonString[]
): Promise<Uint8Array> {
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  const decrypt = await blsDecrypt(ciphertext, shares);
  return decrypt;
}

/**
 * Asynchronously fetches an AMD certification from a specified URL using a CORS proxy.
 * The primary purpose of using a CORS proxy is to avoid being rate-limited by AMD.
 * The function attempts to fetch the AMD cert through a proxy, and if the proxy fetch fails,
 * it retries directly from the original URL.
 *
 * Note: This project is hosted on heroku and uses this codebase: https://github.com/LIT-Protocol/cors-proxy-amd
 *
 * @param url The URL from which to fetch the AMD cert.
 * @returns A Promise that resolves to a Uint8Array containing the AMD certification data.
 * @throws An error detailing HTTP or network issues encountered during the fetch process.
 */
async function getAmdCert(url: string): Promise<Uint8Array> {
  const proxyUrl = `${LIT_CORS_PROXY}/${url}`;

  log(
    `[getAmdCert] Fetching AMD cert using proxy URL ${proxyUrl} to manage CORS restrictions and to avoid being rate limited by AMD.`
  );

  async function fetchAsUint8Array(targetUrl: string) {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      throw new NetworkError(
        {
          info: {
            targetUrl,
          },
        },
        `[getAmdCert] HTTP error! status: ${res.status}`
      );
    }
    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  try {
    return await fetchAsUint8Array(proxyUrl);
  } catch (e) {
    log(`[getAmdCert] Failed to fetch AMD cert from proxy:`, e);
  }

  // Try direct fetch only if proxy fails
  log('[getAmdCert] Attempting to fetch directly without proxy.');

  try {
    return await fetchAsUint8Array(url);
  } catch (e) {
    log('[getAmdCert] Direct fetch also failed:', e);
    throw e; // Re-throw to signal that both methods failed
  }
}

/**
 *
 * Check the attestation against AMD certs
 *
 * @param { NodeAttestation } attestation The actual attestation object, which includes the signature and report
 * @param { string } challengeHex The challenge we sent
 * @param { string } url The URL we talked to
 *
 * @returns { Promise<void> } A promise that throws if the attestation is invalid
 */
export const checkSevSnpAttestation = async (
  attestation: NodeAttestation,
  challengeHex: string,
  url: string
): Promise<void> => {
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
    throw new NetworkError(
      {
        info: {
          attestation,
          challengeHex,
          noonce,
          challenge,
        },
      },
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
      throw new NetworkError(
        {
          info: {
            url,
          },
        },
        `Unknown port in URL ${url}`
      );
    }
  }

  const ipAndAddrFromReport = data['EXTERNAL_ADDR'].toString('utf8');
  const ipFromReport = ipAndAddrFromReport.split(':')[0];
  const portFromReport = ipAndAddrFromReport.split(':')[1];

  if (ipWeTalkedTo !== ipFromReport) {
    throw new NetworkError(
      {
        info: {
          attestation,
          ipWeTalkedTo,
          ipFromReport,
        },
      },
      `Attestation external address ${ipFromReport} does not match IP we talked to ${ipWeTalkedTo}`
    );
  }
  if (portWeTalkedTo !== portFromReport) {
    throw new NetworkError(
      {
        info: {
          attestation,
          portWeTalkedTo,
          portFromReport,
        },
      },
      `Attestation external port ${portFromReport} does not match port we talked to ${portWeTalkedTo}`
    );
  }

  // get the VCEK certificate
  let vcekCert;
  const vcekUrl = await sevSnpGetVcekUrl(report);
  // use local storage if we have one available
  if (globalThis.localStorage) {
    log('Using local storage for certificate caching');
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
    throw new UnknownError(
      {
        info: {
          attestation,
          report,
          vcekUrl,
        },
      },
      'Unable to retrieve VCEK certificate from AMD'
    );
  }

  // pass base64 encoded report to wasm wrapper
  return sevSnpVerify(report, data, signatures, challenge, vcekCert);
};

// Map the right hash function per signing scheme
export const hashFunctions: Record<SigType, any> = {
  Bls12381G1ProofOfPossession: sha256, // TODO needed here? Which hash?
  EcdsaK256Sha256: sha256,
  EcdsaP256Sha256: sha256,
  EcdsaP384Sha384: sha384,
  SchnorrEd25519Sha512: sha512,
  SchnorrK256Sha256: sha256,
  SchnorrP256Sha256: sha256,
  SchnorrP384Sha384: sha384,
  SchnorrRistretto25519Sha512: sha512,
  SchnorrEd448Shake256: (msg: Uint8Array) => shake256(msg, 114),
  SchnorrRedJubjubBlake2b512: (msg: Uint8Array) => blake2b(msg, { dkLen: 64 }),
  SchnorrK256Taproot: sha256,
  SchnorrRedDecaf377Blake2b512: (msg: Uint8Array) =>
    blake2b(msg, { dkLen: 64 }),
  SchnorrkelSubstrate: (msg: Uint8Array) => blake2b(msg, { dkLen: 64 }),
} as const;

// Map the right curve function per signing scheme
export const curveFunctions: Record<SigType, any> = {
  Bls12381G1ProofOfPossession: bls12_381,
  EcdsaK256Sha256: secp256k1,
  EcdsaP256Sha256: p256,
  EcdsaP384Sha384: p384,
  SchnorrEd25519Sha512: ed25519,
  SchnorrK256Sha256: schnorrK256,
  SchnorrP256Sha256: p256,
  SchnorrP384Sha384: p384,
  SchnorrRistretto25519Sha512: (msg: Uint8Array) =>
    RistrettoPoint.hashToCurve(sha512(msg)).toHex(),
  SchnorrEd448Shake256: ed448,
  SchnorrRedJubjubBlake2b512: jubjub,
  SchnorrK256Taproot: secp256k1,
  SchnorrRedDecaf377Blake2b512: p256, // TODO check curve function
  SchnorrkelSubstrate: ed25519, // TODO check curve function
} as const;

export function hashLitMessage(
  signingScheme: SigType,
  message: Uint8Array
): Uint8Array {
  const hashFn = hashFunctions[signingScheme];

  if (!hashFn) {
    throw new CurveTypeNotFoundError(
      {
        info: {
          signingScheme,
        },
      },
      `No known hash function for specified signing scheme ${signingScheme}`
    );
  }

  return hashFn(message);
}

export function verifyLitSignature(
  signingScheme: SigType,
  publicKey: string,
  message: string,
  signature: string
) {
  const curve = curveFunctions[signingScheme];
  if (!curve) {
    throw new CurveTypeNotFoundError(
      {
        info: {
          signingScheme,
        },
      },
      `No known curve function for specified signing scheme ${signingScheme}`
    );
  }

  // TODO call correct verification on all curve functions
  return curve.verify(signature, message, publicKey);
}
