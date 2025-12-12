import { _sumPaymentDetails } from './sumPaymentDetails';

describe('_sumPaymentDetails', () => {
  it('returns undefined when no payment details are present', () => {
    const base = {
      nodeUrl: 'https://127.0.0.1:7470',
      claimData: {},
      decryptedData: {},
      logs: '',
      response: '',
      signedData: {},
      success: true,
    };

    expect(_sumPaymentDetails([])).toBeUndefined();
    expect(_sumPaymentDetails([{ ...base, paymentDetail: undefined }])).toBeUndefined();
    expect(_sumPaymentDetails([{ ...base, paymentDetail: [] }])).toBeUndefined();
  });

  it('sums quantities and prices by component across nodes', () => {
    const base = {
      claimData: {},
      decryptedData: {},
      logs: '',
      response: '',
      signedData: {},
      success: true,
    };

    const result = _sumPaymentDetails([
      {
        ...base,
        nodeUrl: 'https://node-a:7470',
        paymentDetail: [
          { component: 'MemoryUsage', quantity: 14, price: 2_000_000_000_000_000n },
          { component: 'BaseAmount', quantity: 1, price: 100_000_000_000_000_000n },
        ],
      },
      {
        ...base,
        nodeUrl: 'https://node-b:7470',
        paymentDetail: [
          { component: 'BaseAmount', quantity: 1, price: 100_000_000_000_000_000n },
          { component: 'MemoryUsage', quantity: 15, price: 2_000_000_000_000_000n },
        ],
      },
      {
        ...base,
        nodeUrl: 'https://node-c:7470',
        paymentDetail: [{ component: 'BaseAmount', quantity: 1, price: 100_000_000_000_000_000n }],
      },
    ]);

    expect(result).toEqual([
      { component: 'BaseAmount', quantity: 3, price: 300_000_000_000_000_000n },
      { component: 'MemoryUsage', quantity: 29, price: 4_000_000_000_000_000n },
    ]);
  });
});
