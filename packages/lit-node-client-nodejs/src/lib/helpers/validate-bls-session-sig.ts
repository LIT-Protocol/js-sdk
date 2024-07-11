import { AuthSig } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { SiweError, SiweErrorType, SiweMessage } from 'siwe';

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
    signature: Uint8Array
  ) => Promise<void>,
  networkPubKey: string,
  authSig: AuthSig
): Promise<void> => {
  let sigJson = JSON.parse(authSig.sig);
  // we do not nessesarly need to use ethers here but was a quick way
  // to get verification working.
  const eip191Hash = ethers.utils.hashMessage(authSig.signedMessage);
  const prefixedStr =
    LIT_SESSION_SIGNED_MESSAGE_PREFIX + eip191Hash.replace('0x', '');
  const prefixedEncoded = ethers.utils.toUtf8Bytes(prefixedStr);
  const shaHashed = ethers.utils.sha256(prefixedEncoded).replace('0x', '');
  const signatureBytes = Buffer.from(sigJson.ProofOfPossession, `hex`);

  await verifier(networkPubKey, Buffer.from(shaHashed, 'hex'), signatureBytes);
};
