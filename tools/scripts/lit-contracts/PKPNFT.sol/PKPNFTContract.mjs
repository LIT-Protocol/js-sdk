import { ethers } from "ethers";
import { PKPNFTData } from "./PKPNFTData.mjs";

export const getPKPNFTContract = (provider) => new ethers.Contract(
  PKPNFTData.address,
  PKPNFTData.abi,
  provider
);