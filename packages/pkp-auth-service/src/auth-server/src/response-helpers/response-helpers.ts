import { JSONStringify as BigIntStringify } from 'json-with-bigint';

const HEADERS = { 'content-type': 'application/json' };

const _res202 = (jobId: string | undefined, message: string) => {
  if (!jobId) {
    throw new Error(`Job ID is required for 202 response.`);
  }

  return new Response(BigIntStringify({ jobId, message }), {
    headers: HEADERS,
    status: 202,
  });
};

const _res500 = (error: string) => {
  return new Response(BigIntStringify({ error }), {
    headers: HEADERS,
    status: 500,
  });
};

const _res400 = (error: string) => {
  return new Response(BigIntStringify({ error }), {
    headers: HEADERS,
    status: 400,
  });
};

export const resp: Record<number, (...args: any[]) => Response> = {
  202: _res202,
  500: _res500,
  400: _res400,
};
