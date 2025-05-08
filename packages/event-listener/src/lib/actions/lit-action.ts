import { AutomationError } from '@lit-protocol/constants';

import { Action } from './action';
import { executeLitAction } from '../litActions';
import { StateMachine } from '../state-machine';
import { ContextOrLiteral, PKPInfo } from '../types';
import { ILitNodeClient } from '@lit-protocol/types';

interface LitActionActionParams {
  debug?: boolean;
  stateMachine: StateMachine;
  code?: ContextOrLiteral<string>;
  ipfsId?: ContextOrLiteral<string>;
  jsParams?: Record<string, unknown>;
}

export class LitActionAction extends Action {
  constructor(params: LitActionActionParams) {
    const litActionFunction = async () => {
      const activePkp = params.stateMachine.resolveContextPathOrLiteral({
        contextPath: 'activePkp',
      }) as unknown as PKPInfo;
      if (!activePkp) {
        throw new AutomationError(
          {
            info: {
              machineId: params.stateMachine.id,
              activePkp,
            },
          },
          `There is no active pkp. Must configure it to run a Lit Action`
        );
      }

      const litActionResponse = await executeLitAction({
        litNodeClient: params.stateMachine
          .litNodeClient as unknown as ILitNodeClient,
        capacityTokenId: params.stateMachine.resolveContextPathOrLiteral({
          contextPath: 'activeCapacityTokenId',
        }) as unknown as string,
        pkpEthAddress: activePkp.ethAddress,
        pkpPublicKey: activePkp.publicKey,
        authSigner: params.stateMachine.signer,
        ipfsId:
          'ipfsId' in params
            ? params.stateMachine.resolveContextPathOrLiteral(params.ipfsId)
            : undefined,
        code:
          'code' in params
            ? params.stateMachine.resolveContextPathOrLiteral(params.code)
            : undefined,
        jsParams: params.jsParams,
      });

      // TODO send user this result with a webhook and log
      params.stateMachine.setToContext(
        'lastLitActionResponse',
        litActionResponse
      );
    };

    super({
      debug: params.debug,
      function: litActionFunction,
    });
  }
}
