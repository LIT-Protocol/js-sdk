import { ethers } from 'ethers';
import { PKPPermissionsData } from './PKPPermissionsData.mjs';

export const getPKPPermissionsContract = (provider) =>
  new ethers.Contract(
    PKPPermissionsData.address,
    PKPPermissionsData.abi,
    provider
  );
