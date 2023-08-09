import { CID } from 'blockstore-core/dist/src/base';
import { BaseIPFSProvider } from './BaseIPFSProvider';
import { isBrowser, isNode, log } from '../../utils';
import { EncryptResponse } from '@lit-protocol/types';
import { EncryptionMetadata } from '../../types';
import {
  createPayload,
  fetchIPFSContent,
} from '../utils/ipfs-provider-sdk-helper';

export class PinataProvider extends BaseIPFSProvider {
  private _JWT: string;

  constructor({ JWT }: { JWT: string }) {
    super('pinata');

    // -- validate
    if (!JWT) throw new Error('JWT is required');

    // -- set
    this._JWT = JWT;

    log.info('🚀 PinataProvider: initialised!');
  }

  override async set(serialisedData: string): Promise<{
    IPFSHash: string;
    raw: any;
  }> {
    log.start('PinataProvider - store', 'uploading data to IPFS...');

    let data: any;

    const { payload, boundary } = createPayload(serialisedData);

    try {
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          authorization: `Bearer ${this._JWT}`,
        },
        body: payload,
      };

      const res = await fetch(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        options
      );

      data = await res.json();
    } catch (error) {
      log.throw('PinataProvider - store', error);
    }

    log.info('data:', data);

    log.end('PinataProvider - store', 'uploaded data to IPFS!');
    return data;
  }

  override async get(immutableAddress: string): Promise<
    | string
    | {
        encryptResponse: EncryptResponse;
        metaData: EncryptionMetadata;
      }
  > {
    return await fetchIPFSContent(immutableAddress);
  }
}

// -- Test code
// const ipfsHash = await Lit.persistentStorage.store('HELLO MOTO');
// console.log("IPFSHash:", ipfsHash.toString());
// const res = await Lit.persistentStorage.retrieve(ipfsHash);
// console.log(res);
