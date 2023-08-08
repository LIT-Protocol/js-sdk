import './global';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { isBrowser, log } from './lib/utils';
import { handleAutoAuth } from './lib/auth/handle-auto-auth';
import { LitEmitter } from './lib/events/lit-emitter';
import { LitStorage } from '@lit-protocol/lit-storage';
import { AuthMethod } from '@lit-protocol/types';
import { HeliaProvider } from './lib/ipfs-provider-sdk/providers/helia-provider';
import { BaseIPFSProvider } from './lib/ipfs-provider-sdk/providers/BaseIPFSProvider';
import { PinataProvider } from './lib/ipfs-provider-sdk/providers/pinata-provider';
import {
  PersistentStorageConfig,
  PersistentStorageConfigOptions,
  infuraConfig,
  pinataConfig,
} from './lib/types';
import { infuraProvider } from './lib/ipfs-provider-sdk/providers/infura-provider';

// initialize globally
export const loadLit = async ({
  debug = true,
  persistentStorage = {
    provider: 'pinata',
    options: {
      JWT: '',
    },
  },
}: {
  debug?: boolean;
  persistentStorage?: PersistentStorageConfig;
}) => {
  let IPFSProvider;
  let storage;
  let emitter;
  globalThis.Lit.debug = debug; // switch this to false for production
  globalThis.Lit.builder = null;

  log.start('global', 'initializing...');

  // -- initialize IPFSProvider
  try {
    // -- options for persistent storage
    const providerOptions = {
      pinata: (options: pinataConfig) =>
        new PinataProvider({
          JWT: options.JWT ?? '',
        }),
      helia: () => new HeliaProvider(),
      infura: (options: infuraConfig) =>
        new infuraProvider({
          API_KEY: options.API_KEY ?? '',
          API_KEY_SECRET: options.API_KEY_SECRET ?? '',
        }),

      // .. add more providers here
    };

    // -- select persistent storage provider
    if (providerOptions[persistentStorage.provider]) {
      IPFSProvider = providerOptions[persistentStorage.provider](
        persistentStorage.options as any
      );
    } else {
      log.throw(`Invalid persistentStorage option: ${persistentStorage}`);
    }
  } catch (e) {
    log.error(`
    Error while attempting to initialize IPFSProvider, please check your persistentStorage config\n

    loadLit({
      persistentStorage: {
        provider: 'pinata',
        options: {
          JWT: 'your-jwt-token',
        },
      },
    })
    
    \n${e}`);
  }

  // -- initialize LitStorage
  try {
    storage = new LitStorage();
  } catch (e) {
    log.throw(`Error while attempting to initialize LitStorage\n${e}`);
  }

  // -- initialize LitEmitter
  try {
    emitter = new LitEmitter();
  } catch (e) {
    log.throw(`Error while attempting to initialize LitEmitter\n${e}`);
  }

  // -- initialize LitOptionsBuilder
  try {
    // todo: figure out why there is type incompatibility
    globalThis.Lit.builder = new LitOptionsBuilder({
      emitter,
      ...(persistentStorage && { persistentStorage: IPFSProvider }),
      storage,
    }) as any;
  } catch (e) {
    log.throw(`Error while attempting to initialize LitOptionsBuilder\n${e}`);
  }

  if (!globalThis.Lit.builder) {
    log.throw(`globalThis.Lit.builder is undefined!`);
  }

  // -- build LitOptionsBuilder
  try {
    await globalThis.Lit.builder.build();
  } catch (e) {
    log.throw(`Error while attempting to build LitOptionsBuilder\n${e}`);
  }

  log.end('global', 'done!');

  // ---------- Enable auto auth for browser ----------
  if (isBrowser()) {
    handleAutoAuth(async (authData: AuthMethod) => {
      globalThis.Lit.eventEmitter?.createAccountStatus('in_progress');
      log.info('Creating Lit account...');

      try {
        const PKPInfoArr = await globalThis.Lit.createAccount({
          authData: [authData],
        });
        log.success('Lit account created!');
        log.info(`PKPInfo: ${JSON.stringify(PKPInfoArr)}`);

        if (Array.isArray(PKPInfoArr)) {
          globalThis.Lit.eventEmitter?.createAccountStatus(
            'completed',
            PKPInfoArr
          );
        }
      } catch (e) {
        log.error(`Error while attempting to create Lit account ${e}`);
        globalThis.Lit.eventEmitter?.createAccountStatus('failed');
      }
    });
  }
};
