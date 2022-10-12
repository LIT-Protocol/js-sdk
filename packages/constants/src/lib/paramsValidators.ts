import { checkIfAuthSigRequiresChainParam, checkType } from "@litprotocol-dev/utils";
import { DecryptFileProps, DecryptZipFileWithMetadataProps, EncryptFileAndZipWithMetadataProps } from "./interfaces";

export const paramsValidators : {
    [key: string] : any,
} = {

    "decryptString": (params: any) => {

        const encryptedStringBlob : Blob = params[0];
        const symmKey: Uint8Array = params[1];

        // -- validate
        if (
            !checkType({
                value: encryptedStringBlob,
                allowedTypes: ["Blob", "File"],
                paramName: "encryptedStringBlob",
                functionName: "decryptString",
                })
        ) return false;
    
        if (
            !checkType({
                value: symmKey,
                allowedTypes: ["Uint8Array"],
                paramName: "symmKey",
                functionName: "decryptString",
            })
        ) return false;

        // -- success
        return true;

    },
    "decryptFile": (params: DecryptFileProps) => {

        // -- validate
        if (
            !checkType({
              value: params.file,
              allowedTypes: ["Blob", "File"],
              paramName: "file",
              functionName: "decryptFile",
            })
          ) return false;
            
          // -- validate
          if (
            !checkType({
              value: params.symmetricKey,
              allowedTypes: ["Uint8Array"],
              paramName: "symmetricKey",
              functionName: "decryptFile",
            })
          ) return false;

          return true;
    },

    "decryptZipFileWithMetadata": (params: DecryptZipFileWithMetadataProps) => {

        // -- validate
        if (
            !checkType({
                value: params.authSig,
                allowedTypes: ["Object"],
                paramName: "authSig",
                functionName: "decryptZipFileWithMetadata",
            })
        ) return false;

        // -- validate
        if (
            !checkType({
              value: params.file,
              allowedTypes: ["Blob", "File"],
              paramName: "file",
              functionName: "decryptZipFileWithMetadata",
            })
        )return false;

        // -- success case
        return true;
    },

    "decryptZip": (encryptedZipBlob: Blob | File, symmKey: Uint8Array) => { 

        // -- validate
        if (
            !checkType({
                value: encryptedZipBlob,
                allowedTypes: ["Blob", "File"],
                paramName: "encryptedZipBlob",
                functionName: "decryptZip",
            })
        ) return false;
        
        // -- validate
        if (
            !checkType({
                value: symmKey,
                allowedTypes: ["Uint8Array"],
                paramName: "symmKey",
                functionName: "decryptZip",
            })
        ) return false;

        return true;
    },

    "encryptFileAndZipWithMetadata": (params: EncryptFileAndZipWithMetadataProps) => {
        
        // -- validate
        if(
            !checkType({
                value: params.authSig,
                allowedTypes: ["Object"],
                paramName: "authSig",
                functionName: "encryptFileAndZipWithMetadata",
            })
        ) return false;

        // -- validate
        if(
            params.accessControlConditions &&
            !checkType({
                value: params.accessControlConditions,
                allowedTypes: ["Array"],
                paramName: "accessControlConditions",
                functionName: "encryptFileAndZipWithMetadata",
            })
        ) return false;

        // -- validate
        if (
            params.evmContractConditions &&
            !checkType({
                value: params.evmContractConditions,
                allowedTypes: ["Array"],
                paramName: "evmContractConditions",
                functionName: "encryptFileAndZipWithMetadata",
            })
        )
        return false;

        // -- validate
        if (
            params.solRpcConditions &&
            !checkType({
                value: params.solRpcConditions,
                allowedTypes: ["Array"],
                paramName: "solRpcConditions",
                functionName: "encryptFileAndZipWithMetadata",
            })
        )
        return false;
        
        // -- validate
        if (
            params.unifiedAccessControlConditions &&
            !checkType({
                value: params.unifiedAccessControlConditions,
                allowedTypes: ["Array"],
                paramName: "unifiedAccessControlConditions",
                functionName: "encryptFileAndZipWithMetadata",
            })
        )
        return false;
            
        // -- validate
        if (
            !checkIfAuthSigRequiresChainParam(
                params.authSig,
                params.chain,
                "encryptFileAndZipWithMetadata"
            )
        )
        return false;
                
        // -- validate
        if (
            !checkType({
                value: params.file,
                allowedTypes: ["File"],
                paramName: "file",
                functionName: "encryptFileAndZipWithMetadata",
            })
        )
        return false;
        
        // -- validate
        if (
            params.readme &&
            !checkType({
              value: params.readme,
              allowedTypes: ["String"],
              paramName: "readme",
              functionName: "encryptFileAndZipWithMetadata",
            })
        )
        return false;

        // -- success case
        return true;

    }
}