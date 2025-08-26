import { AUTH_METHOD_TYPE_VALUES } from '@lit-protocol/constants';
import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { getChildLogger } from '@lit-protocol/logger';
import { ExpirationSchema } from '@lit-protocol/schemas';
import type { LitAuthStorageProvider } from '../../storage';
import type { LitAuthData } from '../../types';

const _logger = getChildLogger({
  module: 'tryGetCachedAuthData',
});

/**
 * Tries to retrieve cached authentication data from storage for a given address.
 * If no cached data is found, it generates a new session key pair, saves it
 * to storage, and returns the newly created auth data.
 * @returns {Promise<LitAuthData | null>} The cached or newly generated auth data, or null if no data is found.
 * @example
 * {
 *   sessionKey: {
 *     keyPair: {
 *       publicKey: "bf8001bfdead23402d867d1acd965b45b405676a966db4237af11ba5eb85d7ce",
 *       secretKey: "9e19bd14bbc1bf4a6a0d08bd035d279702d31a6da159d52867441ae02e77ba02bf8001bfdead23402d867d1acd965b45b405676a966db4237af11ba5eb85d7ce",
 *     },
 *     expiresAt: "2025-05-02T16:06:19.195Z",
 *   },
 *   authMethodType: 1,
 * }
 */
export async function tryGetCachedAuthData(params: {
  storage: LitAuthStorageProvider;
  address: string;
  expiration: string | undefined;
  type: AUTH_METHOD_TYPE_VALUES;
}): Promise<LitAuthData> {
  // Use `storage` to see if there is cached auth data
  let authData = (await params.storage.read({
    address: params.address,
  })) as LitAuthData | null; // Allow null if nothing is found

  _logger.info({
    address: params.address,
    foundInCache: !!authData,
  }, 'tryGetCachedAuthData: Attempting to read from cache');

  if (authData && authData.sessionKey && authData.sessionKey.expiresAt) {
    try {
      const expirationDate = new Date(authData.sessionKey.expiresAt);
      if (expirationDate.getTime() > Date.now()) {
        _logger.info({
            address: params.address,
            expiresAt: authData.sessionKey.expiresAt,
          }, 'tryGetCachedAuthData: Found valid (unexpired) cached auth data');
        return authData; // Return valid, unexpired authData
      } else {
        _logger.info({
          address: params.address,
          expiredAt: authData.sessionKey.expiresAt,
        }, 'tryGetCachedAuthData: Cached auth data has expired');
        authData = null; // Treat as not found if expired
      }
    } catch (e: any) {
      _logger.warn({
          address: params.address,
          expiresAtValue: authData!.sessionKey!.expiresAt,
          error: e.message || e,
        }, 'tryGetCachedAuthData: Error parsing expirationDate from cached auth data. Will regenerate.');
      authData = null; // Treat as not found if parsing fails
    }
  } else if (authData) {
    _logger.warn({
        address: params.address,
        authDataPreview: JSON.stringify(authData).substring(0, 200),
      }, 'tryGetCachedAuthData: Cached auth data found, but sessionKey or expiresAt is missing. Will regenerate.');
    authData = null; // Treat as not found if incomplete
  }

  // If authData is null at this point (either not found, expired, or invalid), generate new.
  if (!authData) {
    _logger.info({
        address: params.address,
      }, 'tryGetCachedAuthData: No valid cached auth data found or cache expired/invalid. Generating new auth data.');

    const _expiration = ExpirationSchema.parse(params.expiration);

    // generate session key pair
    authData = {
      sessionKey: {
        keyPair: generateSessionKeyPair(),
        expiresAt: _expiration,
      },
      authMethodType: params.type,
    };

    // save session key pair to storage
    await params.storage.write({
      address: params.address,
      authData,
    });
    _logger.info({
      address: params.address,
    }, 'tryGetCachedAuthData: Generated and saved new auth data.');
  }

  // Final check to ensure authData is not null, which should be guaranteed by the logic above.
  // This also helps satisfy TypeScript's null analysis.
  if (!authData) {
    _logger.error(
      'Failed to retrieve or generate authentication data unexpectedly after all checks and generation steps.'
    );
    throw new Error('Failed to retrieve or generate authentication data.');
  }

  const finalAuthData: LitAuthData = authData;

  _logger.info({
    address: params.address,
    // authData, // Avoid logging full authData which may contain sensitive info like keyPair and also resolves linter issue.
  }, 'tryGetCachedAuthData: Success, returning auth data.');

  return finalAuthData;
}
