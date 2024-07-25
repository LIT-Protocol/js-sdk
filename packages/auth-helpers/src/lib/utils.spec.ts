import { formaPKPResource } from './utils'; // Adjust the import path as necessary

describe('formaPKPResource', () => {
  it('should remove the 0x prefix', () => {
    const resource = '0x123abc';
    const result = formaPKPResource(resource);
    expect(result).toBe(
      '0000000000000000000000000000000000000000000000000000000000123abc'
    );
    expect(result.length).toBe(64);
  });

  it('should pad the resource to 64 hex characters when length is less', () => {
    const resource = '123abc';
    const result = formaPKPResource(resource);
    expect(result).toBe(
      '0000000000000000000000000000000000000000000000000000000000123abc'
    );
    expect(result.length).toBe(64);
  });

  it('should not alter a valid 64-character hex string', () => {
    const resource =
      '123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123a';
    const result = formaPKPResource(resource);
    expect(result).toBe(resource);
    expect(result.length).toBe(64);
  });

  it('should return the same string if input is a wildcard "*"', () => {
    const resource = '*';
    const result = formaPKPResource(resource);
    expect(result).toBe('*');
    expect(result.length).toBe(1);
  });

  it('should return the original string for invalid hex characters', () => {
    const resource = 'xyz123';
    const result = formaPKPResource(resource);
    expect(result).toBe('xyz123');
    expect(result.length).toBe(6);
  });

  it('should not alter a string that is exactly 64 hex characters', () => {
    const resource = 'a'.repeat(64);
    const result = formaPKPResource(resource);
    expect(result).toBe(resource);
    expect(result.length).toBe(64);
  });

  it('should handle hex strings shorter than 64 characters correctly', () => {
    const resource = '1';
    const result = formaPKPResource(resource);
    expect(result).toBe(
      '0000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(result.length).toBe(64);
  });

  it('should return a 64-character string when input contains non-hex characters but matches hex pattern partially', () => {
    const resource = '123xyz';
    const result = formaPKPResource(resource);
    expect(result).toBe('123xyz');
    expect(result.length).toBe(6);
  });

  it('should throw an error if the input exceeds 64 characters', () => {
    const resource = '1'.repeat(70);
    expect(() => formaPKPResource(resource)).toThrowError(
      'Resource ID exceeds 64 characters (32 bytes) in length.'
    );
  });
});
