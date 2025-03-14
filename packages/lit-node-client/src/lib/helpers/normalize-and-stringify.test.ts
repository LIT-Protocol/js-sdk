import { normalizeAndStringify } from './normalize-and-stringify';

describe('normalizeAndStringify', () => {
  it('should return a non-JSON string unchanged', () => {
    const input = 'Hello, world!';
    expect(normalizeAndStringify(input)).toBe(input);
  });

  it('should parse and stringify a valid JSON object', () => {
    const input = '{"a": "b"}';
    // JSON.stringify removes spaces so the output will be: {"a":"b"}
    expect(normalizeAndStringify(input)).toBe('{"a":"b"}');
  });

  it('should parse and stringify a valid JSON array', () => {
    const input = '[1, 2, 3]';
    expect(normalizeAndStringify(input)).toBe('[1,2,3]');
  });

  it('should normalize an overly escaped JSON object', () => {
    // The input string is overly escaped.
    // The literal here represents: {\"a\":\"b\"}
    const input = '{\\"a\\":\\"b\\"}';
    expect(normalizeAndStringify(input)).toBe('{"a":"b"}');
  });

  it('should normalize an overly escaped JSON array', () => {
    // The literal represents: [\"a\",\"b\"]
    const input = '[\\"a\\",\\"b\\"]';
    expect(normalizeAndStringify(input)).toBe('["a","b"]');
  });

  it('should return a malformed JSON string as is', () => {
    // Even though it starts with '{', it's not valid JSON and cannot be normalized.
    const input = '{not a json}';
    expect(normalizeAndStringify(input)).toBe(input);
  });

  it('should return an empty string unchanged', () => {
    const input = '';
    expect(normalizeAndStringify(input)).toBe('');
  });

  it('should recursively normalize multiple levels of escaping', () => {
    // This input is escaped twice:
    // The literal represents: {\\\"a\\\":\\\"b\\\"}
    // After one unescape, it becomes: {\"a\":\"b\"} which is still not valid JSON,
    // so it needs a second unescape to yield valid JSON {"a":"b"}.
    const input = '{\\\\\\"a\\\\\\":\\\\\\"b\\\\\\"}';
    expect(normalizeAndStringify(input)).toBe('{"a":"b"}');
  });

  describe('double escaped JSON string', () => {
    test('A doubly escaped JSON string', () => {
      const doublyEscapedJson = '{\\"key\\": \\"value\\"}';
      expect(normalizeAndStringify(doublyEscapedJson)).toBe('{"key":"value"}');
    });

    test('A triply escaped JSON string', () => {
      const triplyEscapedJson = '{\\\\\\"key\\\\\\": \\\\\\"value\\\\\\"}';
      expect(normalizeAndStringify(triplyEscapedJson)).toBe('{"key":"value"}');
    });

    test('A correctly escaped JSON string (for comparison)', () => {
      const correctlyEscapedJson = '{"key":"value"}';
      expect(normalizeAndStringify(correctlyEscapedJson)).toBe(
        '{"key":"value"}'
      );
    });

    test('regular siwe message', () => {
      const regularString =
        'litprotocol.com wants you to sign in with your Ethereum account:\\n0x3edB...';

      expect(normalizeAndStringify(regularString)).toBe(regularString);
    });
  });
});
