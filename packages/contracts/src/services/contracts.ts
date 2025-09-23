/**
 * Contract Service
 * Handles contract data processing and caching
 */
import * as fs from 'fs';
import { CONTRACT_NAME_MAP, ENV_CONFIG, NETWORKS } from '../config/networks';
import type { ProdNetworkName, DevNetworkName } from '../config/networks';
import type { ContractData, NetworkCache } from '../types/contracts';
import { formatNetworkName } from '../utils/format';
import { GitHubService } from './github';

export class ContractService {
  constructor(private githubService: GitHubService) {}

  /**
   * Processes contract ABIs for production networks
   */
  async getProdContractABIs(network: ProdNetworkName): Promise<ContractData[]> {
    console.log(`\n📦 [${network}] Production ABI Source Information:`);
    console.log(`   Repository: networks repo`);
    console.log(`   Branch: main`);
    console.log(`   Path: ${ENV_CONFIG.prod.path}`);

    const path = this.githubService.createGitHubPath(
      ENV_CONFIG.prod.path,
      'main',
      network,
      true
    );
    console.log(`   API URL: ${path}`);

    const filesRes = await fetch(path, { headers: this.githubService.headers });
    const files: any = await filesRes.json();

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error(`No contract files found for network: ${network}`);
    }

    console.log(`   Found ${files.length} contract files\n`);
    const contractsData = [];

    for (const file of files) {
      const name = file.name.replace(ENV_CONFIG.prod.fileExtensionToRemove, '');

      if (!Object.values(CONTRACT_NAME_MAP).includes(name)) {
        continue;
      }

      console.log(`📄 [${network}] Processing contract: ${name}`);
      console.log(`     File URL: ${file.download_url}`);

      const fileRes = await fetch(file.download_url, {
        headers: this.githubService.headers,
      });
      const fileData: any = await fileRes.json();

      const data =
        ENV_CONFIG.prod.abiSourceInJson.length > 0
          ? ENV_CONFIG.prod.abiSourceInJson.reduce(
              (acc, key) => acc[key],
              fileData
            )
          : fileData;

      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error(
          `Empty ABI found for contract: ${name} in network: ${network}`
        );
      }

      console.log(
        `     ABI Methods: ${Array.isArray(data) ? data.length : 'N/A'}`
      );
      contractsData.push({ name, contractName: fileData.contractName, data });
    }

    if (contractsData.length === 0) {
      throw new Error(`No valid contracts found for network: ${network}`);
    }

    console.log(
      `✅ [${network}] Successfully processed ${contractsData.length} contracts`
    );
    return contractsData;
  }

  /**
   * Processes contract ABIs for development
   */
  async getDevContractABIs(
    network: DevNetworkName = 'develop'
  ): Promise<ContractData[]> {
    console.log(`\n📦 [${network}] Development ABI Source Information:`);
    console.log(`   Repository: lit-assets repo`);
    console.log(`   Branch: ${process.env.DEV_BRANCH}`);
    console.log(`   Path: ${ENV_CONFIG.dev.path}`);

    const path = this.githubService.createGitHubPath(
      ENV_CONFIG.dev.path,
      process.env.DEV_BRANCH || 'develop',
      network,
      false
    );
    console.log(`   API URL: ${path}`);

    const filesRes = await fetch(path, { headers: this.githubService.headers });
    const files: any = await filesRes.json();

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error(`No contract files found for network: ${network}`);
    }

    console.log(`   Found ${files.length} contract files\n`);
    const contractsData = [];

    for (const file of files) {
      const name = file.name.replace(ENV_CONFIG.dev.fileExtensionToRemove, '');

      if (!Object.values(CONTRACT_NAME_MAP).includes(name)) {
        continue;
      }

      console.log(`📄 [${network}] Processing contract: ${name}`);
      console.log(`   File URL: ${file.download_url}`);

      const fileRes = await fetch(file.download_url, {
        headers: this.githubService.headers,
      });
      const fileData: any = await fileRes.json();

      const data =
        ENV_CONFIG.dev.abiSourceInJson.length > 0
          ? ENV_CONFIG.dev.abiSourceInJson.reduce(
              (acc, key) => acc[key],
              fileData
            )
          : fileData;

      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error(
          `Empty ABI found for contract: ${name} in network: ${network}`
        );
      }

      console.log(
        `   ABI Methods: ${Array.isArray(data) ? data.length : 'N/A'}`
      );
      contractsData.push({ name, contractName: fileData.contractName, data });
    }

    if (contractsData.length === 0) {
      throw new Error(`No valid contracts found for network: ${network}`);
    }

    console.log(
      `✅ [${network}] Successfully processed ${contractsData.length} contracts`
    );
    return contractsData;
  }

  /**
   * Updates the contract cache for a production network
   */
  async updateProdCache(network: ProdNetworkName): Promise<void> {
    console.log(
      `\n🔄 Starting production cache update for network: ${network}`
    );

    try {
      const deployedContractUrl = NETWORKS.prod.deployedContracts[network];
      this.githubService.trackNetworkPath(
        network,
        'deployedContracts',
        deployedContractUrl
      );

      console.log(`\n📍 [${network}] Contract Addresses Source:`);
      console.log(`   URL: ${deployedContractUrl}`);

      const filePath = this.extractPathAfterMain(deployedContractUrl);
      const lastModified = await this.githubService.getLastModified(
        filePath,
        network
      );

      if (!lastModified) {
        throw new Error('Failed to get last modified date');
      }

      console.log(`   Last Modified: ${lastModified}`);

      const contractABIs = await this.getProdContractABIs(network);
      const deployedContractsRes = await fetch(deployedContractUrl);
      const deployedContracts = await deployedContractsRes.json();

      console.log(`\n🔍 [${network}] Contract Details:`);
      console.log(
        `   Total Contracts Found: ${Object.keys(deployedContracts).length}`
      );

      const cache = await this.buildNetworkCache(
        network,
        deployedContracts,
        contractABIs,
        lastModified
      );

      await this.writeNetworkCache(network, cache);
      console.log(`✅ [${network}] Successfully updated production cache`);
    } catch (error: any) {
      console.error(
        `❌ [${network}] Production cache update failed: ${error.message}`
      );
      this.githubService.trackNetworkError(network, error.message);
    }
  }

  /**
   * Updates the contract cache for development networks
   */
  async updateDevCache(): Promise<void> {
    console.log(`\n🔄 Starting development cache update`);

    // Process all development networks
    for (const network of NETWORKS.dev.networks) {
      try {
        console.log(`\n📦 Processing development network: ${network}`);
        const contractABIs = await this.getDevContractABIs(network);
        const deployedContractUrl = NETWORKS.dev.deployedContracts[network];
        this.githubService.trackNetworkPath(
          network,
          'deployedContracts',
          deployedContractUrl
        );

        console.log(`\n📍 [${network}] Contract Addresses Source:`);
        console.log(`   URL: ${deployedContractUrl}`);

        const filePath = this.extractPathAfterMain(deployedContractUrl);
        const lastModified = await this.githubService.getLastModified(
          filePath,
          network
        );

        if (!lastModified) {
          throw new Error('Failed to get last modified date');
        }

        console.log(`   Last Modified: ${lastModified}`);

        const deployedContractsRes = await fetch(deployedContractUrl);
        const deployedContracts = await deployedContractsRes.json();

        console.log(`\n🔍 [${network}] Contract Details:`);
        console.log(
          `   Total Contracts Found: ${Object.keys(deployedContracts).length}`
        );

        const cache = await this.buildNetworkCache(
          network,
          deployedContracts,
          contractABIs,
          lastModified
        );

        await this.writeNetworkCache(network, cache, true);
        console.log(`✅ Successfully updated ${network} development cache`);
      } catch (error: any) {
        console.error(
          `❌ Development cache update failed for ${network}: ${error.message}`
        );
        this.githubService.trackNetworkError(network, error.message);
      }
    }
  }

  /**
   * Builds network cache from contract data
   */
  private async buildNetworkCache(
    network: string,
    deployedContracts: any,
    contractABIs: ContractData[],
    lastModified: string
  ): Promise<NetworkCache> {
    const cache: NetworkCache = {
      data: [],
    };

    const config = {
      chainId: deployedContracts?.chainId,
      rpcUrl: deployedContracts?.rpcUrl,
      chainName: deployedContracts?.chainName,
      litNodeDomainName: deployedContracts?.litNodeDomainName,
      litNodePort: deployedContracts?.litNodePort,
      rocketPort: deployedContracts?.rocketPort,
    };

    if (
      Object.values(config).some((val) => val !== null && val !== undefined)
    ) {
      cache.config = config;
    }

    for (const [name, address] of Object.entries(deployedContracts)) {
      const contractFileName =
        CONTRACT_NAME_MAP[name as keyof typeof CONTRACT_NAME_MAP];

      if (!contractFileName) {
        if (name.includes('Address')) {
          console.log(
            `\x1b[90m   ⚠️  Skipping unmapped contract: ${name}\x1b[0m`
          );
        }
        continue;
      }

      const contractABI = contractABIs.find(
        (item) => item.name === contractFileName
      );

      if (!contractABI) {
        console.warn(
          `⚠️ [${network}] No ABI found for contract: ${contractFileName}`
        );
        continue;
      }

      console.log(`   ✓ ${contractFileName}:`);
      console.log(`       Address: ${address}`);
      console.log(
        `       ABI Methods: ${
          Array.isArray(contractABI.data) ? contractABI.data.length : 'N/A'
        }`
      );

      cache.data.push({
        name: contractFileName,
        contracts: [
          {
            network,
            address_hash: address as string,
            inserted_at: lastModified,
            ABI: contractABI.data,
          },
        ],
      });
    }

    return cache;
  }

  /**
   * Writes network cache to file
   */
  private async writeNetworkCache(
    network: string,
    cache: NetworkCache,
    isDev = false
  ): Promise<void> {
    const outputDir = isDev ? './dist/dev' : './dist/prod';
    fs.mkdirSync(outputDir, { recursive: true });

    // .ts support
    fs.writeFileSync(
      `${outputDir}/${network}.ts`,
      `export const ${formatNetworkName(network)} = ${JSON.stringify(
        cache,
        null,
        2
      )} as const;`
    );

    // .cjs support
    fs.writeFileSync(
      `${outputDir}/${network}.cjs`,
      `"use strict";\n\nmodule.exports = ${JSON.stringify(cache, null, 2)};`
    );

    // .js support
    fs.writeFileSync(
      `${outputDir}/${network}.js`,
      `export const ${formatNetworkName(network)} = ${JSON.stringify(
        cache,
        null,
        2
      )};`
    );

    // .json support
    fs.writeFileSync(
      `${outputDir}/${network}.json`,
      JSON.stringify(cache, null, 2)
    );
  }

  /**
   * Extracts the path after 'main' from a GitHub URL
   */
  private extractPathAfterMain(urlString: string): string {
    const url = new URL(urlString);
    const parts = url.pathname.split('/');
    const mainIndex = parts.indexOf('main');
    return parts.slice(mainIndex + 1).join('/');
  }
}
