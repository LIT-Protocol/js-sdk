import { ethers } from "ethers";
import { PKPNFTMetadataData } from "./PKPNFTMetadataData";
import { PKPNFTMetadata } from "./PKPNFTMetadata";

export const getPKPNFTMetadataContract = (provider: any) => {
  return new ethers.Contract(
    PKPNFTMetadataData.address,
    PKPNFTMetadataData.abi,
    provider
  ) as unknown as PKPNFTMetadata;
}
