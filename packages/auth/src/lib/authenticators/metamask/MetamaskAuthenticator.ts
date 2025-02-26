import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

import {
  LIT_CHAINS,
  AUTH_METHOD_TYPE,
  InvalidArgumentException,
  LitEVMChainKeys,
  WrongParamFormat,
} from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { log } from '@lit-protocol/misc';
import {
  AuthMethod,
  AuthSig,
  BaseProviderOptions,
  EthWalletProviderOptions,
  EthWalletAuthenticateOptions,
} from '@lit-protocol/types';

import { BaseAuthenticator } from '../BaseAuthenticator';
import { checkAndSignEVMAuthMessage } from './eth';

interface DomainAndOrigin {
  domain?: string;
  origin?: string;
}

export class MetamaskAuthenticator extends BaseAuthenticator {
  /**
   * The domain from which the signing request is made
   */
  public domain: string;
  /**
   * The origin from which the signing request is made
   */
  public origin: string;

  constructor(options: EthWalletProviderOptions & BaseProviderOptions) {
    super(options);

    const { domain, origin } =
      MetamaskAuthenticator.getDomainAndOrigin(options);
    this.domain = domain;
    this.origin = origin;
  }

  private static getDomainAndOrigin(options: DomainAndOrigin) {
    let domain, origin;
    try {
      domain = options.domain || window.location.hostname;
      origin = options.origin || window.location.origin;
    } catch (e) {
      log(
        '⚠️ Error getting "domain" and "origin" from window object, defaulting to "localhost" and "http://localhost"'
      );
      domain = options.domain || 'localhost';
      origin = options.origin || 'http://localhost';
    }
    return { domain, origin };
  }

  /**
   * Generate a wallet signature to use as an auth method
   *
   * @param {EthWalletAuthenticateOptions} options
   * @param {string} [options.address] - Address to sign with
   * @param {string} [options.chain] - Name of chain to use for signature
   * @param {number} [options.expiration] - When the auth signature expires
   *
   * @returns {Promise<AuthMethod>} - Auth method object containing the auth signature
   */
  public async authenticate(
    options?: EthWalletAuthenticateOptions
  ): Promise<AuthMethod> {
    if (!options) {
      throw new InvalidArgumentException(
        {
          info: {
            options,
          },
        },
        'Options are required to authenticate with EthWalletProvider.'
      );
    }

    return MetamaskAuthenticator.authenticate({
      signer: options,
      address: options.address,
      chain: options.chain,
      litNodeClient: this.litNodeClient,
      expiration: options.expiration,
      domain: this.domain,
      origin: this.origin,
    });
  }

  /**
   * Generate a wallet signature to use as an auth method
   *
   * @param {EthWalletAuthenticateOptions} options
   * @param {object} options.signer - Signer object
   * @param {object} options.litNodeClient - LitNodeClient instance
   * @param {string} [options.address] - Address to sign with
   * @param {string} [options.chain] - Name of chain to use for signature
   * @param {number} [options.expiration] - When the auth signature expires
   * @param {string} [options.domain] - Domain from which the signing request is made
   * @param {string} [options.origin] - Origin from which the signing request is made
   * @returns {Promise<AuthMethod>} - Auth method object containing the auth signature
   * @static
   * @memberof MetamaskAuthenticator
   *
   * @example
   * ```typescript
   *   const authMethod = await EthWalletProvider.authenticate({
   *      signer: wallet,
   *      litNodeClient: client,
   *   });
   * ```
   */
  public static async authenticate({
    signer,
    address,
    chain,
    litNodeClient,
    expiration,
    domain,
    origin,
  }: {
    signer: ethers.Signer | ethers.Wallet | EthWalletAuthenticateOptions;
    litNodeClient: LitNodeClient;
    address?: string;
    chain?: LitEVMChainKeys;
    expiration?: string;
    domain?: string;
    origin?: string;
  }): Promise<AuthMethod> {
    chain = chain || 'ethereum';

    let authSig: AuthSig;

    // convert to EIP-55 format or else SIWE complains
    address =
      address ||
      (await signer?.getAddress!()) ||
      (signer as ethers.Wallet)?.address;

    if (!address) {
      throw new InvalidArgumentException(
        {
          info: {
            address,
            signer,
          },
        },
        `Address is required to authenticate with EthWalletProvider. Cannot find it in signer or options.`
      );
    }

    address = ethers.utils.getAddress(address);

    if (signer?.signMessage) {
      // Get chain ID or default to Ethereum mainnet
      const selectedChain = LIT_CHAINS[chain];
      const chainId = selectedChain?.chainId ? selectedChain.chainId : 1;

      // Get expiration or default to 24 hours
      expiration =
        expiration || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

      const { domain: resolvedDomain, origin: resolvedOrigin } =
        MetamaskAuthenticator.getDomainAndOrigin({ domain, origin });

      // Prepare Sign in with Ethereum message
      const preparedMessage: Partial<SiweMessage> = {
        domain: resolvedDomain,
        uri: resolvedOrigin,
        address,
        version: '1',
        chainId,
        expirationTime: expiration,
        nonce: await litNodeClient.getLatestBlockhash(),
      };

      const message: SiweMessage = new SiweMessage(preparedMessage);
      const toSign: string = message.prepareMessage();

      // Use provided function to sign message
      const signature = await signer.signMessage(toSign);

      authSig = {
        sig: signature,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: toSign,
        address: address,
      };
    } else {
      authSig = await checkAndSignEVMAuthMessage({
        chain,
        nonce: await litNodeClient.getLatestBlockhash(),
      });
    }

    const authMethod = {
      authMethodType: AUTH_METHOD_TYPE.EthWallet,
      accessToken: JSON.stringify(authSig),
    };
    return authMethod;
  }

  /**
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<string>} - Auth method id
   */
  public async getAuthMethodId(authMethod: AuthMethod): Promise<string> {
    return MetamaskAuthenticator.authMethodId(authMethod);
  }

  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    let address: string;

    try {
      address = JSON.parse(authMethod.accessToken).address;
    } catch (err) {
      throw new WrongParamFormat(
        {
          info: {
            authMethod,
          },
          cause: err,
        },
        'Error when parsing auth method to generate auth method ID for Eth wallet'
      );
    }

    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${address}:lit`));
  }
}
