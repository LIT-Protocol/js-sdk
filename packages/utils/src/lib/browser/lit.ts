import { AccsCOSMOSParams, AccsDefaultParams, AccsEVMParams, AccsRegularParams, AccsSOLV2Params, ALL_LIT_CHAINS, CheckAndSignAuthParams, DecryptFileProps, DecryptZipFileWithMetadata, DecryptZipFileWithMetadataProps, EncryptedFile, EncryptedString, EncryptedZip, EncryptFileAndZipWithMetadataProps, HumanizedAccsProps, IJWT, ILitError, JsonAuthSig, LIT_ERROR_TYPE, NETWORK_PUB_KEY, ThreeKeys, VerifyJWTProps, VMTYPE } from "@litprotocol-dev/constants";
import { checkIfAuthSigRequiresChainParam, checkType, log, throwError, safeParams, throwRemovedFunctionError } from "@litprotocol-dev/utils";
import { wasmBlsSdkHelpers } from '@litprotocol-dev/core'

import JSZip from "jszip";
import { checkAndSignCosmosAuthMessage } from "./chains/cosmos";
import { checkAndSignEVMAuthMessage, decimalPlaces } from "./chains/eth";
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
import { formatEther, formatUnits } from "ethers/lib/utils";

const PACKAGE_CACHE = {};

// ---------- Local Interfaces ----------

// TODO: unsure about types
interface MetadataForFile{
  name: string | any,
  type: string | any,
  size: string | number | any,
  accessControlConditions: any[] | any,
  evmContractConditions: any[] | any,
  solRpcConditions: any[] | any,
  unifiedAccessControlConditions: any[] | any,
  chain: string,
  encryptedSymmetricKey: Uint8Array | any,
}

// ---------- Local Helpers ----------

/**
 * 
 * Format SOL number using Ether Units
 * 
 * @param { number } amount
 * 
 * @returns { string } formatted unit
 * 
 */
const formatSol = (amount: number) : string => {
  return formatUnits(amount, 9);
}

/**
 * 
 * Format Atom number using Ether Units
 * 
 * @param { number } amount
 * 
 * @returns { string } formatted unit
 * 
 */
const formatAtom = (amount: number) : string => {
  return formatUnits(amount, 6);
}

/**
 * 
 * Get all the metadata needed to decrypt something in the future.  If you're encrypting files with Lit and storing them in IPFS or Arweave, then this function will provide you with a properly formatted metadata object that you should save alongside the files.
 * 
 * @param { MetadataForFile }
 * 
 * @return { MetadataForFile }
 * 
 */
const metadataForFile = ({
  name,
  type,
  size,
  accessControlConditions,
  evmContractConditions,
  solRpcConditions,
  unifiedAccessControlConditions,
  chain,
  encryptedSymmetricKey,
}: MetadataForFile) : MetadataForFile => {
  return {
    name,
    type,
    size,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    encryptedSymmetricKey: uint8arrayToString(encryptedSymmetricKey, "base16"),
  };
}

/**
 * 
 * Comparator translator
 * 
 * @param { string } comparator 
 * 
 * @returns { string } humanized version of the comparator
 */
const humanizeComparator = (comparator: string) => {
  
  let list : any = {
    ">" : "more than",
    ">=" : "at least",
    "=" : "exactly",
    "<" : "less than",
    "<=" : "at most",
    "contains": "contains"
  };

  let selected : string | undefined = list[comparator];

  if ( ! selected ){
    log(`Unregonized comparator ${comparator}`);
    return;
  }
  
  return selected;

}

/**
 * 
 * Humanize EVM basic access control conditions
 * 
 * @property { Array<AccsRegularParams | AccsDefaultParams | any> } accessControlConditions
 * @property { Array<any | string> } tokenList 
 * @property { string } myWalletAddress
 * 
 * @returns 
 */
const humanizeEvmBasicAccessControlConditions = async ({
  accessControlConditions,
  tokenList,
  myWalletAddress,
}: {
  accessControlConditions: Array<AccsRegularParams | AccsDefaultParams | any>,
  tokenList: Array<any | string>,
  myWalletAddress: string,
}) : Promise<string> => {
  
  log("humanizing evm basic access control conditions");
  log("myWalletAddress", myWalletAddress);
  log("accessControlConditions", accessControlConditions);

  let fixedConditions : any = accessControlConditions;

  // inject and operator if needed
  // this is done because before we supported operators,
  // we let users specify an entire array of conditions
  // that would be "AND"ed together.  this injects those ANDs
  if (accessControlConditions.length > 1) {
    let containsOperator = false;

    for (let i = 0; i < accessControlConditions.length; i++) {

      if (accessControlConditions[i].operator) {
        containsOperator = true;
      }
    }

    if (!containsOperator) {
      fixedConditions = [];

      // insert ANDs between conditions
      for (let i = 0; i < accessControlConditions.length; i++) {
        fixedConditions.push(accessControlConditions[i]);
        if (i < accessControlConditions.length - 1) {
          fixedConditions.push({
            operator: "and",
          });
        }
      }
    }
  }

  // -- execute
  const promises = await Promise.all(
    fixedConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeEvmBasicAccessControlConditions({
          accessControlConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === "and") {
          return " and ";
        } else if (acc.operator.toLowerCase() === "or") {
          return " or ";
        }
      }

      if (
        acc.standardContractType === "timestamp" &&
        acc.method === "eth_getBlockByNumber"
      ) {
        return `Latest mined block must be past the unix timestamp ${acc.returnValueTest.value}`;
      } else if (
        acc.standardContractType === "MolochDAOv2.1" &&
        acc.method === "members"
      ) {
        // molochDAOv2.1 membership
        return `Is a member of the DAO at ${acc.contractAddress}`;
      } else if (
        acc.standardContractType === "ERC1155" &&
        acc.method === "balanceOf"
      ) {
        // erc1155 owns an amount of specific tokens
        return `Owns ${humanizeComparator(acc.returnValueTest.comparator)} ${
          acc.returnValueTest.value
        } of ${acc.contractAddress} tokens with token id ${acc.parameters[1]}`;
      } else if (
        acc.standardContractType === "ERC1155" &&
        acc.method === "balanceOfBatch"
      ) {
        // erc1155 owns an amount of specific tokens from a batch of token ids
        return `Owns ${humanizeComparator(acc.returnValueTest.comparator)} ${
          acc.returnValueTest.value
        } of ${acc.contractAddress} tokens with token id ${acc.parameters[1]
          .split(",")
          .join(" or ")}`;
      } else if (
        acc.standardContractType === "ERC721" &&
        acc.method === "ownerOf"
      ) {
        // specific erc721
        return `Owner of tokenId ${acc.parameters[0]} from ${acc.contractAddress}`;
      } else if (
        acc.standardContractType === "ERC721" &&
        acc.method === "balanceOf" &&
        acc.contractAddress === "0x22C1f6050E56d2876009903609a2cC3fEf83B415" &&
        acc.returnValueTest.comparator === ">" &&
        acc.returnValueTest.value === "0"
      ) {
        // for POAP main contract where the user owns at least 1 poap
        return `Owns any POAP`;
      } else if (
        acc.standardContractType === "POAP" &&
        acc.method === "tokenURI"
      ) {
        // owns a POAP
        return `Owner of a ${acc.returnValueTest.value} POAP on ${acc.chain}`;
      } else if (
        acc.standardContractType === "POAP" &&
        acc.method === "eventId"
      ) {
        // owns a POAP
        return `Owner of a POAP from event ID ${acc.returnValueTest.value} on ${acc.chain}`;
      } else if (
        acc.standardContractType === "CASK" &&
        acc.method === "getActiveSubscriptionCount"
      ) {
        // Cask powered subscription
        return `Cask subscriber to provider ${acc.parameters[1]} for plan ${acc.parameters[2]} on ${acc.chain}`;
      } else if (
        acc.standardContractType === "ERC721" &&
        acc.method === "balanceOf"
      ) {
        // any erc721 in collection
        return `Owns ${humanizeComparator(acc.returnValueTest.comparator)} ${
          acc.returnValueTest.value
        } of ${acc.contractAddress} tokens`;
      } else if (
        acc.standardContractType === "ERC20" &&
        acc.method === "balanceOf"
      ) {
        let tokenFromList;
        if (tokenList) {
          tokenFromList = tokenList.find(
            (t) => t.address === acc.contractAddress
          );
        }
        let decimals, name;
        if (tokenFromList) {
          decimals = tokenFromList.decimals;
          name = tokenFromList.symbol;
        } else {
          decimals = await decimalPlaces({
            contractAddress: acc.contractAddress,
            chain: acc.chain,
          });
        }
        log("decimals", decimals);
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatUnits(acc.returnValueTest.value, decimals)} of ${
          name || acc.contractAddress
        } tokens`;
      } else if (
        acc.standardContractType === "" &&
        acc.method === "eth_getBalance"
      ) {
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatEther(acc.returnValueTest.value)} ETH`;
      } else if (acc.standardContractType === "" && acc.method === "") {
        if (
          myWalletAddress &&
          acc.returnValueTest.value.toLowerCase() ===
            myWalletAddress.toLowerCase()
        ) {
          return `Controls your wallet (${myWalletAddress})`;
        } else {
          return `Controls wallet with address ${acc.returnValueTest.value}`;
        }
      }
    })
  );
  return promises.join("");
}

/**
 * 
 * Humanize EVM contract conditions
 * 
 * @property { Array<AccsEVMParams> } evmContractConditions
 * @property { Array<any | string> } tokenList 
 * @property { string } myWalletAddress
 * 
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 * 
 */
const humanizeEvmContractConditions = async ({
  evmContractConditions,
  tokenList,
  myWalletAddress,
}: {
  evmContractConditions: Array<AccsEVMParams>,
  tokenList: Array<any | string>,
  myWalletAddress: string,
}) : Promise<string> => {
  log("humanizing evm contract conditions");
  log("myWalletAddress", myWalletAddress);
  log("evmContractConditions", evmContractConditions);

  const promises = await Promise.all(
    evmContractConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeEvmContractConditions({
          evmContractConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === "and") {
          return " and ";
        } else if (acc.operator.toLowerCase() === "or") {
          return " or ";
        }
      }

      let msg = `${acc.functionName}(${acc.functionParams.join(
        ", "
      )}) on contract address ${
        acc.contractAddress
      } should have a result of ${humanizeComparator(
        acc.returnValueTest.comparator
      )} ${acc.returnValueTest.value}`;
      if (acc.returnValueTest.key !== "") {
        msg += ` for key ${acc.returnValueTest.key}`;
      }
      return msg;
    })
  );
  return promises.join("");
}

/**
 * 
 * Humanize SOL RPC Conditions
 * 
 * @property { Array<AccsSOLV2Params> } solRpcConditions
 * @property { Array<any | string> } tokenList 
 * @property { string } myWalletAddress
 * 
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 * 
 */
const humanizeSolRpcConditions = async ({
  solRpcConditions,
  tokenList,
  myWalletAddress,
}: {
  solRpcConditions: Array<AccsSOLV2Params>,
  tokenList: Array<any | string>,
  myWalletAddress: string,
}) : Promise<string> => {
  log("humanizing sol rpc conditions");
  log("myWalletAddress", myWalletAddress);
  log("solRpcConditions", solRpcConditions);

  const promises = await Promise.all(
    solRpcConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeSolRpcConditions({
          solRpcConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === "and") {
          return " and ";
        } else if (acc.operator.toLowerCase() === "or") {
          return " or ";
        }
      }

      if (acc.method === "getBalance") {
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatSol(acc.returnValueTest.value)} SOL`;
      } else if (acc.method === "") {
        if (
          myWalletAddress &&
          acc.returnValueTest.value.toLowerCase() ===
            myWalletAddress.toLowerCase()
        ) {
          return `Controls your wallet (${myWalletAddress})`;
        } else {
          return `Controls wallet with address ${acc.returnValueTest.value}`;
        }
      } else {
        let msg = `Solana RPC method ${acc.method}(${acc.params.join(
          ", "
        )}) should have a result of ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${acc.returnValueTest.value}`;
        if (acc.returnValueTest.key !== "") {
          msg += ` for key ${acc.returnValueTest.key}`;
        }
        return msg;
      }
    })
  );
  return promises.join("");
}

/**
 * 
 * Humanize Cosmos Conditions
 * 
 * @property { Array<AccsCOSMOSParams> } cosmosConditions
 * @property { Array<any | string> } tokenList 
 * @property { string } myWalletAddress
 * 
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 * 
 */
const humanizeCosmosConditions = async ({
  cosmosConditions,
  tokenList,
  myWalletAddress,
}: {
  cosmosConditions: Array<AccsCOSMOSParams | any>,
  tokenList: Array<any | string>,
  myWalletAddress: string

}) : Promise<string> => {
  log("humanizing cosmos conditions");
  log("myWalletAddress", myWalletAddress);
  log("cosmosConditions", cosmosConditions);

  const promises = await Promise.all(
    cosmosConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeCosmosConditions({
          cosmosConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === "and") {
          return " and ";
        } else if (acc.operator.toLowerCase() === "or") {
          return " or ";
        }
      }

      if (acc.path === "/cosmos/bank/v1beta1/balances/:userAddress") {
        return `Owns ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${formatAtom(acc.returnValueTest.value)} ATOM`;
      } else if (acc.path === ":userAddress") {
        if (
          myWalletAddress &&
          acc.returnValueTest.value.toLowerCase() ===
            myWalletAddress.toLowerCase()
        ) {
          return `Controls your wallet (${myWalletAddress})`;
        } else {
          return `Controls wallet with address ${acc.returnValueTest.value}`;
        }
      } else if (
        acc.chain === "kyve" &&
        acc.path === "/kyve/registry/v1beta1/funders_list/0"
      ) {
        return `Is a current KYVE funder`;
      } else {
        let msg = `Cosmos RPC request for ${
          acc.path
        } should have a result of ${humanizeComparator(
          acc.returnValueTest.comparator
        )} ${acc.returnValueTest.value}`;
        if (acc.returnValueTest.key !== "") {
          msg += ` for key ${acc.returnValueTest.key}`;
        }
        return msg;
      }
    })
  );
  return promises.join("");
}


/**
 * 
 * Humanize unified access control conditions
 * 
 * @property { Array<AccsRegularParams | AccsDefaultParams | AccsSOLV2Params | AccsEVMParams | AccsCOSMOSParams> } unifiedAccessControlConditions
 * @property { Array<any | string> } tokenList 
 * @property { string } myWalletAddress
 * 
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 */
const humanizeUnifiedAccessControlConditions = async ({
  unifiedAccessControlConditions,
  tokenList,
  myWalletAddress,
}: {
  unifiedAccessControlConditions: Array<AccsRegularParams | AccsDefaultParams | AccsSOLV2Params | AccsEVMParams | AccsCOSMOSParams>,
  tokenList: Array<any | string>,
  myWalletAddress: string,
}) : Promise<string> => {
  const promises = await Promise.all(
    unifiedAccessControlConditions.map(async (acc: any) => {
      if (Array.isArray(acc)) {
        // this is a group.  recurse.
        const group = await humanizeUnifiedAccessControlConditions({
          unifiedAccessControlConditions: acc,
          tokenList,
          myWalletAddress,
        });
        return `( ${group} )`;
      }

      if (acc.operator) {
        if (acc.operator.toLowerCase() === "and") {
          return " and ";
        } else if (acc.operator.toLowerCase() === "or") {
          return " or ";
        }
      }

      if (acc.conditionType === "evmBasic") {
        return humanizeEvmBasicAccessControlConditions({
          accessControlConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else if (acc.conditionType === "evmContract") {
        return humanizeEvmContractConditions({
          evmContractConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else if (acc.conditionType === "solRpc") {
        return humanizeSolRpcConditions({
          solRpcConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else if (acc.conditionType === "cosmos") {
        return humanizeCosmosConditions({
          cosmosConditions: [acc],
          tokenList,
          myWalletAddress,
        });
      } else {
        throwError({
          message: `Unrecognized condition type: ${acc.conditionType}`,
          name: "InvalidUnifiedConditionType",
          errorCode: "invalid_unified_condition_type",
        });
      }
    })
  );
  return promises.join("");
}

// ---------- Local Helpers ----------
/**
 * 
 * Check for an existing cryptographic authentication signature and create one of it does not exist.  This is used to prove ownership of a given crypto wallet address to the Lit nodes.  The result is stored in LocalStorage so the user doesn't have to sign every time they perform an operation.
 * 
 * @param { CheckAndSignAuthParams }
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
export const encryptString = async (
  str: string
) : Promise<EncryptedString | undefined> => {

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
 * 
 * Decrypt a string that was encrypted with the encryptString function.
 * 
 * @param { Blob|File } encryptedStringBlob The encrypted string as a Blob
 * @param { Uint8Array } symmKey The symmetric key used that will be used to decrypt this.
 * 
 * @returns { Promise<string> } A promise containing the decrypted string
 */
export const decryptString = async (
    encryptedStringBlob: Blob, 
    symmKey: Uint8Array
) : Promise<string | undefined> => {
    

    // -- validate
    const paramsIsSafe = safeParams({
      functionName: "decryptString",
      params: [encryptedStringBlob, symmKey],
    });

    if ( ! paramsIsSafe ) return;

  
    // -- import the decrypted symm key
    const importedSymmKey : CryptoKey = await importSymmetricKey(symmKey);
  
    const decryptedStringArrayBuffer : Uint8Array = await decryptWithSymmetricKey(
      encryptedStringBlob,
      importedSymmKey
    );
  
    return uint8arrayToString(new Uint8Array(decryptedStringArrayBuffer), "utf8");

}

/**
 * 
 * Zip and encrypt a string.  This is used to encrypt any string that is to be locked via the Lit Protocol.
 * 
 * @param { string } string The string to zip and encrypt
 * 
 * @returns { Promise<Object> } A promise containing the encryptedZip as a Blob and the symmetricKey used to encrypt it, as a Uint8Array.  The encrypted zip will contain a single file called "string.txt"
 */
export const zipAndEncryptString = async (
  string: string
) : Promise<EncryptedZip | undefined> => {

    // -- validate
    if (
        !checkType({
        value: string,
        allowedTypes: ["String"],
        paramName: "string",
        functionName: "zipAndEncryptString",
        })
    )
    return;

    const zip : JSZip = new JSZip();
    
    zip.file("string.txt", string);
    
    return encryptZip(zip);
}

/**
 * 
 * Zip and encrypt multiple files.
 * 
 * @param { Array<File> } files An array of the files you wish to zip and encrypt
 * 
 * @returns {Promise<Object>} A promise containing the encryptedZip as a Blob and the symmetricKey used to encrypt it, as a Uint8Array.  The encrypted zip will contain a folder "encryptedAssets" and all of the files will be inside it.
 
*/
 export const zipAndEncryptFiles = async (
  files: Array<File> 
) : Promise<EncryptedZip | undefined> => {
    
    // let's zip em
    const zip = new JSZip();

    // -- zip each file
    for (let i = 0; i < files.length; i++) {

        // -- validate
        if (
            !checkType({
                value: files[i],
                allowedTypes: ["File"],
                paramName: `files[${i}]`,
                functionName: "zipAndEncryptFiles",
            })
        )return;

        const folder : JSZip | null = zip.folder("encryptedAssets");

        if( ! folder ){
            log("Failed to get 'encryptedAssets' from zip.folder() ");
            return;
        }

        folder.file(files[i].name, files[i]);
    }

    return encryptZip(zip);
}

/**
 * 
 * Decrypt and unzip a zip that was created using encryptZip, zipAndEncryptString, or zipAndEncryptFiles.
 * 
 * @param { Blob|File } encryptedZipBlob The encrypted zip as a Blob
 * @param { Uint8Array } symmKey The symmetric key used that will be used to decrypt this zip.
 * 
 * @returns { Promise<Object> } A promise containing a JSZip object indexed by the filenames of the zipped files.  For example, if you have a file called "meow.jpg" in the root of your zip, you could get it from the JSZip object by doing this: const imageBlob = await decryptedZip['meow.jpg'].async('blob')
 */
export const decryptZip = async (
  encryptedZipBlob : Blob | File, 
  symmKey: Uint8Array
) : Promise<{[key: string]: JSZip.JSZipObject} | undefined> => {

    // -- validate
    const paramsIsSafe = safeParams({
        functionName: "encryptFileAndZipWithMetadata",
        params: {
          encryptedZipBlob,
          symmKey
        }
    });

    if ( ! paramsIsSafe ) return;
  
    // import the decrypted symm key
    const importedSymmKey = await importSymmetricKey(symmKey);
  
    const decryptedZipArrayBuffer = await decryptWithSymmetricKey(
      encryptedZipBlob,
      importedSymmKey
    );
  
    // unpack the zip
    const zip = new JSZip();
    const unzipped = await zip.loadAsync(decryptedZipArrayBuffer);
    
    return unzipped.files;
}

/**
 * 
 * Encrypt a zip file created with JSZip using a new random symmetric key via WebCrypto.
 * 
 * @param { JSZip } zip The JSZip instance to encrypt
 * 
 * @returns { Promise<Object> } A promise containing the encryptedZip as a Blob and the symmetricKey used to encrypt it, as a Uint8Array string.
 */
export const encryptZip = async (
  zip: JSZip
) : Promise<EncryptedZip> => {

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const zipBlobArrayBuffer : ArrayBuffer = await zipBlob.arrayBuffer();
  
    const symmKey : CryptoKey = await generateSymmetricKey();

    const encryptedZipBlob : Blob = await encryptWithSymmetricKey(
      symmKey,
      zipBlobArrayBuffer
    );
  
    // to download the encrypted zip file for testing, uncomment this
    // saveAs(encryptedZipBlob, 'encrypted.bin')

    const exportedSymmKey : Uint8Array = new Uint8Array(
      await crypto.subtle.exportKey("raw", symmKey)
    );

    const encryptedZip : EncryptedZip = {
        symmetricKey: exportedSymmKey,
        encryptedZip: encryptedZipBlob,
    }

    return encryptedZip;
}

/**
 * 
 * Encrypt a single file, save the key to the Lit network, and then zip it up with the metadata.
 * 
 * @param { EncryptFileAndZipWithMetadataProps } 
 * 
 * @returns { Promise<ThreeKeys | undefined> }
 * 
 */
export const encryptFileAndZipWithMetadata = async({
    authSig,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    file,
    litNodeClient,
    readme,
}: EncryptFileAndZipWithMetadataProps) : Promise<ThreeKeys | undefined>=> {

    // -- validate
    const paramsIsSafe = safeParams({
        functionName: "encryptFileAndZipWithMetadata",
        params: {
            authSig,
            accessControlConditions,
            evmContractConditions,
            solRpcConditions,
            unifiedAccessControlConditions,
            chain,
            file,
            litNodeClient,
            readme,
        }
    });

    if ( ! paramsIsSafe ) return;

    // -- validate
    const symmetricKey = await generateSymmetricKey();
    const exportedSymmKey = new Uint8Array(
      await crypto.subtle.exportKey("raw", symmetricKey)
    );
    // log('exportedSymmKey in hex', uint8arrayToString(exportedSymmKey, 'base16'))
  
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      symmetricKey: exportedSymmKey,
      authSig,
      chain,
    });

    log("encrypted key saved to Lit", encryptedSymmetricKey);
  
    // encrypt the file
    var fileAsArrayBuffer = await file.arrayBuffer();
    const encryptedZipBlob = await encryptWithSymmetricKey(
      symmetricKey,
      fileAsArrayBuffer
    );
  
    const zip = new JSZip();
    const metadata = metadataForFile({
      name: file.name,
      type: file.type,
      size: file.size,
      encryptedSymmetricKey,
      accessControlConditions,
      evmContractConditions,
      solRpcConditions,
      unifiedAccessControlConditions,
      chain,
    });
  
    zip.file("lit_protocol_metadata.json", JSON.stringify(metadata));
    if (readme) {
      zip.file("readme.txt", readme);
    }

    const folder : JSZip | null = zip.folder("encryptedAssets");

    if( ! folder ){
        log("Failed to get 'encryptedAssets' from zip.folder() ");
        return;
    }

    folder.file(file.name, encryptedZipBlob);
  
    const zipBlob = await zip.generateAsync({ type: "blob" });

    const threeKeys : ThreeKeys = { 
      zipBlob, 
      encryptedSymmetricKey, 
      symmetricKey: exportedSymmKey 
    };
  
    return threeKeys;
}

/**
 * 
 * Given a zip file with metadata inside it, unzip, load the metadata, and return the decrypted file and the metadata.  This zip file would have been created with the encryptFileAndZipWithMetadata function.
 * 
 * @param { DecryptZipFileWithMetadataProps } 
 * 
 * @returns { Promise<DecryptZipFileWithMetadata> } A promise containing an object that contains decryptedFile and metadata properties.  The decryptedFile is an ArrayBuffer that is ready to use, and metadata is an object that contains all the properties of the file like it's name and size and type.
 */
export const decryptZipFileWithMetadata = async ({
  authSig,
  file,
  litNodeClient,
  additionalAccessControlConditions,
} : DecryptZipFileWithMetadataProps) : Promise<DecryptZipFileWithMetadata | undefined> => {

  // -- validate
  const paramsIsSafe = safeParams({
      functionName: "decryptZipFileWithMetadata",
      params: {
        authSig,
        file,
        litNodeClient,
        additionalAccessControlConditions,
      }
  });

  if ( ! paramsIsSafe ) return;

  // -- execute
  const zip = await JSZip.loadAsync(file);

  const jsonFile : JSZip.JSZipObject | null = zip.file("lit_protocol_metadata.json");

  if ( ! jsonFile ){
    log(`Failed to read lit_protocol_metadata.json while zip.file()`);
    return;
  }

  const metadata = JSON.parse(
    await jsonFile.async("string")
  );

  log("zip metadata", metadata);

  let symmKey;

  try {
    symmKey = await litNodeClient.getEncryptionKey({
      accessControlConditions: metadata.accessControlConditions,
      evmContractConditions: metadata.evmContractConditions,
      solRpcConditions: metadata.solRpcConditions,
      unifiedAccessControlConditions: metadata.unifiedAccessControlConditions,
      toDecrypt: metadata.encryptedSymmetricKey,
      chain: metadata.chain,    // -- validate
      authSig,
    });
  } catch (e: any) {
    if (e.errorCode === "not_authorized") {
      // try more additionalAccessControlConditions
      if (!additionalAccessControlConditions) {
        throw e;
      }
      log("trying additionalAccessControlConditions");

      // -- loop start
      for (let i = 0; i < additionalAccessControlConditions.length; i++) {

        const accessControlConditions =
          additionalAccessControlConditions[i].accessControlConditions;

        log("trying additional condition", accessControlConditions);

        try {
          symmKey = await litNodeClient.getEncryptionKey({
            accessControlConditions: accessControlConditions,
            toDecrypt:
              additionalAccessControlConditions[i].encryptedSymmetricKey,
            chain: metadata.chain,
            authSig,
          });

          // okay we got the additional symmkey, now we need to decrypt the symmkey and then use it to decrypt the original symmkey
          // const importedAdditionalSymmKey = await importSymmetricKey(symmKey)
          // symmKey = await decryptWithSymmetricKey(additionalAccessControlConditions[i].encryptedSymmetricKey, importedAdditionalSymmKey)

          break; // it worked, we can leave the loop and stop checking additional access control conditions
        } catch (e: any) {
          // swallow not_authorized because we are gonna try some more accessControlConditions
          if (e.errorCode !== "not_authorized") {
            throw e;
          }
        }
      }
      // -- loop ends

      if (!symmKey) {
        // we tried all the access control conditions and none worked
        throw e;
      }
    } else {
      throw e;
    }
  }
  const importedSymmKey = await importSymmetricKey(symmKey);

  const folder : JSZip | null = zip.folder("encryptedAssets");
  
  if( ! folder ){
      log("Failed to get 'encryptedAssets' from zip.folder() ");
      return;
  }

  const _file : JSZip.JSZipObject | null = folder
  .file(metadata.name);

  if( ! _file ){
    log("Failed to get 'metadata.name' while zip.folder().file()");
    return;
  }

  const encryptedFile = await _file.async("blob");

  const decryptedFile = await decryptWithSymmetricKey(
    encryptedFile,
    importedSymmKey
  );

  const data : DecryptZipFileWithMetadata = { decryptedFile, metadata };

  return data;
}

/**
 * 
 * Encrypt a file without doing any zipping or packing.  This is useful for large files.  A 1gb file can be encrypted in only 2 seconds, for example.  A new random symmetric key will be created and returned along with the encrypted file.
 * 
 * @param { Object } params
 * @param { Blob|File } params.file The file you wish to encrypt
 * 
 * @returns { Promise<Object> } A promise containing an object with keys encryptedFile and symmetricKey.  encryptedFile is a Blob, and symmetricKey is a Uint8Array that can be used to decrypt the file.
 */
 export const encryptFile = async ({ 
  file
 }: {
  file: File | Blob
 } ) => {

  // -- validate
  if (
    !checkType({
      value: file,
      allowedTypes: ["Blob", "File"],
      paramName: "file",
      functionName: "encryptFile",
    })
  )
  return;

  // generate a random symmetric key
  const symmetricKey = await generateSymmetricKey();
  const exportedSymmKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", symmetricKey)
  );

  // encrypt the file
  var fileAsArrayBuffer = await file.arrayBuffer();
  const encryptedFile = await encryptWithSymmetricKey(
    symmetricKey,
    fileAsArrayBuffer
  );

  const _encryptedFile : EncryptedFile = { 
    encryptedFile, 
    symmetricKey: exportedSymmKey 
  };

  return _encryptedFile;

}

/**
 * 
 * Decrypt a file that was encrypted with the encryptFile function, without doing any unzipping or unpacking.  This is useful for large files.  A 1gb file can be decrypted in only 1 second, for example.
 * 
 * @property { Object } params
 * @property { Blob | File } params.file The file you wish to decrypt
 * @property { Uint8Array } params.symmetricKey The symmetric key used that will be used to decrypt this.
 * 
 * @returns { Promise<Object> } A promise containing the decrypted file.  The file is an ArrayBuffer.
 */
 export const decryptFile = async ({ 
  file, 
  symmetricKey 
} : DecryptFileProps) : Promise<Uint8Array | undefined> => {

  // -- validate
  const paramsIsSafe = safeParams({
    functionName: "decryptFile",
    params: { 
      file, 
      symmetricKey 
    }
  });

  if ( ! paramsIsSafe ) return;


  // -- execute
  const importedSymmKey = await importSymmetricKey(symmetricKey);

  // decrypt the file
  const decryptedFile = await decryptWithSymmetricKey(file, importedSymmKey);

  return decryptedFile;
}


declare global {
  var wasmExports: any;
}

/**
 * // TODO check for expiration
 * 
 * Verify a JWT from the LIT network.  Use this for auth on your server.  For some background, users can define resources (URLs) for authorization via on-chain conditions using the saveSigningCondition function.  Other users can then request a signed JWT proving that their ETH account meets those on-chain conditions using the getSignedToken function.  Then, servers can verify that JWT using this function.  A successful verification proves that the user meets the on-chain conditions defined in the saveSigningCondition step.  For example, the on-chain condition could be posession of a specific NFT.
 * 
 * @param { VerifyJWTProps } jwt 
 * 
 * @returns { IJWT } An object with 4 keys: "verified": A boolean that represents whether or not the token verifies successfully.  A true result indicates that the token was successfully verified.  "header": the JWT header.  "payload": the JWT payload which includes the resource being authorized, etc.  "signature": A uint8array that represents the raw  signature of the JWT.
 */
export const verifyJwt = ({
   jwt 
}: VerifyJWTProps) : IJWT | undefined => {
  
  // -- validate
  if (
    !checkType({
      value: jwt,
      allowedTypes: ["String"],
      paramName: "jwt",
      functionName: "verifyJwt",
    })
  ) return;

  log("verifyJwt", jwt);

  // verify that the wasm was loaded
  if ( ! globalThis.wasmExports) {
    log("wasmExports is not loaded.");
  }

  const pubKey = uint8arrayFromString(NETWORK_PUB_KEY, "base16");
  // log("pubkey is ", pubKey);

  const jwtParts = jwt.split(".");
  const sig = uint8arrayFromString(jwtParts[2], "base64url");
  // log("sig is ", uint8arrayToString(sig, "base16"));

  const unsignedJwt = `${jwtParts[0]}.${jwtParts[1]}`;
  // log("unsignedJwt is ", unsignedJwt);

  const message = uint8arrayFromString(unsignedJwt);
  // log("message is ", message);

  // p is public key uint8array
  // s is signature uint8array
  // m is message uint8array
  // function is: function (p, s, m)
  const verified = Boolean(wasmBlsSdkHelpers.verify(pubKey, sig, message));

  const _jwt : IJWT = {
    verified,
    header: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[0], "base64url"))
    ),
    payload: JSON.parse(
      uint8arrayToString(uint8arrayFromString(jwtParts[1], "base64url"))
    ),
    signature: sig,
  }

  return _jwt;
}

/**
 * 
 * The human readable name for an access control condition
 * 
 * @param { HumanizedAccsProps } params
 * 
 * @returns { Promise<string> } A promise containing a human readable description of the access control conditions
 */
 export const humanizeAccessControlConditions = async ({
  accessControlConditions,
  evmContractConditions,
  solRpcConditions,
  unifiedAccessControlConditions,
  tokenList,
  myWalletAddress,
}: HumanizedAccsProps) : Promise<string | undefined> => {
  if (accessControlConditions) {
    return humanizeEvmBasicAccessControlConditions({
      accessControlConditions,
      tokenList,
      myWalletAddress,
    });
  } else if (evmContractConditions) {
    return humanizeEvmContractConditions({
      evmContractConditions,
      tokenList,
      myWalletAddress,
    });
  } else if (solRpcConditions) {
    return humanizeSolRpcConditions({
      solRpcConditions,
      tokenList,
      myWalletAddress,
    });
  } else if (unifiedAccessControlConditions) {
    return humanizeUnifiedAccessControlConditions({
      unifiedAccessControlConditions,
      tokenList,
      myWalletAddress,
    });
  }else{
    return;
  }
}


// ---------- Deprecated Functions ----------
const getNpmPackage = () => throwRemovedFunctionError("getNpmPackage");
export const createHtmlLIT = () => throwRemovedFunctionError("createHtmlLIT");
export const toggleLock = () => throwRemovedFunctionError("toggleLock");
export const unlockLitWithKey = () => throwRemovedFunctionError("unlockLitWithKey");
export const getTokenList = () => throwRemovedFunctionError("getTokenList");
export const sendMessageToFrameParent = () => throwRemovedFunctionError("sendMessageToFrameParent");
