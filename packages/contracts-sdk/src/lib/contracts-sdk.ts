/* eslint-disable import/order */
import { isBrowser, isNode } from '@lit-protocol/misc';
import {
  CreateCustomAuthMethodRequest,
  EpochInfo,
  GasLimitParam,
  LIT_NETWORKS_KEYS,
  LitContractContext,
  LitContractResolverContext,
  MintCapacityCreditsContext,
  MintCapacityCreditsRes,
  MintNextAndAddAuthMethods,
  MintWithAuthParams,
  MintWithAuthResponse,
} from '@lit-protocol/types';
import bs58 from 'bs58';
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
import { RateLimitNFTData } from '../abis/RateLimitNFT.sol/RateLimitNFTData';
import { StakingData } from '../abis/Staking.sol/StakingData';
import { StakingBalancesData } from '../abis/StakingBalances.sol/StakingBalancesData';
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
import * as rateLimitNftContract from '../abis/RateLimitNFT.sol/RateLimitNFT';
import * as stakingContract from '../abis/Staking.sol/Staking';
import * as stakingBalancesContract from '../abis/StakingBalances.sol/StakingBalances';
// ----- autogen:imports:end  -----

import {
  AUTH_METHOD_TYPE_VALUES,
  AUTH_METHOD_SCOPE_VALUES,
  METAMASK_CHAIN_INFO_BY_NETWORK,
  NETWORK_CONTEXT_BY_NETWORK,
  LIT_NETWORK_VALUES,
  RPC_URL_BY_NETWORK,
  HTTP_BY_NETWORK,
  CENTRALISATION_BY_NETWORK,
  LIT_NETWORK,
  HTTP,
  HTTPS,
  InitError,
  NetworkError,
  WrongNetworkException,
  ParamsMissingError,
  InvalidArgumentException,
  TransactionError,
} from '@lit-protocol/constants';
import { LogManager, Logger } from '@lit-protocol/logger';
import { computeAddress } from 'ethers/lib/utils';
import { IPubkeyRouter } from '../abis/PKPNFT.sol/PKPNFT';
import { TokenInfo, derivedAddresses } from './addresses';
import { getAuthIdByAuthMethod, stringToArrayify } from './auth-utils';
import {
  CIDParser,
  IPFSHash,
  getBytes32FromMultihash,
} from './helpers/getBytes32FromMultihash';
import { calculateUTCMidnightExpiration, requestsToKilosecond } from './utils';
import { ValidatorStruct } from './types';

// const DEFAULT_RPC = 'https://lit-protocol.calderachain.xyz/replica-http';
// const DEFAULT_READ_RPC = 'https://lit-protocol.calderachain.xyz/replica-http';

// This function asynchronously executes a provided callback function for each item in the given array.
// The callback function is awaited before continuing to the next iteration.
// The resulting array of callback return values is then returned.
//
// @param {Array<any>} array - The array to iterate over
// @param {Function} callback - The function to execute for each item in the array. This function
//                              must be asynchronous and should take the following parameters:
//                              - currentValue: The current item being processed in the array
//                              - index: The index of the current item being processed in the array
//                              - array: The array being iterated over
// @return {Array<any>} The array of callback return values
export const asyncForEachReturn = async (array: any[], callback: Function) => {
  const list = [];

  for (let index = 0; index < array.length; index++) {
    const item = await callback(array[index], index, array);
    list.push(item);
  }
  return list;
};

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

  rateLimitNftContract: {
    read: rateLimitNftContract.RateLimitNFT;
    write: rateLimitNftContract.RateLimitNFT;
  };

  stakingContract: {
    read: stakingContract.Staking;
    write: stakingContract.Staking;
  };

  stakingBalancesContract: {
    read: stakingBalancesContract.StakingBalances;
    write: stakingBalancesContract.StakingBalances;
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
    this.network = args?.network || 'cayenne';
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
    this.rateLimitNftContract = {} as any;
    this.stakingContract = {} as any;
    this.stakingBalancesContract = {} as any;
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
      this.provider = new ethers.providers.StaticJsonRpcProvider(this.rpc);
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
      console.warn('THIS.SIGNER:', this.signer);

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
        console.warn(
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
    this.log('Your Provider:', this.provider);

    if (!this.provider) {
      this.log('No provide found. Will try to use the one from the signer.');
      this.provider = this.signer.provider;
      this.log('Your Provider(from signer):', this.provider);
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
    // ----- autogen:init:start  -----
    // Generated at 2023-11-07T01:50:52.460Z

    this.allowlistContract = {
      read: new ethers.Contract(
        addresses.Allowlist.address,
        addresses.Allowlist.abi as any,
        this.provider
      ) as unknown as allowlistContract.Allowlist & allowlistContract.Allowlist,
      write: new ethers.Contract(
        addresses.Allowlist.address,
        addresses.Allowlist.abi as any,
        this.signer
      ) as unknown as allowlistContract.Allowlist & allowlistContract.Allowlist,
    };

    this.litTokenContract = {
      read: new ethers.Contract(
        addresses.LITToken.address,
        addresses.LITToken.abi as any,
        this.provider
      ) as unknown as litTokenContract.LITToken & litTokenContract.LITToken,
      write: new ethers.Contract(
        addresses.LITToken.address,
        addresses.LITToken.abi as any,
        this.signer
      ) as unknown as litTokenContract.LITToken & litTokenContract.LITToken,
    };

    this.multisenderContract = {
      read: new ethers.Contract(
        addresses.Multisender.address,
        addresses.Multisender.abi as any,
        this.provider
      ) as unknown as multisenderContract.Multisender &
        multisenderContract.Multisender,
      write: new ethers.Contract(
        addresses.Multisender.address,
        addresses.Multisender.abi as any,
        this.signer
      ) as unknown as multisenderContract.Multisender &
        multisenderContract.Multisender,
    };

    this.pkpHelperContract = {
      read: new ethers.Contract(
        addresses.PKPHelper.address,
        addresses.PKPHelper.abi as any,
        this.provider
      ) as unknown as pkpHelperContract.PKPHelper & pkpHelperContract.PKPHelper,
      write: new ethers.Contract(
        addresses.PKPHelper.address,
        addresses.PKPHelper.abi as any,
        this.signer
      ) as unknown as pkpHelperContract.PKPHelper & pkpHelperContract.PKPHelper,
    };

    this.pkpNftContract = {
      read: new ethers.Contract(
        addresses.PKPNFT.address,
        addresses.PKPNFT.abi as any,
        this.provider
      ) as unknown as pkpNftContract.PKPNFT & pkpNftContract.PKPNFT,
      write: new ethers.Contract(
        addresses.PKPNFT.address,
        addresses.PKPNFT.abi as any,
        this.signer
      ) as unknown as pkpNftContract.PKPNFT & pkpNftContract.PKPNFT,
    };

    this.pkpNftMetadataContract = {
      read: new ethers.Contract(
        addresses.PKPNFTMetadata.address,
        addresses.PKPNFTMetadata.abi as any,
        this.provider
      ) as unknown as pkpNftMetadataContract.PKPNFTMetadata &
        pkpNftMetadataContract.PKPNFTMetadata,
      write: new ethers.Contract(
        addresses.PKPNFTMetadata.address,
        addresses.PKPNFTMetadata.abi as any,
        this.signer
      ) as unknown as pkpNftMetadataContract.PKPNFTMetadata &
        pkpNftMetadataContract.PKPNFTMetadata,
    };

    this.pkpPermissionsContract = {
      read: new ethers.Contract(
        addresses.PKPPermissions.address,
        addresses.PKPPermissions.abi as any,
        this.provider
      ) as unknown as pkpPermissionsContract.PKPPermissions &
        pkpPermissionsContract.PKPPermissions,
      write: new ethers.Contract(
        addresses.PKPPermissions.address,
        addresses.PKPPermissions.abi as any,
        this.signer
      ) as unknown as pkpPermissionsContract.PKPPermissions &
        pkpPermissionsContract.PKPPermissions,
    };

    this.pubkeyRouterContract = {
      read: new ethers.Contract(
        addresses.PubkeyRouter.address,
        addresses.PubkeyRouter.abi as any,
        this.provider
      ) as unknown as pubkeyRouterContract.PubkeyRouter &
        pubkeyRouterContract.PubkeyRouter,
      write: new ethers.Contract(
        addresses.PubkeyRouter.address,
        addresses.PubkeyRouter.abi as any,
        this.signer
      ) as unknown as pubkeyRouterContract.PubkeyRouter &
        pubkeyRouterContract.PubkeyRouter,
    };

    this.rateLimitNftContract = {
      read: new ethers.Contract(
        addresses.RateLimitNFT.address,
        addresses.RateLimitNFT.abi as any,
        this.provider
      ) as unknown as rateLimitNftContract.RateLimitNFT &
        rateLimitNftContract.RateLimitNFT,
      write: new ethers.Contract(
        addresses.RateLimitNFT.address,
        addresses.RateLimitNFT.abi as any,
        this.signer
      ) as unknown as rateLimitNftContract.RateLimitNFT &
        rateLimitNftContract.RateLimitNFT,
    };

    this.stakingContract = {
      read: new ethers.Contract(
        addresses.Staking.address,
        addresses.Staking.abi as any,
        this.provider
      ) as unknown as stakingContract.Staking & stakingContract.Staking,
      write: new ethers.Contract(
        addresses.Staking.address,
        addresses.Staking.abi as any,
        this.signer
      ) as unknown as stakingContract.Staking & stakingContract.Staking,
    };

    this.stakingBalancesContract = {
      read: new ethers.Contract(
        addresses.StakingBalances.address,
        addresses.StakingBalances.abi as any,
        this.provider
      ) as unknown as stakingBalancesContract.StakingBalances &
        stakingBalancesContract.StakingBalances,
      write: new ethers.Contract(
        addresses.StakingBalances.address,
        addresses.StakingBalances.abi as any,
        this.signer
      ) as unknown as stakingBalancesContract.StakingBalances &
        stakingBalancesContract.StakingBalances,
    };
    // ----- autogen:init:end  -----

    this.connected = true;
  };

  public static async getStakingContract(
    network: LIT_NETWORKS_KEYS,
    context?: LitContractContext | LitContractResolverContext,
    rpcUrl?: string
  ) {
    let provider: ethers.providers.StaticJsonRpcProvider;
    rpcUrl = RPC_URL_BY_NETWORK[network];
    if (context && 'provider' in context!) {
      provider = context.provider;
    } else {
      provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
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
    contractNames?: (keyof LitContractContext)[]
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
        case 'RateLimitNFT':
          address = await resolverContract['getContract'](
            await resolverContract['RATE_LIMIT_NFT_CONTRACT'](),
            environment
          );
          break;
        case 'Staking':
          address = await resolverContract['getContract'](
            await resolverContract['STAKING_CONTRACT'](),
            environment
          );
          break;
        case 'StakingBalances':
          address = await resolverContract['getContract'](
            await resolverContract['STAKING_BALANCES_CONTRACT'](),
            environment
          );
          break;
      }

      return address;
    };

    if (!contractNames) {
      contractNames = [
        'Allowlist',
        'Staking',
        'RateLimitNFT',
        'PubkeyRouter',
        'PKPHelper',
        'PKPPermissions',
        'PKPNFTMetadata',
        'PKPNFT',
        'Multisender',
        'LITToken',
        'StakingBalances',
      ];
    }

    const contractContext: LitContractContext = {} as LitContractContext;
    // Ah, Bluebird.props(), we miss you 🫗
    await Promise.all(
      contractNames.map(async (contractName) => {
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
        case 'RateLimitNFT':
          addresses.RateLimitNFT = {};
          addresses.RateLimitNFT.address = contract.address;
          addresses.RateLimitNFT.abi = contract.abi ?? RateLimitNFTData.abi;
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
        case 'StakingBalances':
          addresses.StakingBalances = {};
          addresses.StakingBalances.address = contract.address;
          addresses.StakingBalances.abi =
            contract.abi ?? StakingBalancesData.abi;
          break;
        case 'Multisender':
          addresses.Multisender = {};
          addresses.Multisender.address = contract.address;
          addresses.Multisender.abi = contract?.abi ?? MultisenderData.abi;
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
   * @deprecated - Use {@link getConnectionInfo } instead, which provides more information.
   */
  public static getMinNodeCount = async (
    network: LIT_NETWORKS_KEYS,
    context?: LitContractContext | LitContractResolverContext,
    rpcUrl?: string
  ) => {
    const contract = await LitContracts.getStakingContract(
      network,
      context,
      rpcUrl
    );

    const minNodeCount = await contract['currentValidatorCountForConsensus']();

    if (!minNodeCount) {
      throw new InitError(
        {
          info: {
            minNodeCount,
          },
        },
        '❌ Minimum validator count is not set'
      );
    }
    return minNodeCount;
  };

  /**
   * @deprecated - Use {@link getConnectionInfo } instead, which provides more information.
   */
  public static getValidators = async (
    network: LIT_NETWORKS_KEYS,
    context?: LitContractContext | LitContractResolverContext,
    rpcUrl?: string,
    nodeProtocol?: typeof HTTP | typeof HTTPS | null
  ): Promise<string[]> => {
    const contract = await LitContracts.getStakingContract(
      network,
      context,
      rpcUrl
    );

    // Fetch contract data
    const [activeValidators, currentValidatorsCount, kickedValidators] =
      await Promise.all([
        contract['getValidatorsInCurrentEpoch'](),
        contract['currentValidatorCountForConsensus'](),
        contract['getKickedValidators'](),
      ]);

    const validators = [];

    // Check if active validator set meets the threshold
    if (
      activeValidators.length - kickedValidators.length >=
      currentValidatorsCount
    ) {
      // Process each validator
      for (const validator of activeValidators) {
        validators.push(validator);
      }
    } else {
      LitContracts.logger.error(
        '❌ Active validator set does not meet the threshold'
      );
    }

    // remove kicked validators in active validators
    const cleanedActiveValidators = activeValidators.filter(
      (av: any) => !kickedValidators.some((kv: any) => kv === av)
    );

    const activeValidatorStructs: ValidatorStruct[] = (
      await contract['getValidatorsStructs'](cleanedActiveValidators)
    ).map((item: any) => {
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

    const networks = activeValidatorStructs.map((item: ValidatorStruct) => {
      const centralisation = CENTRALISATION_BY_NETWORK[network];

      // Convert the integer IP to a string format
      const ip = intToIP(item.ip);
      const port = item.port;

      // Determine the protocol to use based on various conditions
      const protocol =
        // If nodeProtocol is defined, use it
        nodeProtocol ||
        // If port is 443, use HTTPS, otherwise use network-specific HTTP
        (port === 443 ? HTTPS : HTTP_BY_NETWORK[network]) ||
        // Fallback to HTTP if no other conditions are met
        HTTP;

      // Check for specific conditions in centralised networks
      if (centralisation === 'centralised') {
        // Validate if it's cayenne AND port range is 8470 - 8479, if not, throw error
        if (
          network === LIT_NETWORK.Cayenne &&
          !port.toString().startsWith('8')
        ) {
          throw new NetworkError(
            {
              info: {
                ip,
                port,
                network,
              },
            },
            `Invalid port: ${port} for the ${centralisation} ${network} network. Expected range: 8470 - 8479`
          );
        }
      }

      const url = `${protocol}${ip}:${port}`;

      LitContracts.logger.debug("Validator's URL:", url);

      return url;
    });

    return networks;
  };

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
  }> => {
    const stakingContract = await LitContracts.getStakingContract(
      litNetwork,
      networkContext,
      rpcUrl
    );

    const [epochInfo, minNodeCount, activeUnkickedValidatorStructs] =
      await stakingContract['getActiveUnkickedValidatorStructsAndCounts']();

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

    if (activeUnkickedValidatorStructs.length <= minNodeCountInt) {
      throw new Error(
        `❌ Active validator set does not meet the threshold. Required: ${minNodeCountInt} but got: ${activeUnkickedValidatorStructs.length}`
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

    const networks = activeValidatorStructs.map((item: ValidatorStruct) => {
      const centralisation = CENTRALISATION_BY_NETWORK[litNetwork];

      // Convert the integer IP to a string format
      const ip = intToIP(item.ip);
      const port = item.port;

      // Determine the protocol to use based on various conditions
      const protocol =
        // If nodeProtocol is defined, use it
        nodeProtocol ||
        // If port is 443, use HTTPS, otherwise use network-specific HTTP
        (port === 443 ? HTTPS : HTTP_BY_NETWORK[litNetwork]) ||
        // Fallback to HTTP if no other conditions are met
        HTTP;

      // Check for specific conditions in centralised networks
      if (centralisation === 'centralised') {
        // Validate if it's cayenne AND port range is 8470 - 8479, if not, throw error
        if (
          litNetwork === LIT_NETWORK.Cayenne &&
          !(port >= 8470 && port <= 8479)
        ) {
          throw new Error(
            `Invalid port: ${port} for the ${centralisation} ${litNetwork} network. Expected range: 8470 - 8479`
          );
        }
      }

      const url = `${protocol}${ip}:${port}`;

      LitContracts.logger.debug("Validator's URL:", url);

      return url;
    });

    return {
      stakingContract,
      epochInfo: typedEpochInfo,
      minNodeCount: minNodeCountInt,
      bootstrapUrls: networks,
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
    console.warn('tokenId:', tokenId);
    let tries = 0;
    const maxAttempts = 10;
    let publicKey = '';
    while (tries < maxAttempts) {
      publicKey = await this.pkpNftContract.read.getPubkey(tokenId);
      console.log('pkp pub key: ', publicKey);
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

  /**
   * Mint a Capacity Credits NFT (RLI) token with the specified daily request rate and expiration period. The expiration date is calculated to be at midnight UTC, a specific number of days from now.
   *
   * @param {MintCapacityCreditsContext} context - The minting context.
   * @returns {Promise<MintCapacityCreditsRes>} - A promise that resolves to the minted capacity credits NFT response.
   * @throws {Error} - If the input parameters are invalid or an error occurs during the minting process.
   */
  mintCapacityCreditsNFT = async ({
    requestsPerDay,
    requestsPerSecond,
    requestsPerKilosecond,
    daysUntilUTCMidnightExpiration,
    gasLimit,
  }: MintCapacityCreditsContext): Promise<MintCapacityCreditsRes> => {
    this.log('Minting Capacity Credits NFT...');

    // Validate input: at least one of the request parameters must be provided and more than 0
    if (
      (requestsPerDay === null ||
        requestsPerDay === undefined ||
        requestsPerDay <= 0) &&
      (requestsPerSecond === null ||
        requestsPerSecond === undefined ||
        requestsPerSecond <= 0) &&
      (requestsPerKilosecond === null ||
        requestsPerKilosecond === undefined ||
        requestsPerKilosecond <= 0)
    ) {
      throw new InvalidArgumentException(
        {
          info: {
            requestsPerDay,
            requestsPerSecond,
            requestsPerKilosecond,
          },
        },
        `At least one of requestsPerDay, requestsPerSecond, or requestsPerKilosecond is required and must be more than 0`
      );
    }

    // Calculate effectiveRequestsPerKilosecond based on provided parameters
    let effectiveRequestsPerKilosecond: number | undefined;

    // Determine the effective requests per kilosecond based on the input

    // -- requestsPerDay
    if (requestsPerDay !== undefined) {
      effectiveRequestsPerKilosecond = requestsToKilosecond({
        period: 'day',
        requests: requestsPerDay,
      });

      // -- requestsPerSecond
    } else if (requestsPerSecond !== undefined) {
      effectiveRequestsPerKilosecond = requestsToKilosecond({
        period: 'second',
        requests: requestsPerSecond,
      });

      // -- requestsPerKilosecond
    } else if (requestsPerKilosecond !== undefined) {
      effectiveRequestsPerKilosecond = requestsPerKilosecond;
    }

    // Check if effectiveRequestsPerKilosecond was successfully set
    if (
      effectiveRequestsPerKilosecond === undefined ||
      effectiveRequestsPerKilosecond <= 0
    ) {
      throw new InvalidArgumentException(
        {
          info: {
            effectiveRequestsPerKilosecond,
          },
        },
        `Effective requests per kilosecond is required and must be more than 0`
      );
    }

    const expiresAt = calculateUTCMidnightExpiration(
      daysUntilUTCMidnightExpiration
    );

    let mintCost;

    try {
      mintCost = await this.rateLimitNftContract.read.calculateCost(
        effectiveRequestsPerKilosecond,
        expiresAt
      );
    } catch (e) {
      this.log('Error calculating mint cost:', e);
      throw e;
    }

    this.log('Capacity Credits NFT mint cost:', mintCost.toString());
    if (requestsPerDay) this.log('Requests per day:', requestsPerDay);
    if (requestsPerSecond) this.log('Requests per second:', requestsPerSecond);
    this.log(
      'Effective requests per kilosecond:',
      effectiveRequestsPerKilosecond
    );
    this.log(`Expires at (Unix Timestamp): ${expiresAt}`);

    const expirationDate = new Date(expiresAt * 1000);
    this.log('Expiration Date (UTC):', expirationDate.toUTCString());

    try {
      const res = await this._callWithAdjustedOverrides(
        this.rateLimitNftContract.write,
        'mint',
        [expiresAt],
        { value: mintCost, gasLimit }
      );

      const txHash = res.hash;

      const tx = await res.wait();
      this.log('xx Transaction:', tx);

      const tokenId = ethers.BigNumber.from(tx.logs[0].topics[3]);

      return {
        rliTxHash: txHash,
        capacityTokenId: tokenId,
        capacityTokenIdStr: tokenId.toString(),
      };
    } catch (e) {
      throw new TransactionError(
        {
          info: {
            requestsPerDay,
            requestsPerSecond,
            requestsPerKilosecond,
            expiresAt,
          },
          cause: e,
        },
        'Minting capacity credits NFT failed'
      );
    }
  };

  // getRandomPrivateKeySignerProvider = () => {
  //   const privateKey = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  //   let provider;

  //   if (isBrowser()) {
  //     provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  //   } else {
  //     provider = new ethers.providers.StaticJsonRpcProvider(this.rpc);
  //   }
  //   const signer = new ethers.Wallet(privateKey, provider);

  //   return { privateKey, signer, provider };
  // };

  // getPrivateKeySignerProvider = (privateKey: string) => {
  //   let provider;

  //   if (isBrowser()) {
  //     provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  //   } else {
  //     provider = new ethers.providers.StaticJsonRpcProvider(this.rpc);
  //   }
  //   const signer = new ethers.Wallet(privateKey, provider);

  //   return { privateKey, signer, provider };
  // };

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
      const decoded = bs58.decode(multihash);

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

      const multihash = bs58.encode(Buffer.from(`1220${digest}`, 'hex'));

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
          const addrs = await derivedAddresses({
            pkpTokenId: tokenId,
            publicKey: pubKey,
            defaultRPCUrl: this.rpc,
          });

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
        console.warn('tokenIdFromEvent:', tokenIdFromEvent);
        let tries = 0;
        const maxAttempts = 10;
        let publicKey = '';
        while (tries < maxAttempts) {
          publicKey = await this.pkpNftContract.read.getPubkey(
            tokenIdFromEvent
          );
          console.log('pkp pub key: ', publicKey);
          if (publicKey !== '0x') {
            break;
          }
          tries++;
          await new Promise((resolve) => {
            setTimeout(resolve, 10_000);
          });
        }

        console.warn('public key from token id', publicKey);
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

  rateLimitNftContractUtils = {
    read: {
      /**
       * getCapacityByIndex: async (index: number): Promise<any> => {
       *
       *  This function takes a token index as a parameter and returns the capacity of the token
       *  with the given index. The capacity is an object that contains the number of requests
       *  per millisecond that the token allows, and an object with the expiration timestamp and
       *  formatted expiration date of the token.
       *
       *  @param {number} index - The index of the token.
       *  @returns {Promise<any>} - A promise that resolves to the capacity of the token.
       *
       *  Example:
       *
       *  const capacity = await getCapacityByIndex(1);
       *  this.log(capacity);
       *  // Output: {
       *  //   requestsPerMillisecond: 100,
       *  //   expiresAt: {
       *  //     timestamp: 1623472800,
       *  //     formatted: '2022-12-31',
       *  //   },
       *  // }
       *
       * }
       */
      getCapacityByIndex: async (index: number): Promise<any> => {
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

        if (!this.rateLimitNftContract) {
          throw new InitError(
            {
              info: {
                rateLimitNftContract: this.rateLimitNftContract,
              },
            },
            'Contract is not available'
          );
        }

        const capacity = await this.rateLimitNftContract.read.capacity(index);

        return {
          requestsPerMillisecond: parseInt(capacity[0].toString()),
          expiresAt: {
            timestamp: parseInt(capacity[1].toString()),
            formatted: this.utils.timestamp2Date(capacity[1].toString()),
          },
        };
      },

      /**
       * getTokenURIByIndex: async (index: number): Promise<string> => {
       *
       *  This function takes a token index as a parameter and returns the URI of the token
       *  with the given index.
       *
       *  @param {number} index - The index of the token.
       *  @returns {Promise<string>} - A promise that resolves to the URI of the token.
       *
       *  Example:
       *
       *  const URI = await getTokenURIByIndex(1);
       *  this.log(URI);
       *  // Output: 'https://tokens.com/1'
       *
       * }
       */
      getTokenURIByIndex: async (index: number): Promise<string> => {
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

        if (!this.rateLimitNftContract) {
          throw new InitError(
            {
              info: {
                rateLimitNftContract: this.rateLimitNftContract,
              },
            },
            'Contract is not available'
          );
        }

        const base64 = await this.rateLimitNftContract.read.tokenURI(index);

        const data = base64.split('data:application/json;base64,')[1];

        const dataToString = Buffer.from(data, 'base64').toString('binary');

        return JSON.parse(dataToString);
      },

      /**
       * getTokensByOwnerAddress: async (ownerAddress: string): Promise<any> => {
       *
       *  This function takes an owner address as a parameter and returns an array of tokens
       *  that are owned by the given address.
       *
       *  @param {string} ownerAddress - The address of the owner.
       *  @returns {Promise<any>} - A promise that resolves to an array of token objects.
       *
       *  Example:
       *
       *  const tokens = await getTokensByOwnerAddress('0x1234...5678');
       *  this.log(tokens);
       *  // Output: [
       *  //   {
       *  //     tokenId: 1,
       *  //     URI: 'https://tokens.com/1',
       *  //     capacity: 100,
       *  //     isExpired: false,
       *  //   },
       *  //   {
       *  //     tokenId: 2,
       *  //     URI: 'https://tokens.com/2',
       *  //     capacity: 200,
       *  //     isExpired: true,
       *  //   },
       *  //   ...
       *  // ]
       *
       * }
       */
      getTokensByOwnerAddress: async (ownerAddress: string): Promise<any> => {
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

        if (!this.rateLimitNftContract) {
          throw new InitError(
            {
              info: {
                rateLimitNftContract: this.rateLimitNftContract,
              },
            },
            'Contract is not available'
          );
        }

        // -- validate
        if (!ethers.utils.isAddress(ownerAddress)) {
          throw Error(`Given string is not a valid address "${ownerAddress}"`);
        }

        let total: any = await this.rateLimitNftContract.read.balanceOf(
          ownerAddress
        );
        total = parseInt(total.toString());

        const tokens = await asyncForEachReturn(
          [...new Array(total)],
          async (_: undefined, i: number) => {
            if (!this.rateLimitNftContract) {
              throw new InitError(
                {
                  info: {
                    rateLimitNftContract: this.rateLimitNftContract,
                  },
                },
                'Contract is not available'
              );
            }

            const token =
              await this.rateLimitNftContract.read.tokenOfOwnerByIndex(
                ownerAddress,
                i
              );

            const tokenIndex = parseInt(token.toString());

            const URI =
              await this.rateLimitNftContractUtils.read.getTokenURIByIndex(
                tokenIndex
              );

            const capacity =
              await this.rateLimitNftContractUtils.read.getCapacityByIndex(
                tokenIndex
              );

            const isExpired = await this.rateLimitNftContract.read.isExpired(
              tokenIndex
            );

            return {
              tokenId: parseInt(token.toString()),
              URI,
              capacity,
              isExpired,
            };
          }
        );

        return tokens;
      },

      /**
       * getTokens: async (): Promise<any> => {
       *
       *  This function returns an array of all tokens that have been minted.
       *
       *  @returns {Promise<any>} - A promise that resolves to an array of token objects.
       *
       *  Example:
       *
       *  const tokens = await getTokens();
       *  this.log(tokens);
       *  // Output: [
       *  //   {
       *  //     tokenId: 1,
       *  //     URI: 'https://tokens.com/1',
       *  //     capacity: 100,
       *  //     isExpired: false,
       *  //   },
       *  //   {
       *  //     tokenId: 2,
       *  //     URI: 'https://tokens.com/2',
       *  //     capacity: 200,
       *  //     isExpired: true,
       *  //   },
       *  //   ...
       *  // ]
       *
       * }
       */
      getTokens: async (): Promise<any> => {
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

        if (!this.rateLimitNftContract) {
          throw new InitError(
            {
              info: {
                rateLimitNftContract: this.rateLimitNftContract,
              },
            },
            'Contract is not available'
          );
        }

        const bigTotal: ethers.BigNumber =
          await this.rateLimitNftContract.read.totalSupply();
        const total = parseInt(bigTotal.toString());

        const tokens = await asyncForEachReturn(
          [...new Array(total)],
          async (_: any, i: number) => {
            if (!this.rateLimitNftContract) {
              throw new InitError(
                {
                  info: {
                    rateLimitNftContract: this.rateLimitNftContract,
                  },
                },
                'Contract is not available'
              );
            }

            const token = await this.rateLimitNftContract.read.tokenByIndex(i);

            const tokenIndex = parseInt(token.toString());

            const URI =
              await this.rateLimitNftContractUtils.read.getTokenURIByIndex(
                tokenIndex
              );

            const capacity =
              await this.rateLimitNftContractUtils.read.getCapacityByIndex(
                tokenIndex
              );

            const isExpired = await this.rateLimitNftContract.read.isExpired(
              tokenIndex
            );

            return {
              tokenId: parseInt(token.toString()),
              URI,
              capacity,
              isExpired,
            };
          }
        );

        return tokens;
      },
    },
    write: {
      mint: async ({
        txOpts,
        timestamp,
      }: {
        txOpts: ethers.CallOverrides;
        timestamp: number;
      }) => {
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

        if (!this.rateLimitNftContract) {
          throw new InitError(
            {
              info: {
                rateLimitNftContract: this.rateLimitNftContract,
              },
            },
            'Contract is not available'
          );
        }

        const tx = await this._callWithAdjustedOverrides(
          this.rateLimitNftContract.write,
          'mint',
          [timestamp],
          txOpts
        );

        const res = await tx.wait();

        const tokenIdFromEvent = res.events?.[0].topics[1];

        return { tx, tokenId: tokenIdFromEvent };
      },
      /**
       * Transfer RLI token from one address to another
       *
       * @property { string } fromAddress
       * @property { string } toAddress
       * @property { string } RLITokenAddress
       *
       * @return { <Promise<void>> } void
       */
      transfer: async ({
        fromAddress,
        toAddress,
        RLITokenAddress,
      }: {
        fromAddress: string;
        toAddress: string;
        RLITokenAddress: string;
      }): Promise<ethers.ContractTransaction> => {
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

        if (!this.rateLimitNftContract) {
          throw new InitError(
            {
              info: {
                rateLimitNftContract: this.rateLimitNftContract,
              },
            },
            'Contract is not available'
          );
        }

        const tx = await this._callWithAdjustedOverrides(
          this.rateLimitNftContract.write,
          'transferFrom',
          [fromAddress, toAddress, RLITokenAddress]
        );

        this.log('tx:', tx);

        // const res = await tx.wait();

        // return {
        //     tx,
        //     events: res.events
        // }

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
