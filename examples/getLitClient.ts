import { LitNodeClient } from '@lit-protocol/lit-node-client';

/**
 * @deprecated - this is just an stub example, we need to refactor this
 */
export const getLitClient = async ({ network }: { network: 'naga-dev' }) => {
  // --- all the litNodeClient dependencies we want to remove soon
  const litNodeClient = new LitNodeClient({
    litNetwork: network,
  });

  await litNodeClient.connect();
  // const _nodeUrls = await litNodeClient.getMaxPricesForNodeProduct({
  //   product: 'LIT_ACTION',
  // });
  // const _nonce = await litNodeClient.getLatestBlockhash();
  // const _currentEpoch = litNodeClient.currentEpochNumber!;
  // const _signSessionKey = litNodeClient.v2.signPKPSessionKey;

  return {
    getLatestBlockhash: litNodeClient.getLatestBlockhash,
    getCurrentEpoch: async () => litNodeClient.currentEpochNumber ?? 0,
    getSignSessionKey: litNodeClient.v2.signPKPSessionKey,
    getMaxPricesForNodeProduct: litNodeClient.getMaxPricesForNodeProduct,
  };
};

export type LitClientType = Awaited<ReturnType<typeof getLitClient>>;
