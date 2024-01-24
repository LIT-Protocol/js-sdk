import { sanitizeSiweMessage } from "./siwe";

describe('sanitizeSiweMessage', () => {
  it('should unescape double-escaped newlines', () => {
    const input = 'This is a test\\\\n\\\\nNew line';
    const expectedOutput = 'This is a test\\n\\nNew line';
    expect(sanitizeSiweMessage(input)).toBe(expectedOutput);
  });

  it('should replace escaped double quotes with single quotes', () => {
    const input = 'This is a \\"test\\" string';
    const expectedOutput = "This is a 'test' string";
    expect(sanitizeSiweMessage(input)).toBe(expectedOutput);
  });

  it('should handle strings without escapable characters', () => {
    const input = 'This is a normal string';
    const expectedOutput = 'This is a normal string';
    expect(sanitizeSiweMessage(input)).toBe(expectedOutput);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expectedOutput = '';
    expect(sanitizeSiweMessage(input)).toBe(expectedOutput);
  });

  it('should handle strings with both double-escaped newlines and escaped double quotes', () => {
    const input = 'This \\"is\\" a test\\\\n\\\\nNew line';
    const expectedOutput = "This 'is' a test\\n\\nNew line";
    expect(sanitizeSiweMessage(input)).toBe(expectedOutput);
  });
});