export interface BaseStateParams {
  key: string;
  onEnter?: () => Promise<void>;
  onExit?: () => Promise<void>;
  debug?: boolean;
}

export type StateParams = BaseStateParams;

/**
 * A State class that represents a state with optional entry and exit actions.
 */
export class State {
  private readonly debug;
  public readonly key: string;
  public readonly onEnter: (() => Promise<void>) | undefined;
  public readonly onExit: (() => Promise<void>) | undefined;

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
    this.debug && console.log(`enter ${this.key}`);
    await this.onEnter?.();
  }

  /**
   * Executes the onExit action for the state.
   */
  async exit() {
    this.debug && console.log(`exit ${this.key}`);
    await this.onExit?.();
  }
}
