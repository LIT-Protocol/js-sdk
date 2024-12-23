import { Action } from './action';
import { StateMachine } from '../state-machine';

interface MintPkpActionParams {
  debug?: boolean;
  stateMachine: StateMachine;
  daysUntilUTCMidnightExpiration: number;
  requestPerSecond: number;
}

export class MintCapacityCreditAction extends Action {
  constructor(params: MintPkpActionParams) {
    const mintPkpFunction = async () => {
      const capacityCreditNFT =
        await params.stateMachine.litContracts.mintCapacityCreditsNFT({
          requestsPerSecond: params.requestPerSecond,
          daysUntilUTCMidnightExpiration: params.daysUntilUTCMidnightExpiration,
        });
      const capacityTokeId = capacityCreditNFT.capacityTokenIdStr;
      params.debug && console.log(`Minted PKP: ${capacityTokeId}`);
      params.stateMachine.setToContext(`activeCapacityTokenId`, capacityTokeId);
    };

    super({
      debug: params.debug,
      function: mintPkpFunction,
    });
  }
}
