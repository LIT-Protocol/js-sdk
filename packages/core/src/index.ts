export * from './lib/core';
export * from './lib/bls-sdk';

// -- ABIs
const ABI_LIT = import('./abis/LIT.json');
const ABI_ERC20 = import('./abis/ERC20.json');

export {
    ABI_LIT,
    ABI_ERC20
}