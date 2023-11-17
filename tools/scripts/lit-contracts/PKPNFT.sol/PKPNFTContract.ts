import { ethers } from "ethers";
import { PKPNFTData } from "./PKPNFTData";
import { PKPNFT } from "./PKPNFT";

export const getPKPNFTContract = (provider: any) => {
  return new ethers.Contract(
    PKPNFTData.address,
    PKPNFTData.abi,
    provider
  ) as unknown as PKPNFT;
}