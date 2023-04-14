import { ethers } from 'ethers';
import { hexToDec, decToHex } from './hex2dec';
import bs58 from 'bs58';
import { isBrowser, isNode } from '@lit-protocol/misc';

let CID: any;
try {
  CID = require('multiformats/cid');
} catch (e) {
  console.log('CID not found');
}

// ----- autogen:import-data:start  -----
import { accessControlConditions } from '../abis/AccessControlConditions.data';
import { allowlist } from '../abis/Allowlist.data';
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
import * as allowlistContract from '../abis/Allowlist';
import * as litTokenContract from '../abis/LITToken';
import * as multisenderContract from '../abis/Multisender';
import * as pkpHelperContract from '../abis/PKPHelper';
import * as pkpNftContract from '../abis/PKPNFT';
import * as pkpPermissionsContract from '../abis/PKPPermissions';
import * as pubkeyRouterContract from '../abis/PubkeyRouter';
import * as rateLimitNftContract from '../abis/RateLimitNFT';
import * as stakingContract from '../abis/Staking';
// ----- autogen:imports:end  -----

const DEFAULT_RPC = 'https://lit-protocol.calderachain.xyz/http';
const BLOCK_EXPLORER = 'https://lit-protocol.calderaexplorer.xyz/';

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

// This code defines a LitContracts class that acts as a container for a collection of smart contracts. The class has a constructor that accepts an optional args object with provider and rpc properties. If no provider is specified, the class will create a default provider using the specified rpc URL. If no rpc URL is specified, the class will use a default URL.
// The class has a number of properties that represent the smart contract instances, such as accessControlConditionsContract, litTokenContract, pkpNftContract, etc. These smart contract instances are created by passing the contract address, ABI, and provider to the ethers.Contract constructor.
// The class also has a utils object with helper functions for converting between hexadecimal and decimal representation of numbers, as well as functions for working with multihashes and timestamps.
export class LitContracts {
  provider: ethers.providers.JsonRpcProvider | any;
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

  // ----- autogen:declares:start  -----
  accessControlConditionsContract: {
    read: accessControlConditionsContract.ContractContext;
    write: accessControlConditionsContract.ContractContext;
  };

  allowlistContract: {
    read: allowlistContract.ContractContext;
    write: allowlistContract.ContractContext;
  };

  litTokenContract: {
    read: litTokenContract.ContractContext;
    write: litTokenContract.ContractContext;
  };

  multisenderContract: {
    read: multisenderContract.ContractContext;
    write: multisenderContract.ContractContext;
  };

  pkpHelperContract: {
    read: pkpHelperContract.ContractContext;
    write: pkpHelperContract.ContractContext;
  };

  pkpNftContract: {
    read: pkpNftContract.ContractContext;
    write: pkpNftContract.ContractContext;
  };

  pkpPermissionsContract: {
    read: pkpPermissionsContract.ContractContext;
    write: pkpPermissionsContract.ContractContext;
  };

  pubkeyRouterContract: {
    read: pubkeyRouterContract.ContractContext;
    write: pubkeyRouterContract.ContractContext;
  };

  rateLimitNftContract: {
    read: rateLimitNftContract.ContractContext;
    write: rateLimitNftContract.ContractContext;
  };

  stakingContract: {
    read: stakingContract.ContractContext;
    write: stakingContract.ContractContext;
  };

  // ----- autogen:declares:end  -----

  // make the constructor args optional
  constructor(args?: {
    provider?: ethers.providers.JsonRpcProvider | any;
    rpcs?: string[] | any;
    rpc?: string | any;
    signer?: ethers.Signer | any;
    privateKey?: string | undefined;
    randomPrivatekey?: boolean;
    options?: {
      storeOrUseStorageKey?: boolean;
    };
    debug?: boolean;
  }) {
    // this.provider = args?.provider;
    this.rpc = args?.rpc;
    this.rpcs = args?.rpcs;
    this.signer = args?.signer;
    this.privateKey = args?.privateKey;
    this.provider = args?.provider;
    this.randomPrivateKey = args?.randomPrivatekey ?? false;
    this.options = args?.options;
    this.debug = args?.debug ?? false;

    // if rpc is not specified, use the default rpc
    if (!this.rpc) {
      this.rpc = DEFAULT_RPC;
    }

    if (!this.rpcs) {
      this.rpcs = [this.rpc];
    }

    // ----- autogen:blank-init:start  -----
    this.accessControlConditionsContract = {} as any;
    this.allowlistContract = {} as any;
    this.litTokenContract = {} as any;
    this.multisenderContract = {} as any;
    this.pkpHelperContract = {} as any;
    this.pkpNftContract = {} as any;
    this.pkpPermissionsContract = {} as any;
    this.pubkeyRouterContract = {} as any;
    this.rateLimitNftContract = {} as any;
    this.stakingContract = {} as any;
    // ----- autogen:blank-init:end  -----
  }

  /**
   * Logs a message to the console.
   *
   * @param {string} str The message to log.
   * @param {any} [opt] An optional value to log with the message.
   */
  log = (str: string, opt?: any) => {
    if (this.debug) {
      console.log(`[@lit-protocol/contracts-sdk] ${str}`, opt ?? '');
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

    if (isBrowser() && !this.signer) {
      this.log("----- We're in the browser! -----");

      const web3Provider = window.ethereum;

      if (!web3Provider) {
        const msg =
          'No web3 provider found. Please install Brave, MetaMask or another web3 provider.';
        alert(msg);
        throw new Error(msg);
      }

      const chainInfo = {
        chainId: '0x2AC49',
        chainName: 'Lit Protocol',
        nativeCurrency: { name: 'LIT', symbol: 'LIT', decimals: 18 },
        rpcUrls: this.rpcs,
        blockExplorerUrls: [BLOCK_EXPLORER],
        iconUrls: ['future'],
      };

      try {
        await web3Provider.send('wallet_switchEthereumChain', [
          { chainId: chainInfo.chainId },
        ]);
      } catch (e) {
        await web3Provider.request({
          method: 'wallet_addEthereumChain',
          params: [chainInfo],
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
    if (isNode()) {
      this.log("----- We're in node! -----");
      this.provider = new ethers.providers.JsonRpcProvider(this.rpc);
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

      let STORAGE_KEY = 'lit-contracts-sdk-private-key';

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
        console.warn(`
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

    // ----- autogen:init:start  -----

    this.accessControlConditionsContract = {
      read: new ethers.Contract(
        accessControlConditions.address,
        accessControlConditions.abi as any,
        this.provider
      ) as unknown as accessControlConditionsContract.ContractContext,
      write: new ethers.Contract(
        accessControlConditions.address,
        accessControlConditions.abi as any,
        this.signer
      ) as unknown as accessControlConditionsContract.ContractContext,
    };

    this.allowlistContract = {
      read: new ethers.Contract(
        allowlist.address,
        allowlist.abi as any,
        this.provider
      ) as unknown as allowlistContract.ContractContext,
      write: new ethers.Contract(
        allowlist.address,
        allowlist.abi as any,
        this.signer
      ) as unknown as allowlistContract.ContractContext,
    };

    this.litTokenContract = {
      read: new ethers.Contract(
        litToken.address,
        litToken.abi as any,
        this.provider
      ) as unknown as litTokenContract.ContractContext,
      write: new ethers.Contract(
        litToken.address,
        litToken.abi as any,
        this.signer
      ) as unknown as litTokenContract.ContractContext,
    };

    this.multisenderContract = {
      read: new ethers.Contract(
        multisender.address,
        multisender.abi as any,
        this.provider
      ) as unknown as multisenderContract.ContractContext,
      write: new ethers.Contract(
        multisender.address,
        multisender.abi as any,
        this.signer
      ) as unknown as multisenderContract.ContractContext,
    };

    this.pkpHelperContract = {
      read: new ethers.Contract(
        pkpHelper.address,
        pkpHelper.abi as any,
        this.provider
      ) as unknown as pkpHelperContract.ContractContext,
      write: new ethers.Contract(
        pkpHelper.address,
        pkpHelper.abi as any,
        this.signer
      ) as unknown as pkpHelperContract.ContractContext,
    };

    this.pkpNftContract = {
      read: new ethers.Contract(
        pkpNft.address,
        pkpNft.abi as any,
        this.provider
      ) as unknown as pkpNftContract.ContractContext,
      write: new ethers.Contract(
        pkpNft.address,
        pkpNft.abi as any,
        this.signer
      ) as unknown as pkpNftContract.ContractContext,
    };

    this.pkpPermissionsContract = {
      read: new ethers.Contract(
        pkpPermissions.address,
        pkpPermissions.abi as any,
        this.provider
      ) as unknown as pkpPermissionsContract.ContractContext,
      write: new ethers.Contract(
        pkpPermissions.address,
        pkpPermissions.abi as any,
        this.signer
      ) as unknown as pkpPermissionsContract.ContractContext,
    };

    this.pubkeyRouterContract = {
      read: new ethers.Contract(
        pubkeyRouter.address,
        pubkeyRouter.abi as any,
        this.provider
      ) as unknown as pubkeyRouterContract.ContractContext,
      write: new ethers.Contract(
        pubkeyRouter.address,
        pubkeyRouter.abi as any,
        this.signer
      ) as unknown as pubkeyRouterContract.ContractContext,
    };

    this.rateLimitNftContract = {
      read: new ethers.Contract(
        rateLimitNft.address,
        rateLimitNft.abi as any,
        this.provider
      ) as unknown as rateLimitNftContract.ContractContext,
      write: new ethers.Contract(
        rateLimitNft.address,
        rateLimitNft.abi as any,
        this.signer
      ) as unknown as rateLimitNftContract.ContractContext,
    };

    this.stakingContract = {
      read: new ethers.Contract(
        staking.address,
        staking.abi as any,
        this.provider
      ) as unknown as stakingContract.ContractContext,
      write: new ethers.Contract(
        staking.address,
        staking.abi as any,
        this.signer
      ) as unknown as stakingContract.ContractContext,
    };
    // ----- autogen:init:end  -----

    this.connected = true;
  };

  // getRandomPrivateKeySignerProvider = () => {
  //   const privateKey = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  //   let provider;

  //   if (isBrowser()) {
  //     provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  //   } else {
  //     provider = new ethers.providers.JsonRpcProvider(this.rpc);
  //   }
  //   const signer = new ethers.Wallet(privateKey, provider);

  //   return { privateKey, signer, provider };
  // };

  // getPrivateKeySignerProvider = (privateKey: string) => {
  //   let provider;

  //   if (isBrowser()) {
  //     provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  //   } else {
  //     provider = new ethers.providers.JsonRpcProvider(this.rpc);
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
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }
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
      getTokens: async (
        latestNumberOfTokens: number
      ): Promise<Array<string>> => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }
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
    },
    write: {
      mint: async () => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpNftContract) {
          throw new Error('Contract is not available');
        }

        let mintCost;

        try {
          mintCost = await this.pkpNftContract.read.mintCost();
        } catch (e) {
          throw new Error('Could not get mint cost');
        }

        let sentTx;

        if (this.isPKP) {
          this.log(
            "This is a PKP wallet, so we'll use the PKP wallet to sign the tx"
          );

          this.log('...populating tx');
          let tx = await this.pkpNftContract.write.populateTransaction.mintNext(
            2,
            { value: mintCost }
          );
          this.log('tx:', tx);

          this.log('...signing tx');
          let signedTx = await this.signer.signTransaction(tx);
          this.log('signedTx:', signedTx);

          this.log('sending signed tx...');
          sentTx = await this.signer.sendTransaction(
            signedTx as ethers.providers.TransactionRequest
          );
        } else {
          sentTx = await this.pkpNftContract.write.mintNext(2, {
            value: mintCost,
          });
        }

        this.log('sentTx:', sentTx);

        const res: any = await sentTx.wait();
        this.log('res:', res);

        let events = 'events' in res ? res.events : res.logs;

        let tokenIdFromEvent;

        tokenIdFromEvent = events[1].topics[3];
        console.warn('tokenIdFromEvent:', tokenIdFromEvent);

        return { tx: sentTx, tokenId: tokenIdFromEvent };
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
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        const pkpIdHex = this.utils.decToHex(tokenId, null);

        const bool = await this.pkpPermissionsContract.read.isPermittedAddress(
          pkpIdHex as any,
          address
        );

        return bool;
      },

      getPermittedAddresses: async (
        tokenId: string
      ): Promise<Array<string>> => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }
        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        this.log('[getPermittedAddresses] input<tokenId>:', tokenId);

        let addresses: Array<string> = [];

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
       * @param { any } id
       *
       * @returns { Promise<Array<any>> }
       *
       */
      getPermittedActions: async (tokenId: any): Promise<Array<any>> => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        let actions: Array<any> = [];

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
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        this.log('[isPermittedAction] input<pkpId>:', pkpId);
        this.log('[isPermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[isPermittedAction] converted<ipfsHash>:', ipfsHash);

        const bool = await this.pkpPermissionsContract.read.isPermittedAction(
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
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpPermissionsContract || !this.pubkeyRouterContract) {
          throw new Error('Contract is not available');
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

        const tx = await this.pkpPermissionsContract.write.addPermittedAction(
          tokenId,
          ipfsIdBytes as any,
          []
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
      ): Promise<any> => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        this.log('[addPermittedAddress] input<pkpId>:', pkpId);
        this.log('[addPermittedAddress] input<ownerAddress>:', ownerAddress);

        this.log('[addPermittedAddress] input<pkpId>:', pkpId);

        const tx = await this.pkpPermissionsContract.write.addPermittedAddress(
          pkpId,
          ownerAddress,
          []
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
      ): Promise<any> => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.pkpPermissionsContract) {
          throw new Error('Contract is not available');
        }

        this.log('[revokePermittedAction] input<pkpId>:', pkpId);
        this.log('[revokePermittedAction] input<ipfsId>:', ipfsId);

        const ipfsHash = this.utils.getBytesFromMultihash(ipfsId);
        this.log('[revokePermittedAction] converted<ipfsHash>:', ipfsHash);

        const tx =
          await this.pkpPermissionsContract.write.removePermittedAction(
            pkpId,
            ipfsHash as any
          );
        this.log('[revokePermittedAction] output<tx>:', tx);

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
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
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
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
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
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
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
              throw new Error('Contract is not available');
            }

            const token =
              await this.rateLimitNftContract.read.tokenOfOwnerByIndex(
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
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        let total: any = await this.rateLimitNftContract.read.totalSupply();
        total = parseInt(total.toString());

        const tokens = await asyncForEachReturn(
          [...new Array(total)],
          async (_: any, i: number) => {
            if (!this.rateLimitNftContract) {
              throw new Error('Contract is not available');
            }

            const token = await this.rateLimitNftContract.read.tokenByIndex(i);

            const tokenIndex = parseInt(token.toString());

            const URI =
              await this.rateLimitNftContractUtil.read.getTokenURIByIndex(
                tokenIndex
              );

            const capacity =
              await this.rateLimitNftContractUtil.read.getCapacityByIndex(
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
        mintCost,
        timestamp,
      }: {
        mintCost: {
          value: any;
        };
        timestamp: number;
      }) => {
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        const tx = await this.rateLimitNftContract.write.mint(
          timestamp,
          mintCost
        );

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
        if (!this.connected) {
          throw new Error(
            'Contracts are not connected. Please call connect() first'
          );
        }

        if (!this.rateLimitNftContract) {
          throw new Error('Contract is not available');
        }

        const tx = await this.rateLimitNftContract.write.safeTransferFrom(
          fromAddress,
          toAddress,
          RLITokenAddress
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
      //   this.log('[getIpfsIds] input<solidityIpfsId>:', solidityIpfsId);
      //   const ipfsId = this.utils.getMultihashFromBytes(solidityIpfsId);
      //   this.log('[getIpfsIds] output<ipfsId>:', ipfsId);
      //   return ipfsId;
      // },
    },
    write: {},
  };
}
