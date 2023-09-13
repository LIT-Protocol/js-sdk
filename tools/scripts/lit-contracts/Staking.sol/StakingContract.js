import { ethers } from "ethers";
import { StakingData } from "./StakingData.js";

export const getStakingContract = (provider) => new ethers.Contract(
  StakingData.address,
  StakingData.abi,
  provider
);