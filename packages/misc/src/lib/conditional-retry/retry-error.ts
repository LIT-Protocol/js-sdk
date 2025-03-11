export class RetryError extends Error {
  reasons: Error[];

  constructor(message: string, reasons: Error[]) {
    super(message);
    this.name = 'RetryError';
    this.reasons = reasons;
  }
}
