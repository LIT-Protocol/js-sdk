import { encodeCode } from './encode-code';

describe('encodeCode', () => {
  it('should encode a string to base64', () => {
    const code = 'console.log("Hello, World!")';
    const encodedCode = encodeCode(code);

    expect(encodedCode).toEqual('Y29uc29sZS5sb2coIkhlbGxvLCBXb3JsZCEiKQ==');
  });

  it('should handle empty string', () => {
    const code = '';
    const encodedCode = encodeCode(code);

    expect(encodedCode).toEqual('');
  });

  it('should handle special characters', () => {
    const code = 'const x = 10 + 5 - 3 * 2 / 1;';
    const encodedCode = encodeCode(code);

    expect(encodedCode).toEqual('Y29uc3QgeCA9IDEwICsgNSAtIDMgKiAyIC8gMTs=');
  });

  it('should handle non-ASCII characters', () => {
    const code = 'const name = "Jérémy";';
    const encodedCode = encodeCode(code);

    expect(encodedCode).toEqual('Y29uc3QgbmFtZSA9ICJKw6lyw6lteSI7');
  });
});
