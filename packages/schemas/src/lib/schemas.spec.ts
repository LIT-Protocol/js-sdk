import {
  LIT_AUTH_SIG_CHAIN_KEYS,
  LIT_EVM_CHAINS,
  LIT_SVM_CHAINS,
  LIT_COSMOS_CHAINS,
  ALL_LIT_CHAINS,
} from '@lit-protocol/constants';

import {
  AllLitChainsSchema,
  LitAuthSigChainKeysSchema,
  LitEVMChainsSchema,
  LitSVMChainsSchema,
  LitCosmosChainsSchema,
} from './schemas';

describe('Schemas', () => {
  it('should validate LitAuthSigChainKeysSchema enum', () => {
    expect(LitAuthSigChainKeysSchema.safeParse('solana').success).toBeTruthy();
    expect(
      LitAuthSigChainKeysSchema.safeParse('ethereum').success
    ).toBeTruthy();

    expect(LitAuthSigChainKeysSchema.safeParse('bitcoin').success).toBeFalsy();
    expect(
      LitAuthSigChainKeysSchema.safeParse(LIT_AUTH_SIG_CHAIN_KEYS).success
    ).toBeFalsy();
  });

  it('should validate LitEVMChainsSchema record', () => {
    expect(LitEVMChainsSchema.safeParse(LIT_EVM_CHAINS).success).toBeTruthy();
    expect(
      LitEVMChainsSchema.safeParse({ ethereum: LIT_EVM_CHAINS['ethereum'] })
        .success
    ).toBeTruthy();
    expect(LitEVMChainsSchema.safeParse({}).success).toBeTruthy();

    expect(LitEVMChainsSchema.safeParse([]).success).toBeFalsy();
    expect(LitEVMChainsSchema.safeParse(undefined).success).toBeFalsy();
    expect(LitEVMChainsSchema.safeParse(null).success).toBeFalsy();
    expect(LitEVMChainsSchema.safeParse({ ethereum: {} }).success).toBeFalsy();
    expect(
      LitEVMChainsSchema.safeParse({
        ethereum: {
          ...LIT_EVM_CHAINS['ethereum'],
          vmType: 'SVM',
        },
      }).success
    ).toBeFalsy();
  });

  it('should validate LitSVMChainsSchema record', () => {
    expect(LitSVMChainsSchema.safeParse(LIT_SVM_CHAINS).success).toBeTruthy();
    expect(
      LitSVMChainsSchema.safeParse({ solana: LIT_SVM_CHAINS['solana'] }).success
    ).toBeTruthy();
    expect(LitSVMChainsSchema.safeParse({}).success).toBeTruthy();

    expect(LitSVMChainsSchema.safeParse([]).success).toBeFalsy();
    expect(LitSVMChainsSchema.safeParse(undefined).success).toBeFalsy();
    expect(LitSVMChainsSchema.safeParse(null).success).toBeFalsy();
    expect(LitSVMChainsSchema.safeParse({ solana: {} }).success).toBeFalsy();
    expect(
      LitSVMChainsSchema.safeParse({
        solana: {
          ...LIT_SVM_CHAINS['solana'],
          vmType: 'EVM',
        },
      }).success
    ).toBeFalsy();
  });

  it('should validate LitCosmosChainsSchema record', () => {
    expect(
      LitCosmosChainsSchema.safeParse(LIT_COSMOS_CHAINS).success
    ).toBeTruthy();
    expect(
      LitCosmosChainsSchema.safeParse({ cosmos: LIT_COSMOS_CHAINS['cosmos'] })
        .success
    ).toBeTruthy();
    expect(LitCosmosChainsSchema.safeParse({}).success).toBeTruthy();

    expect(LitCosmosChainsSchema.safeParse([]).success).toBeFalsy();
    expect(LitCosmosChainsSchema.safeParse(undefined).success).toBeFalsy();
    expect(LitCosmosChainsSchema.safeParse(null).success).toBeFalsy();
    expect(LitCosmosChainsSchema.safeParse({ cosmos: {} }).success).toBeFalsy();
    expect(
      LitCosmosChainsSchema.safeParse({
        cosmos: {
          ...LIT_COSMOS_CHAINS['cosmos'],
          vmType: 'EVM',
        },
      }).success
    ).toBeFalsy();
  });

  it('should validate AllLitChainsSchema record', () => {
    expect(AllLitChainsSchema.safeParse(ALL_LIT_CHAINS).success).toBeTruthy();
    expect(
      AllLitChainsSchema.safeParse({ ethereum: ALL_LIT_CHAINS['ethereum'] })
        .success
    ).toBeTruthy();
    expect(AllLitChainsSchema.safeParse({}).success).toBeTruthy();

    expect(AllLitChainsSchema.safeParse([]).success).toBeFalsy();
    expect(AllLitChainsSchema.safeParse(undefined).success).toBeFalsy();
    expect(AllLitChainsSchema.safeParse(null).success).toBeFalsy();
    expect(AllLitChainsSchema.safeParse({ ethereum: {} }).success).toBeFalsy();
    expect(
      AllLitChainsSchema.safeParse({
        ethereum: {
          ...ALL_LIT_CHAINS['ethereum'],
          vmType: 'SVM',
        },
      }).success
    ).toBeFalsy();
  });
});
