import {
  ELeft,
  ERight,
  IEither,
  LocalStorageItemNotFoundException,
  LocalStorageItemNotRemovedException,
  LocalStorageItemNotSetException,
} from '@lit-protocol/constants';

/**
 *
 * Get the local storage item by key
 *
 * @param { string } key
 */
export const getStorageItem = (key: string): IEither<string> => {
  let item;
  try {
    item = localStorage.getItem(key);
  } catch (e) {
    // swallowing
  }

  if (!item) {
    return ELeft(
      new LocalStorageItemNotFoundException(
        {
          info: {
            storageKey: key,
          },
        },
        `Failed to get %s from local storage`,
        key
      )
    );
  }

  return ERight(item);
};

/**
 *
 * Set the local storage item by key
 *
 * @param { string } key is the key to set
 * @param { string } value is the value to set
 */
export const setStorageItem = (key: string, value: string): IEither<string> => {
  try {
    localStorage.setItem(key, value);
    return ERight(value);
  } catch (e) {
    return ELeft(
      new LocalStorageItemNotSetException(
        {
          info: {
            storageKey: key,
          },
        },
        `Failed to set %s in local storage`,
        key
      )
    );
  }
};

/**
 *
 * Remove the local storage item by key
 *
 * @param { string } key is the key to remove
 * @returns { IEither } Either the key or an error
 */
export const removeStorageItem = (key: string): IEither<string> => {
  try {
    localStorage.removeItem(key);
    return ERight(key);
  } catch (e) {
    return ELeft(
      new LocalStorageItemNotRemovedException(
        {
          info: {
            storageKey: key,
          },
        },
        `Failed to remove %s from local storage`,
        key
      )
    );
  }
};
