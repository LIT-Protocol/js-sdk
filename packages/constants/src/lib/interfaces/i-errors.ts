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
export type IEither<T> = IEitherError | IEitherSuccess<T>;

export interface IEitherError {
  type: EITHER_TYPE.ERROR;
  result: ILitError;
}

export interface IEitherSuccess<T> {
  type: EITHER_TYPE.SUCCESS;
  result: T;
}
