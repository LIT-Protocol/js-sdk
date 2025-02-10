import { BigNumber } from 'ethers';

export interface ValidatorStruct {
  ip: number;
  ipv6: BigNumber;
  port: number;
  nodeAddress: string;
  reward: BigNumber;
  seconderPubkey: BigNumber;
  receiverPubkey: BigNumber;
}

export interface ValidatorWithPrices extends ValidatorStruct {
  validator: ValidatorStruct;
  prices: BigNumber[];
}
