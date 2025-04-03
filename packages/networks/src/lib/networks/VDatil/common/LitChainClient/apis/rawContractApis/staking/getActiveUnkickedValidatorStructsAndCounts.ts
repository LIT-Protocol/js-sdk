import { DatilContext } from '../../../../../types';
import { GetActiveUnkickedValidatorStructsAndCountsSchema } from '../../../schemas/GetActiveUnkickedValidatorStructsAndCountsSchema';
import { createLitContracts } from '../../utils/createLitContracts';

export async function getActiveUnkickedValidatorStructsAndCounts(
  networkCtx: DatilContext
) {
  const { stakingContract } = createLitContracts(networkCtx);

  const res =
    await stakingContract.read.getActiveUnkickedValidatorStructsAndCounts();

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
//   const networkCtx = datilDevNetworkContext;
//   const res = await getActiveUnkickedValidatorStructsAndCounts(networkCtx);
//   console.log(res);
// }
