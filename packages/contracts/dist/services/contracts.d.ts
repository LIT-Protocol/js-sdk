import type { ProdNetworkName, DevNetworkName } from "../config/networks";
import type { ContractData } from "../types/contracts";
import { GitHubService } from "./github";
export declare class ContractService {
    private githubService;
    constructor(githubService: GitHubService);
    /**
     * Processes contract ABIs for production networks
     */
    getProdContractABIs(network: ProdNetworkName): Promise<ContractData[]>;
    /**
     * Processes contract ABIs for development
     */
    getDevContractABIs(network?: DevNetworkName): Promise<ContractData[]>;
    /**
     * Updates the contract cache for a production network
     */
    updateProdCache(network: ProdNetworkName): Promise<void>;
    /**
     * Updates the contract cache for development networks
     */
    updateDevCache(): Promise<void>;
    /**
     * Builds network cache from contract data
     */
    private buildNetworkCache;
    /**
     * Writes network cache to file
     */
    private writeNetworkCache;
    /**
     * Extracts the path after 'main' from a GitHub URL
     */
    private extractPathAfterMain;
}
