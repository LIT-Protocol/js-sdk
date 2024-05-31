import { importPrivateKey } from './wrapped-keys';
import { ethers } from 'ethers';
import { BaseProvider, LitAuthClient } from '@lit-protocol/lit-auth-client';
import { AuthMethodScope, AuthMethodType, ProviderType } from '@lit-protocol/constants';

describe('Import private key', () => {
	let authProvider: BaseProvider;
	let wallet: ethers.Wallet;

	beforeAll(() => {
		// Set up the Relayer
		const litAuthClient = new LitAuthClient({
			litRelayConfig: {
				relayApiKey: '<Your Lit Relay Server API Key>',
			},
		});
		authProvider = litAuthClient.initProvider(ProviderType.EthWallet);
	});

	beforeEach(async () => {
		// Generate a random wallet
		wallet = ethers.Wallet.createRandom();
		let authMethod = await authProvider.authenticate({
			signMessage: async (message: string) => {
			  return await wallet.signMessage(message);
			}
		});

		// Mint a PKP with that wallet as its owner. IRL this could be any authMethod
		const mintTx = await authProvider.mintPKPThroughRelayer(
			authMethod,
		);

		console.log(mintTx);
	});

	it('Should successfully import an EVM key', () => {
	});

	it('Should fail importing with the same PKP', () => {
	});

	it('Should return an error for invalid outer sessionSig', () => {
	});

	it('Should return an error for invalid inner AuthSig', () => {
	});

	it('Should return an error for expired sessionSig', () => {
	});

	it('Should return an error for EOA sessionSig', () => {
	});

	it('Should return an error for exceeding max size for ciphertext & dataToEncryptHash', () => {
	});
});
