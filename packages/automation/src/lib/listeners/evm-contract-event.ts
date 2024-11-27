import { ethers } from 'ethers';
import { Listener } from './listener';

export type ContractEventData = {
  event: ethers.Event;
  args: any[];
  blockNumber: number;
  transactionHash: string;
};

export interface ContractInfo {
  address: string;
  abi: ethers.ContractInterface;
}

export interface EventInfo {
  name: string;
  filter?: any[];
}

export class EVMContractEventListener extends Listener<ContractEventData> {
  constructor(
    rpcUrl: string,
    contractInfo: ContractInfo,
    eventInfo: EventInfo
  ) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      provider
    );

    super({
      start: async () => {
        const eventFilter = contract.filters[eventInfo.name](
          ...(eventInfo.filter || [])
        );

        contract.on(eventFilter, (...args) => {
          const event = args[args.length - 1] as ethers.Event;
          const eventArgs = args.slice(0, -1);

          this.emit({
            event,
            args: eventArgs,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        });
      },
      stop: async () => {
        contract.removeAllListeners(eventInfo.name);
      },
    });
  }
}
