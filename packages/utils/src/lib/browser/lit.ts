import { ALL_LIT_CHAINS, CheckAndSignAuthParams, EncryptedString, ILitError, JsonAuthSig, LIT_ERROR_TYPE, VMTYPE } from "@litprotocol-dev/constants";
import { checkType, throwError } from "@litprotocol-dev/utils";
import JSZip from "jszip";
import { checkAndSignCosmosAuthMessage } from "./chains/cosmos";
import { checkAndSignEVMAuthMessage } from "./chains/eth";
import { checkAndSignSolAuthMessage } from "./chains/sol";
import {
    fromString as uint8arrayFromString,
    toString as uint8arrayToString,
} from "uint8arrays";

import {
    decryptWithSymmetricKey,
    encryptWithSymmetricKey,
    generateSymmetricKey,
    importSymmetricKey,
} from "./crypto";

const PACKAGE_CACHE = {};

/**
 * 
 * Check for an existing cryptographic authentication signature and create one of it does not exist.  This is used to prove ownership of a given crypto wallet address to the Lit nodes.  The result is stored in LocalStorage so the user doesn't have to sign every time they perform an operation.
 * 
 * @param { CheckAndSignAuthParams }
 * 
 * @property { string } chain The chain you want to use.  Find the supported list of chains here: https://developer.litprotocol.com/docs/supportedChains
 * @property { Array<string> } resources Optional and only used with EVM chains.  A list of resources to be passed to Sign In with Ethereum.  These resources will be part of the Sign in with Ethereum signed message presented to the user.
 * @property { Array<boolean> } switchChain ptional and only used with EVM chains right now.  Set to true by default.  Whether or not to ask Metamask or the user's wallet to switch chains before signing.  This may be desired if you're going to have the user send a txn on that chain.  On the other hand, if all you care about is the user's wallet signature, then you probably don't want to make them switch chains for no reason.  Pass false here to disable this chain switching behavior.
 * 
 *  @returns { AuthSig } The AuthSig created or retrieved
 */
export const checkAndSignAuthMessage = ({
    chain,
    resources,
    switchChain,
}: CheckAndSignAuthParams) : Promise<JsonAuthSig | void> => {

    const chainInfo = ALL_LIT_CHAINS[chain];

    // -- validate: if chain info not found
    if( ! chainInfo ){
        throwError({
            message: `Unsupported chain selected.  Please select one of: ${Object.keys(
                ALL_LIT_CHAINS
            )}`,
            error: LIT_ERROR_TYPE['UNSUPPORTED_CHAIN_EXCEPTION']
        });
    }

    // -- check and sign auth message based on chain
    if( chainInfo.vmType === VMTYPE.EVM){
        return checkAndSignEVMAuthMessage({ chain, resources, switchChain });
    }else if( chainInfo.vmType === VMTYPE.SVM){
        return checkAndSignSolAuthMessage();
    }else if( chainInfo.vmType === VMTYPE.CVM){
        return checkAndSignCosmosAuthMessage({ chain });
    }else{
        return throwError({
            message: `vmType not found for this chain: ${chain}.  This should not happen.  Unsupported chain selected.  Please select one of: ${Object.keys(
                ALL_LIT_CHAINS
            )}`,
            error: LIT_ERROR_TYPE['UNSUPPORTED_CHAIN_EXCEPTION'],
        });
    }
}

/**
 * 
 * Encrypt a string.  This is used to encrypt any string that is to be locked via the Lit Protocol.
 * 
 * @param { string } str The string to encrypt
 * @returns { Promise<Object> } A promise containing the encryptedString as a Blob and the symmetricKey used to encrypt it, as a Uint8Array.
 */
 export const encryptString = async (str: string) : Promise<EncryptedString | undefined> => {

    // -- validate
    if (
        !checkType({
            value: str,
            allowedTypes: ["String"],
            paramName: "str",
            functionName: "encryptString",
        })
    )
    return;
        
    // -- prepare
    const encodedString : Uint8Array = uint8arrayFromString(str, "utf8");

    const symmKey : CryptoKey= await generateSymmetricKey();

    const encryptedString : Blob = await encryptWithSymmetricKey(
        symmKey,
        encodedString.buffer
    );

    const exportedSymmKey : Uint8Array = new Uint8Array(
        await crypto.subtle.exportKey("raw", symmKey)
    );

    return {
        symmetricKey: exportedSymmKey,
        encryptedString,
        encryptedData: encryptedString,
    };
}

  /**
 * Decrypt a string that was encrypted with the encryptString function.
 * @param {Blob|File} encryptedStringBlob The encrypted string as a Blob
 * @param { Uint8Array } symmKey The symmetric key used that will be used to decrypt this.
 * @returns {Promise<string>} A promise containing the decrypted string
 */
export const decryptString = async (
    encryptedStringBlob: Blob, 
    symmKey: Uint8Array
) : Promise<string | undefined> => {
    
    // -- validate
    if (
      !checkType({
        value: encryptedStringBlob,
        allowedTypes: ["Blob", "File"],
        paramName: "encryptedStringBlob",
        functionName: "decryptString",
      })
    )
    return;

    if (
      !checkType({
        value: symmKey,
        allowedTypes: ["Uint8Array"],
        paramName: "symmKey",
        functionName: "decryptString",
      })
    )
    return;
  
    // -- import the decrypted symm key
    const importedSymmKey = await importSymmetricKey(symmKey);
  
    const decryptedStringArrayBuffer = await decryptWithSymmetricKey(
      encryptedStringBlob,
      importedSymmKey
    );
  
    return uint8arrayToString(new Uint8Array(decryptedStringArrayBuffer), "utf8");

}