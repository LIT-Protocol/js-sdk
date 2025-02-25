import { OperatorAccSchema } from './OperatorAcc';

describe('OperatorAccSchema', () => {
  const andOperatorAcc = {
    operator: 'and',
  };
  const orOperatorAcc = {
    operator: 'or',
  };
  const notOperatorAcc = {
    operator: 'not',
  };
  const extraFieldsOperatorAcc = {
    ...andOperatorAcc,
    extraField: 'extraField',
  };

  it('should validate a valid operator access control condition', () => {
    expect(OperatorAccSchema.safeParse(andOperatorAcc).success).toBeTruthy();
    expect(OperatorAccSchema.safeParse(orOperatorAcc).success).toBeTruthy();
  });

  it('should not validate an invalid operator access control condition', () => {
    expect(OperatorAccSchema.safeParse(notOperatorAcc).success).toBeFalsy();
    expect(
      OperatorAccSchema.safeParse(extraFieldsOperatorAcc).success
    ).toBeFalsy();
  });
});
