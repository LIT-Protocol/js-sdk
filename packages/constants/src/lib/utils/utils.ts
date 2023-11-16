import { ethers } from 'ethers';
import { LIT_EVM_CHAINS } from '../constants/constants';
import { EITHER_TYPE } from '../enums';
import { IEither, ILitError } from '../interfaces/i-errors';

/**
 *
 * This method should be used when there's an expected error
 *
 * @param errorMsg is the error message
 * @returns { IEither }
 */
export function ELeft<T>(errorMsg: ILitError): IEither<T> {
  return {
    type: EITHER_TYPE.ERROR,
    result: errorMsg,
  };
}

/**
 *
 * This method should be used when there's an expected success outcome
 *
 * @param result is the successful return value
 * @returns
 */
export function ERight<T>(result: T): IEither<T> {
  return {
    type: EITHER_TYPE.SUCCESS,
    result,
  };
}

export async function getLatestEthBlockhash(): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(
    LIT_EVM_CHAINS['ethereum'].rpcUrls[1]
  );

  for (let i = 1; i < LIT_EVM_CHAINS['ethereum'].rpcUrls.length; i++) {
    try {
      console.log('Fetching the latest Eth blockhash from RPC- ', i);
      const latestEthBlockhash = (await provider.getBlock("latest")).hash;
      console.log('latestEthBlockhash- ', latestEthBlockhash);

      return latestEthBlockhash;
    } catch (e: any) {
      console.error(
        'Error getting the latest Eth blockhash- ' + i + ', trying again: ',
        e
      );
    }
  }

  throw new Error('Unable to get the latestBlockhash from any RPCs');
}
