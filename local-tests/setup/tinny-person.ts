import {
  AuthSig,
  generateAuthSig,
  createSiweMessage,
} from '@lit-protocol/auth-helpers';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  AuthMethod,
  BaseSiweMessage,
  LitContractContext,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { PKPInfo, TinnyEnvConfig } from './tinny-config';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import { AUTH_METHOD_SCOPE, LIT_NETWORK } from '@lit-protocol/constants';

export class TinnyPerson {
  public privateKey: string;
  public wallet: ethers.Wallet;
  public siweMessage: string;
  public authSig: AuthSig;
  public authMethod: AuthMethod;
  public contractsClient: LitContracts;
  // public capacityTokenId: string;
  // public capacityDelegationAuthSig: AuthSig;
  public pkp: PKPInfo;
  public authMethodOwnedPkp: PKPInfo;

  // Pass this to data to sign
  public loveLetter: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
  public hashedLoveLetter = ethers.utils.arrayify(
    ethers.utils.keccak256(this.loveLetter)
  );

  public provider: ethers.providers.StaticJsonRpcProvider;

  public envConfig: TinnyEnvConfig;

  constructor({
    privateKey,
    envConfig,
  }: {
    privateKey: string;
    envConfig: TinnyEnvConfig;
  }) {
    this.envConfig = envConfig;

    this.privateKey = privateKey;
    this.provider = new ethers.providers.StaticJsonRpcProvider({
      url: this.envConfig.rpc,
      skipFetchSetup: true,
    });
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async getAuthMethodId(): Promise<string> {
    return EthWalletProvider.authMethodId(this.authMethod);
  }

  /**
   * FIXME: Enabling this is causing the test to fail
   * Switches the current wallet to a new funding wallet by creating a new funding wallet,
   * funding it with a small amount of ethers, and updating the current wallet to the new one.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves once the wallet has been switched.
   */
  private async _switchWallet() {
    // Create a new funding wallet, funds it with small amount of ethers, and updates the current wallet to the new one.
    const fundingWallet = ethers.Wallet.createRandom().connect(this.provider);

    if (this.envConfig.network != LIT_NETWORK.Custom) {
      // check balance this.wallet
      const balance = await this.wallet.getBalance();
      console.log(
        '[𐬺🧪 Tinny Person𐬺] Wallet balance:',
        ethers.utils.formatEther(balance)
      );

      const transferTx = await this.wallet.sendTransaction({
        to: fundingWallet.address,
        value: ethers.utils.parseEther('0.00001'),
      });

      const transferReciept = await transferTx.wait();
      console.log(
        '[𐬺🧪 Tinny Person𐬺] Transfered Assets for person tx: ',
        transferReciept.transactionHash
      );
      this.wallet = fundingWallet;
    }
  }

  async spawn() {
    // await this._switchWallet();
    console.log('[𐬺🧪 Tinny Person𐬺] Spawning person:', this.wallet.address);
    /**
     * ====================================
     * Get Hot Wallet Auth Sig
     * ====================================
     */
    this.siweMessage = await createSiweMessage<BaseSiweMessage>({
      nonce: await this.envConfig.litNodeClient.getLatestBlockhash(),
      walletAddress: this.wallet.address,
    });

    this.authSig = await generateAuthSig({
      signer: this.wallet,
      toSign: this.siweMessage,
    });

    /**
     * ====================================
     * Craft an authMethod from the authSig for the eth wallet auth method
     * ====================================
     */
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Crafting an authMethod from the authSig for the eth wallet auth method...'
    );
    this.authMethod = await EthWalletProvider.authenticate({
      signer: this.wallet,
      litNodeClient: this.envConfig.litNodeClient,
    });

    /**
     * ====================================
     * Setup contracts-sdk client
     * ====================================
     */
    if (this.envConfig.network === LIT_NETWORK.Custom) {
      const networkContext = this.envConfig.contractContext;
      this.contractsClient = new LitContracts({
        signer: this.wallet,
        debug: this.envConfig.processEnvs.DEBUG,
        rpc: this.envConfig.processEnvs.LIT_RPC_URL, // anvil rpc
        customContext: networkContext as unknown as LitContractContext,
        network: LIT_NETWORK.Custom,
      });
    } else {
      this.contractsClient = new LitContracts({
        signer: this.wallet,
        debug: this.envConfig.processEnvs.DEBUG,
        network: this.envConfig.network,
      });
    }
    await this.contractsClient.connect();

    /**
     * ====================================
     * Mint a PKP
     * ====================================
     */
    console.log('[𐬺🧪 Tinny Person𐬺] Minting a PKP...');
    const walletMintRes =
      await this.contractsClient.pkpNftContractUtils.write.mint();
    this.pkp = walletMintRes.pkp;

    /**
     * ======================================
     * Mint a PKP with eth wallet auth method
     * ======================================
     */
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Minting a PKP with eth wallet auth method...'
    );
    this.authMethodOwnedPkp = (
      await this.contractsClient.mintWithAuth({
        authMethod: this.authMethod,
        scopes: [AUTH_METHOD_SCOPE.SignAnything],
      })
    ).pkp;

    console.log(
      '[𐬺🧪 Tinny Person𐬺] 🐣 TinnyPerson spawned:',
      this.wallet.address
    );
  }
}
