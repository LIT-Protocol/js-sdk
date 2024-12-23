import { voidAsyncFunction } from '../types';

export interface ActionParams {
  debug?: boolean;
  function: voidAsyncFunction;
}

export class Action {
  protected readonly debug;
  private readonly function: voidAsyncFunction;

  constructor(params: ActionParams) {
    this.debug = params.debug;
    this.function = params.function;
  }

  async run() {
    return this.function();
  }
}
