import { ethers } from 'ethers';
import { AllowlistData } from './AllowlistData.js';

export const getAllowlistContract = (provider) =>
  new ethers.Contract(AllowlistData.address, AllowlistData.abi, provider);
