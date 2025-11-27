import { useEffect, useState } from 'react';

export const CurrentPricesTable = () => {
  // Constants - defined inside component for Mintlify compatibility
  const NAGA_PROD_PRICE_FEED_ADDRESS = '0x88F5535Fa6dA5C225a3C06489fE4e3405b87608C';
  const RPC_URL = 'https://lit-chain-rpc.litprotocol.com/';

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

  // PriceFeed ABI (minimal - only functions we need)
  const PRICE_FEED_ABI = [
    {
      inputs: [
        {
          internalType: 'uint256[]',
          name: 'productIds',
          type: 'uint256[]',
        },
      ],
      name: 'baseNetworkPrices',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256[]',
          name: 'productIds',
          type: 'uint256[]',
        },
      ],
      name: 'maxNetworkPrices',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'usagePercent',
          type: 'uint256',
        },
        {
          internalType: 'uint256[]',
          name: 'productIds',
          type: 'uint256[]',
        },
      ],
      name: 'usagePercentToPrices',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getLitActionPriceConfigs',
      outputs: [
        {
          components: [
            {
              internalType: 'enum LibPriceFeedStorage.LitActionPriceComponent',
              name: 'priceComponent',
              type: 'uint8',
            },
            {
              internalType: 'enum LibPriceFeedStorage.NodePriceMeasurement',
              name: 'priceMeasurement',
              type: 'uint8',
            },
            {
              internalType: 'uint256',
              name: 'price',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibPriceFeedStorage.LitActionPriceConfig[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  // Helper functions
  const getLitKeyPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=lit-protocol&vs_currencies=usd'
      );
      const data = await response.json();

      if (data['lit-protocol'] && data['lit-protocol'].usd) {
        return data['lit-protocol'].usd;
      }

      throw new Error('LIT price not found in CoinGecko response');
    } catch (error) {
      console.error('Error fetching LITKEY price from CoinGecko:', error);
      return null;
    }
  };

  const weiToTokens = (wei, ethers) => {
    if (!ethers || !ethers.utils) {
      return 0;
    }
    return parseFloat(ethers.utils.formatUnits(wei, 18));
  };

  const formatPrice = (priceInTokens, priceInUSD) => {
    if (priceInUSD === null) {
      return `${priceInTokens.toFixed(6)} LITKEY`;
    }
    return `${priceInTokens.toFixed(6)} LITKEY ($${priceInUSD.toFixed(6)})`;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basePrices, setBasePrices] = useState([]);
  const [maxPrices, setMaxPrices] = useState([]);
  const [currentPrices, setCurrentPrices] = useState([]);
  const [litActionConfigs, setLitActionConfigs] = useState([]);
  const [litKeyPriceUSD, setLitKeyPriceUSD] = useState(null);
  const [usagePercent, setUsagePercent] = useState(null);
  const [ethersLoaded, setEthersLoaded] = useState(false);

  // Load ethers from CDN
  useEffect(() => {
    if (window.ethers) {
      setEthersLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
    script.onload = () => {
      setEthersLoaded(true);
    };
    script.onerror = () => {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
      fallbackScript.onload = () => {
        setEthersLoaded(true);
      };
      fallbackScript.onerror = () => {
        setError('Failed to load ethers library from CDN');
        setLoading(false);
      };
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!ethersLoaded || !window.ethers) {
      return;
    }

    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);

        const { ethers } = window;
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(NAGA_PROD_PRICE_FEED_ADDRESS, PRICE_FEED_ABI, provider);

        const priceUSD = await getLitKeyPrice();
        setLitKeyPriceUSD(priceUSD);

        const basePricesResult = await contract.baseNetworkPrices(PRODUCT_IDS);
        const maxPricesResult = await contract.maxNetworkPrices(PRODUCT_IDS);

        const estimatedUsage = 50;
        setUsagePercent(estimatedUsage);
        const currentPricesResult = await contract.usagePercentToPrices(estimatedUsage, PRODUCT_IDS);

        const litActionConfigsResult = await contract.getLitActionPriceConfigs();

        setBasePrices(basePricesResult);
        setMaxPrices(maxPricesResult);
        setCurrentPrices(currentPricesResult);
        setLitActionConfigs(litActionConfigsResult);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError(err.message || 'Failed to fetch prices');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [ethersLoaded]);

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
                  padding: '8px 6px 8px 0',
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
              const basePriceInTokens = weiToTokens(basePrices[index], window.ethers);
              const maxPriceInTokens = weiToTokens(maxPrices[index], window.ethers);
              const currentPriceInTokens = weiToTokens(currentPrices[index], window.ethers);
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
                      padding: '8px 6px 8px 0',
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
              const priceInTokens = weiToTokens(config.price, window.ethers);
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
