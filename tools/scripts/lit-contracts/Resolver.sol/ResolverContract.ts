import { ethers } from "ethers";
import { ResolverData } from "./ResolverData";
import { Resolver } from "./Resolver";

export const getResolverContract = (provider: any) => {
  return new ethers.Contract(
    ResolverData.address,
    ResolverData.abi,
    provider
  ) as unknown as Resolver;
}