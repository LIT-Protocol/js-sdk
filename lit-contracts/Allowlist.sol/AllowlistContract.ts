import { ethers } from "ethers";
import { AllowlistData } from "./AllowlistData";
import { Allowlist } from "./Allowlist";

export const getAllowlistContract = (provider: any) => {
  return new ethers.Contract(
    AllowlistData.address,
    AllowlistData.abi,
    provider
  ) as unknown as Allowlist;
}