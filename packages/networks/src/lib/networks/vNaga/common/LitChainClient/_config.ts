import {
  NagaLocalDevelopNetworkContext,
  nagaLocalDevelopNetworkContext,
} from "../../local-develop/networkContext";

/**
 * Due to the usage of arbitrum stylus contracts,
 * the gas limit is increased by 10% to avoid reverts due to out of gas errors
 */
const GAS_LIMIT_INCREASE_PERCENTAGE = 10;
export const GAS_LIMIT_ADJUSTMENT = BigInt(100 + GAS_LIMIT_INCREASE_PERCENTAGE);

export const LIT_CONTRACT_NAME = {
  PubkeyRouter: "PubkeyRouter",
  PKPNFT: "PKPNFT",
  PKPHelper: "PKPHelper",
  PKPPermissions: "PKPPermissions",
  Staking: "Staking",
} as const;

export const networkContext = nagaLocalDevelopNetworkContext; // we shall change this later
export type NetworkContext = NagaLocalDevelopNetworkContext;
