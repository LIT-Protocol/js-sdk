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

    expect(localStorageMock.setItem).toHaveBeenCalledWith(key, value);
  });

  it('getItem should work as expected', () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorageMock.getItem.mockReturnValue(value);

    const result = litStorage.getItem(key);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toEqual(value);
  });
});
