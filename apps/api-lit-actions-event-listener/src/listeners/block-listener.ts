import * as Bull from "bull";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ActionListener, BlockEventParams, JobFilter } from "../types";

interface BlockListenerOpts {
  jsonRpcProvider?: JsonRpcProvider;
}

export class BlockListener implements ActionListener {
  provider: JsonRpcProvider;

  constructor(args?: BlockListenerOpts) {
    args = args || {};

    if (!args.jsonRpcProvider) {
      args.jsonRpcProvider = new JsonRpcProvider(
        "https://rpc-mumbai.maticvigil.com"
      );
    }

    this.provider = args.jsonRpcProvider;
  }

  getFilter(name: string): any {
    try {
      return this.filters.find((f) => f.name === name).filter;
    } catch (e) {
      throw Error("Cannot find filter");
    }
  }

  filters: Array<JobFilter> = [
    {
      name: "lessThanOrEqual",
      filter: (job: Bull.Job, eventParams: BlockEventParams) => {
        return (
          job.data.payload.eventParams.blockNumber <= eventParams.blockNumber
        );
      },
    },
  ];
}
