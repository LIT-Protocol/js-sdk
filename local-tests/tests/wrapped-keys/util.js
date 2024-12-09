import { LIT_CHAINS } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import { config } from '@lit-protocol/wrapped-keys';
import { litActionRepositoryCommon, litActionRepository, } from '@lit-protocol/wrapped-keys-lit-actions';
const emptyLitActionRepositoryCommon = {
    batchGenerateEncryptedKeys: '',
};
const emptyLitActionRepository = {
    signTransaction: {
        evm: '',
        solana: '',
    },
    signMessage: {
        evm: '',
        solana: '',
    },
    generateEncryptedKey: {
        evm: '',
        solana: '',
    },
    exportPrivateKey: {
        evm: '',
        solana: '',
    },
};
export function resetLitActionsCode() {
    config.setLitActionsCodeCommon(emptyLitActionRepositoryCommon);
    config.setLitActionsCode(emptyLitActionRepository);
}
export function setLitActionsCodeToLocal() {
    config.setLitActionsCodeCommon(litActionRepositoryCommon);
    config.setLitActionsCode(litActionRepository);
}
export function getChainForNetwork(network) {
    switch (network) {
        case 'datil-dev':
            return {
                chain: 'yellowstone',
                chainId: LIT_CHAINS['yellowstone'].chainId,
            };
        case 'datil-test':
            return {
                chain: 'yellowstone',
                chainId: LIT_CHAINS['yellowstone'].chainId,
            };
        case 'datil':
            return {
                chain: 'yellowstone',
                chainId: LIT_CHAINS['yellowstone'].chainId,
            };
        default:
            throw new Error(`Cannot identify chain params for ${network}`);
    }
}
export function getGasParamsForNetwork(network) {
    switch (network) {
        case 'datil-dev':
            return { gasLimit: 5000000 };
        case 'datil-test':
            return { gasLimit: 5000000 };
        case 'datil':
            return { gasLimit: 5000000 };
        default:
            throw new Error(`Cannot identify chain params for ${network}`);
    }
}
export function getBaseTransactionForNetwork({ toAddress, network, }) {
    return {
        toAddress,
        value: '0.0001', // in ethers (Lit tokens)
        ...getChainForNetwork(network),
        ...getGasParamsForNetwork(network),
        dataHex: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Test transaction from Alice to bob')),
    };
}
//# sourceMappingURL=util.js.map