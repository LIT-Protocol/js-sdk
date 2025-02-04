import { joinSignature, splitSignature } from 'ethers/lib/utils';

import {
  InvalidParamType,
  LIT_CURVE,
  LIT_CURVE_VALUES,
  NetworkError,
  NoValidShares,
  UnknownError,
  UnknownSignatureError,
} from '@lit-protocol/constants';
import { checkType, log } from '@lit-protocol/misc';
import { nacl } from '@lit-protocol/nacl';
import {
  CombinedECDSASignature,
  NodeAttestation,
  SessionKeyPair,
  SigningAccessControlConditionJWTPayload,
  SigShare,
  WalletEncryptedPayload,
} from '@lit-protocol/types';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';
import {
  BlsSignatureShareJsonString,
  EcdsaVariant,
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  blsVerify,
  ecdsaCombine,
  ecdsaDeriveKey,
  ecdsaVerify,
  sevSnpGetVcekUrl,
  sevSnpVerify,
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
 * Decrypt ciphertext using BLS signature shares.
 *
 * @param ciphertextBase64 base64-encoded string of the ciphertext to decrypt
 * @param shares hex-encoded array of the BLS signature shares
 * @returns Uint8Array of the decrypted data
 */
export const decryptWithSignatureShares = async (
  ciphertextBase64: string,
  shares: BlsSignatureShare[]
): Promise<Uint8Array> => {
  const sigShares = toJSONShares(shares);
  return doDecrypt(ciphertextBase64, sigShares);
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

const ecdsaSigntureTypeMap: Partial<Record<LIT_CURVE_VALUES, EcdsaVariant>> = {
  [LIT_CURVE.EcdsaCaitSith]: 'K256',
  [LIT_CURVE.EcdsaK256]: 'K256',
  [LIT_CURVE.EcdsaCAITSITHP256]: 'P256',
  [LIT_CURVE.EcdsaK256Sha256]: 'K256',
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
export const combineEcdsaShares = async (
  sigShares: SigShare[]
): Promise<CombinedECDSASignature> => {
  const validShares = sigShares.filter((share) => share.signatureShare);

  const anyValidShare = validShares[0];

  if (!anyValidShare) {
    throw new NoValidShares(
      {
        info: {
          shares: sigShares,
        },
      },
      'No valid shares to combine'
    );
  }

  const variant =
    ecdsaSigntureTypeMap[anyValidShare.sigType as LIT_CURVE_VALUES];
  const presignature = Buffer.from(anyValidShare.bigR!, 'hex');
  const signatureShares = validShares.map((share) =>
    Buffer.from(share.signatureShare, 'hex')
  );

  const [r, s, recId] = await ecdsaCombine(
    variant!,
    presignature,
    signatureShares
  );

  const publicKey = Buffer.from(anyValidShare.publicKey, 'hex');
  const messageHash = Buffer.from(anyValidShare.dataSigned!, 'hex');

  await ecdsaVerify(variant!, messageHash, publicKey, [r, s, recId]);

  const signature = splitSignature(
    Buffer.concat([r, s, Buffer.from([recId + 27])])
  );

  // validate r before returning
  if (!signature.r) {
    throw new UnknownSignatureError(
      {
        info: {
          signature,
        },
      },
      'signature could not be combined'
    );
  }

  const _r = signature.r.slice('0x'.length);
  const _s = signature.s.slice('0x'.length);
  const _recid = signature.recoveryParam;

  const encodedSig = joinSignature({
    r: '0x' + _r,
    s: '0x' + _s,
    recoveryParam: _recid,
  }) as `0x${string}`;

  return {
    r: _r,
    s: _s,
    recid: _recid,
    signature: encodedSig,
  };
};

export const computeHDPubKey = async (
  pubkeys: string[],
  keyId: string,
  sigType: LIT_CURVE_VALUES
): Promise<string> => {
  const variant = ecdsaSigntureTypeMap[sigType];

  switch (sigType) {
    case LIT_CURVE.EcdsaCaitSith:
    case LIT_CURVE.EcdsaK256:
      // a bit of pre processing to remove characters which will cause our wasm module to reject the values.
      pubkeys = pubkeys.map((value: string) => {
        return value.replace('0x', '');
      });
      keyId = keyId.replace('0x', '');
      const preComputedPubkey = await ecdsaDeriveKey(
        variant!,
        Buffer.from(keyId, 'hex'),
        pubkeys.map((hex: string) => Buffer.from(hex, 'hex'))
      );
      return Buffer.from(preComputedPubkey).toString('hex');
    default:
      throw new InvalidParamType(
        {
          info: {
            sigType,
          },
        },
        `Non supported signature type`
      );
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

export const walletEncrypt = async(
  myWalletSecretKey: Uint8Array, 
  theirWalletPublicKey: Uint8Array,
  sessionSig: Uint8Array,
  message: Uint8Array
): Promise<WalletEncryptedPayload> => {
  const random = new Uint8Array(16);
  window.crypto.getRandomValues(random);
  const dateNow = Date.now();
  const createdAt = Math.floor(dateNow / 1000);
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigUInt64BE(BigInt(createdAt), 0);

  const myWalletPublicKey = new Uint8Array(32);
  nacl.crypto_scalarmult_base(myWalletPublicKey, myWalletSecretKey);

  // Construct AAD
  const sessionSignature = Buffer.from(sessionSig); // Replace with actual session signature
  const theirPublicKey = Buffer.from(theirWalletPublicKey); // Replace with their public key
  const myPublicKey = Buffer.from(myWalletPublicKey); // Replace with your wallet public key
  
  const aad = Buffer.concat([
    sessionSignature,
    random,
    timestamp,
    theirPublicKey,
    myPublicKey,
  ]);
  
  const hash = new Uint8Array(64);
  nacl.crypto_hash(hash, aad);

  const nonce = hash.slice(0, 24);
  const ciphertext = nacl.box(message, nonce, theirPublicKey, myWalletSecretKey);
  return {
    V1: {
      verification_key: uint8ArrayToHex(myWalletPublicKey),
      ciphertext_and_tag: uint8ArrayToHex(ciphertext),
      session_signature: uint8ArrayToHex(sessionSignature),
      random: uint8ArrayToHex(random),
      created_at: dateNow.toISOString(),
    } 
  };
}

export const walletDecrypt = async(
  myWalletSecretKey: Uint8Array,
  payload: WalletEncryptedPayload
): Promise<Uint8Array> => {
  const dateSent = new Date(payload.V1.created_at)
  const createdAt = Math.floor(dateSent / 1000);
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigUInt64BE(BigInt(createdAt), 0);

  const myWalletPublicKey = new Uint8Array(32);
  nacl.crypto_scalarmult_base(myWalletPublicKey, myWalletSecretKey);

  // Construct AAD
  const random = Buffer.from(hexToUint8Array(payload.V1.random));
  const sessionSignature = Buffer.from(hexToUint8Array(payload.V1.session_signature)); // Replace with actual session signature
  const theirPublicKey = hexToUint8Array(payload.V1.verification_key);
  const theirPublicKeyBuffer = Buffer.from(theirPublicKey); // Replace with their public key
  const myPublicKey = Buffer.from(myWalletPublicKey); // Replace with your wallet public key
  
  const aad = Buffer.concat([
    sessionSignature,
    random,
    timestamp,
    theirPublicKeyBuffer,
    myPublicKey,
  ]);
  
  const hash = new Uint8Array(64);
  nacl.crypto_hash(hash, aad);

  const nonce = hash.slice(0, 24);
  const message = nacl.box.open(payload.V1.ciphertext_and_tag, nonce, theirPublicKey, myWalletSecretKey);
  return message;
}

function uint8ArrayToHex(array: Uint8Array) {
  return Array.from(array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
}

function hexToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
      throw new Error("Hex string must have an even length");
  }
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 *
 * Check the attestation against AMD certs
 *
 * @param { NodeAttestation } attestation The actual attestation object, which includes the signature and report
 * @param { string } challengeHex The challenge we sent
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

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var LitNodeClient: any;
}
