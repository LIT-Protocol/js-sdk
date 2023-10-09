import { ethers } from "ethers";
import { DomainWalletOracleData } from "./DomainWalletOracleData.js";

export const getDomainWalletOracleContract = (provider) => new ethers.Contract(
  DomainWalletOracleData.address,
  DomainWalletOracleData.abi,
  provider
);