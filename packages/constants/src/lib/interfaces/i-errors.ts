import { EITHER_TYPE } from '../constants/constants';
import { LitError } from '../errors';

/**
 * A standardized way to return either error or success
 */
export type IEither<T> = IEitherError | IEitherSuccess<T>;

export interface IEitherError {
  type: typeof EITHER_TYPE.ERROR;
  result: LitError;
}

export interface IEitherSuccess<T> {
  type: typeof EITHER_TYPE.SUCCESS;
  result: T;
}
