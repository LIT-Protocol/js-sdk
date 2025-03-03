import { numberToHex, hexPrefixed, removeHexPrefix } from './hex';

describe('Hex Helpers', () => {
  describe('numberToHex', () => {
    it('should convert a number to a hex string prefixed with 0x', () => {
      expect(numberToHex(255)).toBe('0xff');
    });

    it('should convert zero correctly', () => {
      expect(numberToHex(0)).toBe('0x0');
    });

    it('should convert a larger number correctly', () => {
      expect(numberToHex(4095)).toBe('0xfff');
    });
  });

  describe('hexPrefixed', () => {
    it('should return the string unchanged if it already has 0x prefix', () => {
      expect(hexPrefixed('0xabcdef')).toBe('0xabcdef');
    });

    it('should add 0x prefix if not present', () => {
      expect(hexPrefixed('abcdef')).toBe('0xabcdef');
    });

    it('should add 0x prefix to an empty string', () => {
      expect(hexPrefixed('')).toBe('0x');
    });
  });

  describe('removeHexPrefix', () => {
    it('should remove the hex prefix from a string that starts with 0x', () => {
      const input = '0xabcdef';
      const expectedOutput = 'abcdef';
      expect(removeHexPrefix(input)).toBe(expectedOutput);
    });

    it('should return the string unchanged if no 0x prefix is present', () => {
      const input = 'abcdef';
      const expectedOutput = 'abcdef';
      expect(removeHexPrefix(input)).toBe(expectedOutput);
    });

    it('should not remove prefix if it is uppercase 0X (not valid)', () => {
      // The helper checks only for lowercase '0x'
      const input = '0XABCDEF';
      expect(removeHexPrefix(input)).toBe('0XABCDEF');
    });

    it('should handle an empty string', () => {
      expect(removeHexPrefix('')).toBe('');
    });
  });
});
