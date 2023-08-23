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
import { isBrowser, isNode, log } from '@lit-protocol/misc';
import { isSignedMessageExpired } from '../utils';

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
      log(
        '⚠️ Error getting "domain" and "origin" from window object, defaulting to "localhost" and "https://localhost/login"'
      );
      this.domain = options.domain || 'localhost';
      this.origin = options.origin || 'https://localhost/login';
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

    let authSig: AuthSig | undefined = undefined;

    const _options = {
      cache: true,
      version: this?.version ?? 'V2',
      ...options,
    };

    let setNewExpiration = false;

    // ==================== VERSION 3 ====================
    // Please refer to this document for the expected behaviour
    // https://www.notion.so/litprotocol/ETH-Wallet-Expected-Behaviour-1194ddeae22d4ff6a1a7bacf17ba5885?pvs=4
    // NOTE: we do not want to use the default `lit-auth-signature` when cache is enabled,
    // instead we want to use the `lit-ethwallet-token-<address>` cache key
    if (_options.version === 'V3') {
      if (isBrowser()) {
        setNewExpiration = false;

        // check if there are web wallet connected
        // @ts-ignore
        if (globalThis?.ethereum) {
          log('Trying to get it from web wallet');

          // @ts-ignore
          const address = globalThis?.ethereum?.selectedAddress;

          // -- If there's a selected address
          if (address) {
            log('Found address!:', address);
            const storageKey = `lit-ethwallet-token-${address}`;
            log('storageKey:', storageKey);

            let itemString = this.storageProvider.getItem(storageKey);
            log('itemString:', itemString);

            // -- if there's a storage item for the address
            if (itemString) {
              try {
                const item: {
                  expirationDate: string;
                  value: string;
                } = JSON.parse(itemString);
                log('item:', item);

                const expiration = new Date(item.expirationDate);
                log('expiration:', expiration);
                log('new Date():', new Date());
                log('expiration > new Date():', expiration > new Date());

                // -- if it's not expired
                if (expiration > new Date()) {
                  let authMethodString = item.value;
                  log('authMethodString:', authMethodString);

                  // -- if there's an item
                  if (authMethodString && authMethodString !== undefined) {
                    log('Trying to parse auth method string...');

                    // -- try to parse the auth method string
                    try {
                      const authMethod = JSON.parse(authMethodString);
                      log('authMethod:', authMethod);

                      // -- if it's not expired
                      if (!isSignedMessageExpired(authMethod.accessToken)) {
                        // -- try to parse the auth method's access token

                        log("Trying to parse auth method's access token...");
                        try {
                          // ==================== !!!!! SUCCESS CASE HERE !!!!! ====================
                          authSig = JSON.parse(authMethod.accessToken);
                          // ==================== !!!!! SUCCESS CASE HERE !!!!! ====================
                        } catch (e) {
                          log('Error parsing auth method access token', e);
                        }
                      } else {
                        log('Auth method access token is expired, continue...');
                      }
                    } catch (e) {
                      // continue...
                      log('Error parsing auth method string', e);
                    }
                  } else {
                    log('No auth method string found, continue...');
                  }
                } else {
                  log('Item is expired, continue...');
                }
              } catch (e) {
                log('Error parsing item string, continue...', e);
              }
            }

            log('AuthSig:', authSig);
          }
        }
      }

      if (!authSig || authSig === undefined) {
        setNewExpiration = true;
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
      }

      if (authSig?.sig === '' || authSig === undefined) {
        setNewExpiration = true;
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

          authSig = await this.prepareAuthSig({
            address,
            chain,
            expiration: _options?.expiration,
            signMessage,
          });
        }
      }

      if (!authSig || authSig === undefined) {
        throw new Error('Unable to get auth sig');
      }

      if (setNewExpiration) {
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
      }
    }
    // ==================== VERSION 2 ====================
    // Use `lit-auth-signature` as the cache key
    else {
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

        authSig = await this.prepareAuthSig({
          address,
          chain,
          expiration: _options?.expiration,
          signMessage,
        });
      } else {
        authSig = await checkAndSignAuthMessage({
          chain,
        });
      }
    }

    if (!authSig) throw new Error('Auth signature is undefined');

    this.#authSig = authSig;

    const authSigString =
      typeof authSig === 'string' ? authSig : JSON.stringify(authSig);

    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: authSigString,
    };

    return authMethod;
  }

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
  public async prepareAuthSig({
    address,
    chain,
    expiration,
    signMessage,
  }: {
    address: string;
    chain: string;
    expiration: any;
    signMessage: any;
  }) {
    // convert to EIP-55 format or else SIWE complains
    address = ethers.utils.getAddress(address);

    // Get chain ID or default to Ethereum mainnet
    const selectedChain = LIT_CHAINS[chain];
    const chainId = selectedChain?.chainId ? selectedChain.chainId : 1;

    // Get expiration or default to 24 hours
    expiration =
      expiration || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

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

    return {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: address,
    };
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
