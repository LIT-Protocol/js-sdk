import { NagaContext } from '../../../../../types';
import { GetActiveUnkickedValidatorStructsAndCountsSchema } from '../../../schemas/GetActiveUnkickedValidatorStructsAndCountsSchema';
import { createLitContracts } from '../../utils/createLitContracts';

// const REALM_ID = 1n;

export async function getActiveUnkickedValidatorStructsAndCounts(
  networkCtx: NagaContext
) {
  const { stakingContract } = createLitContracts(networkCtx);

  const res =
    await stakingContract.read.getActiveUnkickedValidatorStructsAndCounts([
      networkCtx.realmId,
    ]);

  const validatedRes =
    GetActiveUnkickedValidatorStructsAndCountsSchema.parse(res);

  const transformedRes = {
    ...validatedRes,
    validatorURLs: validatedRes.validatorURLs.map(
      (url) => networkCtx.httpProtocol + url
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
//   const networkCtx = networkContext;
//   const res = await getActiveUnkickedValidatorStructsAndCounts(networkCtx);
//   console.log(res);
// }
