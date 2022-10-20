import { JsonAuthSig } from '@litprotocol-dev/constants';

import {
    AccessControlConditions,
    EvmContractConditions,
    SolRpcConditions,
    UnifiedAccessControlConditions,
} from '@litprotocol-dev/constants';

import LitNodeClient from './lit-node-client';

export interface EncryptFileAndZipWithMetadataProps {
    // The authSig of the user.  Returned via the checkAndSignAuthMessage function
    authSig: JsonAuthSig;

    // The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    accessControlConditions: AccessControlConditions;

    // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    evmContractConditions: EvmContractConditions;

    // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
    solRpcConditions: SolRpcConditions;

    // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    unifiedAccessControlConditions: UnifiedAccessControlConditions;

    // The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
    chain: string;

    // The file you wish to encrypt
    file: File;

    // An instance of LitNodeClient that is already connected
    litNodeClient: LitNodeClient;

    // An optional readme text that will be inserted into readme.txt in the final zip file.  This is useful in case someone comes across this zip file and wants to know how to decrypt it.  This file could contain instructions and a URL to use to decrypt the file.
    readme: string;
}

export interface DecryptZipFileWithMetadataProps {
    // The authSig of the user.  Returned via the checkAndSignAuthMessage function
    authSig: JsonAuthSig;

    // The zip file blob with metadata inside it and the encrypted asset
    file: File;

    // An instance of LitNodeClient that is already connected
    litNodeClient: LitNodeClient;

    // Addtional access control conditions
    additionalAccessControlConditions: any[];
}
