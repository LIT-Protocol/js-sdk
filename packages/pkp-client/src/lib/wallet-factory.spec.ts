import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { WalletFactory } from './wallet-factory';

import * as LITCONFIG from 'lit.config.json';
import {
  AuthCallbackParams,
  AuthSig,
  PKPCosmosWalletProp,
  PKPEthersWalletProp,
} from '@lit-protocol/types';

describe('WalletFactory', () => {
  it('should create an Ethereum wallet', () => {
    const ethProp: PKPEthersWalletProp = {
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.CHRONICLE_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
    };
    const ethWallet = WalletFactory.createWallet('eth', ethProp);

    expect(ethWallet).toBeInstanceOf(PKPEthersWallet);
  });

  it('should create an Ethereum wallet using auth context', () => {
    const client = new LitNodeClientNodeJs({
      litNetwork: 'localhost',
    });
    const ethProp: PKPEthersWalletProp = {
      authContext: {
        client,
        authMethods: [],
        getSessionSigsProps: {
          chain: 'ethereum',
          resourceAbilityRequests: [],
          authNeededCallback: function (
            params: AuthCallbackParams
          ): Promise<AuthSig> {
            throw new Error('Function not implemented.');
          },
        },
      },
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.CHRONICLE_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
    };
    const ethWallet = WalletFactory.createWallet('eth', ethProp);

    expect(ethWallet).toBeInstanceOf(PKPEthersWallet);
  });

  it('should throw when creating an Ethereum wallet using auth sig and auth context simultaneously', () => {
    const client = new LitNodeClientNodeJs({
      litNetwork: 'localhost',
    });
    const ethProp: PKPEthersWalletProp = {
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      authContext: {
        client,
        authMethods: [],
        getSessionSigsProps: {
          chain: 'ethereum',
          resourceAbilityRequests: [],
          authNeededCallback: function (
            params: AuthCallbackParams
          ): Promise<AuthSig> {
            throw new Error('Function not implemented.');
          },
        },
      },
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.CHRONICLE_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
    };

    expect(() => WalletFactory.createWallet('eth', ethProp)).toThrowError(
      'Multiple authentications are defined, can only use one at a time'
    );
  });

  it('should create a Cosmos wallet', () => {
    const cosmosProp: PKPCosmosWalletProp = {
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.CHRONICLE_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
      addressPrefix: 'cosmos',
    };
    const cosmosWallet = WalletFactory.createWallet('cosmos', cosmosProp);

    expect(cosmosWallet).toBeInstanceOf(PKPCosmosWallet);
  });

  it('should throw an error for unsupported BTC wallet', () => {
    const btcProp: any = {
      /* Bitcoin properties */
    };
    expect(() => WalletFactory.createWallet('btc', btcProp)).toThrowError(
      'BTC wallet is not supported yet'
    );
  });

  it('should throw an error for unsupported chain', () => {
    const unsupportedProp: any = {
      /* Unsupported properties */
    };
    expect(() =>
      WalletFactory.createWallet('unsupportedChain', unsupportedProp)
    ).toThrowError('Unsupported chain: unsupportedChain');
  });
});
