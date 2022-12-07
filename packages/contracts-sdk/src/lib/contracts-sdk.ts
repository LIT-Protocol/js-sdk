import { ethers } from 'ethers';
import { hexToDec, decToHex } from './hex2dec';
import bs58 from 'bs58';
import * as mf from 'multiformats';
import { isBrowser, isNode } from '@lit-protocol/misc';
const CID = mf.CID;

// ----- autogen:import-data:start  -----
import { accessControlConditions } from '../abis/AccessControlConditions.data';
import { litToken } from '../abis/LITToken.data';
import { multisender } from '../abis/Multisender.data';
import { pkpHelper } from '../abis/PKPHelper.data';
import { pkpNft } from '../abis/PKPNFT.data';
import { pkpPermissions } from '../abis/PKPPermissions.data';
import { pubkeyRouter } from '../abis/PubkeyRouter.data';
import { rateLimitNft } from '../abis/RateLimitNFT.data';
import { staking } from '../abis/Staking.data';
// ----- autogen:import-data:end  -----

// ----- autogen:imports:start  -----
import * as accessControlConditionsContract from '../abis/AccessControlConditions';
import * as litTokenContract from '../abis/LITToken';
import * as multisenderContract from '../abis/Multisender';
import * as pkpHelperContract from '../abis/PKPHelper';
import * as pkpNftContract from '../abis/PKPNFT';
import * as pkpPermissionsContract from '../abis/PKPPermissions';
import * as pubkeyRouterContract from '../abis/PubkeyRouter';
import * as rateLimitNftContract from '../abis/RateLimitNFT';
import * as stakingContract from '../abis/Staking';
// ----- autogen:imports:end  -----

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
export const asyncForEachReturn = async (
  array: Array<any>,
  callback: Function
) => {
  const list = [];

  for (let index = 0; index < array.length; index++) {
    const item = await callback(array[index], index, array);
    list.push(item);
  }
  return list;
};

export interface IPFSHash {
  digest: string;
  hashFunction: number;
  size: number;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

/**
 * Logs a message to the console.
 *
 * @param {string} str The message to log.
 * @param {any} [opt] An optional value to log with the message.
 */
const log = (str: string, opt?: any) => {
  console.log(`[@lit-protocol/contracts-sdk] ${str}`, opt ?? '');
};

// This code defines a LitContracts class that acts as a container for a collection of smart contracts. The class has a constructor that accepts an optional args object with provider and rpc properties. If no provider is specified, the class will create a default provider using the specified rpc URL. If no rpc URL is specified, the class will use a default URL.
// The class has a number of properties that represent the smart contract instances, such as accessControlConditionsContract, litTokenContract, pkpNftContract, etc. These smart contract instances are created by passing the contract address, ABI, and provider to the ethers.Contract constructor.
// The class also has a utils object with helper functions for converting between hexadecimal and decimal representation of numbers, as well as functions for working with multihashes and timestamps.
export class LitContracts {
  provider: ethers.providers.JsonRpcProvider | any;
  rpc: string;
  signer: ethers.Signer;

  // ----- autogen:declares:start  -----
  accessControlConditionsContract: accessControlConditionsContract.ContractContext;
  litTokenContract: litTokenContract.ContractContext;
  multisenderContract: multisenderContract.ContractContext;
  pkpHelperContract: pkpHelperContract.ContractContext;
  pkpNftContract: pkpNftContract.ContractContext;
  pkpPermissionsContract: pkpPermissionsContract.ContractContext;
  pubkeyRouterContract: pubkeyRouterContract.ContractContext;
  rateLimitNftContract: rateLimitNftContract.ContractContext;
  stakingContract: stakingContract.ContractContext;
// ----- autogen:declares:end  -----

  // make the constructor args optional
  constructor(args?: {
    // provider?: ethers.providers.JsonRpcProvider | any;
    rpc?: string | any;
    signer?: ethers.Signer | any;
  }) {
    // this.provider = args?.provider;
    this.rpc = args?.rpc;
    this.signer = args?.signer;
    this.provider;

    // if rpc is not specified, use the default rpc
    if (!this.rpc) {
      this.rpc = 'https://matic-mumbai.chainstacklabs.com';
    }

    // -- if node environment
    if (isNode()) {
      log(
        "--- Node environment detected. Using 'ethers.providers.JsonRpcProvider' ---"
      );

      // -- If signer is not provided, we will use a random private key to create a signer
      if (!this.signer) {
        log(
          `No signer is provided, we can generate a random private key to create a signer`
        );
        // generate random private key
        const privateKey = ethers.utils.hexlify(ethers.utils.randomBytes(32));
        this.provider = new ethers.providers.JsonRpcProvider(this.rpc);
        this.signer = new ethers.Wallet(privateKey, this.provider);
      }
      
      // -- If signer is provider
      if ( this.signer ){
        this.provider = this.signer.provider;
      }
    }

    // -- if browser environment
    if (isBrowser()) {
      log(
        "--- Browser environment detected. Using 'ethers.providers.Web3Provider' ---"
      );

      // -- check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error(
          'window.ethereum is not available. Please install a web3 provider such as Brave or MetaMask.'
        );
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    }

    // ----- autogen:blank-init:start  -----
    this.accessControlConditionsContract = {} as accessControlConditionsContract.ContractContext;
    this.litTokenContract = {} as litTokenContract.ContractContext;
    this.multisenderContract = {} as multisenderContract.ContractContext;
    this.pkpHelperContract = {} as pkpHelperContract.ContractContext;
    this.pkpNftContract = {} as pkpNftContract.ContractContext;
    this.pkpPermissionsContract = {} as pkpPermissionsContract.ContractContext;
    this.pubkeyRouterContract = {} as pubkeyRouterContract.ContractContext;
    this.rateLimitNftContract = {} as rateLimitNftContract.ContractContext;
    this.stakingContract = {} as stakingContract.ContractContext;
// ----- autogen:blank-init:end  -----
  }

  /**
   * Connect all contracts to a provider.
   */
  connect = async () => {
    if (!this.provider) {
      throw new Error('Provider is not available');
    }

    if (isBrowser()) {
      await this.provider.send('eth_requestAccounts', []);
      this.signer = this.provider.getSigner();
      log('this.provider:', this.provider);
      log('this.signer:', this.signer);
    }

    log('Connecting to contracts...');

    // ----- autogen:init:start  -----
    this.accessControlConditionsContract = new ethers.Contract(
      accessControlConditions.address,
      accessControlConditions.abi as any,
      this.provider
    ) as unknown as accessControlConditionsContract.ContractContext;
    this.accessControlConditionsContract = this.accessControlConditionsContract.connect(this.signer);

    this.litTokenContract = new ethers.Contract(
      litToken.address,
      litToken.abi as any,
      this.provider
    ) as unknown as litTokenContract.ContractContext;
    this.litTokenContract = this.litTokenContract.connect(this.signer);

    this.multisenderContract = new ethers.Contract(
      multisender.address,
      multisender.abi as any,
      this.provider
    ) as unknown as multisenderContract.ContractContext;
    this.multisenderContract = this.multisenderContract.connect(this.signer);

    this.pkpHelperContract = new ethers.Contract(
      pkpHelper.address,
      pkpHelper.abi as any,
      this.provider
    ) as unknown as pkpHelperContract.ContractContext;
    this.pkpHelperContract = this.pkpHelperContract.connect(this.signer);

    this.pkpNftContract = new ethers.Contract(
      pkpNft.address,
      pkpNft.abi as any,
      this.provider
    ) as unknown as pkpNftContract.ContractContext;
    this.pkpNftContract = this.pkpNftContract.connect(this.signer);

    this.pkpPermissionsContract = new ethers.Contract(
      pkpPermissions.address,
      pkpPermissions.abi as any,
      this.provider
    ) as unknown as pkpPermissionsContract.ContractContext;
    this.pkpPermissionsContract = this.pkpPermissionsContract.connect(this.signer);

    this.pubkeyRouterContract = new ethers.Contract(
      pubkeyRouter.address,
      pubkeyRouter.abi as any,
      this.provider
    ) as unknown as pubkeyRouterContract.ContractContext;
    this.pubkeyRouterContract = this.pubkeyRouterContract.connect(this.signer);

    this.rateLimitNftContract = new ethers.Contract(
      rateLimitNft.address,
      rateLimitNft.abi as any,
      this.provider
    ) as unknown as rateLimitNftContract.ContractContext;
    this.rateLimitNftContract = this.rateLimitNftContract.connect(this.signer);

    this.stakingContract = new ethers.Contract(
      staking.address,
      staking.abi as any,
      this.provider
    ) as unknown as stakingContract.ContractContext;
    this.stakingContract = this.stakingContract.connect(this.signer);
// ----- autogen:init:end  -----
  };

  utils = {
    hexToDec,
    decToHex,
    /**
     * Partition multihash string into object representing multihash
     *
     * @param {string} multihash A base58 encoded multihash string
     * @returns {Multihash}
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

      const hashFunction = parseInt(text.slice(0, 2), 16);
      const digestSize = parseInt(text.slice(2, 4), 16);
      const digest = text.slice(4, 4 + digestSize * 2);

      const multihash = bs58.encode(Buffer.from(`1220${digest}`, 'hex'));

      return multihash;
    },
    /**
     * Partition multihash string into object representing multihash
     *
     * @param {string} multihash A base58 encoded multihash string
     * @returns {Multihash}
     */
    getBytes32FromMultihash: (ipfsId: string) => {
      const cid = CID.parse(ipfsId);
      const hashFunction = cid.multihash.code;
      const size = cid.multihash.size;
      const digest = '0x' + Buffer.from(cid.multihash.digest).toString('hex');

      let ipfsHash: IPFSHash = {
        digest,
        hashFunction,
        size,
      };

      return ipfsHash;
    },

    // convert timestamp to YYYY/MM/DD format
    timestamp2Date: (timestamp: string): string => {
      const date = require('date-and-time');

      const format = 'YYYY/MM/DD HH:mm:ss';

      let timestampFormatted: Date = new Date(parseInt(timestamp) * 1000);

      return date.format(timestampFormatted, format);
    },
  };

  pkpNftContractUtil = {
    read: {
      /**
       * (IERC721Enumerable)
       *
       * Get all PKPs by a given address
       *
       * @param { string } ownerAddress
       * @retu
       * */

      getTokensByAddress: async (
        ownerAddress: string
      ): Promise<Array<string>> => {
        if (!this.pkpNftContract) {
          throw new Error('Contract is not available');
        }

        // -- validate
        if (!ethers.utils.isAddress(ownerAddress)) {
          throw new Error(
            `Given string is not a valid address "${ownerAddress}"`
          );
        }

        let tokens = [];

        for (let i = 0; ; i++) {
          let token;

          try {
            token = await this.pkpNftContract.tokenOfOwnerByIndex(
              ownerAddress,
              i
            );

            token = this.utils.hexToDec(token.toHexString()) as string;

            tokens.push(token);
          } catch (e) {
            log(`[getTokensByAddress] Ended search on index: ${i}`);
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
      getTokens: async (
        latestNumberOfTokens: number
      ): Promise<Array<string>> => {
        if (!this.pkpNftContract) {
          throw new Error('Contract is not available');
        }

        let tokens = [];

        for (let i = 0; ; i++) {
          if (i >= latestNumberOfTokens) {
            break;
          }

          let token;

          try {
            token = await this.pkpNftContract.tokenByIndex(i);

            token = this.utils.hexToDec(token.toHexString()) as string;

            tokens.push(token);
          } catch (e) {
            log(`[getTokensByAddress] Ended search on index: ${i}`);
            break;
          }
        }

        return tokens;
      },
    },
    write: {
      mint: async (mintCost: { value: any }) => {
        if (!this.pkpNftContract) {
          throw new Error('Contract is not available');
        }
        const ECDSA_KEY = 2;

        const tx = await this.pkpNftContract.mintNext(ECDSA_KEY, {
          value: mintCost.value,
        });

        console.log('tx:', tx);

        const res: any = await tx.wait();

        let tokenIdFromEvent;

        // mumbai
        tokenIdFromEvent = res.events[1].topics[3];
        console.warn('tokenIdFromEvent:', tokenIdFromEvent);

        return { tx, tokenId: tokenIdFromEvent };
      },
    },
  };

  pkpPermissionsContractUtil = {
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
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        const pkpIdHex = this.utils.decToHex(tokenId, null);

        const bool = await this.pkpPermissionsContract.isPermittedAddress(
          pkpIdHex as any,
          address
        );

        return bool;
      },

      getPermittedAddresses: async (
        tokenId: string
      ): Promise<Array<string>> => {
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        log('[getPermittedAddresses] input<tokenId>:', tokenId);

        let addresses: Array<string> = [];

        const maxTries = 5;
        let tries = 0;

        while (tries < maxTries) {
          try {
            addresses = await this.pkpPermissionsContract.getPermittedAddresses(
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
            log(
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
       * @param { any } id
       *
       * @returns { Promise<Array<any>> }
       *
       */
      getPermittedActions: async (tokenId: any): Promise<Array<any>> => {
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        let actions: Array<any> = [];

        const maxTries = 5;
        let tries = 0;

        while (tries < maxTries) {
          try {
            actions = await this.pkpPermissionsContract.getPermittedActions(
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
            log(
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
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        log('[isPermittedAction] input<pkpId>:', pkpId);
        log('[isPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        log('[isPermittedAction] converted<ipfsHash>:', ipfsHash);

        const bool = await this.pkpPermissionsContract.isPermittedAction(
          pkpId,
          ipfsHash as any
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
      ): Promise<any> => {
        if (!this.pkpPermissionsContract || !this.pubkeyRouterContract) {
          throw new Error('Contract is not available');
        }

        log('[addPermittedAction] input<pkpId>:', pkpId);

        const pubKey = await this.pubkeyRouterContract.getPubkey(pkpId);
        log('[addPermittedAction] converted<pubKey>:', pubKey);

        const pubKeyHash = ethers.utils.keccak256(pubKey);
        log('[addPermittedAction] converted<pubKeyHash>:', pubKeyHash);

        const tokenId = ethers.BigNumber.from(pubKeyHash);
        log('[addPermittedAction] converted<tokenId>:', tokenId);

        log('[addPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsIdBytes = this.utils.getBytesFromMultihash(ipfsId);
        log('[addPermittedAction] converted<ipfsIdBytes>:', ipfsIdBytes);

        const tx = await this.pkpPermissionsContract.addPermittedAction(
          tokenId,
          ipfsIdBytes as any,
          []
        );
        log('[addPermittedAction] output<tx>:', tx);

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
      ): Promise<any> => {
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        log('[addPermittedAddress] input<pkpId>:', pkpId);
        log('[addPermittedAddress] input<ownerAddress>:', ownerAddress);

        log('[addPermittedAddress] input<pkpId>:', pkpId);

        const tx = await this.pkpPermissionsContract.addPermittedAddress(
          pkpId,
          ownerAddress,
          []
        );

        log('[addPermittedAddress] output<tx>:', tx);

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
      ): Promise<any> => {
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        log('[revokePermittedAction] input<pkpId>:', pkpId);
        log('[revokePermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        log('[revokePermittedAction] converted<ipfsHash>:', ipfsHash);

        const tx = await this.pkpPermissionsContract.removePermittedAction(
          pkpId,
          ipfsHash as any
        );
        log('[revokePermittedAction] output<tx>:', tx);

        return tx;
      },
    },
  };

  rateLimitNftContractUtil = {
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
       *  log(capacity);
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
        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        const capacity = await this.rateLimitNftContract.capacity(index);

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
       *  log(URI);
       *  // Output: 'https://tokens.com/1'
       *
       * }
       */
      getTokenURIByIndex: async (index: number): Promise<string> => {
        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        const base64 = await this.rateLimitNftContract.tokenURI(index);

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
       *  log(tokens);
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
        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        // -- validate
        if (!ethers.utils.isAddress(ownerAddress)) {
          throw Error(`Given string is not a valid address "${ownerAddress}"`);
        }

        let total: any = await this.rateLimitNftContract.balanceOf(
          ownerAddress
        );
        total = parseInt(total.toString());

        const tokens = await asyncForEachReturn(
          [...new Array(total)],
          async (_: undefined, i: number) => {
            if (!this.rateLimitNftContract) {
              throw new Error('Contract is not available');
            }

            const token = await this.rateLimitNftContract.tokenOfOwnerByIndex(
              ownerAddress,
              i
            );

            const tokenIndex = parseInt(token.toString());

            const URI =
              await this.rateLimitNftContractUtil.read.getTokenURIByIndex(
                tokenIndex
              );

            const capacity =
              await this.rateLimitNftContractUtil.read.getCapacityByIndex(
                tokenIndex
              );

            const isExpired = await this.rateLimitNftContract.isExpired(
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
       *  log(tokens);
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
        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        let total: any = await this.rateLimitNftContract.totalSupply();
        total = parseInt(total.toString());

        const tokens = await asyncForEachReturn(
          [...new Array(total)],
          async (_: any, i: number) => {
            if (!this.rateLimitNftContract) {
              throw new Error('Contract is not available');
            }

            const token = await this.rateLimitNftContract.tokenByIndex(i);

            const tokenIndex = parseInt(token.toString());

            const URI =
              await this.rateLimitNftContractUtil.read.getTokenURIByIndex(
                tokenIndex
              );

            const capacity =
              await this.rateLimitNftContractUtil.read.getCapacityByIndex(
                tokenIndex
              );

            const isExpired = await this.rateLimitNftContract.isExpired(
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
        mintCost,
        timestamp,
      }: {
        mintCost: {
          value: any;
        };
        timestamp: number;
      }) => {
        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        const tx = await this.rateLimitNftContract.mint(timestamp, mintCost);

        const res: any = await tx.wait();

        const tokenIdFromEvent = res.events[0].topics[3];

        return { tx, tokenId: tokenIdFromEvent };
      },
      /**
       * Transfer RLI token from one address to another
       *
       * @property { string } fromAddress
       * @property { string } toAddress
       * @property  { stsring } RLITokenAddress
       *
       * @return { <Promise<void> } void
       */
      transfer: async ({
        fromAddress,
        toAddress,
        RLITokenAddress,
      }: {
        fromAddress: string;
        toAddress: string;
        RLITokenAddress: string;
      }): Promise<any> => {
        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        const tx = await this.rateLimitNftContract.safeTransferFrom(
          fromAddress,
          toAddress,
          RLITokenAddress
        );

        log('tx:', tx);

        // const res = await tx.wait();

        // return {
        //     tx,
        //     events: res.events
        // }

        return tx;
      },
    },
  };

  routerContractUtil = {
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
      //   log('[getIpfsIds] input<solidityIpfsId>:', solidityIpfsId);
      //   const ipfsId = this.utils.getMultihashFromBytes(solidityIpfsId);
      //   log('[getIpfsIds] output<ipfsId>:', ipfsId);
      //   return ipfsId;
      // },
    },
    write: {},
  };
}
