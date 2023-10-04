import { ethers } from "ethers";
import { DomainWaleltRegistryData } from "./DomainWaleltRegistryData";
import { DomainWaleltRegistry } from "./DomainWaleltRegistry";

export const getDomainWaleltRegistryContract = (provider: any) => {
  return new ethers.Contract(
    DomainWaleltRegistryData.address,
    DomainWaleltRegistryData.abi,
    provider
  ) as unknown as DomainWaleltRegistry;
}