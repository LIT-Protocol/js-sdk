import * as assert from 'node:assert';

import { TinnyEnvironment } from '@lit-protocol/tinny';


export async function testTransitionEpochShouldTriggerStakingEvent(devEnv: TinnyEnvironment) {
  await devEnv.testnet?.transitionEpochAndWait().then(async () => {
    await new Promise((res) => {
        setTimeout(res, 1_000);
      });
      
      assert.ok(
        devEnv.litNodeClient?.ready
      );
    });
}

