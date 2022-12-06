import { ContractTransaction } from 'ethers';
import { BigNumber, BigNumberish } from 'ethers';
        
        export interface Arrayish {
            toHexString(): string;
            slice(start?: number, end?: number): Arrayish;
            length: number;
            [index: number]: number;
        }
        
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContext<
  PKPNFTMetadata,
  PKPNFTMetadataEventsContext,
  PKPNFTMetadataEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type PKPNFTMetadataEvents = undefined;
export interface PKPNFTMetadataEventsContext {}
export type PKPNFTMetadataMethodNames = 'new' | 'bytesToHex' | 'tokenURI';
export interface PKPNFTMetadata {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param buffer Type: bytes, Indexed: false
   */
  bytesToHex(
    buffer: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param pubKey Type: bytes, Indexed: false
   * @param ethAddress Type: address, Indexed: false
   */
  tokenURI(
    tokenId: BigNumberish,
    pubKey: Arrayish,
    ethAddress: string,
    overrides?: ContractCallOverrides
  ): Promise<string>;
}
