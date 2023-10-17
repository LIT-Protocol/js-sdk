import { CID } from 'blockstore-core/dist/src/base';

export abstract class BaseIPFSProvider {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract set(serialisedData: string): Promise<{
    IPFSHash: string;
    raw: any;
  }>;
  abstract get(immutableAddress: CID | string): Promise<any>;
}
