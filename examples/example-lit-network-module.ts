import { nagaDev } from '@lit-protocol/networks';
import { getLitClient } from '@lit-protocol/lit-client';

(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  const litClient = await getLitClient({
    network: nagaDev,
  });

  console.log('litClient:', litClient);
})();
