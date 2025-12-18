declare const Lit: any;
declare const ethers: any;
declare const jsParams: any;

/**
 * Lit Action: Cross-Chain Swap
 *
 * Simulates a realistic cross-chain swap flow with price discovery,
 * liquidity checks, slippage calculation, and multi-step signing.
 * Runtime: ~20 seconds, Fetches: 4, Signatures: 2, Decrypts: 0
 */
async function crossChainSwap() {
  // Swap parameters (in a real scenario, these would come from jsParams)
  const swapParams = {
    sourceChain: "ethereum",
    destChain: "bitcoin",
    sourceToken: "ETH",
    destToken: "BTC",
    amountIn: "1.0", // 1 ETH
    userAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Example address
    slippageTolerance: 0.5, // 0.5%
  };

  // Fetch prices and chain status (using runOnce to ensure consistent data across all nodes)
  const priceDataResult = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "fetchPriceData" },
    async () => {
      // Fetch 1: Get source token price (ETH)
      const ethPriceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum.usd;

      // Fetch 2: Get destination token price (BTC)
      const bitcoinPriceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const bitcoinPriceData = await bitcoinPriceResponse.json();
      const bitcoinPrice = bitcoinPriceData["bitcoin"].usd;

      // Fetch 3: Check source chain status (simulated via CoinGecko API health)
      const sourceChainStatusResponse = await fetch("https://api.coingecko.com/api/v3/ping");
      const sourceChainStatusData = await sourceChainStatusResponse.json();
      const sourceChainStatus = sourceChainStatusData["gecko_says"];

      // Fetch 4: Check destination chain status (simulated via CoinGecko API health)
      const destChainStatusResponse = await fetch("https://api.coingecko.com/api/v3/ping");
      const destChainStatusData = await destChainStatusResponse.json();
      const destChainStatus = destChainStatusData["gecko_says"];

      return JSON.stringify({
        ethPrice,
        bitcoinPrice,
        sourceChainStatus,
        destChainStatus,
      });
    }
  );

  const { ethPrice, bitcoinPrice, sourceChainStatus, destChainStatus } = JSON.parse(priceDataResult);

  // Calculate swap amounts based on real prices
  const amountInUsd = parseFloat(swapParams.amountIn) * ethPrice;
  const expectedAmountOut = amountInUsd / bitcoinPrice;

  // Simulate bridge fees and slippage
  const bridgeFeePercent = 0.3; // 0.3% bridge fee
  const actualSlippage = 0.2; // 0.2% actual slippage (within tolerance)
  const feesAndSlippage = (bridgeFeePercent + actualSlippage) / 100;
  const amountOutAfterFees = expectedAmountOut * (1 - feesAndSlippage);
  const minAmountOut = expectedAmountOut * (1 - swapParams.slippageTolerance / 100);

  // Prepare swap intent data
  const swapIntent = {
    params: swapParams,
    pricing: {
      ethPrice,
      bitcoinPrice,
      amountInUsd,
      expectedAmountOut,
      minAmountOut,
      amountOutAfterFees,
      bridgeFeePercent,
      actualSlippage,
    },
    chainStatus: {
      source: sourceChainStatus,
      destination: destChainStatus,
    },
    timestamp: Date.now(),
    nonce: 123456789,
  };

  // Sign 1: Sign the swap intent (like approving the swap on source chain)
  const swapIntentHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(swapIntent))
  );
  await Lit.Actions.signEcdsa({
    toSign: ethers.utils.arrayify(swapIntentHash),
    publicKey: jsParams.pkpPublicKey,
    sigName: "swap-approval-signature",
  });

  // Simulate cross-chain bridge processing time (waiting for confirmations, relayers, etc.)
  await new Promise((resolve) => setTimeout(resolve, 15000));

  // Prepare execution proof (simulates proof that swap was executed on dest chain)
  const executionProof = {
    swapIntentHash: swapIntentHash,
    executedAmountOut: amountOutAfterFees.toString(),
    sourceTxHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`source-${swapIntent.nonce}`)),
    destTxHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`dest-${swapIntent.nonce}`)),
    sourceBlockNumber: 18500000,
    destBlockNumber: 50000000,
    status: "completed",
    executedAt: Date.now(),
  };

  // Sign 2: Sign the execution proof (like attesting the swap completed on dest chain)
  const executionProofHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(executionProof))
  );
  await Lit.Actions.signEcdsa({
    toSign: ethers.utils.arrayify(executionProofHash),
    publicKey: jsParams.pkpPublicKey,
    sigName: "swap-execution-signature",
  });

  // Simulate remaining runtime to reach 20 seconds total
  await new Promise((resolve) => setTimeout(resolve, 5000));

  Lit.Actions.setResponse({
    response: JSON.stringify({
      swapIntent,
      executionProof,
      data: 'payment benchmark success',
    }),
  });
}

// Convert the function to a string and wrap it in an IIFE
export const CROSS_CHAIN_SWAP_LIT_ACTION = `(${crossChainSwap.toString()})();`;
