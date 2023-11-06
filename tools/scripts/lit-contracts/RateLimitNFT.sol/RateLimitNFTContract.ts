import { ethers } from 'ethers';
import { RateLimitNFTData } from './RateLimitNFTData';
import { RateLimitNFT } from './RateLimitNFT';

export const getRateLimitNFTContract = (provider: any) => {
  return new ethers.Contract(
    RateLimitNFTData.address,
    RateLimitNFTData.abi,
    provider
  ) as unknown as RateLimitNFT;
};
