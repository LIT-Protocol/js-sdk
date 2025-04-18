import { LitActionAction } from './lit-action';
import { LogContextAction } from './log-context';
import { MintPkpAction } from './mint-pkp';
import { TransactionAction } from './transaction';
import { ActionConstructor } from '../types';

export * from './action';
export * from './lit-action';
export * from './log-context';
export * from './mint-pkp';
export * from './transaction';

export const ACTION_REPOSITORY: Record<string, ActionConstructor> = {
  context: LogContextAction,
  litAction: LitActionAction,
  transaction: TransactionAction,
  usePkp: MintPkpAction,
};
