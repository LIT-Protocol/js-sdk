import { generateAuthSig, createSiweMessage, } from '@lit-protocol/auth-helpers';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import { AUTH_METHOD_SCOPE, LIT_NETWORK } from '@lit-protocol/constants';
export class TinnyPerson {
    constructor({ privateKey, envConfig, }) {
        // Pass this to data to sign
        this.loveLetter = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));
        this.envConfig = envConfig;
        this.privateKey = privateKey;
        this.provider = new ethers.providers.StaticJsonRpcProvider({
            url: this.envConfig.rpc,
            skipFetchSetup: true,
        });
        this.wallet = new ethers.Wallet(privateKey, this.provider);
    }
    async getAuthMethodId() {
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
    async _switchWallet() {
        // Create a new funding wallet, funds it with small amount of ethers, and updates the current wallet to the new one.
        const fundingWallet = ethers.Wallet.createRandom().connect(this.provider);
        if (this.envConfig.network != LIT_NETWORK.Custom) {
            // check balance this.wallet
            const balance = await this.wallet.getBalance();
            console.log('[𐬺🧪 Tinny Person𐬺] Wallet balance:', ethers.utils.formatEther(balance));
            const transferTx = await this.wallet.sendTransaction({
                to: fundingWallet.address,
                value: ethers.utils.parseEther('0.00001'),
            });
            const transferReciept = await transferTx.wait();
            console.log('[𐬺🧪 Tinny Person𐬺] Transfered Assets for person tx: ', transferReciept.transactionHash);
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
        this.siweMessage = await createSiweMessage({
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
        console.log('[𐬺🧪 Tinny Person𐬺] Crafting an authMethod from the authSig for the eth wallet auth method...');
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
                customContext: networkContext,
                network: LIT_NETWORK.Custom,
            });
        }
        else {
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
        const walletMintRes = await this.contractsClient.pkpNftContractUtils.write.mint();
        this.pkp = walletMintRes.pkp;
        /**
         * ====================================
         * Mint a PKP wiuth eth wallet auth method
         * ====================================
         */
        console.log('[𐬺🧪 Tinny Person𐬺] Minting a PKP with eth wallet auth method...');
        this.authMethodOwnedPkp = (await this.contractsClient.mintWithAuth({
            authMethod: this.authMethod,
            scopes: [AUTH_METHOD_SCOPE.SignAnything],
        })).pkp;
        console.log('[𐬺🧪 Tinny Person𐬺] 🐣 TinnyPerson spawned:', this.wallet.address);
    }
    /**
     * ====================================
     * Mint a Capacity Credits NFT
     * ====================================
     */
    async mintCapacityCreditsNFT() {
        console.log('[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT ');
        const capacityTokenId = (await this.contractsClient.mintCapacityCreditsNFT({
            requestsPerKilosecond: this.envConfig.processEnvs.REQUEST_PER_KILOSECOND,
            daysUntilUTCMidnightExpiration: 2,
        })).capacityTokenIdStr;
        return capacityTokenId;
    }
    /**
     * ====================================
     * Mint a Capacity Credits NFT and get a capacity delegation authSig with it
     * ====================================
     */
    async createCapacityDelegationAuthSig(addresses = []) {
        console.log('[𐬺🧪 Tinny Person𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it');
        const capacityTokenId = (await this.contractsClient.mintCapacityCreditsNFT({
            requestsPerKilosecond: this.envConfig.processEnvs.REQUEST_PER_KILOSECOND,
            daysUntilUTCMidnightExpiration: 2,
        })).capacityTokenIdStr;
        this.contractsClient.signer = this.wallet;
        await this.contractsClient.connect();
        return (await this.envConfig.litNodeClient.createCapacityDelegationAuthSig({
            dAppOwnerWallet: this.wallet,
            capacityTokenId: capacityTokenId,
            ...(addresses.length && { delegateeAddresses: addresses }),
        })).capacityDelegationAuthSig;
    }
}
//# sourceMappingURL=tinny-person.js.map