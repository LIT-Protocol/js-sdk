const ENDPOINT = 'http://localhost:3031/';

// create a function to check if endpoint is up
export const checkEndpoint = async () => {
  try {
    const res = await fetch(ENDPOINT + 'status');
    return res.status === 200;
  } catch (e) {
    return false;
  }
};

// create a api call to endpoints at localhost:3031
const handleTx = async (
  action: 'process' | 'resolve' | 'wait-until-empty',
  data: '' | any = '',
  server: any = null
) => {
  await fetch(ENDPOINT + action, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data,
    }),
  });
};

export const processTx = async (description: string, callback: any) => {
  if (!(await checkEndpoint())) {
    return await callback;
  }

  handleTx('process', description);
  await handleTx('wait-until-empty', description);
  const result = await callback;
  await handleTx('resolve', description);
  return result;
};
