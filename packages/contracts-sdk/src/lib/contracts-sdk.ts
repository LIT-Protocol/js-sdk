/* eslint-disable import/order */
import { isBrowser, isNode, log } from '@lit-protocol/misc';
import {
  ContractName,
  CreateCustomAuthMethodRequest,
  EpochInfo,
  GasLimitParam,
  LIT_NETWORKS_KEYS,
  LitContractContext,
  LitContractResolverContext,
  MintNextAndAddAuthMethods,
  MintWithAuthParams,
  MintWithAuthResponse,
  PriceFeedInfo,
} from '@lit-protocol/types';
import { BigNumberish, BytesLike, ContractReceipt, ethers } from 'ethers';
import { decToHex, hexToDec, intToIP } from './hex2dec';

// ----- autogen:import-data:start  -----
// Generated at 2023-11-07T01:50:52.460Z
import { AllowlistData } from '../abis/Allowlist.sol/AllowlistData';
import { LITTokenData } from '../abis/LITToken.sol/LITTokenData';
import { MultisenderData } from '../abis/Multisender.sol/MultisenderData';
import { PKPHelperData } from '../abis/PKPHelper.sol/PKPHelperData';
import { PKPNFTData } from '../abis/PKPNFT.sol/PKPNFTData';
import { PKPNFTMetadataData } from '../abis/PKPNFTMetadata.sol/PKPNFTMetadataData';
import { PKPPermissionsData } from '../abis/PKPPermissions.sol/PKPPermissionsData';
import { PubkeyRouterData } from '../abis/PubkeyRouter.sol/PubkeyRouterData';
import { StakingData } from '../abis/Staking.sol/StakingData';
// ----- autogen:import-data:end  -----

// ----- autogen:imports:start  -----
// Generated at 2023-11-07T01:50:52.460Z
import * as allowlistContract from '../abis/Allowlist.sol/Allowlist';
import * as litTokenContract from '../abis/LITToken.sol/LITToken';
import * as multisenderContract from '../abis/Multisender.sol/Multisender';
import * as pkpHelperContract from '../abis/PKPHelper.sol/PKPHelper';
import * as pkpNftContract from '../abis/PKPNFT.sol/PKPNFT';
import * as pkpNftMetadataContract from '../abis/PKPNFTMetadata.sol/PKPNFTMetadata';
import * as pkpPermissionsContract from '../abis/PKPPermissions.sol/PKPPermissions';
import * as pubkeyRouterContract from '../abis/PubkeyRouter.sol/PubkeyRouter';
import * as stakingContract from '../abis/Staking.sol/Staking';
// ----- autogen:imports:end  -----

import {
  AUTH_METHOD_SCOPE_VALUES,
  AUTH_METHOD_TYPE_VALUES,
  HTTP,
  HTTPS,
  HTTP_BY_NETWORK,
  InitError,
  InvalidArgumentException,
  LIT_NETWORK,
  LIT_NETWORK_VALUES,
  METAMASK_CHAIN_INFO_BY_NETWORK,
  NETWORK_CONTEXT_BY_NETWORK,
  PRODUCT_IDS,
  ParamsMissingError,
  RPC_URL_BY_NETWORK,
  TransactionError,
  WrongNetworkException,
} from '@lit-protocol/constants';
import { LogManager, Logger } from '@lit-protocol/logger';
import { derivedAddresses } from '@lit-protocol/misc';
import { TokenInfo } from '@lit-protocol/types';
import { computeAddress } from 'ethers/lib/utils';
import { IPubkeyRouter } from '../abis/PKPNFT.sol/PKPNFT';
import { getAuthIdByAuthMethod, stringToArrayify } from './auth-utils';
import {
  CIDParser,
  IPFSHash,
  getBytes32FromMultihash,
} from './helpers/getBytes32FromMultihash';
import { ValidatorStruct } from './types';

// FIXME: this should be dynamically set, but we only have 1 net atm.
const REALM_ID = 1;

declare global {
  interface Window {
    ethereum: any;
  }
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
  // ----- autogen:declares:start  -----
  // Generated at 2023-11-07T01:50:52.460Z
  allowlistContract: {
    read: allowlistContract.Allowlist;
    write: allowlistContract.Allowlist;
  };

  litTokenContract: {
    read: litTokenContract.LITToken;
    write: litTokenContract.LITToken;
  };

  multisenderContract: {
    read: multisenderContract.Multisender;
    write: multisenderContract.Multisender;
  };

  pkpHelperContract: {
    read: pkpHelperContract.PKPHelper;
    write: pkpHelperContract.PKPHelper;
  };

  pkpNftContract: {
    read: pkpNftContract.PKPNFT;
    write: pkpNftContract.PKPNFT;
  };

  pkpNftMetadataContract: {
    read: pkpNftMetadataContract.PKPNFTMetadata;
    write: pkpNftMetadataContract.PKPNFTMetadata;
  };

  pkpPermissionsContract: {
    read: pkpPermissionsContract.PKPPermissions;
    write: pkpPermissionsContract.PKPPermissions;
  };

  pubkeyRouterContract: {
    read: pubkeyRouterContract.PubkeyRouter;
    write: pubkeyRouterContract.PubkeyRouter;
  };

  stakingContract: {
    read: stakingContract.Staking;
    write: stakingContract.Staking;
  };

  // ----- autogen:declares:end  -----
  // make the constructor args optional
  constructor(args?: {
    provider?: ethers.providers.StaticJsonRpcProvider | any;
    customContext?: LitContractContext | LitContractResolverContext;
    rpcs?: string[] | any;
    rpc?: string | any;
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
    this.network = args?.network || LIT_NETWORK.DatilDev;
    // if rpc is not specified, use the default rpc
    if (!this.rpc) {
      this.rpc = RPC_URL_BY_NETWORK[this.network];
    }

    if (!this.rpcs) {
      this.rpcs = [this.rpc];
    }

    // ----- autogen:blank-init:start  -----
    // Generated at 2023-11-07T01:50:52.460Z
    this.allowlistContract = {} as any;
    this.litTokenContract = {} as any;
    this.multisenderContract = {} as any;
    this.pkpHelperContract = {} as any;
    this.pkpNftContract = {} as any;
    this.pkpNftMetadataContract = {} as any;
    this.pkpPermissionsContract = {} as any;
    this.pubkeyRouterContract = {} as any;
    this.stakingContract = {} as any;
    // ----- autogen:blank-init:end  -----
  }

  /**
   * Logs a message to the console.
   *
   * @param {any} [args] An optional value to log with the message.
   */
  log = (...args: any) => {
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

      function _decimalToHex(decimal: number): string {
        return '0x' + decimal.toString(16);
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

        // @ts-ignore
        this.provider = this.signer.rpcProvider;
        this.isPKP = true;
      }
    }

    this.log('Your Signer:', this.signer);
    this.log('Your Provider:', this.provider?.connection!);

    if (!this.provider) {
      this.log('No provider found. Will try to use the one from the signer.');
      this.provider = this.signer.provider;
      this.log('Your Provider(from signer):', this.provider?.connection!);
    }

    const addresses: any = await LitContracts.getContractAddresses(
      this.network,
      this.customContext?.provider ?? this.provider,
      this.customContext
    );

    const logAddresses = Object.entries(addresses).reduce(
      (output, [key, val]) => {
        // @ts-expect-error since the object hash returned by `getContractAddresses` is `any`, we have no types here
        output[key] = val.address;
        return output;
      },
      {}
    );

    this.log('resolved contract addresses for: ', this.network, logAddresses);

    if (addresses.Allowlist.abi) {
      this.allowlistContract = {
        read: new ethers.Contract(
          addresses.Allowlist.address,
          addresses.Allowlist.abi as any,
          this.provider
        ) as allowlistContract.Allowlist,
        write: new ethers.Contract(
          addresses.Allowlist.address,
          addresses.Allowlist.abi as any,
          this.signer
        ) as allowlistContract.Allowlist,
      };
    }

    if (addresses.LITToken.abi) {
      this.litTokenContract = {
        read: new ethers.Contract(
          addresses.LITToken.address,
          addresses.LITToken.abi as ethers.ContractInterface,
          this.provider
        ) as litTokenContract.LITToken,
        write: new ethers.Contract(
          addresses.LITToken.address,
          addresses.LITToken.abi as ethers.ContractInterface,
          this.signer
        ) as litTokenContract.LITToken,
      };
    }

    if (addresses.Multisender.abi) {
      this.multisenderContract = {
        read: new ethers.Contract(
          addresses.Multisender.address,
          addresses.Multisender.abi as ethers.ContractInterface,
          this.provider
        ) as multisenderContract.Multisender,
        write: new ethers.Contract(
          addresses.Multisender.address,
          addresses.Multisender.abi as ethers.ContractInterface,
          this.signer
        ) as multisenderContract.Multisender,
      };
    }
    if (addresses.PKPHelper.abi) {
      this.pkpHelperContract = {
        read: new ethers.Contract(
          addresses.PKPHelper.address,
          addresses.PKPHelper.abi as ethers.ContractInterface,
          this.provider
        ) as pkpHelperContract.PKPHelper,
        write: new ethers.Contract(
          addresses.PKPHelper.address,
          addresses.PKPHelper.abi as any,
          this.signer
        ) as pkpHelperContract.PKPHelper,
      };
    }

    if (addresses.PKPNFT.abi) {
      this.pkpNftContract = {
        read: new ethers.Contract(
          addresses.PKPNFT.address,
          addresses.PKPNFT.abi as any,
          this.provider
        ) as pkpNftContract.PKPNFT,
        write: new ethers.Contract(
          addresses.PKPNFT.address,
          addresses.PKPNFT.abi as any,
          this.signer
        ) as pkpNftContract.PKPNFT,
      };
    }
    if (addresses.PKPNFTMetadata.abi) {
      this.pkpNftMetadataContract = {
        read: new ethers.Contract(
          addresses.PKPNFTMetadata.address,
          addresses.PKPNFTMetadata.abi as any,
          this.provider
        ) as pkpNftMetadataContract.PKPNFTMetadata,
        write: new ethers.Contract(
          addresses.PKPNFTMetadata.address,
          addresses.PKPNFTMetadata.abi as any,
          this.signer
        ) as pkpNftMetadataContract.PKPNFTMetadata,
      };
    }

    if (addresses.PKPPermissions.abi) {
      this.pkpPermissionsContract = {
        read: new ethers.Contract(
          addresses.PKPPermissions.address,
          addresses.PKPPermissions.abi as any,
          this.provider
        ) as pkpPermissionsContract.PKPPermissions,
        write: new ethers.Contract(
          addresses.PKPPermissions.address,
          addresses.PKPPermissions.abi as any,
          this.signer
        ) as pkpPermissionsContract.PKPPermissions,
      };
    }

    if (addresses.PubkeyRouter.abi) {
      this.pubkeyRouterContract = {
        read: new ethers.Contract(
          addresses.PubkeyRouter.address,
          addresses.PubkeyRouter.abi as any,
          this.provider
        ) as pubkeyRouterContract.PubkeyRouter,
        write: new ethers.Contract(
          addresses.PubkeyRouter.address,
          addresses.PubkeyRouter.abi as any,
          this.signer
        ) as pubkeyRouterContract.PubkeyRouter,
      };
    }

    if (addresses.Staking.abi) {
      this.stakingContract = {
        read: new ethers.Contract(
          addresses.Staking.address,
          addresses.Staking.abi as any,
          this.provider
        ) as stakingContract.Staking,
        write: new ethers.Contract(
          addresses.Staking.address,
          addresses.Staking.abi as any,
          this.signer
        ) as stakingContract.Staking,
      };
    }
    this.connected = true;
  };

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
    let provider: ethers.providers.StaticJsonRpcProvider;

    const _rpcUrl = rpcUrl || RPC_URL_BY_NETWORK[network];

    if (context && 'provider' in context!) {
      provider = context.provider;
    } else {
      provider = new ethers.providers.StaticJsonRpcProvider({
        url: _rpcUrl,
        skipFetchSetup: true,
      });
    }

    if (!context) {
      const contractData = await LitContracts._resolveContractContext(network);

      const priceFeedContract = contractData.find(
        (item: { name: string }) => item.name === 'PriceFeed'
      );
      const { address, abi } = priceFeedContract!;

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
          '❌ Required contract data is missing for PriceFeed'
        );
      }

      return new ethers.Contract(address, abi, provider);
    } else {
      if (!context.resolverAddress) {
        const priceFeedContract = (context as LitContractContext).PriceFeed;

        if (!priceFeedContract.address) {
          throw new InitError(
            {
              info: {
                priceFeedContract,
                context,
              },
            },
            '❌ Could not get PriceFeed contract address from contract context'
          );
        }
        return new ethers.Contract(
          priceFeedContract.address,

          // FIXME: NOTE!! PriceFeedData.abi is not used since we don't use the imported ABIs in this package.
          // We should remove all imported ABIs and exclusively use NETWORK_CONTEXT_BY_NETWORK to retrieve ABIs for all other contracts.

          // old convention: priceFeedContract.abi ?? PriceFeedData.abi

          // new convention
          priceFeedContract.abi,
          provider
        );
      } else {
        const contractContext = await LitContracts._getContractsFromResolver(
          context as LitContractResolverContext,
          provider,
          ['PriceFeed']
        );

        if (!contractContext.PriceFeed.address) {
          throw new InitError(
            {
              info: {
                contractContext,
                context,
              },
            },
            '❌ Could not get PriceFeed contract from contract resolver instance'
          );
        }

        const priceFeedABI = NETWORK_CONTEXT_BY_NETWORK[network].data.find(
          (data: any) => {
            return data.name === 'PriceFeed';
          }
        );

        return new ethers.Contract(
          contractContext.PriceFeed.address,
          contractContext.PriceFeed.abi ?? priceFeedABI?.contracts[0].ABI,
          provider
        );
      }
    }
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
    let provider: ethers.providers.StaticJsonRpcProvider;

    const _rpcUrl = rpcUrl || RPC_URL_BY_NETWORK[network];

    if (context && 'provider' in context!) {
      provider = context.provider;
    } else {
      provider = new ethers.providers.StaticJsonRpcProvider({
        url: _rpcUrl,
        skipFetchSetup: true,
      });
    }

    if (!context) {
      const contractData = await LitContracts._resolveContractContext(
        network
        //context
      );

      const stakingContract = contractData.find(
        (item: { name: string }) => item.name === 'Staking'
      );
      const { address, abi } = stakingContract!;

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
          '❌ Required contract data is missing'
        );
      }

      return new ethers.Contract(address, abi, provider);
    } else {
      // if we have contract context then we determine if there exists a `resolverAddress`
      // if there is a resolver address we assume we are using a contract resolver for bootstrapping of contracts
      if (!context.resolverAddress) {
        const stakingContract = (context as LitContractContext).Staking;

        if (!stakingContract.address) {
          throw new InitError(
            {
              info: {
                stakingContract,
                context,
              },
            },
            '❌ Could not get staking contract address from contract context'
          );
        }

        return new ethers.Contract(
          stakingContract.address,
          stakingContract.abi ?? StakingData.abi,
          provider
        );
      } else {
        const contractContext = await LitContracts._getContractsFromResolver(
          context as LitContractResolverContext,
          provider,
          ['Staking']
        );
        if (!contractContext.Staking.address) {
          throw new InitError(
            {
              info: {
                contractContext,
                context,
              },
            },
            '❌ Could not get Staking Contract from contract resolver instance'
          );
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore data is callable as an array type
        const stakingABI = NETWORK_CONTEXT_BY_NETWORK[network].data.find(
          (data: any) => {
            return data.name === 'Staking';
          }
        );

        return new ethers.Contract(
          contractContext.Staking.address,
          contractContext.Staking.abi ?? stakingABI?.contracts[0].ABI,
          provider
        );
      }
    }
  }

  private static async _getContractsFromResolver(
    context: LitContractResolverContext,
    provider: ethers.providers.StaticJsonRpcProvider,
    contractNames?: ContractName[]
  ): Promise<LitContractContext> {
    const resolverContract = new ethers.Contract(
      context.resolverAddress,
      context.abi,
      provider
    );

    const getContract = async function (
      contract: keyof LitContractContext,
      environment: number
    ): Promise<string> {
      let address: string = '';
      switch (contract) {
        case 'Allowlist' || 'AllowList':
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
      contractData = await LitContracts._resolveContractContext(network);
    }

    // Destructure the data for easier access
    const addresses: any = {};
    for (const contract of contractData) {
      switch (contract.name) {
        case 'Allowlist':
          addresses.Allowlist = {};
          addresses.Allowlist.address = contract.address;
          addresses.Allowlist.abi = contract.abi ?? AllowlistData.abi;
          break;
        case 'PKPHelper':
          addresses.PKPHelper = {};
          addresses.PKPHelper.address = contract.address;
          addresses.PKPHelper.abi = contract?.abi ?? PKPHelperData.abi;
          break;
        case 'PKPNFT':
          addresses.PKPNFT = {};
          addresses.PKPNFT.address = contract.address;
          addresses.PKPNFT.abi = contract?.abi ?? PKPNFTData.abi;
          break;
        case 'Staking':
          addresses.Staking = {};
          addresses.Staking.address = contract.address;
          addresses.Staking.abi = contract.abi ?? StakingData.abi;
          break;
        case 'PKPPermissions':
          addresses.PKPPermissions = {};
          addresses.PKPPermissions.address = contract.address;
          addresses.PKPPermissions.abi = contract.abi ?? PKPPermissionsData.abi;
          break;
        case 'PKPNFTMetadata':
          addresses.PKPNFTMetadata = {};
          addresses.PKPNFTMetadata.address = contract.address;
          addresses.PKPNFTMetadata.abi = contract.abi ?? PKPNFTMetadataData.abi;
          break;
        case 'PubkeyRouter':
          addresses.PubkeyRouter = {};
          addresses.PubkeyRouter.address = contract.address;
          addresses.PubkeyRouter.abi = contract?.abi ?? PubkeyRouterData.abi;
          break;
        case 'LITToken':
          addresses.LITToken = {};
          addresses.LITToken.address = contract.address;
          addresses.LITToken.abi = contract?.abi ?? LITTokenData.abi;
          break;
        case 'Multisender':
          addresses.Multisender = {};
          addresses.Multisender.address = contract.address;
          addresses.Multisender.abi = contract?.abi ?? MultisenderData.abi;
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
    nodeProtocol?: string;
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
    sortByPrice,
  }: {
    litNetwork: LIT_NETWORKS_KEYS;
    networkContext?: LitContractContext | LitContractResolverContext;
    rpcUrl?: string;
    nodeProtocol?: typeof HTTP | typeof HTTPS | null;
    sortByPrice?: boolean;
  }): Promise<{
    stakingContract: ethers.Contract;
    epochInfo: EpochInfo;
    minNodeCount: number;
    bootstrapUrls: string[];
    priceByNetwork: Record<string, number>;
  }> => {
    // if it's true, we will sort the networks by price feed from lowest to highest
    // if it's false, we will not sort the networks
    let _sortByPrice = sortByPrice || true;

    if (_sortByPrice) {
      log('Sorting networks by price feed from lowest to highest');
    } else {
      log('Not sorting networks by price feed');
    }

    const stakingContract = await LitContracts.getStakingContract(
      litNetwork,
      networkContext,
      rpcUrl
    );

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

    if (!minNodeCountInt) {
      throw new Error('❌ Minimum validator count is not set');
    }

    if (activeUnkickedValidatorStructs.length < minNodeCountInt) {
      throw new Error(
        `❌ Active validator set does not meet the consensus. Required: ${minNodeCountInt} but got: ${activeUnkickedValidatorStructs.length}`
      );
    }

    const activeValidatorStructs: ValidatorStruct[] =
      activeUnkickedValidatorStructs.map((item: any) => {
        return {
          ip: item[0],
          ipv6: item[1],
          port: item[2],
          nodeAddress: item[3],
          reward: item[4],
          seconderPubkey: item[5],
          receiverPubkey: item[6],
        };
      });

    const unsortedNetworks = LitContracts.generateValidatorURLs({
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
    const PRICE_BY_NETWORK = priceFeedInfo.networkPrices.mapByAddress;

    // sorted networks by prices (lowest to highest)
    // [
    //   'http://xxx:7470', <-- lowest price
    //   'http://zzz:7472', <-- middle price
    //   'http://yyy:7471' <-- highest price
    // ]
    const sortedNetworks = unsortedNetworks.sort(
      (a, b) => PRICE_BY_NETWORK[a] - PRICE_BY_NETWORK[b]
    );

    const bootstrapUrls = _sortByPrice ? sortedNetworks : unsortedNetworks;

    return {
      stakingContract,
      epochInfo: typedEpochInfo,
      minNodeCount: minNodeCountInt,
      bootstrapUrls: bootstrapUrls,
      priceByNetwork: PRICE_BY_NETWORK,
    };
  };

  /**
   * Gets price feed information for nodes in the network.
   *
   * @param {Object} params - The parameters object
   * @param {LIT_NETWORKS_KEYS} params.litNetwork - The Lit network to get price feed info for
   * @param {LitContractContext | LitContractResolverContext} [params.networkContext] - Optional network context
   * @param {string} [params.rpcUrl] - Optional RPC URL to use
   * @param {number[]} [params.productIds] - Optional array of product IDs to get prices for. Defaults to [DECRYPTION, LA, SIGN]
   * @param {typeof HTTP | typeof HTTPS | null} [params.nodeProtocol] - Optional node protocol to use
   *
   * @returns {Promise<{
   *   epochId: number,
   *   minNodeCount: number,
   *   networkPrices: {
   *     arr: Array<{network: string, price: number}>,
   *     mapByAddress: Record<string, number>
   *   }
   * }>}
   */
  public static getPriceFeedInfo = async ({
    realmId,
    litNetwork,
    networkContext,
    rpcUrl,
    productIds, // Array of product IDs
  }: {
    realmId: number;
    litNetwork: LIT_NETWORKS_KEYS;
    networkContext?: LitContractContext | LitContractResolverContext;
    rpcUrl?: string;
    nodeProtocol?: typeof HTTP | typeof HTTPS | null;
    productIds?: (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS][];
  }): Promise<PriceFeedInfo> => {
    if (!productIds || productIds.length === 0) {
      log('No product IDs provided. Defaulting to 0');
      productIds = [PRODUCT_IDS.DECRYPTION, PRODUCT_IDS.LA, PRODUCT_IDS.SIGN];
    }

    // check if productIds is any numbers in the PRODUCT_IDS object
    productIds.forEach((productId) => {
      if (!Object.values(PRODUCT_IDS).includes(productId)) {
        throw new Error(
          `❌ Invalid product ID: ${productId}. We only accept ${Object.values(
            PRODUCT_IDS
          ).join(', ')}`
        );
      }
    });

    const priceFeedContract = await LitContracts.getPriceFeedContract(
      litNetwork,
      networkContext,
      rpcUrl
    );

    const nodesForRequest = await priceFeedContract['getNodesForRequest'](
      realmId,
      productIds
    );

    const epochId = nodesForRequest[0].toNumber();
    const minNodeCount = nodesForRequest[1].toNumber();
    const nodesAndPrices = nodesForRequest[2];

    const activeValidatorStructs: ValidatorStruct[] = nodesAndPrices.map(
      (item: any) => {
        return {
          ip: item.validator.ip,
          ipv6: item.validator.ipv6,
          port: item.validator.port,
          nodeAddress: item.validator.nodeAddress,
          reward: item.validator.reward,
          seconderPubkey: item.validator.seconderPubkey,
          receiverPubkey: item.validator.receiverPubkey,
        };
      }
    );

    const networks = LitContracts.generateValidatorURLs({
      activeValidatorStructs,
      litNetwork,
    });

    console.log('networks:', networks);

    const prices = nodesAndPrices.flatMap((item: any) => {
      // Flatten the nested prices array and convert BigNumber to number
      return item.prices.map((price: ethers.BigNumber) =>
        parseFloat(price.toString())
      );
    });

    console.log('Prices as numbers:', prices);

    const networkPriceMap: Record<string, number> = networks.reduce(
      (acc: any, network, index) => {
        acc[network] = prices[index];
        return acc;
      },
      {}
    );

    console.log('Network to Price Map:', networkPriceMap);

    const networkPriceObjArr = networks.map((network, index) => {
      return {
        network, // The key will be the network URL
        price: prices[index], // The value will be the corresponding price
      };
    });

    return {
      epochId,
      minNodeCount,
      networkPrices: {
        arr: networkPriceObjArr,
        mapByAddress: networkPriceMap,
      },
    };
  };

  private static async _resolveContractContext(
    network: LIT_NETWORK_VALUES
    // context?: LitContractContext | LitContractResolverContext
  ) {
    // -- check if it's supported network
    if (!NETWORK_CONTEXT_BY_NETWORK[network]) {
      throw new WrongNetworkException(
        {
          info: {
            network,
          },
        },
        `[_resolveContractContext] Unsupported network: ${network}`
      );
    }

    const data = NETWORK_CONTEXT_BY_NETWORK[network];

    if (!data) {
      throw new WrongNetworkException(
        {
          info: {
            network,
          },
        },
        '[_resolveContractContext] No data found'
      );
    }

    // Normalize the data to the LitContractContext type
    return data.data.map((c: any) => ({
      address: c.contracts[0].address_hash,
      abi: c.contracts[0].ABI,
      name: c.name,
    }));
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

    if (!this.pkpNftContract) {
      throw new InitError(
        {
          info: {
            pkpNftContract: this.pkpNftContract,
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
    const mintCost = await this.pkpNftContract.read.mintCost();

    // -- start minting
    const tx = await this._callWithAdjustedOverrides(
      this.pkpHelperContract.write,
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
      publicKey = await this.pkpNftContract.read.getPubkey(tokenId);
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
  mintWithCustomAuth = async (
    params: CreateCustomAuthMethodRequest
  ): Promise<MintWithAuthResponse<ContractReceipt>> => {
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
      const res = await this._callWithAdjustedOverrides(
        this.pkpPermissionsContract.write,
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
      const res = await this._callWithAdjustedOverrides(
        this.pkpPermissionsContract.write,
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

    // convert timestamp to YYYY/MM/DD format
    timestamp2Date: (timestamp: string): string => {
      const date = require('date-and-time');

      const format = 'YYYY/MM/DD HH:mm:ss';

      const timestampFormatted: Date = new Date(parseInt(timestamp) * 1000);

      return date.format(timestampFormatted, format);
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
        if (!this.pkpNftContract) {
          throw new InitError(
            {
              info: {
                pkpNftContract: this.pkpNftContract,
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
            token = await this.pkpNftContract.read.tokenOfOwnerByIndex(
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
        if (!this.pkpNftContract) {
          throw new InitError(
            {
              info: {
                pkpNftContract: this.pkpNftContract,
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
            token = await this.pkpNftContract.read.tokenByIndex(i);

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
        const tokenIds = await this.pkpNftContractUtils.read.getTokensByAddress(
          ownerAddress
        );

        const arr = [];

        // for each pkp
        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i];
          const pubKey = await this.pkpNftContract.read.getPubkey(tokenId);
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

        if (!this.pkpNftContract) {
          throw new InitError(
            {
              info: {
                pkpNftContract: this.pkpNftContract,
              },
            },
            'Contract is not available'
          );
        }

        let mintCost;

        try {
          mintCost = await this.pkpNftContract.read.mintCost();
        } catch (e) {
          throw new TransactionError(
            {
              info: {
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
          this.pkpNftContract.write,
          'mintNext',
          [2],
          { value: mintCost, ...param }
        );

        this.log('sentTx:', sentTx);

        const res: any = await sentTx.wait();
        this.log('res:', res);

        const events = 'events' in res ? res.events : res.logs;

        const tokenIdFromEvent = events[0].topics[1];
        this.log('tokenIdFromEvent:', tokenIdFromEvent);
        let tries = 0;
        const maxAttempts = 10;
        let publicKey = '';
        while (tries < maxAttempts) {
          publicKey = await this.pkpNftContract.read.getPubkey(
            tokenIdFromEvent
          );
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
        signatures: IPubkeyRouter.SignatureStruct[],
        txOpts: ethers.CallOverrides = {}
      ) => {
        try {
          const tx = await this._callWithAdjustedOverrides(
            this.pkpNftContract.write,
            'claimAndMint',
            [2, derivedKeyId, signatures],
            {
              ...txOpts,
              value:
                txOpts.value ?? (await this.pkpNftContract.read.mintCost()),
            }
          );

          const txRec = await tx.wait();

          const events: any = 'events' in txRec ? txRec.events : txRec.logs;
          const tokenId = events[1].topics[1];
          return { tx, res: txRec, tokenId };
        } catch (e: any) {
          this.log(`[claimAndMint] error: ${e.message}`);
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

        if (!this.pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        const pkpIdHex = this.utils.decToHex(tokenId, null) as string;

        const bool = await this.pkpPermissionsContract.read.isPermittedAddress(
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
        if (!this.pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
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
            addresses =
              await this.pkpPermissionsContract.read.getPermittedAddresses(
                tokenId
              );
            if (addresses.length <= 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              tries++;
              continue;
            } else {
              break;
            }
          } catch (e: any) {
            this.log(
              `[getPermittedAddresses] error<e.message | ${tries}>:`,
              e.message
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

        if (!this.pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
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
            actions =
              await this.pkpPermissionsContract.read.getPermittedActions(
                tokenId
              );

            if (actions.length <= 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              tries++;
              continue;
            } else {
              break;
            }
          } catch (e: any) {
            this.log(
              `[getPermittedActions] error<e.message | ${tries}>:`,
              e.message
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

        if (!this.pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[isPermittedAction] input<pkpId>:', pkpId);
        this.log('[isPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[isPermittedAction] converted<ipfsHash>:', ipfsHash);

        const bool = await this.pkpPermissionsContract.read.isPermittedAction(
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

        if (!this.pkpPermissionsContract || !this.pubkeyRouterContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
                pubkeyRouterContract: this.pubkeyRouterContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[addPermittedAction] input<pkpId>:', pkpId);

        const pubKey = await this.pubkeyRouterContract.read.getPubkey(pkpId);
        this.log('[addPermittedAction] converted<pubKey>:', pubKey);

        const pubKeyHash = ethers.utils.keccak256(pubKey);
        this.log('[addPermittedAction] converted<pubKeyHash>:', pubKeyHash);

        const tokenId = ethers.BigNumber.from(pubKeyHash);
        this.log('[addPermittedAction] converted<tokenId>:', tokenId);

        this.log('[addPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsIdBytes = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[addPermittedAction] converted<ipfsIdBytes>:', ipfsIdBytes);

        const tx = await this._callWithAdjustedOverrides(
          this.pkpPermissionsContract.write,
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

        if (!this.pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
              },
            },
            'Contract is not available'
          );
        }

        this.log('[addPermittedAddress] input<pkpId>:', pkpId);
        this.log('[addPermittedAddress] input<ownerAddress>:', ownerAddress);

        this.log('[addPermittedAddress] input<pkpId>:', pkpId);

        const tx = await this._callWithAdjustedOverrides(
          this.pkpPermissionsContract.write,
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

        if (!this.pkpPermissionsContract) {
          throw new InitError(
            {
              info: {
                pkpPermissionsContract: this.pkpPermissionsContract,
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
          this.pkpPermissionsContract.write,
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
        // first get mint cost
        const mintCost = await this.pkpNftContract.read.mintCost();

        const tx = await this._callWithAdjustedOverrides(
          this.pkpHelperContract.write,
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
      // claimAndMintNextAndAddAuthMethods: async (
      //   keyType: number,
      //   derivedKeyId: string,
      //   signatures: pkpHelperContract.IPubkeyRouter.SignatureStruct[],
      //   permittedAuthMethodTypes: string[],
      //   permittedAuthMethodIds: string[],
      //   permittedAuthMethodPubkeys: string[],
      //   permittedAuthMethodScopes: string[][],
      //   addPkpEthAddressAsPermittedAddress: boolean,
      //   sendPkpToItself: boolean
      // ): Promise<any> => {
      //   const mintCost = await this.pkpNftContract.read.mintCost();
      //   this.pkpHelperContract.write.claimAndMintNextAndAddAuthMethods(
      //     keyType,
      //     `0x${derivedKeyId}` as BytesLike,
      //     signatures,
      //     permittedAuthMethodTypes,
      //     permittedAuthMethodIds as BytesLike[],
      //     permittedAuthMethodPubkeys as BytesLike[],
      //     permittedAuthMethodScopes,
      //     addPkpEthAddressAsPermittedAddress,
      //     sendPkpToItself,
      //     { value: mintCost }
      //   );
      // },
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
