export * from './lib/auth-browser';

// -- all the chains you can connect to
export * as ethConnect from './lib/chains/eth';
export * as cosmosConnect from './lib/chains/cosmos';
export * as solConnect from './lib/chains/sol';
export { disconnectWeb3 } from './lib/chains/eth';
