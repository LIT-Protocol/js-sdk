import {
  datilDevNetworkContext,
  DatilDevNetworkContext,
} from '../../../../../../vDatil/datil-dev/networkContext';
import { getConnectionInfo } from './getConnectionInfo';

describe('ConnectionInfo', () => {
  let networkCtx: DatilDevNetworkContext;

  beforeAll(async () => {
    networkCtx = datilDevNetworkContext;
  });

  test('getConnectionInfo returns properly formatted connection data', async () => {
    const connectionInfo = await getConnectionInfo({
      networkCtx,
    });

    // Verify the structure and data types
    expect(connectionInfo).toHaveProperty('epochInfo');
    expect(connectionInfo).toHaveProperty('minNodeCount');
    expect(connectionInfo).toHaveProperty('bootstrapUrls');

    // Verify the epochInfo structure
    expect(connectionInfo.epochInfo).toHaveProperty('epochLength');
    expect(connectionInfo.epochInfo).toHaveProperty('number');
    expect(connectionInfo.epochInfo).toHaveProperty('endTime');
    expect(connectionInfo.epochInfo).toHaveProperty('retries');
    expect(connectionInfo.epochInfo).toHaveProperty('timeout');

    // Verify data types and ranges
    expect(connectionInfo.minNodeCount).toBeGreaterThanOrEqual(1);
    expect(connectionInfo.bootstrapUrls.length).toBeGreaterThanOrEqual(
      connectionInfo.minNodeCount
    );

    // Verify that all URLs start with http:// or https://
    connectionInfo.bootstrapUrls.forEach((url) => {
      expect(url.startsWith('http://') || url.startsWith('https://')).toBe(
        true
      );
    });
  });

  test('getConnectionInfo applies custom protocol when provided', async () => {
    const customProtocol = 'https://';
    const connectionInfo = await getConnectionInfo({
      networkCtx,
      nodeProtocol: customProtocol,
    });

    // Verify that all URLs use the custom protocol
    connectionInfo.bootstrapUrls.forEach((url) => {
      expect(url.startsWith(customProtocol)).toBe(true);
    });
  });
});
