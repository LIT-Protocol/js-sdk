import { LitContracts } from '@lit-protocol/contracts-sdk';

import { State, StateParams } from './state';

export interface PKPInfo {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
}

export interface MintPKPStateParams extends StateParams {
  litContracts: LitContracts;
  callback: (pkpInfo: PKPInfo) => void;
}

export class MintPKPState extends State {
  constructor(params: MintPKPStateParams) {
    const superParams: StateParams = {
      key: params.key,
      debug: params.debug,
      onExit: params.onExit,
      onEnter: async () => {
        const mintingReceipt =
          await params.litContracts.pkpNftContractUtils.write.mint();
        params.callback(mintingReceipt.pkp);
        await params.onEnter?.();
      },
    };

    super(superParams);
  }
}
