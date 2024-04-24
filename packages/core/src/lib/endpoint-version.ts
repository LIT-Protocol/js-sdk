import { isNode } from '@lit-protocol/misc';
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

  let versionOverride: string | undefined = undefined;

  // Get the version override for a particular endpoint
  // FIXME: We will remove this completly once v0.1 is deployed to all public networks
  if (isNode()) {
    versionOverride = process.env[`${params.endpoint.envName}`] || undefined;
  }

  // Use the overridden version if it exists, otherwise use the default
  const version = versionOverride || params.endpoint.version;

  return `${params.url}${params.endpoint.path}${version}`;
};
