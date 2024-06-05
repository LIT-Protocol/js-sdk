import { LIT_NETWORK } from 'local-tests/setup/tinny-config';
// import { TinnyEnvironmentBase } from 'local-tests/setup/tinny-environment-base';
import networkContext from '../../setup/networkContext.json';
import { LitContractContext } from '@lit-protocol/types';

/**
 *
 * This test is to test the revamp of the SDK
 *
 * @example
 * NETWORK=CAYENNE yarn test:local --filter=testRevamp
 */
export const testRevamp = async () => {
  // const env = new TinnyEnvironmentBase(LIT_NETWORK.LOCALCHAIN);
  // await env.init();

  // const alice = env.createPerson();

  console.log('Hello World!');
};
