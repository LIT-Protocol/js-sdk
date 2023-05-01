import { PKPEthersWallet } from './pkp-ethers';
import {
  ExternallyOwnedAccount,
  Signer,
  TypedDataDomain,
  TypedDataField,
  TypedDataSigner,
} from '@ethersproject/abstract-signer';
import { SignatureLike } from '@ethersproject/bytes';
import { Transaction } from 'ethers';

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

export type SupportedETHSigningMethods =
  | 'eth_sign'
  | 'personal_sign'
  | 'eth_signTransaction'
  | 'eth_signTypedData'
  | 'eth_signTypedData_v1'
  | 'eth_signTypedData_v3'
  | 'eth_signTypedData_v4'
  | 'eth_sendTransaction'
  | 'eth_sendRawTransaction';

export interface ETHRequestSigningPayload {
  method: SupportedETHSigningMethods;
  params: any[];
}

export type ETHHandlerReq = {
  signer: LitTypeDataSigner;
  payload: ETHRequestSigningPayload;
};

export type ETHRequestHandler = (
  request: ETHHandlerReq
) => Promise<ETHHandlerRes>;

export type UnknownETHMethod = Record<string, Function>;

export type ETHSignature = string;

export type ETHTxRes = Transaction;

export type ETHHandlerRes =
  | { signature: ETHSignature }
  | { txRes: Transaction };
