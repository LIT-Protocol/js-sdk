import {
  getBytes32FromMultihash,
  IPFSHash,
  CIDParser,
} from './getBytes32FromMultihash';
import { CID } from 'multiformats/cid';
describe('getBytes32FromMultihash', () => {
  const cid: CIDParser = CID;

  it('should throw an error if ipfsId is not provided', () => {
    expect(() => {
      getBytes32FromMultihash('', cid);
    }).toThrow('ipfsId is required');
  });

  it('should throw an error if CID parsing fails', () => {
    expect(() => {
      getBytes32FromMultihash(
        'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW',
        {} as CIDParser
      );
    }).toThrow('Error parsing CID');
  });

  it('should return the IPFSHash object', () => {
    const ipfsId = 'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW';
    const result: IPFSHash = getBytes32FromMultihash(ipfsId, cid);

    expect(result).toEqual({
      digest:
        '0xa31a20673be4d3043e6b95ee493efce2ca45dd5df33ebfdb1de72bbc9dd3feeb',
      hashFunction: 18,
      size: 32,
    });
  });
});
