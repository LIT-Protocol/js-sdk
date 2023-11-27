import { ethers } from 'ethers';
import { StakingBalancesData } from './StakingBalancesData';
import { StakingBalances } from './StakingBalances';

export const getStakingBalancesContract = (provider: any) => {
  return new ethers.Contract(
    StakingBalancesData.address,
    StakingBalancesData.abi,
    provider
  ) as unknown as StakingBalances;
};
