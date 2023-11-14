import { ethers } from "ethers";
import { AllowlistData } from "./AllowlistData.mjs";

export const getAllowlistContract = (provider) => new ethers.Contract(
  AllowlistData.address,
  AllowlistData.abi,
  provider
);