import { ethers } from 'ethers';
import { PKPHelperData } from './PKPHelperData';
import { PKPHelper } from './PKPHelper';

export const getPKPHelperContract = (provider: any) => {
  return new ethers.Contract(
    PKPHelperData.address,
    PKPHelperData.abi,
    provider
  ) as unknown as PKPHelper;
};
