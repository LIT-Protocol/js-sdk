import { NodeAttestation } from '@lit-protocol/types';
import { ethers } from 'ethers';

export interface SendNodeCommand {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  requestId: string;
}

export interface NodeCommandServerKeysResponse {
  serverPublicKey: string;
  subnetPublicKey: string;
  networkPublicKey: string;
  networkPublicKeySet: string;
  hdRootPubkeys: string[];
  attestation?: NodeAttestation;
  latestBlockhash?: string;
}

export interface HandshakeWithNode {
  url: string;
  challenge: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listener = (...args: any[]) => void;

export type providerTest<T> = (
  provider: ethers.providers.JsonRpcProvider
) => Promise<T>;

export interface CoreNodeConfig {
  subnetPubKey: string;
  networkPubKey: string;
  networkPubKeySet: string;
  hdRootPubkeys: string[];
  latestBlockhash: string;
  lastBlockHashRetrieved: number;
}

export interface EpochCache {
  currentNumber: null | number;
  startTime: null | number;
}
