import { ethers } from "ethers";
import { PubkeyRouterData } from "./PubkeyRouterData";
import { PubkeyRouter } from "./PubkeyRouter";

export const getPubkeyRouterContract = (provider: any) => {
  return new ethers.Contract(
    PubkeyRouterData.address,
    PubkeyRouterData.abi,
    provider
  ) as unknown as PubkeyRouter;
}