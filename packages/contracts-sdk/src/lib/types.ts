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

/**
 * from the `getActiveUnkickedValidatorStructsAndCounts` Staking contract function
   epochLength: _BigNumber { _hex: '0x05dc', _isBigNumber: true },
  number: _BigNumber { _hex: '0x04c5', _isBigNumber: true },
  endTime: _BigNumber { _hex: '0x66c75b12', _isBigNumber: true },
  retries: _BigNumber { _hex: '0x03', _isBigNumber: true },
  timeout: _BigNumber { _hex: '0x3c', _isBigNumber: true }
 */
export type EpochInfo = {
  epochLength: number;
  number: number;
  endTime: number;
  retries: number;
  timeout: number;
};
