import { localStorage as createLocalStorage } from './localStorage';

import type { LitAuthData } from '../types';

describe('localStorage', () => {
  let mockLocalStorage: WindowLocalStorage['localStorage'];

  beforeEach(() => {
    mockLocalStorage = (() => {
      const store = new Map<string, string>();
      return {
        getItem: (key: string) =>
          store.has(key) ? store.get(key) ?? null : null,
        setItem: (key: string, value: string) => store.set(key, value),
      };
    })() as unknown as WindowLocalStorage['localStorage'];
  });

  const appName: string = 'testApp';
  const networkName: string = 'testNetwork';
  const pkpAddress: string = '0x123';
  const authData: LitAuthData = {
    credential: 'abc123',
    authMethod: 'EthWallet',
  };

  test('initializes correctly and validates localStorage', () => {
    expect(() =>
      createLocalStorage({
        appName,
        networkName,
        localStorage: mockLocalStorage,
      })
    ).not.toThrow();
  });

  test('throws an error if localStorage is missing', () => {
    expect(() =>
      // @ts-expect-error Stubbing localstorage for error checking
      createLocalStorage({ appName, networkName, localStorage: null })
    ).toThrow('localStorage is not available in this environment');
  });

  test('writes and reads to/from localStorage correctly', async () => {
    mockLocalStorage.setItem(`lit-auth:${appName}:${networkName}:${pkpAddress}`, JSON.stringify(authData));
    const storage = createLocalStorage({
      appName,
      networkName,
      localStorage: mockLocalStorage,
    });

    await expect(storage.read({ pkpAddress })).resolves.toEqual(authData);
  });

  test('returns null when reading nonexistent data', async () => {
    const storage = createLocalStorage({
      appName,
      networkName,
      localStorage: mockLocalStorage,
    });
    const result = await storage.read({ pkpAddress });

    expect(result).toBeNull();
  });

  test('isolates data between different network names', async () => {
    const storageNetworkA = createLocalStorage({
      appName,
      networkName: 'networkA',
      localStorage: mockLocalStorage,
    });
    const storageNetworkB = createLocalStorage({
      appName,
      networkName: 'networkB',
      localStorage: mockLocalStorage,
    });

    const authDataNetworkA = { ...authData, credential: 'networkA' };
    const authDataNetworkB = { ...authData, credential: 'networkB' };

    await storageNetworkA.write({
      pkpAddress,
      authData: authDataNetworkA,
    });

    await expect(storageNetworkA.read({ pkpAddress })).resolves.toEqual(
      authDataNetworkA
    );
    await expect(storageNetworkB.read({ pkpAddress })).resolves.toBeNull();

    await storageNetworkB.write({
      pkpAddress,
      authData: authDataNetworkB,
    });

    await expect(storageNetworkA.read({ pkpAddress })).resolves.toEqual(
      authDataNetworkA
    );
    await expect(storageNetworkB.read({ pkpAddress })).resolves.toEqual(
      authDataNetworkB
    );
  });

  test('isolates data between different app names', async () => {
    const storageAppA = createLocalStorage({
      appName: 'appA',
      networkName,
      localStorage: mockLocalStorage,
    });
    const storageAppB = createLocalStorage({
      appName: 'appB',
      networkName,
      localStorage: mockLocalStorage,
    });

    const authDataNetworkB = { ...authData, credential: 'networkB' };

    await storageAppA.write({ pkpAddress, authData });
    await expect(storageAppA.read({ pkpAddress })).resolves.toEqual(authData);
    await expect(storageAppB.read({ pkpAddress })).resolves.toBeNull();

    await storageAppB.write({ pkpAddress, authData: authDataNetworkB });
    await expect(storageAppB.read({ pkpAddress })).resolves.toEqual(authDataNetworkB);
    await expect(storageAppA.read({ pkpAddress })).resolves.toEqual(authData);
  });
});
