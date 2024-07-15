import { LIT_PREFIX } from '../constants';

export function removeSaltFromDecryptedKey(decryptedPrivateKey) {
  if (!decryptedPrivateKey.startsWith(LIT_PREFIX)) {
    throw new Error(
      `Error: PKey was not encrypted with salt; all wrapped keys must be prefixed with '${LIT_PREFIX}'`
    );
  }

  return decryptedPrivateKey.slice(LIT_PREFIX.length);
}
