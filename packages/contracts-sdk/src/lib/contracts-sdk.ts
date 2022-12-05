import { ethers } from 'ethers';
import { hexToDec } from './hex2dec';

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
export class LitContracts {
  provider: ethers.providers.JsonRpcProvider;

  // ----- autogen:declares:start  -----
  accessControlConditionsContract: accessControlConditionsContract.ContractContext;
  litTokenContract: litTokenContract.ContractContext;
  multisenderContract: multisenderContract.ContractContext;
  pkpHelperContract: pkpHelperContract.ContractContext;
  pkpNftContract: pkpNftContract.ContractContext;
  pkppermissionsContract: pkpPermissionsContract.ContractContext;
  pubkeyRouterContract: pubkeyRouterContract.ContractContext;
  rateLimitNftContract: rateLimitNftContract.ContractContext;
  stakingContract: stakingContract.ContractContext;
// ----- autogen:declares:end  -----

  // make the constructor args optional
  constructor(args?: { provider?: ethers.providers.JsonRpcProvider | any }) {
    this.provider = args?.provider;

    // if provider is not set, use the default provider
    if (!this.provider) {
      console.log(
        "If no provider is specified, we can use the default provider at 'https://rpc-mumbai.matic.today'."
      );

      this.provider = new ethers.providers.JsonRpcProvider(
        'https://rpc-mumbai.matic.today'
      );
    }

    // ----- autogen:init:start  -----
    this.accessControlConditionsContract = new ethers.Contract(
      accessControlConditions.address,
      accessControlConditions.abi as any,
      this.provider
    ) as unknown as accessControlConditionsContract.ContractContext;

    this.litTokenContract = new ethers.Contract(
      litToken.address,
      litToken.abi as any,
      this.provider
    ) as unknown as litTokenContract.ContractContext;

    this.multisenderContract = new ethers.Contract(
      multisender.address,
      multisender.abi as any,
      this.provider
    ) as unknown as multisenderContract.ContractContext;

    this.pkpHelperContract = new ethers.Contract(
      pkpHelper.address,
      pkpHelper.abi as any,
      this.provider
    ) as unknown as pkpHelperContract.ContractContext;

    this.pkpNftContract = new ethers.Contract(
      pkpNft.address,
      pkpNft.abi as any,
      this.provider
    ) as unknown as pkpNftContract.ContractContext;

    this.pkppermissionsContract = new ethers.Contract(
      pkpPermissions.address,
      pkpPermissions.abi as any,
      this.provider
    ) as unknown as pkpPermissionsContract.ContractContext;

    this.pubkeyRouterContract = new ethers.Contract(
      pubkeyRouter.address,
      pubkeyRouter.abi as any,
      this.provider
    ) as unknown as pubkeyRouterContract.ContractContext;

    this.rateLimitNftContract = new ethers.Contract(
      rateLimitNft.address,
      rateLimitNft.abi as any,
      this.provider
    ) as unknown as rateLimitNftContract.ContractContext;

    this.stakingContract = new ethers.Contract(
      staking.address,
      staking.abi as any,
      this.provider
    ) as unknown as stakingContract.ContractContext;
// ----- autogen:init:end  -----
  }

  utils = {
    hexToDec,
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
            console.log(`[getTokensByAddress] Ended search on index: ${i}`);
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
            console.log(`[getTokensByAddress] Ended search on index: ${i}`);
            break;
          }
        }

        return tokens;
      },
    },
    write: {
      mint: async (mintCost: { value: any }) => {
        const ECDSA_KEY = 2;

        const tx = await this.pkpNftContract.mintNext(ECDSA_KEY, mintCost);

        const res: any = await tx.wait();

        // // if winow
        // window.mint = res;

        // console.warn('[DEBUG] window.mint:', window.mint);

        let tokenIdFromEvent;

        // mumbai
        tokenIdFromEvent = res.events[1].topics[3];
        console.warn('tokenIdFromEvent:', tokenIdFromEvent);

        return { tx, tokenId: tokenIdFromEvent };
      },
    },
  };
}
