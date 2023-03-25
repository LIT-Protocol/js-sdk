import { uint8arrayFromString, uint8arrayToString } from './uint8arrays';

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
      const uint8Array = uint8arrayFromString(testCase.str, testCase.encoding);
      const decodedStr = uint8arrayToString(uint8Array, testCase.encoding);
      expect(decodedStr).toEqual(testCase.str);
    });
  });

  it('should throw an error for an unsupported encoding', () => {
    expect(() =>
      uint8arrayFromString('Hello, World!', 'unsupported')
    ).toThrow();
    expect(() => uint8arrayToString(new Uint8Array(), 'unsupported')).toThrow();
  });
});
