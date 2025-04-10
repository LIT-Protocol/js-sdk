import {
  Abi,
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { BigNumberish, BytesLike, ContractReceipt, ethers } from 'ethers';
import { computeAddress } from 'ethers/lib/utils';

import {
  AUTH_METHOD_SCOPE_VALUES,
  AUTH_METHOD_TYPE_VALUES,
  HTTP,
  HTTP_BY_NETWORK,
  HTTPS,
  InitError,
  InvalidArgumentException,
  LIT_NETWORK,
  LIT_NETWORK_VALUES,
  METAMASK_CHAIN_INFO_BY_NETWORK,
  NETWORK_CONTEXT_BY_NETWORK,
  ParamsMissingError,
  RPC_URL_BY_NETWORK,
  TransactionError,
  WrongNetworkException,
} from '@lit-protocol/constants';
import { Logger, LogManager } from '@lit-protocol/logger';
import { derivedAddresses, isBrowser, isNode } from '@lit-protocol/misc';
import {
  ContractName,
  EpochInfo,
  GasLimitParam,
  LIT_NETWORKS_KEYS,
  LitContract,
  LitContractContext,
  LitContractResolverContext,
  MintNextAndAddAuthMethods,
  MintWithAuthParams,
  MintWithAuthResponse,
  TokenInfo,
} from '@lit-protocol/types';

import { getAuthIdByAuthMethod, stringToArrayify } from './auth-utils';
import {
  CIDParser,
  getBytes32FromMultihash,
  IPFSHash,
} from './helpers/getBytes32FromMultihash';
import { decToHex, hexToDec, intToIP } from './hex2dec';
import { getPriceFeedInfo } from './price-feed-info-manager';
import { ValidatorStruct } from './types';

// CHANGE: this should be dynamically set, but we only have 1 net atm.
const REALM_ID = 1;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
  }
}

function _decimalToHex(decimal: number): string {
  return '0x' + decimal.toString(16);
}

// Due to the usage of arbitrum stylus contracts the gas limit is increased by 10% to avoid reverts due to out of gas errors
const GAS_LIMIT_INCREASE_PERCENTAGE = 10;
const GAS_LIMIT_ADJUSTMENT = ethers.BigNumber.from(100).add(
  GAS_LIMIT_INCREASE_PERCENTAGE
);

// This code defines a LitContracts class that acts as a container for a collection of smart contracts. The class has a constructor that accepts an optional args object with provider and rpc properties. If no provider is specified, the class will create a default provider using the specified rpc URL. If no rpc URL is specified, the class will use a default URL.
// The class has a number of properties that represent the smart contract instances, such as accessControlConditionsContract, litTokenContract, pkpNftContract, etc. These smart contract instances are created by passing the contract address, ABI, and provider to the ethers.Contract constructor.
// The class also has a utils object with helper functions for converting between hexadecimal and decimal representation of numbers, as well as functions for working with multihashes and timestamps.
export class LitContracts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: ethers.providers.StaticJsonRpcProvider | any;
  rpc: string;
  rpcs: string[];
  signer: ethers.Signer | ethers.Wallet;
  privateKey: string | undefined;
  options?: {
    storeOrUseStorageKey?: boolean;
  };
  randomPrivateKey: boolean = false;
  connected: boolean = false;
  isPKP: boolean = false;
  debug: boolean = false;
  network: LIT_NETWORKS_KEYS;
  customContext?: LitContractContext | LitContractResolverContext;
  static contractNames: ContractName[] = [
    'Allowlist',
    'Staking',
    'PubkeyRouter',
    'PKPHelper',
    'PKPPermissions',
    'PKPNFTMetadata',
    'PKPNFT',
    'Multisender',
    'LITToken',
    'PriceFeed',
  ];

  static logger: Logger = LogManager.Instance.get('contract-sdk');

  // make the constructor args optional
  constructor(args?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider?: ethers.providers.StaticJsonRpcProvider | any;
    customContext?: LitContractContext | LitContractResolverContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpcs?: string[] | any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpc?: string | any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signer?: ethers.Signer | any;
    privateKey?: string | undefined;
    randomPrivatekey?: boolean;
    options?: {
      storeOrUseStorageKey?: boolean;
    };
    debug?: boolean;
    network?: LIT_NETWORKS_KEYS;
  }) {
    // this.provider = args?.provider;
    this.customContext = args?.customContext;
    this.rpc = args?.rpc;
    this.rpcs = args?.rpcs;
    this.signer = args?.signer;
    this.privateKey = args?.privateKey;
    this.provider = args?.provider;
    this.randomPrivateKey = args?.randomPrivatekey ?? false;
    this.options = args?.options;
    this.debug = args?.debug ?? false;
    this.network = args?.network || LIT_NETWORK.NagaDev;
    // if rpc is not specified, use the default rpc
    if (!this.rpc) {
      this.rpc = RPC_URL_BY_NETWORK[this.network];
    }

    if (!this.rpcs) {
      this.rpcs = [this.rpc];
    }
  }

  /**
   * Logs a message to the console.
   *
   * @param {any} [args] An optional value to log with the message.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log = (...args: any[]) => {
    if (this.debug) {
      LitContracts.logger.debug(...args);
    }
  };

  connect = async () => {
    // =======================================
    //          SETTING UP PROVIDER
    // =======================================

    // -------------------------------------------------
    //          (Browser) Setting up Provider
    // -------------------------------------------------
    let wallet;
    let SETUP_DONE = false;
    if (this.provider) {
      this.log('Using provided provider');
    } else if (isBrowser() && !this.signer) {
      this.log("----- We're in the browser! -----");

      const web3Provider = window.ethereum;

      if (!web3Provider) {
        const msg =
          'No web3 provider found. Please install Brave, MetaMask or another web3 provider.';
        alert(msg);
        throw new InitError(
          {
            info: {
              web3Provider,
            },
          },
          msg
        );
      }

      const chainInfo = METAMASK_CHAIN_INFO_BY_NETWORK[this.network];

      const metamaskChainInfo = {
        ...chainInfo,
        chainId: _decimalToHex(chainInfo.chainId),
      };

      try {
        await web3Provider.send('wallet_switchEthereumChain', [
          { chainId: metamaskChainInfo.chainId },
        ]);
      } catch (e) {
        await web3Provider.request({
          method: 'wallet_addEthereumChain',
          params: [metamaskChainInfo],
        });
      }

      wallet = new ethers.providers.Web3Provider(web3Provider);

      await wallet.send('eth_requestAccounts', []);

      // this will ask metamask to connect to the wallet
      // this.signer = wallet.getSigner();

      this.provider = wallet;
    }

    // ----------------------------------------------
    //          (Node) Setting up Provider
    // ----------------------------------------------
    else if (isNode()) {
      this.log("----- We're in node! -----");
      this.provider = new ethers.providers.StaticJsonRpcProvider({
        url: this.rpc,
        skipFetchSetup: true,
      });
    }

    // ======================================
    //          CUSTOM PRIVATE KEY
    // ======================================
    if (this.privateKey) {
      this.log('Using your own private key');
      this.signer = new ethers.Wallet(this.privateKey, this.provider);
      this.provider = this.signer.provider;
      SETUP_DONE = true;
    }

    // =====================================
    //          SETTING UP SIGNER
    // =====================================
    if (
      (!this.privateKey && this.randomPrivateKey) ||
      this.options?.storeOrUseStorageKey
    ) {
      this.log('THIS.SIGNER:', this.signer);

      const STORAGE_KEY = 'lit-contracts-sdk-private-key';

      this.log("Let's see if you have a private key in your local storage!");

      // -- find private key in local storage
      let storagePrivateKey;

      try {
        storagePrivateKey = localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        // swallow
        // this.log('Not a problem.');
      }

      // -- (NOT FOUND) no private key found
      if (!storagePrivateKey) {
        this.log('Not a problem, we will generate a random private key');
        storagePrivateKey = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      }

      // -- (FOUND) private key found
      else {
        this.log("Found your private key in local storage. Let's use it!");
      }

      this.signer = new ethers.Wallet(storagePrivateKey, this.provider);

      this.log('- Your private key:', storagePrivateKey);
      this.log('- Your address:', await this.signer.getAddress());
      this.log('- this.signer:', this.signer);
      this.log('- this.provider.getSigner():', this.provider.getSigner());

      // -- (OPTION) store private key in local storage
      if (this.options?.storeOrUseStorageKey) {
        this.log(
          "You've set the option to store your private key in local storage."
        );
        localStorage.setItem(STORAGE_KEY, storagePrivateKey);
      }
    } else {
      // ----------------------------------------
      //          Ask Metamask to sign
      // ----------------------------------------
      if (isBrowser() && wallet && !SETUP_DONE) {
        // this.log('HERE????');
        this.log('this.signer:', this.signer);
        this.signer = wallet.getSigner();
      }
    }

    if (this.signer !== undefined && this.signer !== null) {
      if ('litNodeClient' in this.signer && 'rpcProvider' in this.signer) {
        this.log(`
  // ***********************************************************************************************
  //          THIS IS A PKP WALLET, USING IT AS A SIGNER AND ITS RPC PROVIDER AS PROVIDER
  // ***********************************************************************************************
        `);

        this.provider = this.signer.rpcProvider;
        this.isPKP = true;
      }
    }

    this.log('Your Signer:', this.signer);
    this.log('Your Provider:', this.provider?.connection);

    if (!this.provider) {
      this.log('No provider found. Will try to use the one from the signer.');
      this.provider = this.signer.provider;
      this.log('Your Provider(from signer):', this.provider?.connection);
    }

    this.connected = true;
  };

  public static resolveLitContract(
    network: LIT_NETWORKS_KEYS,
    contractName: ContractName,
    index = 0
  ) {
    const networkContext = NETWORK_CONTEXT_BY_NETWORK[network];

    if (!networkContext) {
      throw new WrongNetworkException(
        {
          info: {
            network,
            contractName,
          },
        },
        `Contract "${contractName}" not found on network "${network}". When using a 'custom' network, you must provide a custom context. This function is not intended for use with a 'custom' network.`
      );
    }

    const networkData = networkContext.data.find((data) => {
      return data.name === contractName;
    });
    const contractData = networkData?.contracts[index];

    if (!contractData) {
      throw new WrongNetworkException(
        {
          info: {
            network,
            contractName,
            contractData,
            index,
          },
        },
        'Network or contract data not found'
      );
    }

    return contractData;
  }

  public static async callLitContract<
    LitAbi extends Abi,
    LitFunction extends ExtractAbiFunctionNames<LitAbi>,
    LitAbiFunction extends AbiFunction = ExtractAbiFunction<LitAbi, LitFunction>
  >(
    abi: LitAbi,
    address: string,
    functionName: LitFunction,
    args: AbiParametersToPrimitiveTypes<LitAbiFunction['inputs'], 'inputs'>,
    signerOrProvider: ethers.Signer | ethers.providers.JsonRpcProvider
  ): Promise<
    AbiParametersToPrimitiveTypes<LitAbiFunction['outputs'], 'outputs'>
  > {
    const contract = new ethers.Contract(
      address,
      abi as ethers.ContractInterface,
      signerOrProvider
    );

    return contract[functionName](...args) as Promise<
      AbiParametersToPrimitiveTypes<LitAbiFunction['outputs'], 'outputs'>
    >;
  }

  /**
   * Similar to {@link getLitContract} but used for internal purposes,
   * such as custom rpc url and context.
   */
  public async getLitContractWithContext(
    network: LIT_NETWORKS_KEYS,
    litContractName: ContractName
  ) {
    let contractContext: LitContractContext | undefined;

    if (!contractContext && network === 'custom') {
      contractContext = this.customContext as unknown as LitContractContext;
    } else {
      const networkContext = NETWORK_CONTEXT_BY_NETWORK[
        network
      ] as unknown as LitContractContext;

      // Find the contract data from the network context
      const contractData = networkContext['data'].find((data: any) => {
        return data.name === litContractName;
      });

      // If found, transform it to the expected format
      if (contractData) {
        contractContext = {} as LitContractContext;
        contractContext[litContractName] = {
          address: contractData.contracts[0].address_hash,
          abi: contractData.contracts[0].ABI,
        };
      }
    }

    return LitContracts.getLitContract(
      network,
      litContractName,
      ...(this.rpc ? [this.rpc] : []),
      ...(contractContext ? [contractContext] : []),
      ...(this.signer ? [this.signer] : [])
    );
  }

  /**
   * Retrieves any Lit contract instance based on the provided network, context, and RPC URL.
   * If a context is provided, it determines if a contract resolver is used for bootstrapping contracts.
   * If a resolver address is present in the context, it retrieves the Lit contract from the contract resolver instance.
   * Otherwise, it retrieves the Lit contract using the contract address and ABI.
   * Throws an error if required contract data is missing or if the Lit contract cannot be obtained.
   *
   * @param network - The network key.
   * @param litContractName - The Lit contract name
   * @param rpcUrl - The RPC URL.
   * @param context - The contract context or contract resolver context.
   * @returns The Lit contract instance.
   * @throws Error if required contract data is missing or if the Lit contract cannot be obtained.
   */
  public static async getLitContract(
    network: LIT_NETWORKS_KEYS,
    litContractName: ContractName,
    rpcUrl = RPC_URL_BY_NETWORK[network],
    context?: LitContractContext | LitContractResolverContext,
    signer?: ethers.Signer | ethers.Wallet
  ): Promise<ethers.Contract> {
    let provider: ethers.providers.StaticJsonRpcProvider;
    let signerOrProvider: ethers.Signer | ethers.providers.JsonRpcProvider;

    if (context && 'provider' in context!) {
      provider = context.provider;
    } else {
      provider = new ethers.providers.StaticJsonRpcProvider({
        url: rpcUrl,
        skipFetchSetup: true,
      });
    }

    if (signer) {
      signerOrProvider = signer.connect(provider);
    } else {
      signerOrProvider = provider;
    }

    if (!context) {
      const litContract = LitContracts._getContractData(
        network,
        litContractName
      );
      const { address, abi } = litContract;

      // Validate the required data
      if (!address || !abi) {
        throw new InitError(
          {
            info: {
              address,
              abi,
              network,
            },
          },
          '❌ Required contract data is missing for %s',
          litContractName
        );
      }

      return new ethers.Contract(address, abi, signerOrProvider);
    } else {
      if (!context.resolverAddress) {
        const litContract = (context as LitContractContext)[litContractName];

        if (!litContract.address || !litContract.abi) {
          throw new InitError(
            {
              info: {
                litContract,
                context,
              },
            },
            '❌ Could not get %s contract address or abi from contract context',
            litContractName
          );
        }

        return new ethers.Contract(
          litContract.address,
          litContract.abi,
          signerOrProvider
        );
      } else {
        const contractContext = await LitContracts._getContractsFromResolver(
          context as LitContractResolverContext,
          signerOrProvider,
          [litContractName]
        );

        const contractAddress = contractContext[litContractName].address;
        const contractABI =
          contractContext[litContractName].abi ||
          LitContracts._getContractData(network, litContractName).abi;

        if (!contractAddress || !contractABI) {
          throw new InitError(
            {
              info: {
                context,
                contractABI,
                contractAddress,
                contractContext,
              },
            },
            '❌ Could not get %s contract from contract resolver instance',
            litContractName
          );
        }

        return new ethers.Contract(contractAddress, contractABI, provider);
      }
    }
  }

  /**
   * Retrieves the PriceFeed contract instance based on the provided network, context, and RPC URL.
   * If a context is provided, it determines if a contract resolver is used for bootstrapping contracts.
   * If a resolver address is present in the context, it retrieves the PriceFeed contract from the contract resolver instance.
   * Otherwise, it retrieves the PriceFeed contract using the contract address and ABI.
   * Throws an error if required contract data is missing or if the PriceFeed contract cannot be obtained.
   *
   * @param network - The network key.
   * @param context - The contract context or contract resolver context.
   * @param rpcUrl - The RPC URL.
   * @returns The PriceFeed contract instance.
   * @throws Error if required contract data is missing or if the PriceFeed contract cannot be obtained.
   */
  public static async getPriceFeedContract(
    network: LIT_NETWORKS_KEYS,
    context?: LitContractContext | LitContractResolverContext,
    rpcUrl?: string
  ) {
    return this.getLitContract(network, 'PriceFeed', rpcUrl, context);
  }

  /**
   * Retrieves the Staking contract instance based on the provided network, context, and RPC URL.
   * If a context is provided, it determines if a contract resolver is used for bootstrapping contracts.
   * If a resolver address is present in the context, it retrieves the Staking contract from the contract resolver instance.
   * Otherwise, it retrieves the Staking contract using the contract address and ABI from the contract context.
   * Throws an error if required contract data is missing or if the Staking contract cannot be obtained.
   *
   * @param network - The network key.
   * @param context - The contract context or contract resolver context.
   * @param rpcUrl - The RPC URL.
   * @returns The Staking contract instance.
   * @throws Error if required contract data is missing or if the Staking contract cannot be obtained.
   */
  public static async getStakingContract(
    network: LIT_NETWORKS_KEYS,
    context?: LitContractContext | LitContractResolverContext,
    rpcUrl?: string
  ) {
    return this.getLitContract(network, 'Staking', rpcUrl, context);
  }

  private static async _getContractsFromResolver(
    context: LitContractResolverContext,
    signerOrProvider: ethers.Signer | ethers.providers.JsonRpcProvider,
    contractNames?: ContractName[]
  ): Promise<LitContractContext> {
    const resolverContract = new ethers.Contract(
      context.resolverAddress,
      context.abi,
      signerOrProvider
    );

    const getContract = async function (
      contract: ContractName,
      environment: number
    ): Promise<string> {
      let address: string = '';
      switch (contract) {
        case 'Allowlist':
          address = await resolverContract['getContract'](
            await resolverContract['ALLOWLIST_CONTRACT'](),
            environment
          );
          break;
        case 'LITToken':
          address = await resolverContract['getContract'](
            await resolverContract['LIT_TOKEN_CONTRACT'](),
            environment
          );
          break;
        case 'Multisender':
          address = await resolverContract['getContract'](
            await resolverContract['MULTI_SENDER_CONTRACT'](),
            environment
          );
          break;
        case 'PKPNFT':
          address = await resolverContract['getContract'](
            await resolverContract['PKP_NFT_CONTRACT'](),
            environment
          );
          break;
        case 'PKPNFTMetadata':
          address = await resolverContract['getContract'](
            await resolverContract['PKP_NFT_METADATA_CONTRACT'](),
            environment
          );
          break;
        case 'PKPPermissions':
          address = await resolverContract['getContract'](
            await resolverContract['PKP_PERMISSIONS_CONTRACT'](),
            environment
          );
          break;
        case 'PKPHelper':
          address = await resolverContract['getContract'](
            await resolverContract['PKP_HELPER_CONTRACT'](),
            environment
          );
          break;
        case 'PubkeyRouter':
          address = await resolverContract['getContract'](
            await resolverContract['PUB_KEY_ROUTER_CONTRACT'](),
            environment
          );
          break;
        case 'Staking':
          address = await resolverContract['getContract'](
            await resolverContract['STAKING_CONTRACT'](),
            environment
          );
          break;
        case 'PriceFeed':
          address = await resolverContract['getContract'](
            await resolverContract['PRICE_FEED_CONTRACT'](),
            environment
          );
          break;
        default:
          throw new InvalidArgumentException(
            {
              info: {
                contract,
                environment,
                contractNames,
              },
            },
            'Contract not found'
          );
      }

      return address;
    };

    const names = contractNames ?? LitContracts.contractNames;

    const contractContext: LitContractContext = {} as LitContractContext;
    // Ah, Bluebird.props(), we miss you ����
    await Promise.all(
      names.map(async (contractName) => {
        const contracts = context?.contractContext;
        contractContext[contractName] = {
          address: await getContract(contractName, context.environment),
          abi: contracts?.[contractName]?.abi ?? undefined,
        };
      })
    );

    return contractContext;
  }

  public static async getContractAddresses(
    network: LIT_NETWORKS_KEYS,
    provider: ethers.providers.StaticJsonRpcProvider,
    context?: LitContractContext | LitContractResolverContext
  ) {
    let contractData;
    if (context) {
      // if there is a resolver address we use the resolver contract to query the rest of the contracts
      // here we override context to be what is returned from the resolver which is of type LitContractContext
      if (context?.resolverAddress) {
        context = await LitContracts._getContractsFromResolver(
          context as LitContractResolverContext,
          provider
        );
      }

      const flatten = [];
      const keys = Object.keys(context);
      for (const key of keys) {
        context[key].name = key;
        flatten.push(context[key]);
      }
      contractData = flatten;
    } else {
      contractData = LitContracts._resolveContractContext(network);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addresses: any = {};
    for (const contract of contractData) {
      switch (contract.name) {
        case 'Allowlist':
          addresses.Allowlist = {};
          addresses.Allowlist.address = contract.address;
          addresses.Allowlist.abi = contract.abi;
          break;
        case 'PKPHelper':
          addresses.PKPHelper = {};
          addresses.PKPHelper.address = contract.address;
          addresses.PKPHelper.abi = contract.abi;
          break;
        case 'PKPNFT':
          addresses.PKPNFT = {};
          addresses.PKPNFT.address = contract.address;
          addresses.PKPNFT.abi = contract.abi;
          break;
        case 'Staking':
          addresses.Staking = {};
          addresses.Staking.address = contract.address;
          addresses.Staking.abi = contract.abi;
          break;
        case 'PKPPermissions':
          addresses.PKPPermissions = {};
          addresses.PKPPermissions.address = contract.address;
          addresses.PKPPermissions.abi = contract.abi;
          break;
        case 'PKPNFTMetadata':
          addresses.PKPNFTMetadata = {};
          addresses.PKPNFTMetadata.address = contract.address;
          addresses.PKPNFTMetadata.abi = contract.abi;
          break;
        case 'PubkeyRouter':
          addresses.PubkeyRouter = {};
          addresses.PubkeyRouter.address = contract.address;
          addresses.PubkeyRouter.abi = contract?.abi;
          break;
        case 'LITToken':
          addresses.LITToken = {};
          addresses.LITToken.address = contract.address;
          addresses.LITToken.abi = contract?.abi;
          break;
        case 'Multisender':
          addresses.Multisender = {};
          addresses.Multisender.address = contract.address;
          addresses.Multisender.abi = contract?.abi;
          break;
        case 'PriceFeed':
          addresses.PriceFeed = {};
          addresses.PriceFeed.address = contract.address;
          addresses.PriceFeed.abi = contract?.abi;
          break;
      }
    }

    // Validate the required data
    if (Object.keys(addresses).length < 5) {
      throw new InitError(
        {
          info: {
            network,
            addresses,
            context,
          },
        },
        '❌ Required contract data is missing'
      );
    }

    return addresses;
  }

  /**
   * Generates an array of validator URLs based on the given validator structs and network configurations.
   *
   * @property {ValidatorStruct[]} activeValidatorStructs - Array of validator structures containing IP and port information.
   * @property {string | undefined} nodeProtocol - Optional node protocol to override the default protocol selection logic.
   * @property {string} litNetwork - The name of the network used to determine HTTP/HTTPS settings.
   * @returns {string[]} Array of constructed validator URLs.
   *
   * @example
   * // Example input
   * const activeValidatorStructs = [
   *   { ip: 3232235777, port: 443 }, // IP: 192.168.1.1
   *   { ip: 3232235778, port: 80 },  // IP: 192.168.1.2
   * ];
   * const nodeProtocol = undefined;
   * const litNetwork = "mainnet";
   *
   * // Example output
   * const urls = generateValidatorURLs(activeValidatorStructs, nodeProtocol, litNetwork);
   * console.log(urls);
   * Output: [
   *   "https://192.168.1.1:443",
   *   "http://192.168.1.2:80"
   * ]
   */
  public static generateValidatorURLs({
    activeValidatorStructs,
    nodeProtocol,
    litNetwork,
  }: {
    activeValidatorStructs: ValidatorStruct[];
    nodeProtocol?: typeof HTTP | typeof HTTPS | null;
    litNetwork: LIT_NETWORK_VALUES;
  }): string[] {
    return activeValidatorStructs.map((item) => {
      // Convert the integer IP to a string format
      const ip = intToIP(item.ip);
      const port = item.port;

      // Determine the protocol to use based on conditions
      const protocol =
        nodeProtocol || // Use nodeProtocol if defined
        (port === 443 ? HTTPS : HTTP_BY_NETWORK[litNetwork]) || // HTTPS for port 443 or network-specific HTTP
        HTTP; // Fallback to HTTP

      // Construct the URL
      const url = `${protocol}${ip}:${port}`;

      // Log the constructed URL for debugging
      LitContracts.logger.debug("Validator's URL:", url);

      return url;
    });
  }

  /**
   * Retrieves the connection information for a given network.
   *
   * @param params
   * @param params.litNetwork - The key representing the network.
   * @param [params.networkContext] - Optional network context for the contract.
   * @param [params.rpcUrl] - Optional RPC URL for the network.
   * @param [params.nodeProtocol] - Optional protocol for the network node.
   *
   * @returns An object containing the staking contract, epoch number, minimum node count and an array of bootstrap URLs.
   *
   * @throws Error if the minimum validator count is not set or if the active validator set does not meet the threshold.
   */
  public static getConnectionInfo = async ({
    litNetwork,
    networkContext,
    rpcUrl,
    nodeProtocol,
  }: {
    litNetwork: LIT_NETWORKS_KEYS;
    networkContext?: LitContractContext | LitContractResolverContext;
    rpcUrl?: string;
    nodeProtocol?: typeof HTTP | typeof HTTPS | null;
  }): Promise<{
    stakingContract: ethers.Contract;
    epochInfo: EpochInfo;
    minNodeCount: number;
    bootstrapUrls: string[];
    nodePrices: { url: string; prices: bigint[] }[];
  }> => {
    const stakingContract = await LitContracts.getStakingContract(
      litNetwork,
      networkContext,
      rpcUrl
    );

    // const test =  await stakingContract['getActiveUnkickedValidatorStructsAndCounts'](
    //   REALM_ID
    // );;

    // console.log("test:", test);
    // process.exit(0);

    const [epochInfo, minNodeCount, activeUnkickedValidatorStructs] =
      await stakingContract['getActiveUnkickedValidatorStructsAndCounts'](
        REALM_ID
      );

    const typedEpochInfo: EpochInfo = {
      epochLength: ethers.BigNumber.from(epochInfo[0]).toNumber(),
      number: ethers.BigNumber.from(epochInfo[1]).toNumber(),
      endTime: ethers.BigNumber.from(epochInfo[2]).toNumber(),
      retries: ethers.BigNumber.from(epochInfo[3]).toNumber(),
      timeout: ethers.BigNumber.from(epochInfo[4]).toNumber(),
    };

    const minNodeCountInt = ethers.BigNumber.from(minNodeCount).toNumber();
    console.log('epochInfo:', epochInfo);
    console.log('minNodeCountInt', minNodeCountInt);
    console.log(
      'activeUnkickedValidatorStructs',
      activeUnkickedValidatorStructs
    );

    if (!minNodeCountInt) {
      throw new Error('❌ Minimum validator count is not set');
    }

    if (activeUnkickedValidatorStructs.length < minNodeCountInt) {
      throw new Error(
        `❌ Active validator set does not meet the consensus. Required: ${minNodeCountInt} but got: ${activeUnkickedValidatorStructs.length}`
      );
    }

    const activeValidatorStructs: ValidatorStruct[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeUnkickedValidatorStructs.map((item: any) => {
        return {
          ip: item[0],
          ipv6: item[1],
          port: item[2],
          nodeAddress: item[3],
          reward: item[4],
          seconderPubkey: item[5],
          receiverPubkey: item[6],
          lastActiveEpoch: item[7],
          commission: item[8],
          lastRewardEpoch: item[9],

          // -- new params for naga
          // lastRealmId: BigNumber { _hex: '0x01', _isBigNumber: true },
          // delegatedStakeAmount: BigNumber { _hex: '0x00', _isBigNumber: true },
          // delegatedStakeWeight: BigNumber { _hex: '0x00', _isBigNumber: true },
          // lastRewardEpochClaimedFixedCostRewards: BigNumber { _hex: '0x00', _isBigNumber: true },
          // lastRewardEpochClaimedCommission: BigNumber { _hex: '0x00', _isBigNumber: true },
          // operatorAddress: '0x4542d87b0ceC8C9EFEC642452e82059Fc8346581'
          lastRealmId: item[10],
          delegatedStakeAmount: item[11],
          delegatedStakeWeight: item[12],
          lastRewardEpochClaimedFixedCostRewards: item[13],
          lastRewardEpochClaimedCommission: item[14],
          operatorAddress: item[15],
        };
      });

    const bootstrapUrls = LitContracts.generateValidatorURLs({
      activeValidatorStructs,
      litNetwork,
    });

    // networks are all the nodes we know from the `getActiveUnkickedValidatorStructsAndCounts` function, but we also want to sort it by price feed
    // which we need to call the price feed contract
    const priceFeedInfo = await LitContracts.getPriceFeedInfo({
      realmId: REALM_ID,
      litNetwork,
      networkContext,
      rpcUrl,
      nodeProtocol,
    });

    // example of Network to Price Map: {
    //   'http://xxx:7470': 100, <-- lowest price
    //   'http://yyy:7471': 300, <-- highest price
    //   'http://zzz:7472': 200 <-- middle price
    // }
    return {
      stakingContract,
      epochInfo: typedEpochInfo,
      minNodeCount: minNodeCountInt,
      bootstrapUrls: bootstrapUrls,
      nodePrices: priceFeedInfo.networkPrices,
    };
  };

  public static getPriceFeedInfo = async (params: {
    realmId: number;
    litNetwork: LIT_NETWORKS_KEYS;
    networkContext?: LitContractContext | LitContractResolverContext;
    rpcUrl?: string;
    nodeProtocol?: typeof HTTP | typeof HTTPS | null;
  }) => {
    return getPriceFeedInfo(params);
  };

  private static _resolveContractContext(
    network: LIT_NETWORK_VALUES
  ): LitContract[] {
    const data = NETWORK_CONTEXT_BY_NETWORK[network];

    if (!data) {
      throw new WrongNetworkException(
        {
          info: {
            network,
          },
        },
        `[_resolveContractContext] Unsupported network: ${network}`
      );
    }

    // Normalize the data to the LitContract type
    return data.data.map((c) => ({
      address: c.contracts[0].address_hash,
      abi: c.contracts[0].ABI,
      name: c.name,
    }));
  }

  private static _getContractData(
    network: LIT_NETWORKS_KEYS,
    contractName: ContractName
  ): LitContract {
    const contractContexts = LitContracts._resolveContractContext(network);

    const litContract = contractContexts.find((data) => {
      return data.name === contractName;
    });

    if (!litContract) {
      throw new WrongNetworkException(
        {
          info: {
            network,
            contractName,
          },
        },
        'Cannot find requested contract for network'
      );
    }

    return litContract;
  }

  /**
   * Mints a new token with authentication.
   *
   * @param authMethod - The authentication method.
   * @param scopes - The permission scopes.
   * @param pubkey - The public key.
   * @param authMethodId - (optional) The authentication ID.
   * @param gasLimit - (optional) The gas limit.
   * @returns An object containing the PKP information and the transaction receipt.
   * @throws Error if the contracts are not connected, the contract is not available, authMethodType or accessToken is missing, or permission scopes are required.
   */
  mintWithAuth = async ({
    authMethod,
    scopes,
    pubkey,
    authMethodId,
    gasLimit,
  }: MintWithAuthParams): Promise<MintWithAuthResponse<ContractReceipt>> => {
    // -- validate
    if (!this.connected) {
      throw new InitError(
        {
          info: {
            connected: this.connected,
          },
        },
        'Contracts are not connected. Please call connect() first'
      );
    }

    const pkpNftContract = await this.getLitContractWithContext(
      this.network,
      'PKPNFT'
    );

    if (!pkpNftContract) {
      throw new InitError(
        {
          info: {
            network: this.network,
            pkpNftContract,
          },
        },
        'Contract is not available'
      );
    }

    if (authMethod && !authMethod?.authMethodType) {
      throw new ParamsMissingError(
        {
          info: {
            authMethod,
          },
        },
        'authMethodType is required'
      );
    }

    if (
      authMethod &&
      !authMethod?.accessToken &&
      authMethod?.accessToken !== 'custom-auth'
    ) {
      throw new ParamsMissingError(
        {
          info: {
            authMethod,
          },
        },
        'accessToken is required'
      );
    }

    if (scopes.length <= 0) {
      throw new InvalidArgumentException(
        {
          info: {
            scopes,
          },
        },
        `❌ Permission scopes are required!
[0] No Permissions
[1] Sign Anything
[2] Only Sign Messages
Read more here:
https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
      `
      );
    }

    // -- prepare
    const _pubkey = pubkey ?? '0x';

    // if scopes are list of strings, turn them into numbers
    const _scopes = scopes.map((scope) => {
      if (typeof scope === 'string') {
        return ethers.BigNumber.from(scope);
      }
      if (typeof scope === 'number') {
        return ethers.BigNumber.from(scope.toString());
      }
      return scope;
    });

    const _authMethodId =
      authMethodId ?? (await getAuthIdByAuthMethod(authMethod));

    // -- go
    const mintCost = await pkpNftContract['mintCost']();

    // -- start minting
    const pkpHelperContract = await this.getLitContractWithContext(
      this.network,
      'PKPHelper'
    );
    const tx = await this._callWithAdjustedOverrides(
      pkpHelperContract,
      'mintNextAndAddAuthMethods',
      [
        2, // key type
        [authMethod.authMethodType],
        [_authMethodId],
        [_pubkey],
        [[..._scopes]],
        true,
        true,
      ],
      { value: mintCost, gasLimit }
    );
    const receipt = await tx.wait();

    const events = 'events' in receipt ? receipt.events : receipt.logs;

    if (!events || events.length <= 0) {
      throw new TransactionError(
        {
          info: {
            events,
            receipt,
          },
        },
        'No events found in receipt'
      );
    }

    if (!events[0].topics || events[0].topics.length < 1) {
      throw new TransactionError(
        {
          info: {
            events,
            receipt,
          },
        },
        `No topics found in events, cannot derive pkp information. Transaction hash: ${receipt.transactionHash} If you are using your own contracts please use ethers directly`
      );
    }

    const tokenId = events[0].topics[1];
    this.log('tokenId:', tokenId);
    let tries = 0;
    const maxAttempts = 10;
    let publicKey = '';
    while (tries < maxAttempts) {
      publicKey = await pkpNftContract['getPubkey'](tokenId);
      this.log('pkp pub key: ', publicKey);
      if (publicKey !== '0x') {
        break;
      }
      tries++;
      await new Promise((resolve) => {
        setTimeout(resolve, 10_000);
      });
    }

    if (publicKey.startsWith('0x')) {
      publicKey = publicKey.slice(2);
    }

    const pubkeyBuffer = Buffer.from(publicKey, 'hex');

    const ethAddress = computeAddress(pubkeyBuffer);

    return {
      pkp: {
        tokenId,
        publicKey,
        ethAddress,
      },
      tx: receipt,
    };
  };

  /**
   * Mints a new token with customer authentication.
   *
   * @param { Object } params - The parameters for minting a new token with customer authentication.
   * @param { string } params.authMethodId - The authentication method id.
   * @param { string[] | number[] } params.scopes - The permission scopes.
   * @param { string } params.authMethodType - The authentication method type.
   * @returns { Promise<MintWithAuthResponse<ContractReceipt>> } - An object containing the PKP information and the transaction receipt.
   * @throws { Error } - If the contracts are not connected, the contract is not available, authMethodType, or permission scopes are required.
   *
   */
  mintWithCustomAuth = async (params: {
    /**
     * For a custom authentication method, the custom auth ID should uniquely identify the user for that project. For example, for Google, we use appId:userId, so you should follow a similar format for Telegram, Twitter, or any other custom auth method.
     */
    authMethodId: string | Uint8Array;

    authMethodType: number;

    /**
     * Permission scopes:
     * https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
     */
    scopes: string[] | number[];
  }): Promise<MintWithAuthResponse<ContractReceipt>> => {
    const authMethodId =
      typeof params.authMethodId === 'string'
        ? stringToArrayify(params.authMethodId)
        : params.authMethodId;

    return this.mintWithAuth({
      ...params,
      authMethodId,
      authMethod: {
        authMethodType: params.authMethodType,
        accessToken: 'custom-auth',
      },
    });
  };

  /**
   * Adds a permitted authentication method for a given PKP token.
   *
   * @param {Object} params - The parameters for adding the permitted authentication method.
   * @param {string} params.pkpTokenId - The ID of the PKP token.
   * @param {AUTH_METHOD_TYPE_VALUES | number} params.authMethodType - The type of the authentication method.
   * @param {string | Uint8Array} params.authMethodId - The ID of the authentication method.
   * @param {AuthMethodScope[]} params.authMethodScopes - The scopes of the authentication method.
   * @param {string} [params.webAuthnPubkey] - The public key for WebAuthn.
   * @returns {Promise<any>} - A promise that resolves with the result of adding the permitted authentication method.
   * @throws {Error} - If an error occurs while adding the permitted authentication method.
   */
  addPermittedAuthMethod = async ({
    pkpTokenId,
    authMethodType,
    authMethodId,
    authMethodScopes,
    webAuthnPubkey,
  }: {
    pkpTokenId: string;
    authMethodType: AUTH_METHOD_TYPE_VALUES | number;
    authMethodId: string | Uint8Array;
    authMethodScopes: AUTH_METHOD_SCOPE_VALUES[];
    webAuthnPubkey?: string;
  }): Promise<ethers.ContractReceipt> => {
    const _authMethodId =
      typeof authMethodId === 'string'
        ? stringToArrayify(authMethodId)
        : authMethodId;

    const _webAuthnPubkey = webAuthnPubkey ?? '0x';

    try {
      const pkpPermissionsContract = await this.getLitContractWithContext(
        this.network,
        'PKPPermissions'
      );
      const res = await this._callWithAdjustedOverrides(
        pkpPermissionsContract,
        'addPermittedAuthMethod',
        [
          pkpTokenId,
          {
            authMethodType: authMethodType,
            id: _authMethodId,
            userPubkey: _webAuthnPubkey,
          },
          authMethodScopes,
        ]
      );

      const receipt = await res.wait();

      return receipt;
    } catch (e) {
      throw new TransactionError(
        {
          info: {
            pkpTokenId,
            authMethodType,
            authMethodId,
            authMethodScopes,
            webAuthnPubkey,
          },
          cause: e,
        },
        'Adding permitted action failed'
      );
    }
  };

  /**
   * Adds a permitted action to the PKP permissions contract.
   *
   * @param ipfsId - The IPFS ID of the action.
   * @param pkpTokenId - The PKP token ID.
   * @param authMethodScopes - Optional array of authentication method scopes.
   * @returns A promise that resolves to the result of the write operation.
   * @throws If an error occurs during the write operation.
   */
  addPermittedAction = async ({
    ipfsId,
    pkpTokenId,
    authMethodScopes,
  }: {
    ipfsId: string;
    pkpTokenId: string;
    authMethodScopes: AUTH_METHOD_SCOPE_VALUES[];
  }) => {
    const ipfsIdBytes = this.utils.getBytesFromMultihash(ipfsId);
    const scopes = authMethodScopes ?? [];

    try {
      const pkpPermissionsContract = await this.getLitContractWithContext(
        this.network,
        'PKPPermissions'
      );
      const res = await this._callWithAdjustedOverrides(
        pkpPermissionsContract,
        'addPermittedAction',
        [pkpTokenId, ipfsIdBytes, scopes]
      );

      const receipt = await res.wait();

      return receipt;
    } catch (e) {
      throw new TransactionError(
        {
          info: {
            pkpTokenId,
            ipfsIdBytes,
            scopes,
          },
          cause: e,
        },
        'Adding permitted action failed'
      );
    }
  };

  utils = {
    hexToDec,
    decToHex,
    /**
     * Partition multihash string into object representing multihash
     *
     * @param {string} multihash A base58 encoded multihash string
     * @returns {string}
     */
    getBytesFromMultihash: (multihash: string) => {
      const decoded = ethers.utils.base58.decode(multihash);

      return `0x${Buffer.from(decoded).toString('hex')}`;
    },

    /**
     *
     * Convert bytes32 to IPFS ID
     * @param { string } byte32 0x1220baa0d1e91f2a22fef53659418ddc3ac92da2a76d994041b86ed62c0c999de477
     * @returns { string } QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW
     */
    getMultihashFromBytes: (byte32: string): string => {
      const text = byte32.replace('0x', '');

      // const hashFunction = parseInt(text.slice(0, 2), 16);
      const digestSize = parseInt(text.slice(2, 4), 16);
      const digest = text.slice(4, 4 + digestSize * 2);

      const multihash = ethers.utils.base58.encode(
        Buffer.from(`1220${digest}`, 'hex')
      );

      return multihash;
    },
    /**
     * NOTE: This function requires the "multiformats/cid" package in order to work
     *
     * Partition multihash string into object representing multihash
     *
     * @param {string} ipfsId A base58 encoded multihash string
     * @param {CIDParser} CID The CID object from the "multiformats/cid" package
     *
     * @example
     * const CID = require('multiformats/cid')
     * const ipfsId = 'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW'
     * const bytes32 = getBytes32FromMultihash(ipfsId, CID)
     * console.log(bytes32)
     *
     * @returns {IPFSHash}
     */
    getBytes32FromMultihash: (ipfsId: string, CID: CIDParser): IPFSHash => {
      return getBytes32FromMultihash(ipfsId, CID);
    },
  };

  pkpNftContractUtils = {
    read: {
      /**
       * (IERC721Enumerable)
       *
       * Get all PKPs by a given address
       *
       * @param { string } ownerAddress
       * @retu
       * */

      getTokensByAddress: async (ownerAddress: string): Promise<string[]> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }
        const pkpNftContract = await this.getLitContractWithContext(
          this.network,
          'PKPNFT'
        );
        if (!pkpNftContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpNftContract,
              },
            },
            'Contract is not available'
          );
        }

        // -- validate
        if (!ethers.utils.isAddress(ownerAddress)) {
          throw new InvalidArgumentException(
            {
              info: {
                ownerAddress,
              },
            },
            `Given string is not a valid address "${ownerAddress}"`
          );
        }

        const tokens = [];

        for (let i = 0; ; i++) {
          let token;

          try {
            token = await pkpNftContract['tokenOfOwnerByIndex'](
              ownerAddress,
              i
            );

            token = this.utils.hexToDec(token.toHexString()) as string;

            tokens.push(token);
          } catch (e) {
            this.log(`[getTokensByAddress] Ended search on index: ${i}`);
            break;
          }
        }

        return tokens;
      },

      /**
       * (IERC721Enumerable)
       *
       * Get the x latest number of tokens
       *
       * @param { number } latestNumberOfTokens
       *
       * @returns { Array<string> } a list of PKP NFTs
       *
       */
      getTokens: async (latestNumberOfTokens: number): Promise<string[]> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }
        const pkpNftContract = await this.getLitContractWithContext(
          this.network,
          'PKPNFT'
        );
        if (!pkpNftContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpNftContract,
              },
            },
            'Contract is not available'
          );
        }

        const tokens = [];

        for (let i = 0; ; i++) {
          if (i >= latestNumberOfTokens) {
            break;
          }

          let token;

          try {
            token = await pkpNftContract['tokenByIndex'](i);

            token = this.utils.hexToDec(token.toHexString()) as string;

            tokens.push(token);
          } catch (e) {
            this.log(`[getTokensByAddress] Ended search on index: ${i}`);
            break;
          }
        }

        return tokens;
      },

      /**
       * Get info of all PKPs by a given address
       */
      getTokensInfoByAddress: async (
        ownerAddress: string
      ): Promise<TokenInfo[]> => {
        const pkpNftContract = await this.getLitContractWithContext(
          this.network,
          'PKPNFT'
        );
        const tokenIds = await this.pkpNftContractUtils.read.getTokensByAddress(
          ownerAddress
        );

        const arr = [];

        for (const tokenId of tokenIds) {
          const pubKey = await pkpNftContract['getPubkey'](tokenId);
          const addrs: TokenInfo = await derivedAddresses({
            publicKey: pubKey,
          });

          if (!addrs.tokenId) {
            addrs.tokenId = tokenId;
          }

          arr.push(addrs);
        }

        return arr;
      },
    },
    write: {
      mint: async (param?: GasLimitParam) => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpNftContract = await this.getLitContractWithContext(
          this.network,
          'PKPNFT'
        );

        if (!pkpNftContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpNftContract,
              },
            },
            'Contract is not available'
          );
        }

        let mintCost;

        try {
          mintCost = await pkpNftContract['mintCost']();
        } catch (e) {
          throw new TransactionError(
            {
              info: {
                network: this.network,
                mintCost,
              },
              cause: e,
            },
            'Could not get mint cost'
          );
        }

        if (this.isPKP) {
          this.log(
            "This is a PKP wallet, so we'll use the PKP wallet to sign the tx"
          );
        }

        this.log('...signing and sending tx');

        const sentTx = await this._callWithAdjustedOverrides(
          pkpNftContract,
          'mintNext',
          [2],
          { value: mintCost, ...param }
        );

        this.log('sentTx:', sentTx);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await sentTx.wait();
        this.log('res:', res);

        const events = 'events' in res ? res.events : res.logs;

        const tokenIdFromEvent = events[0].topics[1];
        this.log('tokenIdFromEvent:', tokenIdFromEvent);
        let tries = 0;
        const maxAttempts = 10;
        let publicKey = '';
        while (tries < maxAttempts) {
          publicKey = await pkpNftContract['getPubkey'](tokenIdFromEvent);
          this.log('pkp pub key: ', publicKey);
          if (publicKey !== '0x') {
            break;
          }
          tries++;
          await new Promise((resolve) => {
            setTimeout(resolve, 10_000);
          });
        }

        this.log('public key from token id', publicKey);
        if (publicKey.startsWith('0x')) {
          publicKey = publicKey.slice(2);
        }

        const pubkeyBuffer = Buffer.from(publicKey, 'hex');

        const ethAddress = computeAddress(pubkeyBuffer);

        return {
          pkp: {
            tokenId: tokenIdFromEvent,
            publicKey,
            ethAddress,
          },
          tx: sentTx,
          tokenId: tokenIdFromEvent,
          res,
        };
      },

      claimAndMint: async (
        derivedKeyId: BytesLike,
        signatures: { r: BytesLike; s: BytesLike; v: BigNumberish }[],
        txOpts: ethers.CallOverrides = {}
      ) => {
        try {
          const pkpNftContract = await this.getLitContractWithContext(
            this.network,
            'PKPNFT'
          );
          const tx = await this._callWithAdjustedOverrides(
            pkpNftContract,
            'claimAndMint',
            [2, derivedKeyId, signatures],
            {
              ...txOpts,
              value: txOpts.value ?? (await pkpNftContract['mintCost']()),
            }
          );

          const txRec = await tx.wait();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const events: any = 'events' in txRec ? txRec.events : txRec.logs;
          const tokenId = events[1].topics[1];
          return { tx, res: txRec, tokenId };
        } catch (e: unknown) {
          this.log(`[claimAndMint] error: ${(e as Error).message}`);
          throw new TransactionError(
            {
              info: {
                derivedKeyId,
                signatures,
                txOpts,
              },
              cause: e,
            },
            'claimAndMint failed'
          );
        }
      },
    },
  };

  pkpPermissionsContractUtils = {
    read: {
      /**
       *
       * Check if an address is permitted
       *
       * @param { string } tokenId
       * @param { string } address
       *
       * @returns { Promise<boolean> }
       */
      isPermittedAddress: async (
        tokenId: string,
        address: string
      ): Promise<boolean> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        if (!pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        const pkpIdHex = this.utils.decToHex(tokenId, null) as string;

        const bool = await pkpPermissionsContract['isPermittedAddress'](
          pkpIdHex,
          address
        );

        return bool;
      },

      /**
       * Get permitted addresses
       *
       * @param { string } tokenId
       *
       * @returns { Promise<Array<string>> }
       *
       */
      getPermittedAddresses: async (tokenId: string): Promise<string[]> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        if (!pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[getPermittedAddresses] input<tokenId>:', tokenId);

        let addresses: string[] = [];

        const maxTries = 5;
        let tries = 0;

        while (tries < maxTries) {
          try {
            addresses = await pkpPermissionsContract['getPermittedAddresses'](
              tokenId
            );
            if (addresses.length <= 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              tries++;
              continue;
            } else {
              break;
            }
          } catch (e: unknown) {
            this.log(
              `[getPermittedAddresses] error<e.message | ${tries}>:`,
              (e as Error).message
            );
            tries++;
          }
        }

        return addresses;
      },

      /**
       *
       * Get permitted action
       *
       * @param { any } tokenId
       *
       * @returns { Promise<Array<string>> }
       *
       */
      getPermittedActions: async (tokenId: BigNumberish): Promise<string[]> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        if (!pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        let actions: string[] = [];

        const maxTries = 5;
        let tries = 0;

        while (tries < maxTries) {
          try {
            actions = await pkpPermissionsContract['getPermittedActions'](
              tokenId
            );

            if (actions.length <= 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              tries++;
              continue;
            } else {
              break;
            }
          } catch (e: unknown) {
            this.log(
              `[getPermittedActions] error<e.message | ${tries}>:`,
              (e as Error).message
            );
            tries++;
          }
        }

        return actions;
      },

      /**
       *
       * Check if an action is permitted given the pkpid and ipfsId
       *
       * @param { string } pkpId 103309008291725705563022469659474510532358692659842796086905702509072063991354
       * @param { string } ipfsId  QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW
       *
       * @return { object } transaction
       */
      isPermittedAction: async (
        pkpId: string,
        ipfsId: string
      ): Promise<boolean> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        if (!pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[isPermittedAction] input<pkpId>:', pkpId);
        this.log('[isPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[isPermittedAction] converted<ipfsHash>:', ipfsHash);

        const bool = await pkpPermissionsContract['isPermittedAction'](
          pkpId,
          ipfsHash
        );

        return bool;
      },
    },

    write: {
      /**
       *
       * Add permitted action to a given PKP id & ipfsId
       *
       * @param { string } pkpId 103309008291725705563022469659474510532358692659842796086905702509072063991354
       * @param { string } ipfsId  QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW
       *
       * @return { object } transaction
       */
      addPermittedAction: async (
        pkpId: string,
        ipfsId: string
      ): Promise<ethers.ContractTransaction> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        const pubkeyRouterContract = await this.getLitContractWithContext(
          this.network,
          'PubkeyRouter'
        );
        if (!pkpPermissionsContract || !pubkeyRouterContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
                pubkeyRouterContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[addPermittedAction] input<pkpId>:', pkpId);

        const pubKey = await pubkeyRouterContract['getPubkey'](pkpId);
        this.log('[addPermittedAction] converted<pubKey>:', pubKey);

        const pubKeyHash = ethers.utils.keccak256(pubKey);
        this.log('[addPermittedAction] converted<pubKeyHash>:', pubKeyHash);

        const tokenId = ethers.BigNumber.from(pubKeyHash);
        this.log('[addPermittedAction] converted<tokenId>:', tokenId);

        this.log('[addPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsIdBytes = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[addPermittedAction] converted<ipfsIdBytes>:', ipfsIdBytes);

        const tx = await this._callWithAdjustedOverrides(
          pkpPermissionsContract,
          'addPermittedAction',
          [tokenId, ipfsIdBytes, [1]]
        );

        this.log('[addPermittedAction] output<tx>:', tx);

        return tx;
      },

      /**
       * TODO: add transaction type
       * Add permitted action to a given PKP id & ipfsId
       *
       * @param { string } pkpId 103309008291725705563022469659474510532358692659842796086905702509072063991354
       * @param { string } ownerAddress  0x3B5dD2605.....22aDC499A1
       *
       * @return { object } transaction
       */
      addPermittedAddress: async (
        pkpId: string,
        ownerAddress: string
      ): Promise<ethers.ContractTransaction> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        if (!pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[addPermittedAddress] input<pkpId>:', pkpId);
        this.log('[addPermittedAddress] input<ownerAddress>:', ownerAddress);

        this.log('[addPermittedAddress] input<pkpId>:', pkpId);

        const tx = await this._callWithAdjustedOverrides(
          pkpPermissionsContract,
          'addPermittedAddress',
          [pkpId, ownerAddress, [1]]
        );

        this.log('[addPermittedAddress] output<tx>:', tx);

        return tx;
      },

      /**
       * Revoke permitted action of a given PKP id & ipfsId
       *
       * @param { string } pkpId 103309008291725705563022469659474510532358692659842796086905702509072063991354
       * @param { string } ipfsId  QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW
       *
       * @return { object } transaction
       */
      revokePermittedAction: async (
        pkpId: string,
        ipfsId: string
      ): Promise<ethers.ContractTransaction> => {
        if (!this.connected) {
          throw new InitError(
            {
              info: {
                connected: this.connected,
              },
            },
            'Contracts are not connected. Please call connect() first'
          );
        }

        const pkpPermissionsContract = await this.getLitContractWithContext(
          this.network,
          'PKPPermissions'
        );
        if (!pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                network: this.network,
                pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[revokePermittedAction] input<pkpId>:', pkpId);
        this.log('[revokePermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[revokePermittedAction] converted<ipfsHash>:', ipfsHash);

        const tx = await this._callWithAdjustedOverrides(
          pkpPermissionsContract,
          'removePermittedAction',
          [pkpId, ipfsHash]
        );

        this.log('[revokePermittedAction] output<tx>:', tx);

        return tx;
      },
    },
  };

  routerContractUtils = {
    read: {
      /**
       *
       * Convert IPFS response from Solidity to IPFS ID
       * From: "0xb4200a696794b8742fab705a8c065ea6788a76bc6d270c0bc9ad900b6ed74ebc"
       * To: "QmUnwHVcaymJWiYGQ6uAHvebGtmZ8S1r9E6BVmJMtuK5WY"
       *
       * @param { string } solidityIpfsId
       *
       * @return { Promise<string> }
       */
      // getIpfsIds: async (solidityIpfsId: string): Promise<string> => {
      //   this.log('[getIpfsIds] input<solidityIpfsId>:', solidityIpfsId);
      //   const ipfsId = this.utils.getMultihashFromBytes(solidityIpfsId);
      //   this.log('[getIpfsIds] output<ipfsId>:', ipfsId);
      //   return ipfsId;
      // },
    },
    write: {},
  };

  pkpHelperContractUtil = {
    read: {},

    write: {
      /**
       *
       * @param param0
       * @returns
       */
      mintNextAndAddAuthMethods: async ({
        keyType,
        permittedAuthMethodTypes,
        permittedAuthMethodIds,
        permittedAuthMethodPubkeys,
        permittedAuthMethodScopes,
        addPkpEthAddressAsPermittedAddress,
        sendPkpToItself,
        gasLimit,
      }: MintNextAndAddAuthMethods): Promise<ethers.ContractTransaction> => {
        const [pkpNftContract, pkpHelperContract] = await Promise.all([
          LitContracts.getLitContract(this.network, 'PKPNFT'),
          LitContracts.getLitContract(this.network, 'PKPHelper'),
        ]);
        // first get mint cost
        const mintCost = await pkpNftContract['mintCost']();

        const tx = await this._callWithAdjustedOverrides(
          pkpHelperContract,
          'mintNextAndAddAuthMethods',
          [
            keyType,
            permittedAuthMethodTypes,
            permittedAuthMethodIds as BytesLike[],
            permittedAuthMethodPubkeys as BytesLike[],
            permittedAuthMethodScopes,
            addPkpEthAddressAsPermittedAddress,
            sendPkpToItself,
          ],
          { value: mintCost, gasLimit }
        );
        return tx;
      },
    },
  };

  private _getAdjustedGasLimit = async <
    T extends ethers.Contract,
    K extends keyof T['functions']
  >(
    contract: T,
    method: K,
    args: Parameters<T['functions'][K]>,
    overrides: ethers.CallOverrides = {},
    gasLimitAdjustment: ethers.BigNumber = GAS_LIMIT_ADJUSTMENT
  ): Promise<ethers.BigNumber> => {
    const gasLimit = await contract.estimateGas[method as string](
      ...args,
      overrides
    );
    // BigNumber uses integer math, so for example, to get a 10% increase,
    // we multiply it by 110 to get 10% more gas and then divide
    // by 100 to get the final gas limit
    return gasLimit.mul(gasLimitAdjustment).div(100);
  };

  private async _callWithAdjustedOverrides<
    T extends ethers.Contract,
    K extends keyof T['functions']
  >(
    contract: T,
    method: K,
    args: Parameters<T['functions'][K]>,
    overrides: ethers.CallOverrides = {},
    gasLimitAdjustment: ethers.BigNumber = GAS_LIMIT_ADJUSTMENT
  ): Promise<ReturnType<T['functions'][K]>> {
    // Check if the method exists on the contract
    if (!(method in contract.functions)) {
      throw new Error(
        `Method ${String(method)} does not exist on the contract`
      );
    }

    // Adjust the gas limit
    const gasLimit =
      overrides.gasLimit ??
      (await this._getAdjustedGasLimit(
        contract,
        method,
        args,
        overrides,
        gasLimitAdjustment
      ));

    // Call the contract method with adjusted overrides
    return contract.functions[method as string](...args, {
      ...overrides,
      gasLimit,
    }) as ReturnType<T['functions'][K]>;
  }
}
