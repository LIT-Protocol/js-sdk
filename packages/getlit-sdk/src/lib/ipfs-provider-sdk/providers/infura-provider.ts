import { EncryptResponse } from '@lit-protocol/types';
import { log } from '../../utils';
import { BaseIPFSProvider } from './BaseIPFSProvider';
import { EncryptionMetadata } from '../../types';
import { createPayload } from '../utils/ipfs-provider-sdk-helper';

export class infuraProvider extends BaseIPFSProvider {
  private _API_KEY: string;
  private _API_KEY_SECRET: string;

  constructor({
    API_KEY,
    API_KEY_SECRET,
  }: {
    API_KEY: string;
    API_KEY_SECRET: string;
  }) {
    super('infura');
    this._API_KEY = API_KEY;
    this._API_KEY_SECRET = API_KEY_SECRET;

    if (!this._API_KEY) {
      throw new Error('API_KEY is required');
    }

    if (!this._API_KEY_SECRET) {
      throw new Error('API_KEY_SECRET is required');
    }

    log.info('🚀 infuraProvider: initialised!');
  }

  override async set(
    serialisedData: string,
    opts?: {
      infuraURL?: string;
      CIDVersion?: number;
      pin?: boolean;
      hash?: string;
    }
  ): Promise<{ IPFSHash: string; raw: any }> {
    // -- params
    const infuraURL =
      opts?.infuraURL ?? 'https://ipfs.infura.io:5001/api/v0/add';
    const CIDVersion = opts?.CIDVersion ?? 1;
    const pin = opts?.pin ?? true;
    const hash = opts?.hash ?? 'sha2-256';

    const { payload, boundary } = createPayload(serialisedData);

    let data: any;

    try {
      const url = `${infuraURL}?pin=${pin}&cid-version=${CIDVersion}&hash=${hash}}`;

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          authorization: `Basic ${Buffer.from(
            `${this._API_KEY}:${this._API_KEY_SECRET}`
          ).toString('base64')}`,
        },
        body: payload,
      };

      const res = await fetch(url, options);

      // -- check status
      if (res.status !== 200) {
        log.throw(
          `InfuraProvider - store - status: ${res.status} - ${res.statusText}`
        );
      }

      data = await res.json();
    } catch (error) {
      log.throw('InfuraProvider - store', error);
    }

    return {
      IPFSHash: data.Hash,
      raw: data,
    };
  }

  override async get(immutableAddress: string): Promise<
    | string
    | {
        encryptResponse: EncryptResponse;
        metaData: EncryptionMetadata;
      }
  > {
    // fetch the content from https://ipfs.io/ipfs/${immutableAddress}

    let res;

    try {
      res = await fetch(`https://ipfs.io/ipfs/${immutableAddress}`);
    } catch (e) {
      log.throw('InfuraProvider - get', e);
    }

    let data;

    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }

    return data;
  }
}
