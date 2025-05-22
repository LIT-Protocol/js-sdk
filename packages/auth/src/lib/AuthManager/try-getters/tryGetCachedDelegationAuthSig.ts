import { getChildLogger } from '@lit-protocol/logger';
import type { LitAuthStorageProvider } from '../../storage';

const _logger = getChildLogger({
  module: 'tryGetCachedDelegationAuthSig',
});

export async function tryGetCachedDelegationAuthSig(params: {
  storage: LitAuthStorageProvider;
  address: string;
  expiration: string; // Desired expiration for new sigs, not used for checking existing
  signSessionKey: any; // This is assumed to be a Promise resolving to the auth sig
}) {
  const delegationAuthSigString =
    await params.storage.readInnerDelegationAuthSig({
      publicKey: params.address,
    });

  _logger.info('tryGetCachedDelegationAuthSig: Attempting to read from cache', {
    address: params.address,
    foundInCache: !!delegationAuthSigString,
  });

  if (delegationAuthSigString) {
    _logger.info(
      'tryGetCachedDelegationAuthSig: Found cached delegation auth sig',
      {
        address: params.address,
        cachedSig: delegationAuthSigString,
      }
    );

    try {
      const cachedSig = JSON.parse(delegationAuthSigString);
      let sigExpirationTime: string | undefined = undefined;

      if (cachedSig && typeof cachedSig === 'object') {
        // Prefer a direct expirationTime field if it exists
        if (typeof cachedSig.expirationTime === 'string') {
          sigExpirationTime = cachedSig.expirationTime;
        }
        // Fallback to parsing from signedMessage if it's a common AuthSig structure containing a SIWE message
        else if (typeof cachedSig.signedMessage === 'string') {
          const siweMsg = cachedSig.signedMessage;
          // Regex to find "Expiration Time: <ISO_DATE_STRING>" in a potentially multi-line SIWE message
          const expirationMatch = siweMsg.match(/^Expiration Time: (.*)$/m);
          if (expirationMatch && expirationMatch[1]) {
            const extractedTime = expirationMatch[1].trim();
            // Validate it's a valid ISO date string before using
            try {
              new Date(extractedTime).toISOString(); // Throws if invalid date format
              sigExpirationTime = extractedTime;
            } catch (dateError) {
              _logger.warn(
                'tryGetCachedDelegationAuthSig: Extracted expirationTime from signedMessage is not a valid date.',
                { extractedTime, address: params.address, error: dateError }
              );
              sigExpirationTime = undefined; // Invalidate if parsing fails
            }
          }
        }
      }

      if (sigExpirationTime) {
        const expirationDate = new Date(sigExpirationTime);
        if (expirationDate.getTime() > Date.now()) {
          _logger.info(
            'tryGetCachedDelegationAuthSig: Found valid (unexpired) cached delegation auth sig',
            {
              address: params.address,
              expiresAt: sigExpirationTime,
            }
          );
          return cachedSig;
        } else {
          _logger.info(
            'tryGetCachedDelegationAuthSig: Cached delegation auth sig has expired',
            {
              address: params.address,
              expiredAt: sigExpirationTime,
            }
          );
        }
      } else {
        _logger.warn(
          'tryGetCachedDelegationAuthSig: Cached delegation auth sig found, but valid expirationTime is missing or not in expected format. Will regenerate.',
          {
            address: params.address,
            // Log a preview for debugging, avoid logging the full potentially large object
            cachedSigPreview: delegationAuthSigString.substring(0, 200),
          }
        );
      }
    } catch (e: any) {
      _logger.error(
        'tryGetCachedDelegationAuthSig: Error parsing or validating cached delegation auth sig. Will regenerate.',
        {
          address: params.address,
          error: e.message || e,
        }
      );
    }
  }

  _logger.info(
    'tryGetCachedDelegationAuthSig: No valid cached sig found or cache expired/invalid. Generating new delegation auth sig.',
    {
      address: params.address,
    }
  );

  const newDelegationAuthSig = await params.signSessionKey();

  await params.storage.writeInnerDelegationAuthSig({
    publicKey: params.address,
    authSig: JSON.stringify(newDelegationAuthSig),
  });

  _logger.info(
    'tryGetCachedDelegationAuthSig: Generated and saved new delegation auth sig.',
    {
      address: params.address,
    }
  );

  return newDelegationAuthSig;
}
