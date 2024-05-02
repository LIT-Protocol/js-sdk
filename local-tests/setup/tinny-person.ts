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
import { LIT_TESTNET, PKPInfo, TinnyEnvConfig } from './tinny-config';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import networkContext from './networkContext.json';
import { AuthMethodScope } from '@lit-protocol/constants';

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

  async spawn() {
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

    // /**
    //  * ====================================
    //  * Setup contracts-sdk client
    //  * ====================================
    //  */
    if (this.envConfig.network === LIT_TESTNET.LOCALCHAIN) {
      this.contractsClient = new LitContracts({
        signer: this.wallet,
        debug: this.envConfig.processEnvs.DEBUG,
        rpc: this.envConfig.processEnvs.LIT_RPC_URL, // anvil rpc
        customContext: networkContext as unknown as LitContractContext,
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
    const capacityTokenId = (
      await this.contractsClient.mintCapacityCreditsNFT({
        requestsPerKilosecond:
          this.envConfig.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
    ).capacityTokenIdStr;

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
    const capacityTokenId = (
      await this.contractsClient.mintCapacityCreditsNFT({
        requestsPerKilosecond:
          this.envConfig.processEnvs.REQUEST_PER_KILOSECOND,
        daysUntilUTCMidnightExpiration: 2,
      })
    ).capacityTokenIdStr;

    return (
      await this.envConfig.litNodeClient.createCapacityDelegationAuthSig({
        uses: "100",
        dAppOwnerWallet: this.wallet,
        capacityTokenId: capacityTokenId,
        ...(addresses.length && { delegateeAddresses: addresses }),
      })
    ).capacityDelegationAuthSig;
  }
}
