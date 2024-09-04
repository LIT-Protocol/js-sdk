import { TinnyEnvironment } from '@lit-protocol/tinny';

export async function testTransitionEpochShouldTriggerStakingEvent(devEnv: TinnyEnvironment) {

  const connectedNodes: string[] | undefined = devEnv.litNodeClient?.config.bootstrapUrls;
  await devEnv.testnet?.transitionEpochAndWait()

  await new Promise((res) => {
    setTimeout(res, 45_000);
  });
  
  
  const currentEpoch = devEnv.litNodeClient?.currentEpochNumber;

  if (!devEnv.litNodeClient?.ready) {
    throw new Error("Nodes not connected after epoch transition");
  }

  if (connectedNodes?.length !== devEnv.litNodeClient.config.bootstrapUrls.length) {
    throw new Error('Validator collection lengths do not match after epoch transition with same node set');
  }

  for (const url of connectedNodes!) {
    if (devEnv.litNodeClient.config.bootstrapUrls.indexOf(url) < 0) {
      console.log(connectedNodes);
      console.log(devEnv.litNodeClient.config.bootstrapUrls);
      throw new Error("Connected nodes does not match original node set pre epoch transiton");
    }
  } 

  /**
   * Currently not passing as after the chain event is emitted the current epoch state appears to alwayys be the previous epoch
   */
  if (currentEpoch as number + 1 != devEnv.litNodeClient?.currentEpochNumber as number) {
    console.log(currentEpoch);
    console.log(devEnv.litNodeClient?.currentEpochNumber);
    throw new Error('Epoch value is not what was expected');
  }
}

