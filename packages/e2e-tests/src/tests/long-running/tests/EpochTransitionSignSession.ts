import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { TinnyEnvironment, getPkpSessionSigs } from '@lit-protocol/tinny';

export async function testEpochTransitionSignSessioShouldValidateAfterTransition(
  devEnv: TinnyEnvironment
) {
  const alice = await devEnv.createRandomPerson();
  await devEnv.testnet?.transitionEpochAndWait();

  const session = await getPkpSessionSigs(devEnv, alice, [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ]);

  if (!session) {
    throw new Error('Could not sign session');
  }
}

export async function testEpochTransitionSignSessioShouldValidateDuringTransition(
  devEnv: TinnyEnvironment
) {
  const alice = await devEnv.createRandomPerson();
  devEnv.testnet?.transitionEpochAndWait();
  // give some time for the transition to start
  await new Promise<void>((res) => {
    setTimeout(res, 5_000);
  });
  const session = await getPkpSessionSigs(devEnv, alice, [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ]);

  if (!session) {
    throw new Error('Could not sign session');
  }
}

export async function testEpochTransitionHandshakeShouldReturnUniformEpoch(
  devEnv: TinnyEnvironment
) {
  devEnv.testnet?.transitionEpochAndWait();
  // give some time for the transition to start
  await new Promise<void>((res) => {
    setTimeout(res, 15_000);
  });
  await devEnv.litNodeClient?.disconnect();
  await devEnv.litNodeClient?.connect();
  console.log(devEnv.litNodeClient?.connectedNodes);
}
