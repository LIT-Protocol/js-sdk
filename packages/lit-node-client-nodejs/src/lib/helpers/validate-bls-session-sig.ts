import { AuthSig } from '@lit-protocol/types';
import { uint8arrayToString } from '@lit-protocol/uint8arrays';
import { ethers } from 'ethers';

const LIT_SESSION_SIGNED_MESSAGE_PREFIX = 'lit_session:';

export const blsSessionSigVerify = (
  verifier: (public_key: any, message: any, signature: any) => void,
  networkPubKey: string,
  authSig: AuthSig
): void => {
  let sigJson = JSON.parse(authSig.sig);

  const eip191Hash = ethers.utils.hashMessage(authSig.signedMessage);
  const prefixedStr =
    LIT_SESSION_SIGNED_MESSAGE_PREFIX + eip191Hash.replace('0x', '');
  const prefixedEncoded = ethers.utils.toUtf8Bytes(prefixedStr);
  const shaHashed = ethers.utils.base64.encode(
    ethers.utils.sha256(prefixedEncoded)
  );
  const signatureBytes = Buffer.from(sigJson.ProofOfPossession, `hex`);

  verifier(
    networkPubKey,
    shaHashed,
    uint8arrayToString(signatureBytes, `base64`)
  );
};
