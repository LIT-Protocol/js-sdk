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

        // Get actual current price to calculate usage percent
        // Using PkpSign (productId 0) as reference
        const nodePriceData = await contract.prices(ProductId.PkpSign);
        const basePrice = basePricesResult[0];
        const maxPrice = maxPricesResult[0];
        
        // Calculate usage percent: (current - base) / (max - base) * 100
        // Average the prices from all nodes
        let calculatedUsage = 0;
        if (nodePriceData.length > 0 && !maxPrice.eq(basePrice)) {
          const avgPrice = nodePriceData.reduce((sum, node) => sum.add(node.price), ethers.BigNumber.from(0)).div(nodePriceData.length);
          calculatedUsage = avgPrice.sub(basePrice).mul(100).div(maxPrice.sub(basePrice)).toNumber();
        }
        setUsagePercent(calculatedUsage);
        const currentPricesResult = await contract.usagePercentToPrices(calculatedUsage, PRODUCT_IDS);

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

