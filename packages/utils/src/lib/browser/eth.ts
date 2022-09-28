import { ELeft, ERight, IEither, IEitherErrorType, ILitError, JsonAuthSig, LIT_CHAINS, LIT_ERROR_TYPE, LOCAL_STORAGE_KEYS } from "@litprotocol-dev/constants";
import { log, throwError, numberToHex, getStorageItem } from "../utils";
import { ABI_LIT, ABI_ERC20 } from "@litprotocol-dev/core";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";

import LitConnectModal from "lit-connect-modal";

import { Web3Provider } from "@ethersproject/providers";
import { SiweMessage } from "lit-siwe";
import { getAddress } from "ethers/lib/utils";

/** ---------- Local Interfaces ---------- */
interface ConnectWeb3{
    chainId: number,
}
interface RPCUrls{
    [chainId: number]: string | String,
}

interface Web3ProviderOptions {
    walletconnect: {
        package: WalletConnectProvider | any,
        options: {
            infuraId?: string,
            rpc: RPCUrls,
            chainId: number,
        }

    }
}

interface CheckAndSignAuthParams {
    chain: string,
    resources: any,
    switchChain: boolean,
}

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

/**
 * Get chain id of the current network
 * @param { string } chain 
 * @param { Web3Provider } web3 
 * @returns { Promise<IEither> }
 */
export const getChainId = async (chain: string, web3: Web3Provider) : Promise<IEither> => {

    let resultOrError : IEither;

    try {
        const resp = await web3.getNetwork();
        resultOrError = ERight(resp.chainId);
    } catch (e) {
         // couldn't get chainId.  throw the incorrect network error
        log("getNetwork threw an exception", e);

        resultOrError = ELeft({
            message: `Incorrect network selected.  Please switch to the ${chain} network in your wallet and try again.`,
            error: LIT_ERROR_TYPE['WRONG_NETWORK_EXCEPTION']
        });
    }

    return resultOrError;
}

// TODO: Why check when we return true anyways?
export const getMustResign = (
    authSig: JsonAuthSig, 
    resources: any
) : boolean => {

    let mustResign! : boolean;

    try {
        const parsedSiwe = new SiweMessage(authSig.signedMessage);
        log("parsedSiwe.resources", parsedSiwe.resources);
  
        if (JSON.stringify(parsedSiwe.resources) !== JSON.stringify(resources)) {
          log(
            "signing auth message because resources differ from the resources in the auth sig"
          );
          mustResign = true;
        }
        
        if (parsedSiwe.address !== getAddress(parsedSiwe.address)) {
          log(
            "signing auth message because parsedSig.address is not equal to the same address but checksummed.  This usually means the user had a non-checksummed address saved and so they need to re-sign."
          );
          mustResign = true;
        }
      } catch (e) {
        log("error parsing siwe sig.  making the user sign again: ", e);
        mustResign = true;
      }

      return mustResign;
}

/**
 * 
 * Get RPC Urls in the correct format
 * need to make it look like this:
   ---
   rpc: {
        1: "https://mainnet.mycustomnode.com",
        3: "https://ropsten.mycustomnode.com",
        100: "https://dai.poa.network",
        // ...
    },
   ---
 * 
 * @returns
 */
export const getRPCUrls = () : RPCUrls => {

    let rpcUrls : RPCUrls = {};
    
    const keys : Array<string> = Object.keys(LIT_CHAINS);

    for (let i = 0; i < keys.length; i++) {
        const chainName = keys[i];
        const chainId = LIT_CHAINS[chainName].chainId;
        const rpcUrl = LIT_CHAINS[chainName].rpcUrls[0];
        rpcUrls[chainId] = rpcUrl;
    }

    return rpcUrls;
}


/** ---------- Exports ---------- */
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
 * // #browser
 * // TEST: connectWeb3()
 * Connect to web 3 
 * 
 * @param { ConnectWeb3 } 
 * 
 * @return { Web3Provider, string } web3, account
 */
export const connectWeb3 = async ({ chainId = 1 }: ConnectWeb3) => {
    
    const rpcUrls : RPCUrls = getRPCUrls();

    const providerOptions : Web3ProviderOptions = {
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

/**
 * 
 * Delete any saved AuthSigs from local storage. Takes no params and returns
 * nothing. This will also clear out the WalletConnect cache in local storage. 
 * We often run this function as a result of the user pressing a "Logout" button.
 * 
 * @return { void } 
 */
export const disconnectWeb3 = () : void => {

    const storage = LOCAL_STORAGE_KEYS;

    localStorage.removeItem(storage.WALLET_CONNECT);
    localStorage.removeItem(storage.AUTH_SIGNATURE);
    localStorage.removeItem(storage.AUTH_SOL_SIGNATURE);
    localStorage.removeItem(storage.AUTH_COSMOS_SIGNATURE);
    localStorage.removeItem(storage.WEB3_PROVIDER);
}

/**
 * // TODO: This is incompleted
 * Check and sign EVM auth message
 * 
 * @param { CheckAndSignAuthParams }  
 * @returns 
 */
export const checkAndSignEVMAuthMessage = async ({
    chain,
    resources,
    switchChain,
}: CheckAndSignAuthParams) => {
    
    // -- 1. prepare
    const selectedChain = LIT_CHAINS[chain];

    const { web3, account } = await connectWeb3({
        chainId: selectedChain.chainId,
    });

    log(`got web3 and account: ${account}`);

    // -- 2. prepare all required variables
    const currentChainIdOrError : IEither = await getChainId(chain, web3);
    const selectedChainId : number = selectedChain.chainId;
    const selectedChainIdHex : string = numberToHex(selectedChainId);
    const authSigOrError : IEither = getStorageItem(LOCAL_STORAGE_KEYS.AUTH_SIGNATURE);

    // -- 3. check all variables before executing business logic
    if ( currentChainIdOrError.type === IEitherErrorType.ERROR ){
        throwError(currentChainIdOrError.result);
        return;
    }
    
    log("chainId from web3", currentChainIdOrError);
    log(
      `checkAndSignAuthMessage with chainId ${currentChainIdOrError} and chain set to ${chain} and selectedChain is `,
      selectedChain);
    
    // -- 4. case: (current chain id is NOT equal to selected chain) AND is set to switch chain
    if( (currentChainIdOrError.result !== selectedChainId) && switchChain ){

    }

    // -- 5. case: Lit auth signature is NOT in the local storage
    log("checking if sig is in local storage");
    if( authSigOrError.type === IEitherErrorType.ERROR ){
        log("signing auth message because sig is not in local storage");
    }

    // -- 6. case: Lit auth signature IS in the local storage
    let authSig : JsonAuthSig  = JSON.parse(authSigOrError.result);

    // -- 7. case: when we are NOT on the right wallet address
    if( account !== authSig.address ){
        log(
            "signing auth message because account is not the same as the address in the auth sig"
        );

        // await signAndSaveAuthMessage({

        let authSigOrError : IEither = getStorageItem(LOCAL_STORAGE_KEYS.AUTH_SIGNATURE);
        authSig = JSON.parse(authSigOrError.result);
    }else{

        // -- 8. case: we are on the right wallet, but need to check the resources of the sig and re-sign if they don't match
        let mustResign = getMustResign(authSig, resources);

        if (mustResign) {
            
        }
    }
    
    log("got auth sig", authSig);
    return authSig;

}