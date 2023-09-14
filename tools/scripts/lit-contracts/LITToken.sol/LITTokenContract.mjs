import { ethers } from "ethers";
import { LITTokenData } from "./LITTokenData.mjs";

export const getLITTokenContract = (provider) => new ethers.Contract(
  LITTokenData.address,
  LITTokenData.abi,
  provider
);