import { splitSignature } from 'ethers/lib/utils';

import {
  InvalidParamType,
  LIT_CURVE,
  LIT_CURVE_VALUES,
  NetworkError,
  NoValidShares,
  UnknownError,
} from '@lit-protocol/constants';
import { checkType, log } from '@lit-protocol/misc';
import { nacl } from '@lit-protocol/nacl';
import {
  CombinedECDSASignature,
  IJWT,
  NodeAttestation,
  SessionKeyPair,
  SigningAccessControlConditionJWTPayload,
  SigShare,
  VerifyJWTProps,
} from '@lit-protocol/types';
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
  sevSnpGetVcekUrl,
  sevSnpVerify,
} from '@lit-protocol/wasm';

/** ---------- Exports ---------- */
const LIT_CORS_PROXY = `https://cors.litgateway.com`;

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
export const encrypt = async (
  publicKeyHex: string,
  message: Uint8Array,
  identity: Uint8Array
): Promise<string> => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');

  switch (publicKeyHex.replace('0x', '').length) {
    case 218:
      return Buffer.from(
        await blsEncrypt('Bls12381G2', publicKey, message, identity)
      ).toString('hex');
    case 96:
      return Buffer.from(
        await blsEncrypt('Bls12381G2', publicKey, message, identity)
      ).toString('base64');
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
export const decryptWithSignatureShares = async (
  ciphertextBase64: string,
  shares: BlsSignatureShare[]
): Promise<Uint8Array> => {
  const signature = await doCombineSignatureShares(shares);

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
export const verifyAndDecryptWithSignatureShares = async (
  publicKeyHex: string,
  identity: Uint8Array,
  ciphertextBase64: string,
  shares: BlsSignatureShare[]
): Promise<Uint8Array> => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');
  const signature = await doCombineSignatureShares(shares);
  await blsVerify('Bls12381G2', publicKey, identity, signature);

  return doDecrypt(ciphertextBase64, signature);
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
  const signature = await doCombineSignatureShares(shares);

  return Buffer.from(signature).toString('hex');
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
  signature: Uint8Array
): Promise<void> => {
  const publicKey = Buffer.from(publicKeyHex, 'hex');

  await blsVerify('Bls12381G2', publicKey, message, signature);
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

const ecdsaSigntureTypeMap: Partial<Record<LIT_CURVE_VALUES, EcdsaVariant>> = {
  [LIT_CURVE.EcdsaCaitSith]: 'K256',
  [LIT_CURVE.EcdsaK256]: 'K256',
  [LIT_CURVE.EcdsaCAITSITHP256]: 'P256',
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

  const [r, s, v] = await ecdsaCombine(variant!, presignature, signatureShares);

  const publicKey = Buffer.from(anyValidShare.publicKey, 'hex');
  const messageHash = Buffer.from(anyValidShare.dataSigned!, 'hex');

  await ecdsaVerify(variant!, messageHash, publicKey, [r, s, v]);

  const signature = splitSignature(Buffer.concat([r, s, Buffer.from([v])]));

  return {
    r: signature.r.slice('0x'.length),
    s: signature.s.slice('0x'.length),
    recid: signature.recoveryParam,
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

function doDecrypt(
  ciphertextBase64: string,
  signature: Uint8Array
): Promise<Uint8Array> {
  console.log('signature from encrypt op: ', signature);
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  return blsDecrypt('Bls12381G2', ciphertext, signature);
}

function doCombineSignatureShares(
  shares: BlsSignatureShare[]
): Promise<Uint8Array> {
  const sigShares = shares.map((s) => Buffer.from(s.ProofOfPossession, 'hex'));
  const signature = blsCombine('Bls12381G2', sigShares);
  return signature;
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
  // `var` is required for global hackery
  // FIXME: `any` types for wasm are no bueno
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var wasmExports: any;
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var wasmECDSA: any;
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var LitNodeClient: any;
}

/**
 * // TODO check for expiration
 *
 * Verify a JWT from the LIT network.  Use this for auth on your server.  For some background, users can specify access control conditions for various URLs, and then other users can then request a signed JWT proving that their ETH account meets those on-chain conditions using the getSignedToken function.  Then, servers can verify that JWT using this function.  A successful verification proves that the user meets the access control conditions defined earlier.  For example, the on-chain condition could be posession of a specific NFT.
 *
 * @param { VerifyJWTProps } jwt
 *
 * @returns { IJWT<T> } An object with 4 keys: "verified": A boolean that represents whether or not the token verifies successfully.  A true result indicates that the token was successfully verified.  "header": the JWT header.  "payload": the JWT payload which includes the resource being authorized, etc.  "signature": A uint8array that represents the raw  signature of the JWT.
 */
export const verifyJwt = async ({
  publicKey,
  jwt,
}: VerifyJWTProps): Promise<IJWT<SigningAccessControlConditionJWTPayload>> => {
  // -- validate
  if (
    !checkType({
      value: jwt,
      allowedTypes: ['String'],
      paramName: 'jwt',
      functionName: 'verifyJwt',
    })
  )
    throw new InvalidParamType(
      {
        info: {
          jwt,
        },
      },
      'jwt must be a string'
    );

  log('verifyJwt', jwt);

  // verify that the wasm was loaded
  if (!globalThis.wasmExports) {
    log('wasmExports is not loaded.');
  }

  const jwtParts = jwt.split('.');
  const signature = uint8arrayFromString(jwtParts[2], 'base64url');

  const unsignedJwt = `${jwtParts[0]}.${jwtParts[1]}`;

  const message = uint8arrayFromString(unsignedJwt);

  await verifySignature(publicKey, message, signature);

  const _jwt: IJWT<SigningAccessControlConditionJWTPayload> = {
    verified: true,
    header: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[0], 'base64url'))
    ),
    payload: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[1], 'base64url'))
    ),
    signature,
  };

  return _jwt;
};
