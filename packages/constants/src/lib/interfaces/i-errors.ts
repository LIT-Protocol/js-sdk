import { EITHER_TYPE } from '../enums';
import { LitError } from '../errors';

/**
 * A standardized way to return either error or success
 */
export type IEither<T> = IEitherError | IEitherSuccess<T>;

export interface IEitherError {
  type: EITHER_TYPE.ERROR;
  result: LitError;
}

export interface IEitherSuccess<T> {
  type: EITHER_TYPE.SUCCESS;
  result: T;
}
