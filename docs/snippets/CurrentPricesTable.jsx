import { weiToTokens, formatPrice } from './PriceProvider';

export const CurrentPricesTable = ({ priceData }) => {
  // Product IDs
  const ProductId = {
    PkpSign: 0,
    EncSign: 1,
    LitAction: 2,
    SignSessionKey: 3,
  };

  // Product IDs array used for fetching prices
  const PRODUCT_IDS = [
    ProductId.PkpSign,
    ProductId.EncSign,
    ProductId.LitAction,
    ProductId.SignSessionKey,
  ];

  // LitActionPriceComponent enum values
  const LitActionPriceComponent = {
    baseAmount: 0,
    runtimeLength: 1,
    memoryUsage: 2,
    codeLength: 3,
    responseLength: 4,
    signatures: 5,
    broadcasts: 6,
    contractCalls: 7,
    callDepth: 8,
    decrypts: 9,
    fetches: 10,
  };

  // NodePriceMeasurement enum values
  const NodePriceMeasurement = {
    perSecond: 0,
    perMegabyte: 1,
    perCount: 2,
  };

  const PRODUCT_NAMES = {
    [ProductId.PkpSign]: 'PKP Sign',
    [ProductId.EncSign]: 'Encrypted Sign',
    [ProductId.LitAction]: 'Lit Action',
    [ProductId.SignSessionKey]: 'Sign Session Key',
  };

  const LIT_ACTION_COMPONENT_NAMES = {
    [LitActionPriceComponent.baseAmount]: 'Base Amount',
    [LitActionPriceComponent.runtimeLength]: 'Runtime Length',
    [LitActionPriceComponent.memoryUsage]: 'Memory Usage',
    [LitActionPriceComponent.codeLength]: 'Code Length',
    [LitActionPriceComponent.responseLength]: 'Response Length',
    [LitActionPriceComponent.signatures]: 'Signatures',
    [LitActionPriceComponent.broadcasts]: 'Broadcasts',
    [LitActionPriceComponent.contractCalls]: 'Contract Calls',
    [LitActionPriceComponent.callDepth]: 'Call Depth',
    [LitActionPriceComponent.decrypts]: 'Decrypts',
    [LitActionPriceComponent.fetches]: 'Fetches',
  };

  const MEASUREMENT_NAMES = {
    [NodePriceMeasurement.perSecond]: '/second',
    [NodePriceMeasurement.perMegabyte]: '/MB',
    [NodePriceMeasurement.perCount]: '/count',
  };

  if (!priceData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Price data not available. Please wrap this component with PriceProvider.</p>
      </div>
    );
  }

  const {
    loading,
    error,
    basePrices,
    maxPrices,
    currentPrices,
    litActionConfigs,
    litKeyPriceUSD,
    usagePercent,
    pkpMintCost,
    ethers,
  } = priceData;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading current prices from blockchain...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error loading prices: {error}</p>
        <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
          Unable to fetch pricing data. Please check your connection or try again later.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', marginBottom: '20px', paddingLeft: '4px' }}>
      {litKeyPriceUSD && (
        <p style={{ marginBottom: '20px', fontSize: '0.9em', color: '#666' }}>
          <strong>LITKEY Price:</strong> ${litKeyPriceUSD.toFixed(4)} USD
          {usagePercent !== null && (
            <span style={{ marginLeft: '20px' }}>
              <strong>Estimated Network Usage:</strong> {usagePercent}%
            </span>
          )}
        </p>
      )}

      <div style={{ overflowX: 'auto', marginLeft: '0', marginRight: '0', paddingLeft: '0' }}>
        <table
          style={{
            width: '100%',
            maxWidth: '100%',
            borderCollapse: 'collapse',
            marginBottom: '30px',
            marginLeft: '0',
            marginRight: '0',
            tableLayout: 'auto',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th
                style={{
                  padding: '8px 6px 8px 8px',
                  textAlign: 'left',
                  border: '1px solid #ddd',
                  fontSize: '0.9em',
                }}
              >
                Product
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  fontSize: '0.9em',
                }}
              >
                Current Price
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  fontSize: '0.9em',
                }}
              >
                Base Price
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  fontSize: '0.9em',
                }}
              >
                Max Price
              </th>
            </tr>
          </thead>
          <tbody>
            {PRODUCT_IDS.map((productId, index) => {
              const basePriceInTokens = weiToTokens(basePrices[index], ethers);
              const maxPriceInTokens = weiToTokens(maxPrices[index], ethers);
              const currentPriceInTokens = weiToTokens(currentPrices[index], ethers);
              const basePriceInUSD = litKeyPriceUSD
                ? basePriceInTokens * litKeyPriceUSD
                : null;
              const maxPriceInUSD = litKeyPriceUSD
                ? maxPriceInTokens * litKeyPriceUSD
                : null;
              const currentPriceInUSD = litKeyPriceUSD
                ? currentPriceInTokens * litKeyPriceUSD
                : null;

              return (
                <tr key={productId}>
                  <td
                    style={{
                      padding: '8px 6px 8px 8px',
                      border: '1px solid #ddd',
                      fontWeight: '500',
                      fontSize: '0.9em',
                    }}
                  >
                    {PRODUCT_NAMES[productId]}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #ddd',
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      fontSize: '0.85em',
                    }}
                  >
                    {formatPrice(currentPriceInTokens, currentPriceInUSD)}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #ddd',
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                    }}
                  >
                    {formatPrice(basePriceInTokens, basePriceInUSD)}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #ddd',
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                    }}
                  >
                    {formatPrice(maxPriceInTokens, maxPriceInUSD)}
                  </td>
                </tr>
              );
            })}
            {pkpMintCost !== null && (
              <tr>
                <td
                  style={{
                    padding: '8px 6px 8px 8px',
                    border: '1px solid #ddd',
                    fontWeight: '500',
                    fontSize: '0.9em',
                  }}
                >
                  PKP Minting{' '}
                  <span
                    style={{
                      color: '#666',
                      fontSize: '0.85em',
                      fontWeight: 'normal',
                      fontStyle: 'italic',
                    }}
                  >
                    (Static)
                  </span>
                </td>
                <td
                  style={{
                    padding: '8px 10px',
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    fontSize: '0.85em',
                  }}
                >
                  {formatPrice(
                    weiToTokens(pkpMintCost, ethers),
                    litKeyPriceUSD
                      ? weiToTokens(pkpMintCost, ethers) * litKeyPriceUSD
                      : null
                  )}
                </td>
                <td
                  style={{
                    padding: '8px 10px',
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    fontFamily: 'monospace',
                    fontSize: '0.85em',
                  }}
                >
                  {formatPrice(
                    weiToTokens(pkpMintCost, ethers),
                    litKeyPriceUSD
                      ? weiToTokens(pkpMintCost, ethers) * litKeyPriceUSD
                      : null
                  )}
                </td>
                <td
                  style={{
                    padding: '8px 10px',
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    fontFamily: 'monospace',
                    fontSize: '0.85em',
                  }}
                >
                  {formatPrice(
                    weiToTokens(pkpMintCost, ethers),
                    litKeyPriceUSD
                      ? weiToTokens(pkpMintCost, ethers) * litKeyPriceUSD
                      : null
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>
        Lit Action Price Components
      </h3>
      <div style={{ overflowX: 'auto', marginLeft: '0', marginRight: '0', paddingLeft: '0' }}>
        <table
          style={{
            width: '100%',
            maxWidth: '100%',
            borderCollapse: 'collapse',
            marginLeft: '0',
            marginRight: '0',
            tableLayout: 'auto',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  border: '1px solid #ddd',
                  fontSize: '0.9em',
                }}
              >
                Component
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  fontSize: '0.9em',
                }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {litActionConfigs.map((config, index) => {
              const priceComponentNum = Number(config.priceComponent);
              const priceMeasurementNum = Number(config.priceMeasurement);
              const componentName =
                LIT_ACTION_COMPONENT_NAMES[priceComponentNum] ||
                `Component ${priceComponentNum}`;
              const measurementName =
                MEASUREMENT_NAMES[priceMeasurementNum] || '';
              const priceInTokens = weiToTokens(config.price, ethers);
              const priceInUSD = litKeyPriceUSD
                ? priceInTokens * litKeyPriceUSD
                : null;

              return (
                <tr key={index}>
                  <td
                    style={{
                      padding: '8px 10px',
                      border: '1px solid #ddd',
                      fontSize: '0.9em',
                    }}
                  >
                    {componentName}
                    {measurementName && (
                      <span style={{ color: '#666', marginLeft: '5px' }}>
                        {measurementName}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #ddd',
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                    }}
                  >
                    {formatPrice(priceInTokens, priceInUSD)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
