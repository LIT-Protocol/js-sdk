import { LitAbility, LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { TinnyEnvironment, getPkpSessionSigs } from '@lit-protocol/tinny';

export async function epochTransitionSignSessioShouldValidateAfterTransition(devEnv: TinnyEnvironment) {
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


export async function epochTransitionSignSessioShouldValidateDuringTransition(devEnv: TinnyEnvironment) {
    const alice = await devEnv.createRandomPerson();
    devEnv.testnet?.transitionEpochAndWait();

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