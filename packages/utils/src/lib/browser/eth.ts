import { LIT_CHAINS, LIT_ERROR_TYPE } from "@litprotocol-dev/constants";
import { log, throwError } from "../utils";
import { ABI_LIT, ABI_ERC20 } from "@litprotocol-dev/core";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import * as LitConnectModal from "lit-connect-modal";

import { Web3Provider } from "@ethersproject/providers";

/** ---------- Local Interfaces ---------- */
interface ConnectWeb3{
    chainId: number,
}

interface RPCUrls{
    [chainId: number]: string | String,
}

/** ---------- Local Helpers ---------- */

/**
 * 
 * Convert chain hex id to chain name
 * 
 * @param { string } chainHexId 
 * @returns { void | string } 
 */
export const chainHexIdToChainName = (chainHexId: string) : void | string => {

    // -- setup
    const keys = Object.keys(LIT_CHAINS);
    const entries  = Object.entries(LIT_CHAINS);
    const hexIds = Object.values(LIT_CHAINS).map((chain) => "0x" + chain.chainId.toString(16));

    // -- validate:: must begin with 0x
    if( ! chainHexId.startsWith("0x")){

        throwError({
            message: `${chainHexId} should begin with "0x"`,
            error: LIT_ERROR_TYPE['WRONG_PARAM_FORMAT'],
        })

    }

    // -- validate:: hex id must be listed in constants
    if ( ! hexIds.includes(chainHexId) ){

        throwError({
            message: `${chainHexId} cannot be found in LIT_CHAINS`,
            error: LIT_ERROR_TYPE['UNSUPPORTED_CHAIN_EXCEPTION'],
        })
        
    }

    // -- search
    const chainName = entries.find(data => "0x" + data[1].chainId.toString(16) === chainHexId) || null;

    // -- success case
    if( chainName ){
        return chainName[0];
    }

    // -- fail case
    throwError({
        message: `Failed to convert ${chainHexId}`,
        error: LIT_ERROR_TYPE['UNKNOWN_ERROR'],
    })
}


// export function encodeCallData({ abi, functionName, functionParams }) {
//     const iface = new ethers.utils.Interface(abi);
//     const callData = iface.encodeFunctionData(functionName, functionParams);
//     return callData;
// }

interface IABI{
    inputs: any[],
    name: string,
    outputs: Array<{ 
        internalType: string,
        name: string,
        type: string, 
    }>,
    stateMutability: string,
    type: string,
}

interface IABIEncode{
    abi: Array<IABI>,
    functionName: string,
    functionParams: [],
}

interface IABIDecode{
    abi: Array<IABI>,
    functionName: string,
    data: any
}

/**
 * 
 * (ABI) Encode call data
 * 
 * @param { IABIEncode } 
 * @returns { string }
 */
export const encodeCallData = ({abi, functionName, functionParams}: IABIEncode) : string => {

    const _interface = new ethers.utils.Interface(abi);

    const callData = _interface.encodeFunctionData(functionName, functionParams);

    return callData;

}

/**
 * 
 * (ABI) Decode call data
 * TODO: fix "any"
 * 
 * @param { IABIDecode } 
 * @returns { string }
 */
export const decodeCallResult = ({ abi, functionName, data }: IABIDecode) : { answer: string } | any => {

    const _interface = new ethers.utils.Interface(abi);

    const decoded = _interface.decodeFunctionResult(functionName, data);

    return decoded;
}

/**
 * 
 * Connect to web 3 
 * 
 * @param { ConnectWeb3 } 
 * 
 */
export const connectWeb3 = async ({ chainId = 1 }: ConnectWeb3) => {
    
    let rpcUrls : RPCUrls = {};

    // need to make it look like this:
    // rpc: {
    //   1: "https://mainnet.mycustomnode.com",
    //   3: "https://ropsten.mycustomnode.com",
    //   100: "https://dai.poa.network",
    //   // ...
    // },
  
    for (let i = 0; i < Object.keys(LIT_CHAINS).length; i++) {
      const chainName = Object.keys(LIT_CHAINS)[i];
      const chainId = LIT_CHAINS[chainName].chainId;
      const rpcUrl = LIT_CHAINS[chainName].rpcUrls[0];
      rpcUrls[chainId] = rpcUrl;
    }
  
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          // infuraId: "cd614bfa5c2f4703b7ab0ec0547d9f81",
          rpc: rpcUrls,
          chainId,
        },
      },
    };
  
    log("getting provider via lit connect modal");
  
    const dialog = new LitConnectModal({
      providerOptions,
    });

    const provider = await dialog.getWalletProvider();
  
    log("got provider", provider);
    const web3 = new Web3Provider(provider);
  
    // const provider = await detectEthereumProvider();
    // const web3 = new Web3Provider(provider);
  
    // trigger metamask popup
    await provider.enable();
  
    log("listing accounts");
    const accounts = await web3.listAccounts();
    // const accounts = await provider.request({
    //   method: "eth_requestAccounts",
    //   params: [],
    // });
    log("accounts", accounts);
    const account = accounts[0].toLowerCase();
  
    return { web3, account };
  }