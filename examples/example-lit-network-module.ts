import { nagaDev } from '@lit-protocol/networks';
import { getLitClient } from '@lit-protocol/lit-client';
import { createChainManager } from 'packages/networks/src/networks/vNaga/envs/naga-dev/chain-manager/createChainManager';
import { privateKeyToAccount } from 'viem/accounts';

(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  // const litClient = await getLitClient({
  //   network: nagaDev,
  // });

  // console.log('litClient:', litClient);

  const viemAccount = privateKeyToAccount(
    process.env['PRIVATE_KEY'] as `0x${string}`
  );

  const chainManager = createChainManager(viemAccount);

  console.log(chainManager);
})();
