import { ethers } from "ethers";
import { DomainWalletOracleData } from "./DomainWalletOracleData.mjs";

export const getDomainWalletOracleContract = (provider) => new ethers.Contract(
  DomainWalletOracleData.address,
  DomainWalletOracleData.abi,
  provider
);