import { LitEndpoint } from '@lit-protocol/types';

/**
 * Compose the Lit URL
 *
 * The schema of the routing can be found in the `constants` package in the `endpoints.ts` file, where you would be able to add new endpoint to the enum,
 * and use that enum in the LIT_ENDPOINT map.
 *
 * @param params
 * @returns the composed URL
 */
export const composeLitUrl = (params: {
  url: string;
  endpoint: LitEndpoint;
}) => {
  // check if params.url is a valid URL
  try {
    new URL(params.url);
  } catch (error) {
    throw new Error(`[composeLitUrl] Invalid URL: "${params.url}"`);
  }

  const version = params.endpoint.version;

  return `${params.url}${params.endpoint.path}${version}`;
};
