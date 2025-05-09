import { DefaultNetworkConfig } from '../../../../interfaces/NetworkContext';
import { createLitContracts } from '../../../createLitContracts';
import { GetActiveUnkickedValidatorStructsAndCountsSchema } from '../../../schemas/GetActiveUnkickedValidatorStructsAndCountsSchema';

// const REALM_ID = 1n;

export async function getActiveUnkickedValidatorStructsAndCounts(
  networkCtx: DefaultNetworkConfig
) {
  const { stakingContract } = createLitContracts(networkCtx);

  const res =
    await stakingContract.read.getActiveUnkickedValidatorStructsAndCounts([
      networkCtx.networkSpecificConfigs.realmId,
    ]);

  const validatedRes =
    GetActiveUnkickedValidatorStructsAndCountsSchema.parse(res);

  const transformedRes = {
    ...validatedRes,
    validatorURLs: validatedRes.validatorURLs.map(
      (url: string) => networkCtx.httpProtocol + url
    ),
  };

  return transformedRes;
}

// Expected output:
// {
//   epochInfo: {
//     epochLength: 300,
//     number: 34144,
//     endTime: 1741198445,
//     retries: 0,
//     timeout: 60,
//   },
//   minNodeCount: 2,
//   validatorURLs: [ "https://15.235.83.220:7470", "https://15.235.83.220:7472", "https://15.235.83.220:7471" ],
// }
// if (import.meta.main) {
//   const { networkContext } = await import('../../../_config');
//   const res = await getActiveUnkickedValidatorStructsAndCounts(networkContext);
//   console.log(res);
// }
