import { ethers } from "ethers";
import { DomainWaleltRegistryData } from "./DomainWaleltRegistryData.js";

export const getDomainWaleltRegistryContract = (provider) => new ethers.Contract(
  DomainWaleltRegistryData.address,
  DomainWaleltRegistryData.abi,
  provider
);