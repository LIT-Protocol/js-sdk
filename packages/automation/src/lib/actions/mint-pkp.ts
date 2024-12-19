import { Action } from './action';
import { StateMachine } from '../state-machine';

interface MintPkpActionParams {
  debug?: boolean;
  stateMachine: StateMachine;
}

export class MintPkpAction extends Action {
  constructor(params: MintPkpActionParams) {
    const mintPkpFunction = async () => {
      const mintingReceipt =
        await params.stateMachine.litContracts.pkpNftContractUtils.write.mint();
      const pkp = mintingReceipt.pkp;
      params.debug && console.log(`Minted PKP: ${pkp}`);
      params.stateMachine.setToContext('activePkp', pkp);
    };

    super({
      debug: params.debug,
      function: mintPkpFunction,
    });
  }
}
