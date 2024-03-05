declare global {
    var LitNodeClientNodeJs: any;
}
export * from './lib/lit-node-client-nodejs';
export { decryptToFile, decryptToString, decryptToZip, decryptZipFileWithMetadata, decryptFromIpfs, encryptFile, encryptFileAndZipWithMetadata, encryptString, encryptToIpfs, encryptZip, verifyJwt, zipAndEncryptFiles, zipAndEncryptString, } from '@lit-protocol/encryption';
export { hashResourceIdForSigning, humanizeAccessControlConditions, } from '@lit-protocol/access-control-conditions';
export { base64StringToBlob, blobToBase64String, } from '@lit-protocol/misc-browser';
export { uint8arrayFromString, uint8arrayToString, } from '@lit-protocol/uint8arrays';
