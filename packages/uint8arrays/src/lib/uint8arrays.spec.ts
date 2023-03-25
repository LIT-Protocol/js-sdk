import {
  uint8arrayFromString,
  uint8arrayToString,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from './uint8arrays';

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
      const uint8Array = uint8arrayFromString(testCase.str, testCase.encoding as any);
      const decodedStr = uint8arrayToString(uint8Array, testCase.encoding as any);
      expect(decodedStr).toEqual(testCase.str);
    });
  });

  it('should throw an error for an unsupported encoding', () => {
    expect(() =>
      uint8arrayFromString('Hello, World!', 'unsupported' as any)
    ).toThrow();
    expect(() => uint8arrayToString(new Uint8Array(), 'unsupported' as any)).toThrow();
  });
});

describe('Base64 encoding and decoding', () => {
  const testCases = [
    'SGVsbG8sIFdvcmxkIQ==',
    '44GT44KT44Gr44Gh44Gv',
    '8J+klPCfmITwn46T',
    'w7zDp8O8',
  ];

  testCases.forEach((testCase) => {
    test(`encodes and decodes "${testCase}"`, () => {
      const decoded = base64ToUint8Array(testCase);
      const encoded = uint8ArrayToBase64(decoded);
      expect(encoded).toBe(testCase);
    });
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
