export * from './lib/auth-config-builder';
export * from './lib/generate-auth-sig';
export * from './lib/models';
export * from './lib/recap/recap-session-capability-object';
export * from './lib/recap/resource-builder';
export * from './lib/recap/utils';
export * from './lib/resources';
export * from './lib/session-capability-object';
export * from './lib/siwe/create-siwe-message';
export * from './lib/siwe/siwe-helper';
// export * from './lib/siwe';
// export * from './lib/wallets/walletconnect';

// Export new resource shorthand transformer utilities
export {
  isResourceShorthandInput,
  transformShorthandResources,
} from './lib/resource-shorthand-transformer';

export type {
  ResourceShorthandInput,
  ResourceShorthandObject,
  ResourceShorthandTuple,
  ShorthandAbilityType,
} from './lib/resource-shorthand-transformer';
