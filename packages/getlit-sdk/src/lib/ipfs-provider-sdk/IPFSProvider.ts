import { CID } from 'blockstore-core/dist/src/base';

export abstract class IPFSProvider {
  abstract store(serialisedData: string): Promise<any>;
  abstract get(immutableAddress: CID): Promise<any>;
}
