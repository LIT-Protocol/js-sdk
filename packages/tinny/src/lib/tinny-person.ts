import { ethers } from 'ethers';

import {
  AuthSig,
  generateAuthSig,
  createSiweMessage,
} from '@lit-protocol/auth-helpers';
import { AuthMethodScope } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import {
  AuthMethod,
  BaseSiweMessage,
  LIT_NETWORKS_KEYS,
  LitContractContext,
} from '@lit-protocol/types';

import { LIT_TESTNET, PKPInfo, TinnyEnvConfig } from './tinny-config';

export class TinnyPerson {
  public privateKey: string;
  public wallet: ethers.Wallet;
  public siweMessage: string | undefined;
  public authSig: AuthSig | undefined;
  public authMethod: AuthMethod | undefined;
  public contractsClient: LitContracts | undefined;
  // public capacityTokenId: string;
  // public capacityDelegationAuthSig: AuthSig;
  public pkp: PKPInfo | undefined;
  public authMethodOwnedPkp: PKPInfo | undefined;

  // Pass this to data to sign
  public loveLetter: Uint8Array = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );

  public provider: ethers.providers.JsonRpcProvider;

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
    this.provider = new ethers.providers.JsonRpcProvider(this.envConfig.rpc);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
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

    if (this.envConfig.network != LIT_TESTNET.LOCALCHAIN) {
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
    if (this.envConfig.network === LIT_TESTNET.LOCALCHAIN) {
      const networkContext = this.envConfig.contractContext;
      this.contractsClient = new LitContracts({
        signer: this.wallet,
        debug: this.envConfig.processEnvs.DEBUG,
        rpc: this.envConfig.processEnvs.LIT_RPC_URL, // anvil rpc
        customContext: networkContext as unknown as LitContractContext,
        network: this.envConfig.processEnvs.NETWORK
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
     * ====================================
     * Mint a PKP wiuth eth wallet auth method
     * ====================================
     */
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Minting a PKP with eth wallet auth method...'
    );
    this.authMethodOwnedPkp = (
      await this.contractsClient.mintWithAuth({
        authMethod: this.authMethod,
        scopes: [AuthMethodScope.SignAnything],
      })
    ).pkp;

    console.log(
      '[𐬺🧪 Tinny Person𐬺] 🐣 TinnyPerson spawned:',
      this.wallet.address
    );
  }

  /**
   * ====================================
   * Mint a Capacity Credits NFT
   * ====================================
   */
  async mintCapacityCreditsNFT() {
    console.log('[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT ');
    const capacityToken = await this.contractsClient
      ?.mintCapacityCreditsNFT({
        requestsPerKilosecond:
          this.envConfig.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
      .catch((err) => {
        throw new Error(
          `Error while minting capacity credit nft, error message: ${
            err.message ?? 'unknown'
          }`
        );
      });

    if (!capacityToken) {
      throw new Error(
        'Errpr while mitning capacity credit nft: receive undefined value'
      );
    }

    const capacityTokenId = capacityToken.capacityTokenIdStr;

    return capacityTokenId;
  }

  /**
   * ====================================
   * Mint a Capacity Credits NFT and get a capacity delegation authSig with it
   * ====================================
   */
  async createCapacityDelegationAuthSig(
    addresses: string[] = []
  ): Promise<AuthSig> {
    console.log(
      '[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
    );

    const capacityTokenId = await this.mintCapacityCreditsNFT();

    this.contractsClient!.signer = this.wallet;
    await this.contractsClient?.connect();
    return (
      await this.envConfig.litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: this.wallet,
        capacityTokenId: capacityTokenId,
        ...(addresses.length && { delegateeAddresses: addresses }),
      })
    ).capacityDelegationAuthSig;
  }
}
