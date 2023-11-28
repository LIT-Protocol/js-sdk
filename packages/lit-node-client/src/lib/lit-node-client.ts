import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { CustomNetwork, LitNodeClientConfig } from '@lit-protocol/types';
import { isNode, log } from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';
import { EITHER_TYPE } from '@lit-protocol/constants';

export class LitNodeClient extends LitNodeClientNodeJs {
  constructor(args: any[LitNodeClientConfig | CustomNetwork | any]) {
    super({
      ...args,
      defaultAuthCallback: checkAndSignAuthMessage,
    });

    // -- override configs
    this.overrideConfigsFromLocalStorage();
  }

  /**
   *
   * (Browser Only) Get the config from browser local storage and override default config
   *
   * @returns { void }
   *
   */
  overrideConfigsFromLocalStorage = (): void => {
    if (isNode()) return;

    const storageKey = 'LitNodeClientConfig';
    const storageConfigOrError = getStorageItem(storageKey);

    // -- validate
    if (storageConfigOrError.type === EITHER_TYPE.ERROR) {
      log(`Storage key "${storageKey}" is missing. `);
      return;
    }

    // -- execute
    const storageConfig = JSON.parse(storageConfigOrError.result as string);
    // this.config = override(this.config, storageConfig);
    this.config = { ...this.config, ...storageConfig };
  };
}
