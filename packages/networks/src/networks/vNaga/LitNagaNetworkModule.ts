import { LitNetworkModule } from "../LitNetworkModule";
import type { EpochInfo } from '@lit-protocol/types';

interface NetworkPrice {
  url: string;
  prices: bigint[];
}

interface PriceFeedInfo {
  epochId: bigint;
  minNodeCount: bigint;
  networkPrices: NetworkPrice[];
}

interface EpochState {
  currentNumber: number;
  startTime: number;
}


// TODO: Change this to the inferred type ReturnType<typeof api.connection.getConnectionInfo> 
interface ConnectionInfo {
  epochInfo: EpochInfo;
  epochState: EpochState;
  minNodeCount: number;
  bootstrapUrls: string[];
  priceFeedInfo: PriceFeedInfo;
}

export interface LitNagaNetworkModule extends Omit<LitNetworkModule, 'getConnectionInfo'> {
  getConnectionInfo: () => Promise<ConnectionInfo>;
}