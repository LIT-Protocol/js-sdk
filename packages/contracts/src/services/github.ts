/**
 * GitHub Service
 * Handles all GitHub API interactions
 */
import {
  GITHUB_API_BASE,
  USERNAME,
  NETWORK_PATHS,
  NETWORKS_REPO,
  LIT_ASSETS_REPO,
} from '../config/networks';
import type {
  NetworkName,
  ProdNetworkName,
  DevNetworkName,
} from '../config/networks';
import type { NetworkPaths } from '../types/contracts';

export class GitHubService {
  public readonly headers: HeadersInit;
  private networkPaths: Record<string, NetworkPaths> = {};

  constructor(apiKey: string) {
    this.headers = {
      Authorization: `token ${apiKey}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  /**
   * Creates the GitHub API path for fetching contract data
   */
  createGitHubPath(
    contentPath: string,
    branch: string,
    network: NetworkName,
    isProd: boolean
  ): string {
    const repoName = isProd ? NETWORKS_REPO : LIT_ASSETS_REPO;

    // Get the full content path based on environment and network
    const fullPath = isProd
      ? NETWORK_PATHS.prod.getContentPath(
          network as ProdNetworkName,
          contentPath
        )
      : NETWORK_PATHS.dev.getContentPath(
          network as DevNetworkName,
          contentPath
        );
    const githubPath = `${GITHUB_API_BASE}/${USERNAME}/${repoName}/contents/${fullPath}?ref=${branch}`;

    this.trackNetworkPath(network, 'abis', githubPath);
    return githubPath;
  }

  /**
   * Fetches the last modified date for a file from GitHub
   */
  async getLastModified(
    filePath: string,
    network: NetworkName | 'develop'
  ): Promise<string | null> {
    console.log(`📅 [${network}] Fetching last modified date for: ${filePath}`);

    try {
      const fileAPI = `${GITHUB_API_BASE}/${USERNAME}/${NETWORKS_REPO}/commits?path=${filePath}`;
      const response = await fetch(fileAPI, { headers: this.headers });
      const commits: any = await response.json();

      if (!commits.length) {
        console.error(
          `❌ [${network}] No commit history found for ${filePath}`
        );
        return null;
      }

      return commits[0].commit.author.date;
    } catch (error: any) {
      console.error(
        `❌ [${network}] Failed to fetch last modified date: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Tracks network paths for summary
   */
  trackNetworkPath(
    network: string,
    type: keyof Omit<NetworkPaths, 'error' | 'status'>,
    path: string
  ): void {
    if (!this.networkPaths[network]) {
      this.networkPaths[network] = {
        abis: '',
        deployedContracts: '',
        status: 'success',
      };
    }
    this.networkPaths[network][type] = path;
  }

  /**
   * Tracks network error
   */
  trackNetworkError(network: string, error: string): void {
    if (!this.networkPaths[network]) {
      this.networkPaths[network] = {
        abis: '',
        deployedContracts: '',
        status: 'error',
      };
    }
    this.networkPaths[network].error = error;
    this.networkPaths[network].status = 'error';
  }

  /**
   * Gets the network paths summary
   */
  getNetworkPaths(): Record<string, NetworkPaths> {
    return this.networkPaths;
  }
}
