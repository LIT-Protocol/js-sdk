import { ethers } from 'ethers';
import { PKPPermissionsData } from './PKPPermissionsData';
import { PKPPermissions } from './PKPPermissions';

export const getPKPPermissionsContract = (provider: any) => {
  return new ethers.Contract(
    PKPPermissionsData.address,
    PKPPermissionsData.abi,
    provider
  ) as unknown as PKPPermissions;
};
