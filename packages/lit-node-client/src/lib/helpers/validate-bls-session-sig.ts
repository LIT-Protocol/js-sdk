import { ethers } from 'ethers';
import { SiweError, SiweErrorType, SiweMessage } from 'siwe';

import { InvalidArgumentException } from '@lit-protocol/constants';
import { AuthSig } from '@lit-protocol/types';

const LIT_SESSION_SIGNED_MESSAGE_PREFIX = 'lit_session:';

/**
 * Verifies a BLS session signature.
 *
 * @param {Function} verifier - A wasm function that takes a public key, message, and signature to verify.
 * @param {string} networkPubKey - The public key of the network.
 * @param {AuthSig} authSig
 * @typedef {Object} AuthSig
 * @property {string} sig - The signature in string format.
 * @property {string} signedMessage - The message that was signed.
 */
export const blsSessionSigVerify = async (
  verifier: (
    publicKeyHex: string,
    message: Uint8Array,
    signature: string
  ) => Promise<void>,
  networkPubKey: string,
  authSig: AuthSig,
  authSigSiweMessage: SiweMessage
): Promise<void> => {
  const sigJson = JSON.parse(authSig.sig);
  // we do not necessarily need to use ethers here but was a quick way
  // to get verification working.
  const eip191Hash = ethers.utils.hashMessage(authSig.signedMessage);
  const prefixedStr =
    LIT_SESSION_SIGNED_MESSAGE_PREFIX + eip191Hash.replace('0x', '');
  const prefixedEncoded = ethers.utils.toUtf8Bytes(prefixedStr);
  const shaHashed = ethers.utils.sha256(prefixedEncoded).replace('0x', '');
  const signatureString = sigJson.ProofOfPossession;

  /** Check time or now */
  const checkTime = new Date();

  if (!authSigSiweMessage.expirationTime || !authSigSiweMessage.issuedAt) {
    throw new InvalidArgumentException(
      {
        info: {
          authSigSiweMessage,
        },
      },
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

  await verifier(networkPubKey, Buffer.from(shaHashed, 'hex'), signatureString);
};
