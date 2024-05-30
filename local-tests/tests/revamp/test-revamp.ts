import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 *
 * This test is to test the revamp of the SDK
 *
 * @example
 * NETWORK=CAYENNE yarn test:local --filter=testRevamp
 */
export const testRevamp = async (devEnv: TinnyEnvironment) => {
  console.log('Hello World!');
};
