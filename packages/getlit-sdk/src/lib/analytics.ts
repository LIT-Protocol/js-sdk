const API = 'https://lit-general-worker.getlit.dev';

// Collect data
function collectData(
  date: string,
  functionName: string,
  executionTime: number
) {
  fetch(API + '/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date, functionName, executionTime }),
  });
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
    const isoTimestamp = new Date().toISOString();
    const functionName = fnname;
    const executionTime = 0;
    collectData(isoTimestamp, functionName, executionTime);
  },
};
