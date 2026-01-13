export const CurrentPricesTable = ({ priceData }) => {
  // Get constants and helper functions from window (populated by lit-pricing-constants.js)
  const PRODUCT_IDS = window.LitPricingConstants?.PRODUCT_IDS || [];
  const PRODUCT_NAMES = window.LitPricingConstants?.PRODUCT_NAMES || {};
  const LIT_ACTION_COMPONENT_NAMES = window.LitPricingConstants?.LIT_ACTION_COMPONENT_NAMES || {};
  const MEASUREMENT_NAMES = window.LitPricingConstants?.MEASUREMENT_NAMES || {};
  const weiToTokens = window.LitPricingConstants?.weiToTokens || (() => 0);
  const formatPrice = window.LitPricingConstants?.formatPrice || ((price) => String(price));

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
    numberOfNodes,
    thresholdNodes,
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
        <p style={{ marginBottom: '20px', fontSize: '0.9em', color: 'var(--mint-text-secondary, #666)' }}>
          <strong>LITKEY Price:</strong> ${litKeyPriceUSD.toFixed(4)} USD
          {usagePercent !== null && (
            <span style={{ marginLeft: '20px' }}>
              <strong>Estimated Network Usage:</strong> {usagePercent}%
            </span>
          )}
          {numberOfNodes !== null && (
            <span style={{ marginLeft: '20px' }}>
              <strong>Total Nodes:</strong> {numberOfNodes}
            </span>
          )}
          {thresholdNodes !== null && (
            <span style={{ marginLeft: '20px' }}>
              <strong>Threshold Nodes:</strong> {thresholdNodes}
            </span>
          )}
        </p>
      )}
      {thresholdNodes !== null && numberOfNodes !== null && (
        <p style={{ marginBottom: '20px', fontSize: '0.85em', color: 'var(--mint-text-secondary, #666)', fontStyle: 'italic' }}>
          <strong>Note:</strong> Prices shown are per request (on-chain prices × {thresholdNodes} threshold nodes). On-chain prices are per node, but since your request goes to {thresholdNodes} nodes (2/3 of {numberOfNodes} total nodes, minimum 3) and each node charges the product price, the total cost per request is the product price multiplied by {thresholdNodes}.
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
            <tr style={{ backgroundColor: 'var(--mint-bg-secondary, #f5f5f5)' }}>
              <th
                style={{
                  padding: '8px 6px 8px 8px',
                  textAlign: 'left',
                  border: '1px solid var(--mint-border, #ddd)',
                  fontSize: '0.9em',
                  color: 'var(--mint-text, inherit)',
                }}
              >
                Product
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid var(--mint-border, #ddd)',
                  fontSize: '0.9em',
                  color: 'var(--mint-text, inherit)',
                }}
              >
                Current Price
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid var(--mint-border, #ddd)',
                  fontSize: '0.9em',
                  color: 'var(--mint-text, inherit)',
                }}
              >
                Base Price
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid var(--mint-border, #ddd)',
                  fontSize: '0.9em',
                  color: 'var(--mint-text, inherit)',
                }}
              >
                Max Price
              </th>
            </tr>
          </thead>
          <tbody>
            {PRODUCT_IDS.map((productId, index) => {
              // Multiply by thresholdNodes since each node charges the product price
              // and requests go to threshold nodes (2/3 of total, minimum 3)
              const basePricePerNode = weiToTokens(basePrices[index], ethers);
              const maxPricePerNode = weiToTokens(maxPrices[index], ethers);
              const currentPricePerNode = weiToTokens(currentPrices[index], ethers);
              const basePriceInTokens = thresholdNodes ? basePricePerNode * thresholdNodes : basePricePerNode;
              const maxPriceInTokens = thresholdNodes ? maxPricePerNode * thresholdNodes : maxPricePerNode;
              const currentPriceInTokens = thresholdNodes ? currentPricePerNode * thresholdNodes : currentPricePerNode;
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
                      border: '1px solid var(--mint-border, #ddd)',
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
                      border: '1px solid var(--mint-border, #ddd)',
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
                      border: '1px solid var(--mint-border, #ddd)',
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
                      border: '1px solid var(--mint-border, #ddd)',
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
                    border: '1px solid var(--mint-border, #ddd)',
                    fontWeight: '500',
                    fontSize: '0.9em',
                  }}
                >
                  PKP Minting{' '}
                  <span
                    style={{
                      color: 'var(--mint-text-secondary, #666)',
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
                    border: '1px solid var(--mint-border, #ddd)',
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
                    border: '1px solid var(--mint-border, #ddd)',
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
                    border: '1px solid var(--mint-border, #ddd)',
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
            <tr style={{ backgroundColor: 'var(--mint-bg-secondary, #f5f5f5)' }}>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  border: '1px solid var(--mint-border, #ddd)',
                  fontSize: '0.9em',
                  color: 'var(--mint-text, inherit)',
                }}
              >
                Component
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'right',
                  border: '1px solid var(--mint-border, #ddd)',
                  fontSize: '0.9em',
                  color: 'var(--mint-text, inherit)',
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
              // Multiply by thresholdNodes since each node charges the product price
              // and requests go to threshold nodes (2/3 of total, minimum 3)
              const pricePerNode = weiToTokens(config.price, ethers);
              const priceInTokens = thresholdNodes ? pricePerNode * thresholdNodes : pricePerNode;
              const priceInUSD = litKeyPriceUSD
                ? priceInTokens * litKeyPriceUSD
                : null;

              return (
                <tr key={index}>
                  <td
                    style={{
                      padding: '8px 10px',
                      border: '1px solid var(--mint-border, #ddd)',
                      fontSize: '0.9em',
                    }}
                  >
                    {componentName}
                    {measurementName && (
                      <span style={{ color: 'var(--mint-text-secondary, #666)', marginLeft: '5px' }}>
                        {measurementName}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid var(--mint-border, #ddd)',
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
