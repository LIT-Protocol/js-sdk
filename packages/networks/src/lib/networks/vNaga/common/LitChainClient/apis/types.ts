import { Hex, TransactionReceipt } from 'viem';
import { DecodedLog } from './utils/decodeLogs';

export type LitTxRes<T> = {
  hash: Hex;
  receipt: TransactionReceipt;
  decodedLogs: DecodedLog[];
  data: T;
};

export type LitTxVoid = {
  hash: Hex;
  receipt: TransactionReceipt;
  decodedLogs: DecodedLog[];
};
