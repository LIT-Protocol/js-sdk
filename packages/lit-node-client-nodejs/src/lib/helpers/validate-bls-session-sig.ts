import { AuthSig } from '@lit-protocol/types';
import { uint8arrayToString } from '@lit-protocol/uint8arrays';
import { ethers } from 'ethers';
import { SiweError, SiweErrorType, SiweMessage } from 'siwe';

const LIT_SESSION_SIGNED_MESSAGE_PREFIX = 'lit_session:';

/**
 * Verifies a BLS session signature.
 *
 * @param {Function} verifier - A wasm function that takes a public key, message, and signature to verify. NOTE: `public_key` is snake cased because it's a wasm parameter
 * @param {string} networkPubKey - The public key of the network.
 * @param {AuthSig} authSig
 * @typedef {Object} AuthSig
 * @property {string} sig - The signature in string format.
 * @property {string} signedMessage - The message that was signed.
 */
export const blsSessionSigVerify = (
  // TODO: refactor type with merger of PR 'https://github.com/LIT-Protocol/js-sdk/pull/503`
  verifier: (public_key: any, message: any, signature: any) => void,
  networkPubKey: string,
  authSig: AuthSig,
  authSigSiweMessage: SiweMessage
): void => {
  let sigJson = JSON.parse(authSig.sig);
  // we do not nessesarly need to use ethers here but was a quick way
  // to get verification working.
  const eip191Hash = ethers.utils.hashMessage(authSig.signedMessage);
  const prefixedStr =
    LIT_SESSION_SIGNED_MESSAGE_PREFIX + eip191Hash.replace('0x', '');
  const prefixedEncoded = ethers.utils.toUtf8Bytes(prefixedStr);
  const shaHashed = ethers.utils.base64.encode(
    ethers.utils.sha256(prefixedEncoded)
  );
  const signatureBytes = Buffer.from(sigJson.ProofOfPossession, `hex`);

  /** Check time or now */
  const checkTime = new Date();

  if (!authSigSiweMessage.expirationTime || !authSigSiweMessage.issuedAt) {
    throw new Error(
      'Invalid SIWE message. Missing expirationTime or issuedAt.'
    );
  }

  // check timestamp of SIWE
  const expirationDate = new Date(authSigSiweMessage.expirationTime);
  if (checkTime.getTime() >= expirationDate.getTime()) {
    throw new SiweError(
      SiweErrorType.EXPIRED_MESSAGE,
      `${checkTime.toISOString()} < ${expirationDate.toISOString()}`,
      `${checkTime.toISOString()} >= ${expirationDate.toISOString()}`
    );
  }

  const issuedAt = new Date(authSigSiweMessage.issuedAt);
  if (checkTime.getTime() < issuedAt.getTime()) {
    throw new SiweError(
      SiweErrorType.NOT_YET_VALID_MESSAGE,
      `${checkTime.toISOString()} >= ${issuedAt.toISOString()}`,
      `${checkTime.toISOString()} < ${issuedAt.toISOString()}`
    );
  }

  verifier(
    networkPubKey,
    shaHashed,
    uint8arrayToString(signatureBytes, `base64`)
  );
};
