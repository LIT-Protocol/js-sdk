import * as assert from 'node:assert';

import { TinnyEnvironment } from '@lit-protocol/tinny';


export async function testTransitionEpochShouldTriggerStakingEvent(devEnv: TinnyEnvironment) {
  await devEnv.testnet?.transitionEpochAndWait()

  await new Promise((res) => {
    setTimeout(res, 1_000);
  });
  
  if (! devEnv.litNodeClient?.ready) {
    throw new Error("Nodes not connected after epoch transition");
  }
}

