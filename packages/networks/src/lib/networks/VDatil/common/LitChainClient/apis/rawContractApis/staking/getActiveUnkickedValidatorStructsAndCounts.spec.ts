import { beforeAll, describe, expect, test } from 'bun:test';
import {
  datilDevNetworkContext,
  DatilDevNetworkContext,
} from 'services/lit/LitNetwork/vDatil/datil-dev/networkContext';
import { getActiveUnkickedValidatorStructsAndCounts } from './getActiveUnkickedValidatorStructsAndCounts';
import { JSONStringify } from 'json-with-bigint';

describe('LitChainClient', () => {
  let networkCtx: DatilDevNetworkContext;

  beforeAll(async () => {
    networkCtx = datilDevNetworkContext;
  });

  // Expected output:
  // {
  //   epochInfo: {
  //     epochLength: 300,
  //     number: 31316,
  //     endTime: 1740008064,
  //     retries: 0,
  //     timeout: 60,
  //   },
  //   minNodeCount: 2,
  //   validatorURLs: [ "https://15.235.83.220:7470", "https://15.235.83.220:7472", "https://15.235.83.220:7471" ],
  // }
  test('getActiveUnkickedValidatorStructsAndCounts', async () => {
    const res = await getActiveUnkickedValidatorStructsAndCounts(networkCtx);
    console.log(res);
    expect(res.minNodeCount).toBeGreaterThanOrEqual(2);
    expect(res.epochInfo.epochLength).toBeGreaterThan(0);
    expect(res.validatorURLs.length).toBeGreaterThanOrEqual(
      Number(res.minNodeCount)
    );
  });
});
