import { ethers } from "ethers";
import { PKPPermissionsData } from "./PKPPermissionsData.js";

export const getPKPPermissionsContract = (provider) => new ethers.Contract(
  PKPPermissionsData.address,
  PKPPermissionsData.abi,
  provider
);