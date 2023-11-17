import { ethers } from "ethers";
import { StakingData } from "./StakingData";
import { Staking } from "./Staking";

export const getStakingContract = (provider: any) => {
  return new ethers.Contract(
    StakingData.address,
    StakingData.abi,
    provider
  ) as unknown as Staking;
}