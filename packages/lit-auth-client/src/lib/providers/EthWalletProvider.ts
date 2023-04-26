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

export default class EthWalletProvider extends BaseProvider {
  /**
   * Ethereum wallet address
   */
  public address: string;
  /**
   * Function to sign message
   *
   * @param {string} message - Message to sign
   *
   * @returns {Promise<string>} - Raw signature of message
   */
  public signMessage: (message: string) => Promise<string>;
  /**
   * The domain from which the signing request is made
   */
  public domain: string;
  /**
   * The origin from which the signing request is made
   */
  public origin: string;

  constructor(options: BaseProviderOptions & EthWalletProviderOptions) {
    super(options);
    this.address = ethers.utils.getAddress(options.address);
    this.signMessage = options.signMessage;
    this.domain = options.domain || window.location.hostname;
    this.origin = options.origin || window.location.origin;
  }

  /**
   * Generate a wallet signature to use as an auth method
   *
   * @param {EthWalletAuthenticateOptions} options
   * @param {string} [options.address] - Ethereum wallet address to use for signature
   * @param {string} [options.signMessage] - Function to sign message
   * @param {string} [options.chain] - Name of chain to use for signature
   * @param {number} [options.expiration] - When the auth signature expires
   *
   * @returns {Promise<AuthMethod>} - Auth method object containing the auth signature
   */
  public async authenticate(
    options?: EthWalletAuthenticateOptions
  ): Promise<AuthMethod> {
    // Get chain ID or default to Ethereum mainnet
    const chain = options?.chain || 'ethereum';
    const selectedChain = LIT_CHAINS[chain];
    const chainId = selectedChain?.chainId ? selectedChain.chainId : 1;

    // Get expiration or default to 24 hours
    const expiration =
      options?.expiration ||
      new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    // Prepare Sign in with Ethereum message
    const preparedMessage: Partial<SiweMessage> = {
      domain: this.domain,
      uri: this.origin,
      address: ethers.utils.getAddress(this.address), // convert to EIP-55 format or else SIWE complains
      version: '1',
      chainId,
      expirationTime: expiration,
    };

    const message: SiweMessage = new SiweMessage(preparedMessage);
    const toSign: string = message.prepareMessage();

    // Use provided function to sign message
    const signature = await this.signMessage(toSign);

    const authSig: AuthSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: this.address,
    };

    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(authSig),
    };
    return authMethod;
  }
}
