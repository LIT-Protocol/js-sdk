import { ethers } from 'ethers';
import { StakingBalancesData } from './StakingBalancesData.js';

export const getStakingBalancesContract = (provider) =>
  new ethers.Contract(
    StakingBalancesData.address,
    StakingBalancesData.abi,
    provider
  );
