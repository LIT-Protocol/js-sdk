import { EvmBasicAccSchema } from './EvmBasicAcc';

describe('EvmBasicAccSchema', () => {
  const validEVMBasicAcc = {
    conditionType: 'evmBasic',
    contractAddress: '0x50D8EB685a9F262B13F28958aBc9670F06F819d9',
    standardContractType: 'MolochDAOv2.1',
    chain: 'ethereum',
    method: 'members',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '=',
      value: 'true',
    },
  };

  it('should validate a valid EVM basic access control condition', () => {
    expect(EvmBasicAccSchema.safeParse(validEVMBasicAcc).success).toBeTruthy();
    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        conditionType: undefined,
      }).success
    ).toBeTruthy();
  });

  it('should not validate an invalid EVM basic access control conditions', () => {
    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        chain: 'invalidChain',
      }).success
    ).toBeFalsy();

    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        chain: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        chain: 1,
      }).success
    ).toBeFalsy();

    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        method: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        contractAddress: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmBasicAccSchema.safeParse({
        ...validEVMBasicAcc,
        standardContractType: undefined,
      }).success
    ).toBeFalsy();
  });
});
