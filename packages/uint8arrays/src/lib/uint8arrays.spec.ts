import { uint8arrayFromString, uint8arrayToString, base64ToUint8Array } from './uint8arrays';
import { base64StringToBlob } from '@lit-protocol/misc-browser';

describe('Encoding Functions', () => {
  const testCases = [
    { str: 'Hello, World!', encoding: 'utf8' },
    { str: 'こんにちは、世界！', encoding: 'utf8' },
    { str: 'Привет, мир!', encoding: 'utf8' },
    { str: '1234567890', encoding: 'utf8' },
    { str: 'abcdefABCDEF', encoding: 'utf8' },
    { str: '48656c6c6f2c20576f726c6421', encoding: 'base16' },
  ];

  testCases.forEach((testCase) => {
    it(`should encode and decode a string using ${testCase.encoding} encoding`, () => {
      const uint8Array = uint8arrayFromString(
        testCase.str,
        testCase.encoding as any
      );
      const decodedStr = uint8arrayToString(
        uint8Array,
        testCase.encoding as any
      );
      expect(decodedStr).toEqual(testCase.str);
    });
  });

  it('should throw an error for an unsupported encoding', () => {
    expect(() =>
      uint8arrayFromString('Hello, World!', 'unsupported' as any)
    ).toThrow();
    expect(() =>
      uint8arrayToString(new Uint8Array(), 'unsupported' as any)
    ).toThrow();
  });
});

describe('uint8arrayFromString and uint8arrayToString', () => {
  const testCases = [
    { str: 'Hello, World!', encoding: 'utf8' },
    { str: 'こんにちは世界', encoding: 'utf8' },
    { str: '👋🌎', encoding: 'utf8' },
    { str: '48656c6c6f2c20576f726c6421', encoding: 'base16' },
    { str: 'e38182e3818de3818ee381aae38184', encoding: 'base16' },
    { str: 'SGVsbG8sIFdvcmxkIQ==', encoding: 'base64' },
    { str: '44GT44KT44Gr44Gh44Gv', encoding: 'base64' },
  ];

  testCases.forEach(({ str, encoding }) => {
    test(`converts "${str}" with encoding "${encoding}"`, () => {
      const uint8Array = uint8arrayFromString(str, encoding as any);
      const result = uint8arrayToString(uint8Array, encoding as any);
      expect(result).toBe(str);
    });
  });
});

describe('conversion', () => {
  describe('uint8arrayFromString', () => {
    it('converts utf8 string to Uint8Array', () => {
      const str = 'Hello, World!';
      const expectedResult = new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ]);

      const result = uint8arrayFromString(str, 'utf8');

      expect(result).toEqual(expectedResult);
    });

    it('converts base16 string to Uint8Array', () => {
      const str = '48656c6c6f2c20576f726c6421';
      const expectedResult = new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ]);

      const result = uint8arrayFromString(str, 'base16');

      expect(result).toEqual(expectedResult);
    });

    it('converts base64 string to Uint8Array', () => {
      const str = 'SGVsbG8sIFdvcmxkIQ==';
      const expectedResult = new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ]);

      const result = uint8arrayFromString(str, 'base64');

      expect(result).toEqual(expectedResult);
    });

    it('converts base64urlpad string to Uint8Array', () => {
      const str = 'SGVsbG8sIFdvcmxkIQ';
      const expectedResult = new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ]);

      const result = uint8arrayFromString(str, 'base64urlpad');

      expect(result).toEqual(expectedResult);
    });
  });

  describe('uint8arrayToString', () => {
    it('converts Uint8Array to utf8 string', () => {
      const uint8array = new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ]);
      const expectedResult = 'Hello, World!';

      const result = uint8arrayToString(uint8array, 'utf8');

      expect(result).toEqual(expectedResult);
    });

    it('converts Uint8Array to base16 string', () => {
      const uint8array = new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ]);
      const expectedResult = '48656c6c6f2c20576f726c6421';

      const result = uint8arrayToString(uint8array, 'base16');

      expect(result).toEqual(expectedResult);
    });

    describe('base64 ', () => {
      it('encode to base64urlpad should decde', () => {
        // generate a random base64urlpad string of length 1333 (which is equivalent to 1000 bytes when decoded)
        // generate a random Uint8Array of length 1000
        const randomBytes = new Uint8Array(1000);
        for (let i = 0; i < randomBytes.length; i++) {
          randomBytes[i] = Math.floor(Math.random() * 256);
        }

        // Convert the Uint8Array to a base64urlpad string
        const str = uint8arrayToString(randomBytes, 'base64urlpad');
        const blob = new Blob([uint8arrayFromString(str, 'base64urlpad')]);

        expect(blob.size).toBe(1000);
      });

      it('base64 large encoding should decode', () => {
        // generate a random base64urlpad string of length 1333 (which is equivalent to 1000 bytes when decoded)
        // generate a random Uint8Array of length 1000 * 20000
        const randomBytes = new Uint8Array(1000 * 20000);
        for (let i = 0; i < randomBytes.length; i++) {
          randomBytes[i] = Math.floor(Math.random() * 256);
        }

        // Convert the Uint8Array to a base64urlpad string
        const str = uint8arrayToString(randomBytes, 'base64');
        const urlStr = base64StringToBlob(str);

        expect(urlStr.size).toBe(1000 * 20000);
      });
    });

    describe('base64 ', () => {
      // generate a random base64urlpad string of length 1333 (which is equivalent to 1000 bytes when decoded)
      // generate a random Uint8Array of length 1000
      const randomBytes = new Uint8Array(1000);
      for (let i = 0; i < randomBytes.length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }

      // Convert the Uint8Array to a base64urlpad string
      const str = uint8arrayToString(randomBytes, 'base64urlpad');
      const blob = new Blob([uint8arrayFromString(str, 'base64urlpad')]);

      expect(blob.size).toBe(1000);
    });
  });
});

describe('turn to base64urlpad', () => {
  it('should decrypt a file', async () => {
    const u8a = uint8arrayFromString('Hello, World!', 'utf8');

    // blobToBase64String
    const base64 = uint8arrayToString(u8a, 'base64urlpad');

    expect(base64).toBe('SGVsbG8sIFdvcmxkIQ');
  });
});
