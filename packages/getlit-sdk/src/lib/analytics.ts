const API = 'https://lit-general-worker.getlit.dev';

// Collect data
async function collectData(
  date: string,
  functionName: string,
  executionTime: number
) {
  const response = await fetch(API + '/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date, functionName, executionTime }),
  });

  const data = await response.json();
  console.log(data);
}

export const LitAnalytics = {
  collect(fnname: string) {
    if (!fnname) {
      throw new Error('Function name is required');
    }

    if (!globalThis.Lit.collectAnalytics) {
      return;
    }

    // full current timestamp
    let date = new Date();
    const isoTimestamp = new Date().toISOString();
    const functionName = fnname;
    const executionTime = 0;
    collectData(isoTimestamp, functionName, executionTime);
  },
};
