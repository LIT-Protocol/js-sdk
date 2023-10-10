import { isValidBooleanExpression } from './utils'
import { AccsDefaultParams } from "@lit-protocol/types";

const conditionA: AccsDefaultParams = {
  contractAddress: '',
  standardContractType: '',
  chain: 'ethereum',
  method: 'eth_getBalance',
  parameters: [
    ':userAddress',
    'latest'
  ],
  returnValueTest: {
    comparator: '>=',
    value: '10000000000000'
  }
};

const conditionB: AccsDefaultParams = {
  contractAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  standardContractType: 'ERC20',
  chain: 'ethereum',
  method: 'balanceOf',
  parameters: [
    ':userAddress'
  ],
  returnValueTest: {
    comparator: '>',
    value: '0'
  }
};

const groupValid: any = [
  conditionA, { operator: "or" }, conditionB,
];

const groupInvalid: any = [
  conditionA, { operator: "or" }, conditionB, { operator: "and" }
];

describe('encryption', () => {
  it('should pass single access control condition', () => {
    expect(isValidBooleanExpression([conditionA])).toBeTruthy();
  });
  it('should pass boolean access control condition', () => {
    expect(isValidBooleanExpression([conditionA, { operator: "or" }, conditionB])).toBeTruthy();
  });
  it('should fail trailing boolean operator', () => {
    expect(isValidBooleanExpression([conditionA, { operator: "or" }, conditionB, { operator: "and" }])).toBeFalsy();
  });
  it('should fail consecutive boolean operators', () => {
    expect(isValidBooleanExpression([conditionA, { operator: "or" }, { operator: "and" }, conditionB])).toBeFalsy();
  });
  it('should fail only boolean operator', () => {
    expect(isValidBooleanExpression([{ operator: "or" }])).toBeFalsy();
  });
  it('should fail consecutive boolean conditions', () => {
    expect(isValidBooleanExpression([conditionA, conditionB])).toBeFalsy();
  });
  it('should pass boolean condition and group', () => {
    expect(isValidBooleanExpression([conditionA, { operator: "or" }, groupValid])).toBeTruthy();
  });
  it('should pass boolean group and condition', () => {
    expect(isValidBooleanExpression([groupValid, { operator: "and" }, conditionA])).toBeTruthy();
  });
  it('should pass boolean group and group', () => {
    expect(isValidBooleanExpression([groupValid, { operator: "and" }, groupValid])).toBeTruthy();
  });
  it('should pass group only', () => {
    expect(isValidBooleanExpression([groupValid])).toBeTruthy();
  });
  it('should fail invalid group only', () => {
    expect(isValidBooleanExpression([groupInvalid])).toBeFalsy();
  });
  it('should fail trailing boolean operator with group', () => {
    expect(isValidBooleanExpression([groupValid, { operator: "and" }])).toBeFalsy();
  });
  it('should fail consecutive boolean operators with group', () => {
    expect(isValidBooleanExpression([groupValid, { operator: "and" }, { operator: "or" }, groupValid])).toBeFalsy();
  });
  it('should fail boolean with invalid group', () => {
    expect(isValidBooleanExpression([groupValid, { operator: "and" }, groupInvalid])).toBeFalsy();
  });
  it('should fail boolean with invalid group and valid condition', () => {
    expect(isValidBooleanExpression([groupInvalid, { operator: "or" }, conditionB])).toBeFalsy();
  });
  it('should pass boolean condition after group', () => {
    expect(isValidBooleanExpression([conditionB, { operator: "or" }, groupValid, { operator: "and" }, conditionA])).toBeTruthy();
  });
});