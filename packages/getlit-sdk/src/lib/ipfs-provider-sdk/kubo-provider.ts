import { CID } from 'blockstore-core/dist/src/base';
import { IPFSProvider } from './IPFSProvider';

export class KuboProvider extends IPFSProvider {
  constructor() {
    super();
  }

  override store(serialisedData: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  override get(immutableAddress: CID): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

// const ipfsHash = await Lit.persistentStorage.store('HELLO MOTO');
// console.log("IPFSHash:", ipfsHash.toString());

// const res = await Lit.persistentStorage.retrieve(ipfsHash);
// console.log(res);
