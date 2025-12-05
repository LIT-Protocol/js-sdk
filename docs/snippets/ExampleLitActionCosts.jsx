import { usePrices, weiToTokens, formatPrice, LitActionPriceComponent, NodePriceMeasurement } from './PriceProvider';

export const ExampleLitActionCosts = () => {
  const {
    loading,
    error,
    litActionConfigs,
    litKeyPriceUSD,
    ethers,
  } = usePrices();

  // Helper to get price for a specific component
  const getComponentPrice = (componentType, measurementType) => {
    if (!litActionConfigs || litActionConfigs.length === 0) return null;
    
    const config = litActionConfigs.find(
      (c) =>
        Number(c.priceComponent) === componentType &&
        Number(c.priceMeasurement) === measurementType
    );
    
    if (!config) return null;
    return weiToTokens(config.price, ethers);
  };

  // Calculate cost for a Lit Action example
  const calculateCost = (example) => {
    if (!litActionConfigs || litActionConfigs.length === 0) return null;

    let totalCost = 0;
    const breakdown = [];

    // Base amount (always included)
    const baseAmount = getComponentPrice(
      LitActionPriceComponent.baseAmount,
      NodePriceMeasurement.perCount
    );
    if (baseAmount !== null) {
      totalCost += baseAmount;
      breakdown.push({
        component: 'Base Amount',
        quantity: 1,
        unitPrice: baseAmount,
        total: baseAmount,
      });
    }

    // Runtime length (per second)
    if (example.runtimeSeconds) {
      const runtimePrice = getComponentPrice(
        LitActionPriceComponent.runtimeLength,
        NodePriceMeasurement.perSecond
      );
      if (runtimePrice !== null) {
        const runtimeCost = runtimePrice * example.runtimeSeconds;
        totalCost += runtimeCost;
        breakdown.push({
          component: 'Runtime Length',
          quantity: example.runtimeSeconds,
          unitPrice: runtimePrice,
          total: runtimeCost,
          unit: 'seconds',
        });
      }
    }

    // Fetches (per count)
    if (example.fetches) {
      const fetchPrice = getComponentPrice(
        LitActionPriceComponent.fetches,
        NodePriceMeasurement.perCount
      );
      if (fetchPrice !== null) {
        const fetchCost = fetchPrice * example.fetches;
        totalCost += fetchCost;
        breakdown.push({
          component: 'Fetches',
          quantity: example.fetches,
          unitPrice: fetchPrice,
          total: fetchCost,
          unit: 'count',
        });
      }
    }

    // Signatures (per count)
    if (example.signatures) {
      const signaturePrice = getComponentPrice(
        LitActionPriceComponent.signatures,
        NodePriceMeasurement.perCount
      );
      if (signaturePrice !== null) {
        const signatureCost = signaturePrice * example.signatures;
        totalCost += signatureCost;
        breakdown.push({
          component: 'Signatures',
          quantity: example.signatures,
          unitPrice: signaturePrice,
          total: signatureCost,
          unit: 'count',
        });
      }
    }

    // Decrypts (per count)
    if (example.decrypts) {
      const decryptPrice = getComponentPrice(
        LitActionPriceComponent.decrypts,
        NodePriceMeasurement.perCount
      );
      if (decryptPrice !== null) {
        const decryptCost = decryptPrice * example.decrypts;
        totalCost += decryptCost;
        breakdown.push({
          component: 'Decrypts',
          quantity: example.decrypts,
          unitPrice: decryptPrice,
          total: decryptCost,
          unit: 'count',
        });
      }
    }

    return {
      totalCost,
      breakdown,
      totalCostUSD: litKeyPriceUSD ? totalCost * litKeyPriceUSD : null,
    };
  };

  const examples = [
    {
      title: 'Oracle Operation',
      description: 'Fetches external data and signs the result',
      runtimeSeconds: 10,
      fetches: 1,
      signatures: 1,
      decrypts: 0,
    },
    {
      title: 'Cross-Chain Swap',
      description: 'Complex operation with multiple data fetches and signatures',
      runtimeSeconds: 20,
      fetches: 4,
      signatures: 2,
      decrypts: 0,
    },
    {
      title: 'Verifiable Data Job',
      description: 'Processes data and signs the result',
      runtimeSeconds: 45,
      fetches: 0,
      signatures: 1,
      decrypts: 0,
    },
    {
      title: 'Secure API Key Usage',
      description: 'Decrypts an API key and uses it in a fetch request',
      runtimeSeconds: 5,
      fetches: 1,
      signatures: 0,
      decrypts: 1,
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading price data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error loading prices: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      {litKeyPriceUSD && (
        <p style={{ marginBottom: '20px', fontSize: '0.9em', color: '#666' }}>
          <strong>LITKEY Price:</strong> ${litKeyPriceUSD.toFixed(4)} USD
        </p>
      )}

      {examples.map((example, idx) => {
        const costData = calculateCost(example);
        if (!costData) return null;

        return (
          <div
            key={idx}
            style={{
              marginBottom: '40px',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <h3 style={{ marginTop: '0', marginBottom: '10px' }}>
              {example.title}
            </h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9em' }}>
              {example.description}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <strong>Estimated Total Cost:</strong>{' '}
              <span style={{ fontFamily: 'monospace', fontSize: '1.1em', fontWeight: '600' }}>
                {formatPrice(costData.totalCost, costData.totalCostUSD)}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9em',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        border: '1px solid #ddd',
                      }}
                    >
                      Component
                    </th>
                    <th
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        border: '1px solid #ddd',
                      }}
                    >
                      Quantity
                    </th>
                    <th
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        border: '1px solid #ddd',
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        border: '1px solid #ddd',
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {costData.breakdown.map((item, itemIdx) => (
                    <tr key={itemIdx}>
                      <td
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #ddd',
                        }}
                      >
                        {item.component}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          border: '1px solid #ddd',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.quantity} {item.unit || ''}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          border: '1px solid #ddd',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatPrice(item.unitPrice, litKeyPriceUSD ? item.unitPrice * litKeyPriceUSD : null)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          border: '1px solid #ddd',
                          fontFamily: 'monospace',
                          fontWeight: '600',
                        }}
                      >
                        {formatPrice(item.total, litKeyPriceUSD ? item.total * litKeyPriceUSD : null)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f0f0f0', fontWeight: '600' }}>
                    <td
                      style={{
                        padding: '8px 10px',
                        border: '1px solid #ddd',
                      }}
                    >
                      <strong>Total</strong>
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        border: '1px solid #ddd',
                      }}
                    ></td>
                    <td
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        border: '1px solid #ddd',
                      }}
                    ></td>
                    <td
                      style={{
                        padding: '8px 10px',
                        textAlign: 'right',
                        border: '1px solid #ddd',
                        fontFamily: 'monospace',
                      }}
                    >
                      <strong>
                        {formatPrice(costData.totalCost, costData.totalCostUSD)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

