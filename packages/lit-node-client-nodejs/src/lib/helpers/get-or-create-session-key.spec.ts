import {
  clearSessionKeyCache,
  getOrCreateSessionKey,
} from './get-or-create-session-key';

describe('getOrCreateSessionKey', () => {
  beforeEach(() => {
    clearSessionKeyCache();
    // Remove global.localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(() => {
          throw new Error('localStorage.getItem is not implemented');
        }),
        setItem: jest.fn(() => {
          throw new Error('localStorage.setItem is not implemented');
        }),
      },
      writable: true,
    });
  });
  it('should always use the session key that was initially set if it is not expired.', () => {
    const requestedExpiration = new Date(
      Date.now() + 24 * 60 * 60 * 1000 // equivalent to 1 day
    ).toISOString();

    const sessionKeyFirstTime = getOrCreateSessionKey(requestedExpiration);
    expect(sessionKeyFirstTime).toBeDefined();

    const newExpirationShouldBeIgnored = new Date(
      Date.now() + 24 * 60 * 60 * 10000 // equivalent to 10 days
    ).toISOString();

    const sessionKeyShouldBeTheSame = getOrCreateSessionKey(
      newExpirationShouldBeIgnored
    );

    expect(sessionKeyShouldBeTheSame).toStrictEqual(sessionKeyFirstTime);
  });

  it('should generate a new session key if the cached session key has expired.', () => {
    const requestedExpiration = new Date(
      Date.now() - 5 * 60 * 1000 // 5 mins ago
    ).toISOString();

    // This should set the cache
    const sessionKeyFirstTime = getOrCreateSessionKey(requestedExpiration);

    // Second time the cache should already be set, but if the cache is expired, we should
    // get a new one
    const sessionKeySecondTime = getOrCreateSessionKey(requestedExpiration);

    expect(sessionKeyFirstTime).not.toStrictEqual(sessionKeySecondTime);
  });
});
