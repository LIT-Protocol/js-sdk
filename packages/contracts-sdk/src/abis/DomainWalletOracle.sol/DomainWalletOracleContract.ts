import { ethers } from "ethers";
import { DomainWalletOracleData } from "./DomainWalletOracleData";
import { DomainWalletOracle } from "./DomainWalletOracle";

export const getDomainWalletOracleContract = (provider: any) => {
  return new ethers.Contract(
    DomainWalletOracleData.address,
    DomainWalletOracleData.abi,
    provider
  ) as unknown as DomainWalletOracle;
}