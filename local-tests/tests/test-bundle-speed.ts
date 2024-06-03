import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test bundle speed
 * @param devEnv
 */
export const testBundleSpeed = async (devEnv: TinnyEnvironment) => {
  const a = await import('@lit-protocol/lit-node-client');
  const b = await import('@lit-protocol/contracts-sdk');
  const c = await import('@lit-protocol/auth-helpers');
  const d = await import('@lit-protocol/constants');
  const e = await import('@lit-protocol/lit-auth-client');

  console.log(a, b, c, d, e);
};
