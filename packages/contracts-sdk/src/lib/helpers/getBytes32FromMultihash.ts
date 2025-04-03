import {
  InvalidArgumentException,
  ParamsMissingError,
} from '@lit-protocol/constants';

export interface IPFSHash {
  digest: string;
  hashFunction: number;
  size: number;
}

export interface CIDParser {
  parse: (ipfsId: string) => {
    multihash: {
      code: number;
      size: number;
      digest: Uint8Array;
    };
  };
}
/**
 * NOTE: This function requires the "multiformats/cid" package in order to work
 *
 * Partition multihash string into object representing multihash
 *
 * @param {string} ipfsId A base58 encoded multihash string
 * @param {CIDParser} CID The CID object from the "multiformats/cid" package
 *
 * @example
 * const CID = require('multiformats/cid')
 * const ipfsId = 'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW'
 * const {digest, hashFunction, size} = getBytes32FromMultihash(ipfsId, CID)
 *
 * @returns {IPFSHash}
 */
export const getBytes32FromMultihash = (
  ipfsId: string,
  CID: CIDParser
): IPFSHash => {
  if (!CID) {
    throw new ParamsMissingError(
      {
        info: {
          ipfsId,
          CID,
        },
      },
      'CID is required. Please import from "multiformats/cid" package, and pass the CID object to the function.'
    );
  }

  if (!ipfsId) {
    throw new ParamsMissingError(
      {
        info: {
          ipfsId,
        },
      },
      'ipfsId is required'
    );
  }

  let cid;
  try {
    cid = CID.parse(ipfsId);
  } catch (e) {
    throw new InvalidArgumentException(
      {
        info: {
          ipfsId,
          CID,
        },
      },
      'Error parsing CID'
    );
  }

  const hashFunction = cid.multihash.code;
  const size = cid.multihash.size;
  const digest = '0x' + Buffer.from(cid.multihash.digest).toString('hex');

  const ipfsHash: IPFSHash = {
    digest,
    hashFunction,
    size,
  };

  return ipfsHash;
};
