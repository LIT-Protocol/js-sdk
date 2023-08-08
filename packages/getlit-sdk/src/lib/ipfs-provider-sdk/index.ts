import { BaseIPFSProvider } from './providers/BaseIPFSProvider';
import { HeliaProvider } from './providers/helia-provider';
import { PinataProvider } from './providers/pinata-provider';
import { infuraProvider } from './providers/infura-provider';
import { LitIPFSProvider } from './providers/lit-ipfs-provider';

export const IPFSProviderSDK = {
  BaseIPFSProvider,
  providers: {
    HeliaProvider,
    PinataProvider,
    infuraProvider,
    LitIPFSProvider,
  },
};
