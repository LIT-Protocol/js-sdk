import { EITHER_TYPE } from '../enums';

export interface ILitError {
  message?: string;
  name?: string;
  errorCode?: string;
  errorKind?: string;
  error?: ILitErrorTypeParams;
}

export interface ILitErrorTypeParams {
  name: string;
  code: string;
}

/**
 * A standardized way to return either error or success
 */
export interface IEither<T> {
  type: EITHER_TYPE.SUCCESS | EITHER_TYPE.ERROR;
  result: T | ILitError;
}
