import { SessionSigsMap, AccessControlConditions, ILitNodeClient } from '@lit-protocol/types';
import { CHAIN_ETHEREUM, ENCRYPTED_PRIVATE_KEY_ENDPOINT } from './constants';
import { encryptString } from '@lit-protocol/encryption';
import { log } from '@lit-protocol/misc';
import { LitMessage, LitTransaction, getFirstSessionSig, getPkpAddressFromSessionSig } from './utils';

export async function importPrivateKey(pkpSessionSigs: SessionSigsMap, privateKey: string, litNodeClient: ILitNodeClient): Promise<boolean> {
	const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
	const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);

	const allowPkpAddressToDecrypt: AccessControlConditions = [
		{
			contractAddress: '',
			standardContractType: '',
			chain: CHAIN_ETHEREUM,
			method: '',
			parameters: [
				':userAddress',
			],
			returnValueTest: {
				comparator: '=',
				value: pkpAddress,
			}
		}
	];

	const { ciphertext, dataToEncryptHash } = await encryptString(
		{
		  accessControlConditions: allowPkpAddressToDecrypt,
		  dataToEncrypt: privateKey,
		},
		litNodeClient,
	);

	const data = {
		ciphertext,
		dataToEncryptHash,
	};

	try {
		const response = await fetch(ENCRYPTED_PRIVATE_KEY_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'pkpsessionsig': JSON.stringify(firstSessionSig),
			},
			body: JSON.stringify(data),
		});

		const responseData = await response.json();

		if (!response.ok) {
			log(`Could not import the encrypted key due to the error: ${responseData}`);
		}

		return true;
	} catch (error) {
		console.error(`There was a problem fetching from the database: ${error}`);
	}

	return false;
}

export async function signWithEncryptedKey<T = LitMessage | LitTransaction>(pkpSessionSigs: SessionSigsMap, litActionCid: string, unsignedTransaction: T, litNodeClient: ILitNodeClient): Promise<string> {
	const firstSessionSig = getFirstSessionSig(pkpSessionSigs);

	let responseData;

	try {
		const response = await fetch(ENCRYPTED_PRIVATE_KEY_ENDPOINT, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'pkpsessionsig': JSON.stringify(firstSessionSig),
			},
		});

		responseData = await response.json();

		if (!response.ok) {
			log(`Could not fetch the encrypted key from the database due to the error: ${responseData}`);
		}
	} catch (error) {
		console.error(`There was a problem fetching from the database: ${error}`);
	}

	const { pkpAddress, ciphertext, dataToEncryptHash } = responseData;

	const result = await litNodeClient.executeJs({
		sessionSigs: pkpSessionSigs,
		ipfsId: litActionCid,
		jsParams: {
			pkpAddress,
			ciphertext,
			dataToEncryptHash,
			unsignedTransaction,
		},
	});

	log(`Lit Action result: ${result}`);

	if (!result) {
		throw new Error('There was some error running the Lit Action');
	}

	if (typeof result.response !== 'string') {
		throw new Error('Lit Action should return a string response');
	}

	return result.response;
}