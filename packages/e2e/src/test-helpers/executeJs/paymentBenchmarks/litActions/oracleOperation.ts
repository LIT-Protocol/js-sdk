declare const Lit: any;
declare const ethers: any;

/**
 * Lit Action: Oracle Operation
 *
 * Fetches external data and signs the result using broadcastAndCollect to medianize prices.
 */
async function oracleOperation() {
  // Helper function to calculate median
  const median = (arr: number[]) => {
    const arrSorted = [...arr].sort((a, b) => a - b);
    return arrSorted.length % 2 === 0
      ? (arrSorted[arrSorted.length / 2 - 1] +
          arrSorted[arrSorted.length / 2]) /
          2
      : arrSorted[Math.floor(arrSorted.length / 2)];
  };

  // Fetch external data (e.g., price oracle data from Coinbase)
  const response = await fetch(
    'https://api.coinbase.com/v2/prices/ETH-USD/spot'
  );
  const data = await response.json();

  // Collect prices from all the nodes
  const allPrices = await Lit.Actions.broadcastAndCollect({
    name: 'ethPrice',
    value: data.data.amount,
  });

  // Medianize the price, so that outliers don't skew the result
  const medianPrice = median(allPrices);

  // Process the fetched data
  const priceHash = ethers.utils.hashMessage(
    ethers.utils.toUtf8Bytes(medianPrice.toString())
  );

  // Sign the result
  const toSign = ethers.utils.arrayify(priceHash);
  await Lit.Actions.signAsAction({
    toSign,
    signingScheme: 'EcdsaK256Sha256',
    sigName: 'oracle-signature',
  });

  // Simulate runtime of 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  Lit.Actions.setResponse({
    response: JSON.stringify({
      medianPrice,
      data: 'payment benchmark success',
    }),
  });
}

// Convert the function to a string and wrap it in an IIFE
export const ORACLE_OPERATION_LIT_ACTION = `(${oracleOperation.toString()})();`;
