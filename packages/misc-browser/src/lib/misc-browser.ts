import {
  LocalStorageItemNotFoundException,
  LocalStorageItemNotRemovedException,
  LocalStorageItemNotSetException,
} from '@lit-protocol/constants';

/**
 * Get the local storage item by key.
 *
 * @param {string} key The key to retrieve.
 * @returns {string} The stored string.
 * @throws Will throw an error if reading from localStorage fails or the item is not found.
 */
export const getStorageItem = (key: string): string => {
  let item: string | null;
  try {
    item = localStorage.getItem(key);
  } catch (e) {
    throw new LocalStorageItemNotFoundException(
      {
        info: {
          storageKey: key,
        },
        cause: e,
      },
      `Error reading localStorage for key "${key}"`
    );
  }

  if (!item) {
    throw new LocalStorageItemNotFoundException(
      {
        info: {
          storageKey: key,
        },
      },
      `Failed to find ${key} in local storage`
    );
  }

  return item;
};

/**
 *
 * Set the local storage item by key
 *
 * @param { string } key is the key to set
 * @param { string } value is the value to set
 */
export const setStorageItem = (key: string, value: string): string => {
  try {
    localStorage.setItem(key, value);
    return value;
  } catch (e) {
    throw new LocalStorageItemNotSetException(
      {
        info: {
          storageKey: key,
        },
        cause: e,
      },
      `Failed to set %s in local storage`,
      key
    );
  }
};

/**
 *
 * Remove the local storage item by key
 *
 * @param { string } key is the key to remove
 * @returns { string } the key removed
 */
export const removeStorageItem = (key: string): string => {
  try {
    localStorage.removeItem(key);
    return key;
  } catch (e) {
    throw new LocalStorageItemNotRemovedException(
      {
        info: {
          storageKey: key,
        },
        cause: e,
      },
      `Failed to remove %s from local storage`,
      key
    );
  }
};
