import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testPruneRLI
 * ✅ NETWORK=datil-test yarn test:local --filter=testPruneRLI
 * ✅ NETWORK=custom yarn test:local --filter=testPruneRLI
 */
export const testPruneRLI = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const res =
    await alice.contractsClient.rateLimitNftContractUtils.write.pruneExpired(
      alice.wallet.address
    );

  console.log(res);
};
