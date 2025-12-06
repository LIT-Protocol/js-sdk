// Shared constants and helper functions for Lit Protocol pricing components
// This file is automatically included on every page by Mintlify

window.LitPricingConstants = {
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

  // NodePriceMeasurement enum values
  NodePriceMeasurement: {
    perSecond: 0,
    perMegabyte: 1,
    perCount: 2,
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

