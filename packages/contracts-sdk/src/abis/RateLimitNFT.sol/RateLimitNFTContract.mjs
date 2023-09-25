import { ethers } from "ethers";
import { RateLimitNFTData } from "./RateLimitNFTData.mjs";

export const getRateLimitNFTContract = (provider) => new ethers.Contract(
  RateLimitNFTData.address,
  RateLimitNFTData.abi,
  provider
);