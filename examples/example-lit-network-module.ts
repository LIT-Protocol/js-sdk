import { getLitClient } from '@lit-protocol/lit-client';

(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  // 1. Pick the network you want to connect to:
  const { nagaDev } = await import('@lit-protocol/networks');

  // 2. Get the LitClient instance
  const litClient = await getLitClient({ network: nagaDev });

  // 3. Get an instance of the auth manager
  // const authManager = await import('@lit-protocol/auth');

  // 4. Create an auth config
  // const authConfig = authManager.getEoaAuthContext({

  // })

  // 5. Use the litClient APIs

  // (optiional) If you ever want to disconnect from the network (stopping the event listener)
  // litClient.disconnect();
})();
