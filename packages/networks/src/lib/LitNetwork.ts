import { HTTP, HTTPS, LIT_ENDPOINT } from '@lit-protocol/constants';

import type { LitChainConfig, LitNetworkConfig } from './types';

export abstract class LitNetwork {
  private readonly _name: string;
  private readonly _chainConfig: LitChainConfig;
  private readonly _endpoints: typeof LIT_ENDPOINT;
  private readonly _httpProtocol: typeof HTTP | typeof HTTPS;
  private readonly _options: unknown;

  constructor(config: LitNetworkConfig) {
    this._name = config.name;
    this._chainConfig = config.chainConfig;
    this._endpoints = config.endpoints;
    this._httpProtocol = config.httpProtocol;
    this._options = config.options;
  }

  get name() {
    return this._name;
  }

  get endpoints() {
    return this._endpoints;
  }

  get httpProtocol() {
    return this._httpProtocol;
  }

  get options() {
    return this._options;
  }

  get chainConfig() {
    return this._chainConfig;
  }

  abstract createSignRequests(params: unknown): Promise<unknown>;
  abstract handleSignResponses(params: unknown): Promise<unknown>;

  abstract createDecryptRequests(params: unknown): Promise<unknown>;
  abstract handleDecryptResponses(params: unknown): Promise<unknown>;

  abstract createExecuteJsRequests(params: unknown): Promise<unknown>;
  abstract handleExecuteJsResponses(params: unknown): Promise<unknown>;

  // Methods for PKP Session Key Signing
  abstract createSignSessionKeyRequest(params: unknown): Promise<unknown>;
  abstract handleSignSessionKeyResponse(params: unknown): Promise<unknown>;

  // Methods for PKP Claiming
  abstract createClaimKeyRequest(params: unknown): Promise<unknown>;
  abstract handleClaimKeyResponse(params: unknown): Promise<unknown>;

  // Methods for Encryption Signing (part of Decrypt flow)
  abstract createEncryptionSignRequest(params: unknown): Promise<unknown>;
  abstract handleEncryptionSignResponse(params: unknown): Promise<unknown>;

  // Methods for Node Pricing / Selection Logic
  abstract getNodePrices(): Promise<unknown>;
  abstract getMaxNodesForProduct(params: unknown): Promise<unknown>;

  // Optional: Method for IPFS Fallback Logic
  // abstract getIpfsCode(ipfsId: string): Promise<string>;
}
