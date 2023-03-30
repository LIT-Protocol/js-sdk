import { PKPEthersWallet } from './pkp-ethers';
import {
  ExternallyOwnedAccount,
  Signer,
  TypedDataDomain,
  TypedDataField,
  TypedDataSigner,
} from '@ethersproject/abstract-signer';
import { SignatureLike } from '@ethersproject/bytes';

export type LitTypeDataSigner = PKPEthersWallet | TypedDataSigner;

export interface EIP712TypedData {
  types: {
    // EIP712Domain: TypedDataField[]; <==
    Person: TypedDataField[];
    Mail: TypedDataField[];
    [key: string]: TypedDataField[];
  };
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  message: {
    from: {
      name: string;
      wallet: string;
    };
    to: {
      name: string;
      wallet: string;
    };
    contents: string;
  };
}

export type SupportedETHSigningMethods = 'eth_signTypedData';

export interface ETHRequestPayload {
  method: SupportedETHSigningMethods;
  params: any[];
}

export type ETHHandlerReq = {
  signer: LitTypeDataSigner;
  payload: ETHRequestPayload;
};

export type ETHSignature = string;

export type ETHHandlerRes = {
  signature: ETHSignature;
};

export type ETHRequestHandler = (
  request: ETHHandlerReq
) => Promise<ETHHandlerRes>;

export type UnknownETHMethod = Record<string, Function>;
