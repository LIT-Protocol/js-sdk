import { ethers } from 'ethers';
import { PKPHelperData } from './PKPHelperData.js';

export const getPKPHelperContract = (provider) =>
  new ethers.Contract(PKPHelperData.address, PKPHelperData.abi, provider);
