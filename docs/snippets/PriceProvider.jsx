import { useEffect, useState } from 'react';

export const PriceProvider = ({ children, component: Component }) => {
  // Constants - defined inside component for Mintlify compatibility
  const NAGA_PROD_PRICE_FEED_ADDRESS = '0x88F5535Fa6dA5C225a3C06489fE4e3405b87608C';
  const NAGA_PROD_PKP_ADDRESS = '0x11eBfFeab32f6cb5775BeF83E09124B9322E4026';
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

  // Helpful for debugging: map productId -> human label
  const PRODUCT_META = [
    { id: ProductId.PkpSign, key: 'PkpSign', name: 'PKP Sign' },
    { id: ProductId.EncSign, key: 'EncSign', name: 'Encrypted Sign' },
    { id: ProductId.LitAction, key: 'LitAction', name: 'Lit Action' },
    { id: ProductId.SignSessionKey, key: 'SignSessionKey', name: 'Sign Session Key' },
  ];
  const getProductMeta = (productId) =>
    PRODUCT_META.find((p) => p.id === productId) || { id: productId, key: `Product_${productId}`, name: `Product ${productId}` };

  // Debug logs (always on for the current prices page snippet)
  const debugPricingLog = (label, data) => {
    // eslint-disable-next-line no-console
    console.log(`[pricing] ${label}`, data);
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
      inputs: [
        {
          internalType: 'uint256',
          name: 'productId',
          type: 'uint256',
        },
      ],
      name: 'prices',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'stakerAddress',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'price',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'productId',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'timestamp',
              type: 'uint256',
            },
          ],
          internalType: 'struct LibPriceFeedStorage.NodePriceData[]',
          name: '',
          type: 'tuple[]',
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

  // PKP Contract ABI (for mintCost)
  const PKP_ABI = [
    {
      inputs: [],
      name: 'mintCost',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  // Helper function to get LITKEY price
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basePrices, setBasePrices] = useState([]);
  const [maxPrices, setMaxPrices] = useState([]);
  const [currentPrices, setCurrentPrices] = useState([]);
  const [litActionConfigs, setLitActionConfigs] = useState([]);
  const [litKeyPriceUSD, setLitKeyPriceUSD] = useState(null);
  const [usagePercent, setUsagePercent] = useState(null);
  const [pkpMintCost, setPkpMintCost] = useState(null);
  const [numberOfNodes, setNumberOfNodes] = useState(null);
  const [thresholdNodes, setThresholdNodes] = useState(null);
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
        const pkpContract = new ethers.Contract(NAGA_PROD_PKP_ADDRESS, PKP_ABI, provider);

        const priceUSD = await getLitKeyPrice();
        setLitKeyPriceUSD(priceUSD);

        const basePricesResult = await contract.baseNetworkPrices(PRODUCT_IDS);
        const maxPricesResult = await contract.maxNetworkPrices(PRODUCT_IDS);

        debugPricingLog('Fetched network price bands', {
          rpcUrl: RPC_URL,
          priceFeedAddress: NAGA_PROD_PRICE_FEED_ADDRESS,
          productIds: PRODUCT_IDS,
          products: PRODUCT_IDS.map((id, i) => ({
            productId: id,
            ...getProductMeta(id),
            basePriceWei: basePricesResult?.[i]?.toString?.(),
            maxPriceWei: maxPricesResult?.[i]?.toString?.(),
          })),
        });

        // Get actual current price to calculate usage percent
        // Using PkpSign (productId 0) as reference
        const referenceProductId = ProductId.PkpSign;
        const referenceProductMeta = getProductMeta(referenceProductId);
        const nodePriceData = await contract.prices(referenceProductId);
        // Store number of nodes (length of prices array)
        const totalNodes = nodePriceData.length;
        setNumberOfNodes(totalNodes);
        
        // Calculate threshold: floor(numberOfNodes * 2/3), minimum 3
        // Using integer math with truncation (Math.floor)
        const calculatedThreshold = Math.floor(totalNodes * 2 / 3);
        const threshold = Math.max(3, calculatedThreshold);
        setThresholdNodes(threshold);
        
        const basePrice = basePricesResult[0];
        const maxPrice = maxPricesResult[0];
        
        // Calculate usage percent by finding which usage percentage produces the current price
        // Use median price from all nodes to get current market price
        let calculatedUsage = 0;
        let medianPriceForReferenceProduct = null;
        if (nodePriceData.length > 0 && !maxPrice.eq(basePrice)) {
          // Extract and sort all node prices
          const prices = nodePriceData.map(node => ethers.BigNumber.from(node.price));
          prices.sort((a, b) => {
            if (a.lt(b)) return -1;
            if (a.gt(b)) return 1;
            return 0;
          });
          
          // Calculate median
          let medianPrice;
          const mid = Math.floor(prices.length / 2);
          if (prices.length % 2 === 0) {
            // Even number of prices: average the two middle values
            medianPrice = prices[mid - 1].add(prices[mid]).div(2);
          } else {
            // Odd number of prices: use the middle value
            medianPrice = prices[mid];
          }
          medianPriceForReferenceProduct = medianPrice;
          
          // Debug: log values to understand why calculation might fail
          // eslint-disable-next-line no-console
          console.log('Usage calculation:', {
            referenceProduct: referenceProductMeta, // <-- which product basePrice/maxPrice/median are for
            rpcUrl: RPC_URL,
            priceFeedAddress: NAGA_PROD_PRICE_FEED_ADDRESS,
            nodePrices: nodePriceData.map(n => n.price.toString()),
            sortedPrices: prices.map(p => p.toString()),
            medianPrice: medianPrice.toString(),
            basePrice: basePrice.toString(),
            maxPrice: maxPrice.toString(),
            maxEqualsBase: maxPrice.eq(basePrice),
            totalNodes,
            thresholdNodes: threshold,
            medianVsBase: medianPrice.lt(basePrice) ? 'median < base' : medianPrice.eq(basePrice) ? 'median = base' : 'median > base',
            // quick glance stats
            minNodePrice: prices[0]?.toString?.(),
            maxNodePrice: prices[prices.length - 1]?.toString?.(),
          });

          debugPricingLog('Node price samples (reference product)', {
            referenceProduct: referenceProductMeta,
            totalNodes,
            // include a few fields to validate the feed data shape
            firstNodeSample: nodePriceData?.[0]
              ? {
                  stakerAddress: nodePriceData[0].stakerAddress,
                  productId: nodePriceData[0].productId?.toString?.(),
                  priceWei: nodePriceData[0].price?.toString?.(),
                  timestamp: nodePriceData[0].timestamp?.toString?.(),
                }
              : null,
          });
          
          // If medianPrice equals basePrice, usage is 0%
          if (medianPrice.lte(basePrice)) {
            calculatedUsage = 0;
          } 
          // If medianPrice equals or exceeds maxPrice, usage is 100%
          else if (medianPrice.gte(maxPrice)) {
            calculatedUsage = 100;
          }
          // Otherwise, calculate: (medianPrice - basePrice) * 100 / (maxPrice - basePrice)
          else {
            const priceDiff = medianPrice.sub(basePrice);
            const maxBaseDiff = maxPrice.sub(basePrice);
            // Calculate percentage (0-100) with integer precision
            calculatedUsage = priceDiff.mul(100).div(maxBaseDiff).toNumber();
            // Ensure it's between 0 and 100
            calculatedUsage = Math.max(0, Math.min(100, calculatedUsage));
          }
        }
        // eslint-disable-next-line no-console
        console.log('Calculated usage:', {
          usagePercent: calculatedUsage,
          referenceProduct: referenceProductMeta,
        });
        setUsagePercent(calculatedUsage);
        const currentPricesResult = await contract.usagePercentToPrices(calculatedUsage, PRODUCT_IDS);

        debugPricingLog('Derived current prices from usagePercentToPrices', {
          usagePercent: calculatedUsage,
          products: PRODUCT_IDS.map((id, i) => ({
            productId: id,
            ...getProductMeta(id),
            currentPriceWei: currentPricesResult?.[i]?.toString?.(),
          })),
        });

        // Extra debug: does the median node price for the reference product align with the derived "current" price?
        // (If these diverge significantly, the usage estimation logic may not match how node prices are being set.)
        try {
          const derivedReferencePriceWei = currentPricesResult?.[0];
          if (medianPriceForReferenceProduct && derivedReferencePriceWei) {
            const diffWei = medianPriceForReferenceProduct.sub(derivedReferencePriceWei);
            debugPricingLog('Median vs derived reference price', {
              referenceProduct: referenceProductMeta,
              usagePercent: calculatedUsage,
              medianNodePriceWei: medianPriceForReferenceProduct.toString(),
              derivedReferencePriceWei: derivedReferencePriceWei.toString(),
              diffWei: diffWei.toString(),
            });
          } else {
            debugPricingLog('Median vs derived reference price (skipped)', {
              referenceProduct: referenceProductMeta,
              usagePercent: calculatedUsage,
              reason: !medianPriceForReferenceProduct
                ? 'median price not available (no node prices or max==base)'
                : 'derived reference price not available',
            });
          }
        } catch (e) {
          debugPricingLog('Median vs derived reference price (error)', {
            referenceProduct: referenceProductMeta,
            usagePercent: calculatedUsage,
            error: e?.message || String(e),
          });
        }

        const litActionConfigsResult = await contract.getLitActionPriceConfigs();

        // Fetch PKP minting cost (static price)
        const mintCostResult = await pkpContract.mintCost();
        setPkpMintCost(mintCostResult);

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

  const priceData = {
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
    ethers: window.ethers,
  };

  // Render the component with price data as a prop
  // Prefer component prop, fall back to children if provided
  const ComponentToRender = Component || (children && typeof children === 'function' ? children : null);
  
  if (!ComponentToRender) {
    return null;
  }

  // Render the component with priceData prop
  if (typeof ComponentToRender === 'function') {
    return <ComponentToRender priceData={priceData} />;
  }

  // If children is a React element, try to render it (shouldn't happen with our usage pattern)
  return children;
};

