export interface NetworkCache {
    config?: {
        chainId?: string;
        rpcUrl?: string;
        chainName?: string;
        litNodeDomainName?: string;
        litNodePort?: number;
        rocketPort?: number;
    };
    data: Array<{
        name: string;
        contracts: Array<{
            network: string;
            address_hash: string;
            inserted_at: string;
            ABI: any[];
        }>;
    }>;
}
export interface NetworkPaths {
    abis: string;
    deployedContracts: string;
    error?: string;
    status: "success" | "error";
}
export interface ContractData {
    name: string;
    contractName?: string;
    data: any;
}
