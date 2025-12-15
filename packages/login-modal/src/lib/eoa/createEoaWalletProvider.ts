import type { ReactNode } from 'react';
import { createWalletClient, custom, getAddress, type Chain } from 'viem';

import type { LitEoaWalletProvider } from '../types';

export type Eip1193ProviderLike = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

export function createEoaWalletProvider(params: {
  /**
   * Return a connected viem WalletClient (e.g. Wagmi's `useWalletClient().data`).
   */
  getWalletClient?: () => Promise<unknown>;
  /**
   * Return an EIP-1193 provider (e.g. WalletConnect/Web3Modal/Privy/Dynamic provider).
   */
  getEip1193Provider?: () => Promise<Eip1193ProviderLike>;
  /**
   * Optional chain config to attach to the viem client.
   */
  chain?: Chain;
  /**
   * Optional UI to render in the EOA step (e.g. a connect button).
   */
  renderConnect?: () => ReactNode;
  /**
   * Show raw private key input in the EOA step (advanced/dev).
   */
  allowPrivateKey?: boolean;
  /**
   * Use `eth_accounts` instead of `eth_requestAccounts` when possible.
   * Defaults to `true` (always request accounts).
   */
  requestAccounts?: boolean;
}): LitEoaWalletProvider {
  return {
    allowPrivateKey: params.allowPrivateKey,
    renderConnect: params.renderConnect,
    getWalletClient: async () => {
      if (params.getWalletClient) return await params.getWalletClient();
      if (!params.getEip1193Provider) {
        throw new Error(
          'createEoaWalletProvider: provide `getWalletClient` or `getEip1193Provider`'
        );
      }

      const provider = await params.getEip1193Provider();
      const method =
        params.requestAccounts === false
          ? 'eth_accounts'
          : 'eth_requestAccounts';

      const accounts = (await provider.request({
        method,
      })) as unknown as string[];
      const address = accounts?.[0];
      if (!address) throw new Error('No wallet accounts returned');

      return createWalletClient({
        account: getAddress(address),
        chain: params.chain,
        transport: custom(provider as any),
      });
    },
  };
}
