import type { NetworkName } from "../config/networks";
import type { NetworkPaths } from "../types/contracts";
export declare class GitHubService {
    readonly headers: HeadersInit;
    private networkPaths;
    constructor(apiKey: string);
    /**
     * Creates the GitHub API path for fetching contract data
     */
    createGitHubPath(contentPath: string, branch: string, network: NetworkName, isProd: boolean): string;
    /**
     * Fetches the last modified date for a file from GitHub
     */
    getLastModified(filePath: string, network: NetworkName | "develop"): Promise<string | null>;
    /**
     * Tracks network paths for summary
     */
    trackNetworkPath(network: string, type: keyof Omit<NetworkPaths, "error" | "status">, path: string): void;
    /**
     * Tracks network error
     */
    trackNetworkError(network: string, error: string): void;
    /**
     * Gets the network paths summary
     */
    getNetworkPaths(): Record<string, NetworkPaths>;
}
