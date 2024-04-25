import { EITHER_TYPE, LOCAL_STORAGE_KEYS } from '@lit-protocol/constants';
import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { log } from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';
import { SessionKeyCache, SessionKeyPair } from '@lit-protocol/types';

// Global cache variable
let sessionKeyCache: SessionKeyCache | undefined = undefined;

// const _expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

/**
 * Retrieves the session key from local storage or cache, or generates a new session key if none exists.
 * @param expiration - The expiration date of the session key.
 * @returns The session key pair.
 */
export const getOrCreateSessionKey = (expiration: string): SessionKeyPair => {
  const siweExpiration = new Date(expiration).getTime();

  const storageKey = LOCAL_STORAGE_KEYS.SESSION_KEY;
  const storedSessionKeyOrError = getStorageItem(storageKey);

  if (
    storedSessionKeyOrError.type === EITHER_TYPE.ERROR ||
    !storedSessionKeyOrError.result ||
    storedSessionKeyOrError.result === ''
  ) {
    console.warn(
      `Storage key "${storageKey}" is missing. Not a problem. Contiune...`
    );

    // Check if a valid session key exists in cache
    if (sessionKeyCache && Date.now() < sessionKeyCache.timestamp) {
      log(`[getSessionKey] Returning session key from cache.`);
      return sessionKeyCache.value;
    }
    // Cache is missing or expired, generate a new session key
    const newSessionKey = generateSessionKeyPair();

    // Try to set to local storage
    try {
      localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
    } catch (e) {
      console.warn(`Localstorage not available. Not a problem. Contiune...`);
    }
    // Store in cache
    sessionKeyCache = {
      value: newSessionKey,
      timestamp: siweExpiration,
    };

    return newSessionKey;
  } else {
    console.log('G');
    return JSON.parse(storedSessionKeyOrError.result as string);
  }
};

/**
 * Clears the session key cache.
 */
export const clearSessionKeyCache = (): void => {
  sessionKeyCache = undefined;
};
