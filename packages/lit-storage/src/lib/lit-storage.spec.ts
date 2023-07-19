import { LitStorage } from './lit-storage';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

describe('LitStorage', () => {
  let litStorage: LitStorage;

  beforeEach(() => {
    litStorage = new LitStorage(localStorageMock);
  });

  afterEach(() => {
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
  });

  it('setItem should work as expected', () => {
    const key = 'testKey';
    const value = 'testValue';
    litStorage.setItem(key, value);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify({ value })
    );
  });

  it('getItem should work as expected', () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorageMock.getItem.mockReturnValue(value);

    const result = litStorage.getItem(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toEqual(value);
  });

  it('setExpirableItem should store an expirable item in localStorage', () => {
    const key = 'testKey';
    const value = 'testValue';
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    litStorage.setExpirableItem(key, value, expirationDate);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify({ value, expirationDate: expirationDate.toJSON() })
    );
  });

  it('getExpirableItem should retrieve a non-expired item from localStorage', () => {
    const key = 'testKey';
    const value = 'testValue';
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    const item = { value, expirationDate: expirationDate.toJSON() };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(item));

    const result = litStorage.getExpirableItem(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toEqual(value);
  });

  it('getExpirableItem should return null for an expired item', () => {
    const key = 'testKey';
    const value = 'testValue';
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 1);

    const item = { value, expirationDate: expirationDate.toJSON() };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(item));

    const result = litStorage.getExpirableItem(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  it('getExpirableItem should return null for a non-existent item', () => {
    const key = 'nonexistentKey';
    localStorageMock.getItem.mockReturnValue(null);

    const result = litStorage.getExpirableItem(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  it('isItemExpired should return true for an expired item', () => {
    const key = 'testKey';
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 1);

    const item = { expirationDate: expirationDate.toJSON() };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(item));

    const result = litStorage.isItemExpired(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toBe(true);
  });

  it('isItemExpired should return false for a non-expired item', () => {
    const key = 'testKey';
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    const item = { expirationDate: expirationDate.toJSON() };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(item));

    const result = litStorage.isItemExpired(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toBe(false);
  });
});
