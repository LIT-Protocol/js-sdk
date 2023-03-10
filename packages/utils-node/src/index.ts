import { isBrowser, isNode } from '@lit-protocol/misc';
import pinataInstanceType from '@pinata/sdk';
import * as pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

type UploadToIPFSProps = {
  nodeService: 'ipfs' | 'pinata' | 'infura',
  data: any,
  config: {
    API: string,
    SECRET_KEY: string,
  },
};

type PinataResponse = {
  status: number,
  data: any,
};

/**
 * Pin a string to IPFS using pinata
 * @param string - string to pin
 * @param { pinataSDK } pinata pinata sdk instance
 * @returns data - response from pinata
 */
export const pinStringToIPFS = async (
  string: string,
  pinata: pinataInstanceType
): Promise<PinataResponse> => {
  let data: any;

  try {
    const buffer = Buffer.from(string, 'utf8');
    const stream = Readable.from(buffer);

    // @ts-ignore
    stream.path = 'string.txt';

    const res = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: 'test' },
    });
    data = { status: 200, data: res };
  } catch (error) {
    data = { status: 500, data: error };
  }
  return data;
};

export const uploadToIpfs = (
  params: UploadToIPFSProps
): Promise<PinataResponse> => {
  if (params.nodeService !== 'pinata') {
    throw new Error('Sorry. We only support pinata for now.');
  }

  //   Warning: This is a security risk. Please use environment variables instead.
  if (params.config.API || params.config.SECRET_KEY) {
    if (isBrowser()) {
      console.warn(
        'YOUR API KEY AND SECRET KEY ARE BEING EXPOSED TO THE PUBLIC. PLEASE USE ENVIRONMENT VARIABLES INSTEAD.'
      );
    }
  }

  //   Try to get API key and secret key from environment variables if not provided in config
  if (!params.config.API || !params.config.SECRET_KEY) {
    if (isNode()) {
      // @ts-ignore
      if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
        // @ts-ignore
        params.config.API = process.env.PINATA_API_KEY;
        // @ts-ignore
        params.config.SECRET_KEY = process.env.PINATA_SECRET_API_KEY;
      } else {
        throw new Error('Please provide your pinata API key and secret key');
      }
    } else {
      throw new Error('Please provide your pinata API key and secret key');
    }
  }

  //   @ts-ignore
  let pinataInstance = new pinataSDK(
    params.config.API,
    params.config.SECRET_KEY
  );

  if (typeof params.data === 'string') {
    return pinStringToIPFS(params.data, pinataInstance);
  }

  throw new Error('Sorry. We only support string for now.');
};
