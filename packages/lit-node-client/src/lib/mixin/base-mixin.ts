import {
  CustomNetwork,
  defaultLitnodeClientConfig,
  KV,
  LitNodeClientConfig,
  LIT_ERROR,
  LIT_NETWORKS,
} from '@lit-protocol/constants';
import { isNode, throwError } from '@lit-protocol/misc';
import { getStorageItem } from '@lit-protocol/misc-browser';
import { Class } from './mixin';

export function BaseMixin<Base extends Class>(base: Base) {
  return class extends base {
    config: LitNodeClientConfig;
    connectedNodes: SetConstructor | Set<any> | any;
    serverKeys: KV | any;
    ready: boolean;
    subnetPubKey: string | null;
    networkPubKey: string | null;
    networkPubKeySet: string | null;

    // ========== Constructor ==========
    constructor(...args: any[LitNodeClientConfig | CustomNetwork | any]) {
      super();

      let customConfig = args[0];

      // -- initialize default config
      this.config = defaultLitnodeClientConfig;

      // -- if config params are specified, replace it
      if (customConfig) {
        this.config = { ...this.config, ...customConfig };
        // this.config = override(this.config, customConfig);
      }

      // -- init default properties
      this.connectedNodes = new Set();
      this.serverKeys = {};
      this.ready = false;
      this.subnetPubKey = null;
      this.networkPubKey = null;
      this.networkPubKeySet = null;

      // -- override configs
      this.overrideConfigsFromLocalStorage();

      // -- set bootstrapUrls to match the network litNetwork unless it's set to custom
      this.setCustomBootstrapUrls();

      // -- set global variables
      globalThis.litConfig = this.config;
    }

    // ========== Scoped Class Helpers ==========

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
        console.warn(`Storage key "${storageKey}" is missing. `);
        return;
      }

      // -- execute
      const storageConfig = JSON.parse(storageConfigOrError.result);
      // this.config = override(this.config, storageConfig);
      this.config = { ...this.config, ...storageConfig };
    };

    /**
     *
     * Set bootstrapUrls to match the network litNetwork unless it's set to custom
     *
     * @returns { void }
     *
     */
    setCustomBootstrapUrls = (): void => {
      // -- validate
      if (this.config.litNetwork === 'custom') return;

      // -- execute
      const hasNetwork: boolean = this.config.litNetwork in LIT_NETWORKS;

      if (!hasNetwork) {
        // network not found, report error
        throwError({
          message:
            'the litNetwork specified in the LitNodeClient config not found in LIT_NETWORKS',
          error: LIT_ERROR.LIT_NODE_CLIENT_BAD_CONFIG_ERROR,
        });
        return;
      }

      this.config.bootstrapUrls = LIT_NETWORKS[this.config.litNetwork];
    };
  };
}
