import { ethers } from 'ethers';

import { Address, BalanceTransitionDefinition } from '../types';

export const ERC20ABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
];

export async function getERC20Balance(
  provider: ethers.providers.Provider,
  tokenAddress: Address,
  tokenDecimals: number,
  accountAddress: Address
) {
  const contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const balance = (await contract['balanceOf'](
    accountAddress
  )) as ethers.BigNumber;

  const adjustedBalance = ethers.utils.parseUnits(
    balance.toString(),
    18 - tokenDecimals
  );

  return adjustedBalance;
}

export function getBalanceTransitionCheck(
  transitionIndex: number,
  balance: BalanceTransitionDefinition
): (values: any[]) => Promise<boolean> {
  const balanceCheck = async (values: any[]) => {
    const { amount, comparator } = balance;
    const targetAmount = ethers.utils.parseUnits(amount);
    const addressBalance = values[transitionIndex] as
      | ethers.BigNumber
      | undefined;

    if (!addressBalance) return false;

    switch (comparator) {
      case '<':
        return addressBalance.lt(targetAmount);
      case '<=':
        return addressBalance.lte(targetAmount);
      case '=':
        return addressBalance.eq(targetAmount);
      case '!=':
        return !addressBalance.eq(targetAmount);
      case '>=':
        return addressBalance.gte(targetAmount);
      case '>':
        return addressBalance.gt(targetAmount);
      default:
        throw new Error(`Unrecognized comparator ${comparator}`);
    }
  };

  return balanceCheck;
}
