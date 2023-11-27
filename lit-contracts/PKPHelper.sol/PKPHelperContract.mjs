import { ethers } from 'ethers';
import { PKPHelperData } from './PKPHelperData.mjs';

export const getPKPHelperContract = (provider) =>
  new ethers.Contract(PKPHelperData.address, PKPHelperData.abi, provider);
