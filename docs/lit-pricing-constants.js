// Shared constants and helper functions for Lit Protocol pricing components
// This file is automatically included on every page by Mintlify

window.LitPricingConstants = {
  // Product IDs
  ProductId: {
    PkpSign: 0,
    EncSign: 1,
    LitAction: 2,
    SignSessionKey: 3,
  },

  // Product IDs array used for fetching prices
  PRODUCT_IDS: [0, 1, 3], // [PkpSign, EncSign, SignSessionKey]

  // Product names
  PRODUCT_NAMES: {
    0: 'PKP Sign',
    1: 'Encrypted Sign',
    2: 'Lit Action',
    3: 'Sign Session Key',
  },

  // LitActionPriceComponent enum values
  LitActionPriceComponent: {
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
  },

  // Lit Action component names
  LIT_ACTION_COMPONENT_NAMES: {
    0: 'Base Amount',
    1: 'Runtime Length',
    2: 'Memory Usage',
    3: 'Code Length',
    4: 'Response Length',
    5: 'Signatures',
    6: 'Broadcasts',
    7: 'Contract Calls',
    8: 'Call Depth',
    9: 'Decrypts',
    10: 'Fetches',
  },

  // NodePriceMeasurement enum values
  NodePriceMeasurement: {
    perSecond: 0,
    perMegabyte: 1,
    perCount: 2,
  },

  // Measurement names
  MEASUREMENT_NAMES: {
    0: '/second',
    1: '/MB',
    2: '/count',
  },

  // Helper function to convert wei to tokens
  weiToTokens: (wei, ethers) => {
    if (!ethers || !ethers.utils) {
      return 0;
    }
    return parseFloat(ethers.utils.formatUnits(wei, 18));
  },

  // Helper function to format price display
  formatPrice: (priceInTokens, priceInUSD) => {
    if (priceInUSD === null) {
      return `${priceInTokens.toFixed(6)} LITKEY`;
    }
    return `${priceInTokens.toFixed(6)} LITKEY ($${priceInUSD.toFixed(6)})`;
  },
};

