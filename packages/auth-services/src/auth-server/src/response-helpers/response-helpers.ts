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

const _res200 = (data: any) => {
  return new Response(BigIntStringify(data), {
    headers: HEADERS,
    status: 200,
  });
};

const _res401 = (error: string) => {
  return new Response(BigIntStringify({ error }), {
    headers: HEADERS,
    status: 401,
  });
};

export const resp: Record<string, (...args: any[]) => Response> = {
  SUCCESS: _res200,
  QUEUED: _res202,
  ERROR: _res500,
  BAD_REQUEST: _res400,
  UNAUTHORIZED: _res401,
};
