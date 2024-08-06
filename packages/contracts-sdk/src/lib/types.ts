import { BigNumber } from 'ethers';

export type ValidatorStruct = {
  ip: number;
  ipv6: BigNumber;
  port: number;
  nodeAddress: string;
  reward: BigNumber;
  seconderPubkey: BigNumber;
  receiverPubkey: BigNumber;
};

export interface ValidatorStructAndCount extends ValidatorStruct {
  epoch: number;
  minNodeCount: number;
}
