import { TinnyEnvironment } from '@lit-protocol/tinny';

export async function testTransitionEpochShouldTriggerStakingEvent(devEnv: TinnyEnvironment) {

  const connectedNodes: string[] | undefined = devEnv.litNodeClient?.config.bootstrapUrls;
  await devEnv.testnet?.transitionEpochAndWait()

  await new Promise((res) => {
    setTimeout(res, 10_000);
  });
  
  
  const currentEpoch = devEnv.litNodeClient?.currentEpochNumber;

  if (!devEnv.litNodeClient?.ready) {
    throw new Error("Nodes not connected after epoch transition");
  }

  if (devEnv.litNodeClient?.config.bootstrapUrls !== connectedNodes) {
    throw new Error("Connected nodes does not match original node set pre epoch transiton");
  }


  if (currentEpoch as number + 1 != devEnv.litNodeClient.currentEpochNumber) {
    console.log(currentEpoch);
    console.log(devEnv.litNodeClient?.currentEpochNumber);
    throw new Error('Epoch value is not what was expected');
  }
}

