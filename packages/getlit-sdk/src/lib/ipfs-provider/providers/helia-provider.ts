import { CID } from 'blockstore-core/dist/src/base';
import { isBrowser, isNode, log } from '../../utils';
import { BaseIPFSProvider } from './base-ipfs-provider';
import { fetchIPFSContent } from '../utils/ipfs-provider-sdk-helper';

// These will be automatically injected if it is a browser environment
declare global {
  var Helia: any;
  var HeliaStrings: any;
}

const SCRIPTS = [
  'https://unpkg.com/helia@1.3.12/dist/index.min.js',
  'https://unpkg.com/@helia/strings@1.0.0/dist/index.min.js',
];

export class HeliaProvider extends BaseIPFSProvider {
  public heliaNode: any;

  constructor() {
    super('helia');

    if (isBrowser()) {
      // ==================== !!!! NOTE !!!! ====================
      // This is a sync call and may not be available immediately
      // It will try to "wait" to see if "withPersistentStorage()"
      // is called after "await loadLit()". If it is, then it will
      // not inject the scripts.
      setTimeout(() => {
        console.log(
          'globalThis.Lit.builder?.custom.persistentStorage:',
          globalThis.Lit.builder?.custom.persistentStorage
        );
        if (globalThis.Lit.builder?.custom.persistentStorage === false) {
          console.log('No custom persistent storage found');
          this.injectScripts();

          log.info('Creating Helia instance');

          // poll 10 times, every 200ms to check if Helia is injected
          let pollCount = 0;
          const poll = setInterval(() => {
            if (pollCount > 10) {
              clearInterval(poll);
              throw new Error('Helia not injected after 10 attempts');
            }

            if (globalThis.Helia && globalThis.HeliaStrings) {
              log.info('🚀 Helia injected!');
              clearInterval(poll);

              this.createHeliaNode().then((heliaNode) => {
                log.info(`🚀 HeliaProvider: Helia Node created!
        peerId: ${heliaNode.libp2p.peerId.toString()}
        isStarted: ${heliaNode.libp2p.isStarted()}
                `);
                this.heliaNode = heliaNode;
                this.heliaNode.libp2p.stop();
              });
            }

            log.info('Polling for Helia instance...');
          }, 200);
        }
      }, 800);
    }
  }

  injectScripts() {
    SCRIPTS.forEach((src) => {
      log.info('injecting script:', src);

      // -- inject to DOM body
      document.head.appendChild(
        Object.assign(document.createElement('script'), {
          src,
        })
      );
    });
  }

  validateInjectedScripts() {
    if (!globalThis.Helia || !globalThis.HeliaStrings) {
      console.log('globalThis.Helia:', globalThis.Helia);
      console.log('globalThis.HeliaStrings:', globalThis.HeliaStrings);
      throw new Error('Helia or HeliaStrings not found in globalThis');
    }
  }

  createHeliaNode = async () => {
    let heliaNode;

    try {
      heliaNode = await globalThis.Helia.createHelia();
    } catch (e) {
      log.throw(`Error while attempting to createHelia\n${e}`);
    }

    return heliaNode;
  };

  heliaStrings = async (helia: any) => {
    let str;

    try {
      str = globalThis.HeliaStrings.strings(helia);
    } catch (e) {
      log.throw(`Error while attempting to createHelia\n${e}`);
    }

    return str;
  };

  getHeliaStrings = async () => {
    return await this.heliaStrings(this.heliaNode);
  };

  override async set(serialisedData: string): Promise<{
    IPFSHash: string;
    raw: any;
  }> {
    log.start('HeliaProvider - store', 'uploading data to IPFS...');
    log.info('serialisedData:', serialisedData);
    let immutableAddress;

    if (isBrowser()) {
      this.validateInjectedScripts();

      const s = await this.getHeliaStrings();

      try {
        immutableAddress = await s.add(serialisedData);
      } catch (e) {
        log.throw(`Error while attempting to add to IPFS\n${e}`);
      }

      log.info('immutableAddress:', immutableAddress);

      log.end('HeliaProvider - store', 'uploaded data to IPFS!');

      return {
        IPFSHash: immutableAddress.toString(),
        raw: immutableAddress,
      };
    }

    if (isNode()) {
      log.info('HeliaProvider is not supported in NodeJS environments');
    }

    return {
      IPFSHash: '',
      raw: null,
    };
  }

  override async get(immutableAddress: CID | string): Promise<any> {
    log.start('HeliaProvider - retrieve', 'downloading data from IPFS...');

    let data = await fetchIPFSContent(immutableAddress.toString());

    // -- try to fetch it from IPFS first
    if (data) {
      return data;
    }

    if (isBrowser()) {
      this.validateInjectedScripts();

      const s = await this.getHeliaStrings();

      data = await s.get(immutableAddress);
    }

    if (isNode()) {
      log.info('HeliaProvider is not supported in NodeJS environments');
    }

    log.end('HeliaProvider - retrieve', 'downloaded data from IPFS!');

    return data;
  }
}
