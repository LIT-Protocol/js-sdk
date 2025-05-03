import { privateKeyToAccount } from 'viem/accounts';

export const myViemSigner = () => {
  const anvilPrivateKey =
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

  const account = privateKeyToAccount(anvilPrivateKey);

  return {
    signMessage: async (message: string) => account.signMessage({ message }),
    getAddress: async () => account.address,
  };
};
