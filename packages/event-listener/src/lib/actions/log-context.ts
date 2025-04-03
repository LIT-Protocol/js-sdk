import { logger } from '@lit-protocol/logger';

import { Action } from './action';
import { StateMachine } from '../state-machine';

interface LogContextActionParams {
  debug?: boolean;
  stateMachine: StateMachine;
  path?: string;
}

export class LogContextAction extends Action {
  constructor(params: LogContextActionParams) {
    const logContextFunction = async () => {
      logger.info({
        msg: `State Machine context`,
        context: params.stateMachine.getFromContext(params.path),
      });
    };

    super({
      debug: params.debug,
      function: logContextFunction,
    });
  }
}
