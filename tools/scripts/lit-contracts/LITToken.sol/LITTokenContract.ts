import { ethers } from 'ethers';
import { LITTokenData } from './LITTokenData';
import { LITToken } from './LITToken';

export const getLITTokenContract = (provider: any) => {
  return new ethers.Contract(
    LITTokenData.address,
    LITTokenData.abi,
    provider
  ) as unknown as LITToken;
};
