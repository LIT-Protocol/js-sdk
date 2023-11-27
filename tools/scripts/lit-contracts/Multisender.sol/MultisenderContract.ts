import { ethers } from 'ethers';
import { MultisenderData } from './MultisenderData';
import { Multisender } from './Multisender';

export const getMultisenderContract = (provider: any) => {
  return new ethers.Contract(
    MultisenderData.address,
    MultisenderData.abi,
    provider
  ) as unknown as Multisender;
};
