import {
  AuthMethod,
  AuthSig,
  BaseProviderOptions,
  EthWalletProviderOptions,
  EthWalletAuthenticateOptions,
} from '@lit-protocol/types';
import { LIT_CHAINS, AuthMethodType } from '@lit-protocol/constants';
import { SiweMessage } from 'lit-siwe';
import { ethers } from 'ethers';
import { BaseProvider } from './BaseProvider';
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';
import { isBrowser, isNode } from '@lit-protocol/misc';

export default class EthWalletProvider extends BaseProvider {
  /**
   * The domain from which the signing request is made
   */
  public domain: string;
  /**
   * The origin from which the signing request is made
   */
  public origin: string;

  /**
   * Wallet signature
   */
  #authSig: AuthSig | undefined;

  constructor(options: BaseProviderOptions & EthWalletProviderOptions) {
    super(options);

    try {
      this.domain = options.domain || window.location.hostname;
      this.origin = options.origin || window.location.origin;
    } catch (e) {
      console.log(
        '⚠️ Error getting "domain" and "origin" from window object, defaulting to "My DApp Name" and "MyEthereumApp-development"'
      );
      this.domain = options.domain || 'My DApp Name';
      this.origin = options.origin || 'MyEthereumApp-development';
    }
  }

  public getAuthMethodStorageUID(authSig: AuthSig | string): string {
    let _authSig: AuthSig;

    try {
      _authSig = JSON.parse(authSig as string) as AuthSig;
    } catch (e) {
      _authSig = authSig as AuthSig;
    }

    if (!_authSig.address) {
      throw new Error(
        'Address is required to generate auth method storage UID'
      );
    }

    return `lit-ethwallet-token-${_authSig.address}`;
  }

  /**
   * Generate a wallet signature to use as an auth method
   *
   * @param {EthWalletAuthenticateOptions} options
   * @param {string} [options.address] - Address to sign with
   * @param {function} [options.signMessage] - Function to sign message with
   * @param {string} [options.chain] - Name of chain to use for signature
   * @param {number} [options.expiration] - When the auth signature expires
   *
   * @returns {Promise<AuthMethod>} - Auth method object containing the auth signature
   */
  public async authenticate(
    options?: EthWalletAuthenticateOptions
  ): Promise<AuthMethod> {
    let address = options?.address;
    let signMessage = options?.signMessage;
    const chain = options?.chain || 'ethereum';

    let authSig: AuthSig;

    const _options = {
      cache: true,
      ...options,
    };

    if (_options?.cache) {
      // -- we do not want to use the default lit-auth-signature when cache is enabled,
      // instead we want to use the lit-ethwallet-token
      authSig = await checkAndSignAuthMessage({
        chain,
        ...(_options?.expirationUnit &&
          _options?.expirationLength && {
            expiration: this.storageProvider.convertToISOString(
              _options.expirationLength,
              _options.expirationUnit
            ),
          }),
        cache: false,
      });

      const storageUID = this.getAuthMethodStorageUID(authSig);

      this.storageProvider.setExpirableItem(
        storageUID,
        JSON.stringify({
          authMethodType: AuthMethodType.EthWallet,
          accessToken: JSON.stringify(authSig),
        }),
        _options?.expirationLength ?? 24,
        _options?.expirationUnit ?? 'hours'
      );
    } else {
      /**
       * If signMessage is provided like "ethSigner.signMessage", then we need to
       * bind the signer to the signMessage function. This is because the signer
       * is not available until the user has connected their wallet.
       *
       * eg. const signer = new ethers.Wallet(privateKey);
       *     const signMessage = signer.signMessage.bind(signer);
       *
       * So if you only pass in signer.signMessage, you will get "Cannot read properties
       * of undefined (reading '_signingKey')".
       */
      if ((address && signMessage) || _options?.signer) {
        if (_options?.signer) {
          if (!address) {
            address = await _options?.signer.getAddress();
          }

          if (!signMessage) {
            signMessage = _options.signer.signMessage.bind(_options.signer);
          }
        }
        if (!address) {
          throw new Error('address is required');
        }

        if (!signMessage) {
          throw new Error('signMessage is required');
        }

        // convert to EIP-55 format or else SIWE complains
        address = ethers.utils.getAddress(address);

        // Get chain ID or default to Ethereum mainnet
        const selectedChain = LIT_CHAINS[chain];
        const chainId = selectedChain?.chainId ? selectedChain.chainId : 1;

        // Get expiration or default to 24 hours
        const expiration =
          _options?.expiration ||
          new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

        // Prepare Sign in with Ethereum message
        const preparedMessage: Partial<SiweMessage> = {
          domain: this.domain,
          uri: this.origin,
          address,
          version: '1',
          chainId,
          expirationTime: expiration,
        };

        const message: SiweMessage = new SiweMessage(preparedMessage);
        const toSign: string = message.prepareMessage();

        // Use provided function to sign message
        const signature = await signMessage(toSign);

        authSig = {
          sig: signature,
          derivedVia: 'web3.eth.personal.sign',
          signedMessage: toSign,
          address: address,
        };
      } else {
        authSig = await checkAndSignAuthMessage({
          chain,
        });
      }
    }

    if (!authSig) throw new Error('Auth signature is undefined');

    this.#authSig = authSig;

    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
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
    let address: string;

    try {
      address = JSON.parse(authMethod.accessToken).address;
    } catch (err) {
      throw new Error(
        `Error when parsing auth method to generate auth method ID for Eth wallet: ${err}`
      );
    }

    return address.toLowerCase();
  }
}
