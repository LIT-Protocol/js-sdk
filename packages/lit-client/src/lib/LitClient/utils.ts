import { hexToBigInt, keccak256, toBytes } from 'viem';

export const utils = {
  generateUniqueAuthMethodType: ({
    uniqueDappName,
  }: {
    uniqueDappName: string;
  }) => {
    const hex = keccak256(toBytes(uniqueDappName));
    const bigint = hexToBigInt(hex);

    return {
      hex,
      bigint,
    };
  },
  generateAuthData: ({
    uniqueDappName,
    uniqueAuthMethodType,
    userId,
  }: {
    uniqueDappName: string;
    uniqueAuthMethodType: bigint;
    userId: string;
  }) => {
    const uniqueUserId = `${uniqueDappName}-${userId}`;

    return {
      authMethodType: uniqueAuthMethodType,
      authMethodId: keccak256(toBytes(uniqueUserId)),
    };
  },
};
