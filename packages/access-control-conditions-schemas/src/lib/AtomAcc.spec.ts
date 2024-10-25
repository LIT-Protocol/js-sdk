import { AtomAccSchema } from './AtomAcc';

describe('AtomAccSchema', () => {
  const validAtomAcc = {
    conditionType: 'cosmos',
    path: '/cosmos/bank/v1beta1/balances/:userAddress',
    chain: 'cosmos',
    returnValueTest: {
      key: '$.balances[0].amount',
      comparator: '>=',
      value: '1000000',
    },
  };

  it('should validate a valid Atom access control condition', () => {
    expect(AtomAccSchema.safeParse(validAtomAcc).success).toBeTruthy();
  });

  it('should not validate an invalid Atom access control condition', () => {
    expect(
      AtomAccSchema.safeParse({
        ...validAtomAcc,
        path: undefined,
      }).success
    ).toBeFalsy();

    expect(
      AtomAccSchema.safeParse({
        ...validAtomAcc,
        chain: 'invalidChain',
      }).success
    ).toBeFalsy();

    expect(
      AtomAccSchema.safeParse({
        ...validAtomAcc,
        returnValueTest: undefined,
      }).success
    ).toBeFalsy();
  });
});
