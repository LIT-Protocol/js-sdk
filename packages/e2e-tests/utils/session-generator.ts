import { LitResourceAbilityRequest, SessionSigsMap } from '@lit-protocol/types';
import { TinnyEnvironment } from '../setup/tinny-environment';
import { TinnyPerson } from '../setup/tinny-person';
import { getEoaSessionSigs } from '../setup/session-sigs/get-eoa-session-sigs';
import {
  getLitActionSessionSigs,
  getLitActionSessionSigsUsingIpfsId,
} from '../setup/session-sigs/get-lit-action-session-sigs';
import { getPkpSessionSigs } from '../setup/session-sigs/get-pkp-session-sigs';

export const sessionGenerators = [
  {
    name: `LitAction`,
    fn: (
      devEnv: TinnyEnvironment,
      person: TinnyPerson,
      resources?: LitResourceAbilityRequest[]
    ): Promise<SessionSigsMap | undefined> => {
      return getLitActionSessionSigs(devEnv, person, resources);
    },
  },
  {
    name: `EOA`,
    fn: (
      devEnv: TinnyEnvironment,
      person: TinnyPerson,
      resources?: LitResourceAbilityRequest[]
    ): Promise<SessionSigsMap | undefined> => {
      return getEoaSessionSigs(devEnv, person, resources);
    },
  },
  {
    name: `LitActionIPFS`,
    fn: (
      devEnv: TinnyEnvironment,
      person: TinnyPerson,
      resources?: LitResourceAbilityRequest[]
    ): Promise<SessionSigsMap | undefined> => {
      return getLitActionSessionSigsUsingIpfsId(devEnv, person, resources);
    },
  },
  {
    name: `PKP`,
    fn: (
      devEnv: TinnyEnvironment,
      person: TinnyPerson,
      resources?: LitResourceAbilityRequest[]
    ): Promise<SessionSigsMap | undefined> => {
      return getPkpSessionSigs(devEnv, person, resources);
    },
  },
];
