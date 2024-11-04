import { RetryError } from './retry-error';

export class TimeoutError extends RetryError {
  constructor(message: string, reasons: Error[]) {
    super(message, reasons);
    this.name = 'TimeoutError';
  }
}
