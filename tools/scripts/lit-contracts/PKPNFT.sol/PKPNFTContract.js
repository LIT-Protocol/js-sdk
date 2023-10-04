import { ethers } from "ethers";
import { PKPNFTData } from "./PKPNFTData.js";

export const getPKPNFTContract = (provider) => new ethers.Contract(
  PKPNFTData.address,
  PKPNFTData.abi,
  provider
);