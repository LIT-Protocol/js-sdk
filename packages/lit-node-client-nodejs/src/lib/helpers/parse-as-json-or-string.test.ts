import { parseAsJsonOrString } from './parse-as-json-or-string';

describe('parseAsJsonOrString', () => {
  it('should parse a valid JSON response', () => {
    const responseString = '{"message": "Hello, World!"}';
    const expectedResponse = { message: 'Hello, World!' };

    const result = parseAsJsonOrString(responseString);

    expect(result).toEqual(expectedResponse);
  });

  it('should return the response as string if parsing fails', () => {
    const responseString = 'abcdefg';
    const expectedResponse = 'abcdefg';

    const result = parseAsJsonOrString(responseString);

    expect(result).toEqual(expectedResponse);
  });
});
