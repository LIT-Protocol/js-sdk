import { SolAccSchema } from './SolAcc';

describe('SolAccSchema', () => {
  const validSolAcc = {
    conditionType: 'solRpc',
    method: 'getBalance',
    params: ['someAccountAddress'],
    pdaParams: ['somePdaParam'],
    pdaInterface: {
      offset: 0,
      fields: {
        field1: 'value1',
        field2: 'value2',
      },
    },
    pdaKey: 'somePdaKey',
    chain: 'solana',
    returnValueTest: {
      key: 'myKey',
      comparator: '=',
      value: '10000000',
    },
  };

  it('should validate a valid Solana access control condition', () => {
    expect(SolAccSchema.safeParse(validSolAcc).success).toBeTruthy();
  });

  it('should not validate an invalid Solana access control condition', () => {
    expect(
      SolAccSchema.safeParse({
        ...validSolAcc,
        method: undefined,
      }).success
    ).toBeFalsy();

    expect(
      SolAccSchema.safeParse({
        ...validSolAcc,
        params: undefined,
      }).success
    ).toBeFalsy();

    expect(
      SolAccSchema.safeParse({
        ...validSolAcc,
        pdaInterface: undefined,
      }).success
    ).toBeFalsy();

    expect(
      SolAccSchema.safeParse({
        ...validSolAcc,
        pdaKey: undefined,
      }).success
    ).toBeFalsy();

    expect(
      SolAccSchema.safeParse({
        ...validSolAcc,
        chain: 'invalidChain',
      }).success
    ).toBeFalsy();

    expect(
      SolAccSchema.safeParse({
        ...validSolAcc,
        returnValueTest: undefined,
      }).success
    ).toBeFalsy();
  });
});
