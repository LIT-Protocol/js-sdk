import { ethers } from "ethers";
import { MultisenderData } from "./MultisenderData.js";

export const getMultisenderContract = (provider) => new ethers.Contract(
  MultisenderData.address,
  MultisenderData.abi,
  provider
);