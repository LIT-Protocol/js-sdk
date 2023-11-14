import { ethers } from "ethers";
import { PubkeyRouterData } from "./PubkeyRouterData.js";

export const getPubkeyRouterContract = (provider) => new ethers.Contract(
  PubkeyRouterData.address,
  PubkeyRouterData.abi,
  provider
);