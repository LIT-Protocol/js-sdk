import { NodeClient } from '@lit-protocol/node-client';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';
import { CustomNetwork, LitNodeClientConfig } from '@lit-protocol/types';
import { isNode, log } from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';

export class LitNodeClient extends NodeClient {
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
    if (storageConfigOrError.type === 'ERROR') {
      log(`Storage key "${storageKey}" is missing. `);
      return;
    }

    // -- execute
    const storageConfig = JSON.parse(storageConfigOrError.result);
    // this.config = override(this.config, storageConfig);
    this.config = { ...this.config, ...storageConfig };
  };
}
