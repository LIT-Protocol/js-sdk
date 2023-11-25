import { ethers } from 'ethers';
import { MultisenderData } from './MultisenderData.mjs';

export const getMultisenderContract = (provider) =>
  new ethers.Contract(MultisenderData.address, MultisenderData.abi, provider);
