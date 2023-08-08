import { BaseIPFSProvider } from './BaseIPFSProvider';

export class LitIPFSProvider extends BaseIPFSProvider {
  override set(
    serialisedData: string
  ): Promise<{ IPFSHash: string; raw: any }> {
    throw new Error('Method not implemented.');
  }

  override get(
    immutableAddress: import('blockstore-core/dist/src/base').CID | string
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
