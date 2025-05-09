import { ethers } from 'ethers';
import { LitContract } from '@lit-protocol/types';

// Basic context needed by a chain client
export interface LitChainClientContext {
  rpcUrl: string;
  networkName: string; // e.g., "naga-dev"
  provider?: ethers.providers.Provider;
}

// What the chain client might provide regarding contract setups
export interface LitContractSetup {
  [contractName: string]: ethers.Contract;
}

// Data structure for contract ABI and address
export interface ContractDeploymentInfo {
  name: string; // e.g., "Staking", "PubSub"
  address: string;
  abi: any[]; // Consider a more specific ABI type if available
}

// Data returned by a method that fetches all relevant contract deployments for a network
export interface NetworkContractDeployments {
  [contractName: string]: ContractDeploymentInfo;
}
