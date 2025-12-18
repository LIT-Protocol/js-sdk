declare const Lit: any;
declare const ethers: any;
declare const jsParams: any;

/**
 * Lit Action: Verifiable Data Job
 *
 * Processes data locally and signs the result to create a verifiable attestation.
 * Runtime: ~45 seconds, Fetches: 0, Signatures: 1, Decrypts: 0
 */
async function verifiableDataJob() {
  // Generate and process data locally (using runOnce to ensure it only runs on one node)
  const dataResult = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "generateData" },
    async () => {
      const dataPoints = [];
      for (let i = 0; i < 1000; i++) {
        const randomValue = Math.random() * 1000;
        const processedValue = Math.sqrt(randomValue) * Math.PI;
        dataPoints.push({
          index: i,
          value: processedValue,
          hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(processedValue.toString())),
        });
      }

      // Aggregate the processed data
      const aggregatedData = {
        totalPoints: dataPoints.length,
        averageValue: dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length,
        dataHash: ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(dataPoints.map(p => p.hash).join(""))
        ),
        timestamp: Date.now(),
      };

      return JSON.stringify(aggregatedData);
    }
  );

  const aggregatedData = JSON.parse(dataResult);
  console.log('aggregatedData', aggregatedData);

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 45000));

  // Sign the processed result
  const toSign = ethers.utils.arrayify(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(aggregatedData)))
  );
  await Lit.Actions.signEcdsa({
    toSign,
    publicKey: jsParams.pkpPublicKey,
    sigName: "verifiable-data-signature",
  });

  Lit.Actions.setResponse({
    response: JSON.stringify({
      aggregatedData,
      data: 'payment benchmark success',
    }),
  });
}

// Convert the function to a string and wrap it in an IIFE
export const VERIFIABLE_DATA_JOB_LIT_ACTION = `(${verifiableDataJob.toString()})();`;
