import { ethers } from "ethers";
import { ResolverData } from "./ResolverData.mjs";

export const getResolverContract = (provider) => new ethers.Contract(
  ResolverData.address,
  ResolverData.abi,
  provider
);