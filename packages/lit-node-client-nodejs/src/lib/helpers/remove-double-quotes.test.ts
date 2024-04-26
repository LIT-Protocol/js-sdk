import { removeDoubleQuotes } from './remove-double-quotes';

describe('removeDoubleQuotes', () => {
  it('should remove double quotes from string values in the object', () => {
    const obj = {
      key1: {
        subkey1: '"value1"',
        subkey2: '"value2"',
      },
      key2: {
        subkey3: 'value3"',
      },
      key3: {
        subkey3: '"""""value3"""""',
      },
    };

    const expectedObj = {
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
      key2: {
        subkey3: 'value3',
      },
      key3: {
        subkey3: 'value3',
      },
    };

    const result = removeDoubleQuotes(obj);

    expect(result).toEqual(expectedObj);
  });

  it('should not modify the object if there are no string values with double quotes', () => {
    const obj = {
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
      key2: {
        subkey3: 'value3',
      },
    };

    const result = removeDoubleQuotes(obj);

    expect(result).toEqual(obj);
  });
});
