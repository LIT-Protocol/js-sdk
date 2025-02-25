import { EvmContractAccSchema } from './EvmContractAcc';

describe('EvmContractAccSchema', () => {
  const validEvmContractAcc = {
    conditionType: 'evmContract',
    contractAddress: '0x50D8EB685a9F262B13F28958aBc9670F06F819d9',
    chain: 'ethereum',
    functionName: 'myFunction',
    functionParams: ['param1', 'param2'],
    functionAbi: {
      name: 'myFunction',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'string' },
      ],
      outputs: [],
    },
    returnValueTest: {
      key: 'myKey',
      comparator: '=',
      value: 'true',
    },
  };

  it('should validate a valid EVM contract access control condition', () => {
    expect(
      EvmContractAccSchema.safeParse(validEvmContractAcc).success
    ).toBeTruthy();
  });

  it('should not validate an invalid EVM contract access control condition', () => {
    expect(
      EvmContractAccSchema.safeParse({
        ...validEvmContractAcc,
        contractAddress: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmContractAccSchema.safeParse({
        ...validEvmContractAcc,
        chain: 'invalidChain',
      }).success
    ).toBeFalsy();

    expect(
      EvmContractAccSchema.safeParse({
        ...validEvmContractAcc,
        functionName: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmContractAccSchema.safeParse({
        ...validEvmContractAcc,
        functionParams: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmContractAccSchema.safeParse({
        ...validEvmContractAcc,
        functionAbi: undefined,
      }).success
    ).toBeFalsy();

    expect(
      EvmContractAccSchema.safeParse({
        ...validEvmContractAcc,
        returnValueTest: undefined,
      }).success
    ).toBeFalsy();
  });
});
