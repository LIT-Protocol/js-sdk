import { TinnyEnvironment } from '@lit-protocol/tinny';

export async function testTransitionEpochShouldTriggerStakingEvent(devEnv: TinnyEnvironment) {
  await devEnv.testnet?.transitionEpochAndWait().then(async () => {
    await new Promise((res) => {
        setTimeout(res, 1_000);
      });
      expect(
        devEnv.litNodeClient?.['_handleStakingContractStateChange']
      ).toBeCalled();
    });
}

