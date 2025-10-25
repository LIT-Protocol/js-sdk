import { getIpfsId } from './getIpfsId';

const encoder = new TextEncoder();

describe('getIpfsId', () => {
  it('creates a CIDv0 for string input', async () => {
    await expect(getIpfsId('hello')).resolves.toBe(
      'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
    );
  });

  it('creates the same CIDv0 for byte input', async () => {
    const bytes = encoder.encode('hello');
    await expect(getIpfsId(bytes)).resolves.toBe(
      'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
    );
  });

  it('throws when input type is unsupported', async () => {
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getIpfsId(123 as any)
    ).rejects.toThrow(/ArrayBufferView/);
  });
});
