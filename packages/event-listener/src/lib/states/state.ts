import { logger } from '@lit-protocol/logger';

import { voidAsyncFunction } from '../types';

export interface BaseStateParams {
  key: string;
  onEnter?: voidAsyncFunction;
  onExit?: voidAsyncFunction;
  debug?: boolean;
}

export type StateParams = BaseStateParams;

/**
 * A State class that represents a state with optional entry and exit actions.
 */
export class State {
  private readonly debug;
  public readonly key: string;
  public readonly onEnter: voidAsyncFunction | undefined;
  public readonly onExit: voidAsyncFunction | undefined;

  constructor(params: BaseStateParams) {
    this.key = params.key;
    this.onEnter = params.onEnter;
    this.onExit = params.onExit;
    this.debug = params.debug ?? false;
  }

  /**
   * Executes the onEnter action for the state.
   */
  async enter() {
    this.debug && logger.info(`enter ${this.key}`);
    await this.onEnter?.();
  }

  /**
   * Executes the onExit action for the state.
   */
  async exit() {
    this.debug && logger.info(`exit ${this.key}`);
    await this.onExit?.();
  }
}
