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
  cache?: boolean; // If false, always generate a new auth sig
}) {
  // If cache is explicitly disabled, skip cache reading and generate new auth sig
  if (params.cache === false) {
    _logger.info(
      {
        address: params.address,
      },
      'tryGetCachedDelegationAuthSig: Cache disabled, generating new delegation auth sig.'
    );

    const newDelegationAuthSig = await params.signSessionKey();

    _logger.info(
      {
        address: params.address,
      },
      'tryGetCachedDelegationAuthSig: Generated new delegation auth sig (cache disabled, not saved).'
    );

    return newDelegationAuthSig;
  }

  const delegationAuthSigString =
    await params.storage.readInnerDelegationAuthSig({
      publicKey: params.address,
    });

  _logger.info(
    {
      address: params.address,
      foundInCache: !!delegationAuthSigString,
    },
    'tryGetCachedDelegationAuthSig: Attempting to read from cache'
  );

  if (delegationAuthSigString) {
    _logger.info(
      {
        address: params.address,
        cachedSig: delegationAuthSigString,
      },
      'tryGetCachedDelegationAuthSig: Found cached delegation auth sig'
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
                { extractedTime, address: params.address, error: dateError },
                'tryGetCachedDelegationAuthSig: Extracted expirationTime from signedMessage is not a valid date.'
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
            {
              address: params.address,
              expiresAt: sigExpirationTime,
            },
            'tryGetCachedDelegationAuthSig: Found valid (unexpired) cached delegation auth sig'
          );
          return cachedSig;
        } else {
          _logger.info(
            {
              address: params.address,
              expiredAt: sigExpirationTime,
            },
            'tryGetCachedDelegationAuthSig: Cached delegation auth sig has expired'
          );
        }
      } else {
        _logger.warn(
          {
            address: params.address,
            // Log a preview for debugging, avoid logging the full potentially large object
            cachedSigPreview: delegationAuthSigString.substring(0, 200),
          },
          'tryGetCachedDelegationAuthSig: Cached delegation auth sig found, but valid expirationTime is missing or not in expected format. Will regenerate.'
        );
      }
    } catch (e: any) {
      _logger.error(
        {
          address: params.address,
          error: e.message || e,
        },
        'tryGetCachedDelegationAuthSig: Error parsing or validating cached delegation auth sig. Will regenerate.'
      );
    }
  }

  _logger.info(
    {
      address: params.address,
    },
    'tryGetCachedDelegationAuthSig: No valid cached sig found or cache expired/invalid. Generating new delegation auth sig.'
  );

  const newDelegationAuthSig = await params.signSessionKey();

  await params.storage.writeInnerDelegationAuthSig({
    publicKey: params.address,
    authSig: JSON.stringify(newDelegationAuthSig),
  });

  _logger.info(
    {
      address: params.address,
    },
    'tryGetCachedDelegationAuthSig: Generated and saved new delegation auth sig.'
  );

  return newDelegationAuthSig;
}
